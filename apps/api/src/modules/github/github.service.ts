import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { Redis } from 'ioredis';

@Injectable()
export class GithubService implements OnModuleInit {
  private appOctokit: Octokit;
  private installationId: number | null = null;
  private readonly logger = new Logger(GithubService.name);
  
  // Fallback cache in case Redis is down
  private fallbackCache = new Map<string, { data: any, expiresAt: number }>();

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  onModuleInit() {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!appId || !privateKey) {
      this.logger.warn('GITHUB_APP_ID or GITHUB_PRIVATE_KEY is missing. Github integration will not work.');
      return;
    }

    // This instance acts as the App itself (JWT) to fetch installations
    this.appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: appId,
        privateKey: privateKey,
      },
    });
    this.logger.log('GithubService initialized App Authentication');
  }

  private async getOctokit(): Promise<Octokit> {
    if (!this.installationId) {
      // Fetch all installations of this app
      const { data: installations } = await this.appOctokit.request('GET /app/installations');
      if (installations && installations.length > 0) {
        this.installationId = installations[0].id;
        this.logger.log(`Found GitHub App Installation ID: ${this.installationId}`);
      } else {
        throw new Error('GitHub App is not installed on any account! Please install it first.');
      }
    }

    // Return an Octokit instance authenticated as the Installation (has 15k rate limit for public data)
    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.GITHUB_APP_ID,
        privateKey: process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        installationId: this.installationId,
      },
    });
  }

  private async getOctokitForOrg(org: string): Promise<Octokit> {
    try {
      const { data: installation } = await this.appOctokit.rest.apps.getOrgInstallation({ org });
      
      return new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: process.env.GITHUB_APP_ID,
          privateKey: process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          installationId: installation.id,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get installation for organization ${org}: ${(error as Error).message}`);
      throw new Error(`GitHub App is not installed on the organization: ${org}`);
    }
  }

  /**
   * Helper to fetch data with Redis cache and memory fallback
   */
  private async getCachedData<T>(cacheKey: string, fetchFn: () => Promise<T>, ttlSeconds: number = 300): Promise<T> {
    // 1. Try Redis
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (err) {
      // 2. Try Fallback memory cache if Redis is down
      const memoryCached = this.fallbackCache.get(cacheKey);
      if (memoryCached && memoryCached.expiresAt > Date.now()) {
        return memoryCached.data as T;
      }
    }

    // 3. If not in cache, fetch fresh data
    const freshData = await fetchFn();

    // 4. Save to cache
    try {
      await this.redis.set(cacheKey, JSON.stringify(freshData), 'EX', ttlSeconds);
    } catch (err) {
      // Fallback save
      this.fallbackCache.set(cacheKey, { 
        data: freshData, 
        expiresAt: Date.now() + (ttlSeconds * 1000) 
      });
    }

    return freshData;
  }

  async getAggregatedStats(username: string) {
    const cacheKey = `github:${username}:aggregated_stats`;
    return this.getCachedData(cacheKey, async () => {
      try {
        const octokit = await this.getOctokit();

        // Fetch User and Repos
        const { data: user } = await octokit.rest.users.getByUsername({ username });
        const { data: repos } = await octokit.rest.repos.listForUser({
          username,
          per_page: 100,
          sort: 'updated',
        });

        // Fetch events for recent activity (fallback for PRs/Issues if search fails)
        const { data: events } = await octokit.rest.activity.listPublicEventsForUser({
          username,
          per_page: 100,
        });

        // Use Search API for accurate counts
        const [commitsSearch, prsSearch, issuesSearch] = await Promise.allSettled([
          octokit.rest.search.commits({ q: `author:${username}` }),
          octokit.rest.search.issuesAndPullRequests({ q: `author:${username} type:pr` }),
          octokit.rest.search.issuesAndPullRequests({ q: `author:${username} type:issue` })
        ]);

        const totalCommits = commitsSearch.status === 'fulfilled' ? commitsSearch.value.data.total_count : 0;
        const totalPRs = prsSearch.status === 'fulfilled' ? prsSearch.value.data.total_count : 0;
        const totalIssues = issuesSearch.status === 'fulfilled' ? issuesSearch.value.data.total_count : 0;

        // Fetch contributions calendar from third-party (Deno endpoint) since GitHub API doesn't expose it directly
        let contributions = [];
        try {
          const res = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
          if (res.ok) {
            contributions = await res.json();
          }
        } catch (e) {
          this.logger.warn(`Failed to fetch contributions calendar for ${username}`);
        }

        return {
          user,
          repos,
          events,
          totalCommits,
          totalPRs,
          totalIssues,
          contributions
        };
      } catch (error) {
        this.logger.error(`Error fetching GitHub data for ${username}`, error);
        throw error;
      }
    }, 300); // 5 minutes TTL
  }

  async getOrganizationRepos(org: string) {
    const cacheKey = `github:org:${org}:repos`;
    return this.getCachedData(cacheKey, async () => {
      try {
        const octokit = await this.getOctokitForOrg(org);
        
        // Fetch repositories for the organization
        const { data: repos } = await octokit.rest.repos.listForOrg({
          org,
          per_page: 100,
          sort: 'updated',
        });
        
        return repos;
      } catch (error) {
        this.logger.error(`Error fetching repositories for organization ${org}`, error);
        throw error;
      }
    }, 300);
  }

  async getRepoReadme(org: string, repo: string) {
    const cacheKey = `github:org:${org}:repo:${repo}:readme`;
    return this.getCachedData(cacheKey, async () => {
      try {
        const octokit = await this.getOctokitForOrg(org);
        const { data } = await octokit.rest.repos.getReadme({
          owner: org,
          repo,
          mediaType: {
            format: 'raw',
          },
        });
        return data; // Raw text because of mediaType: raw
      } catch (error) {
        // Return null instead of erroring out if readme doesn't exist
        return null; 
      }
    }, 3600); // 1 hour TTL
  }

  async getRepoFile(org: string, repo: string, path: string) {
    const cacheKey = `github:org:${org}:repo:${repo}:file:${path}`;
    return this.getCachedData(cacheKey, async () => {
      try {
        const octokit = await this.getOctokitForOrg(org);
        const { data } = await octokit.rest.repos.getContent({
          owner: org,
          repo,
          path,
          mediaType: {
            format: 'raw',
          },
        });
        return data; // Raw string
      } catch (error) {
        return null;
      }
    }, 3600);
  }
}
