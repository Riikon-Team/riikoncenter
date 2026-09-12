import { NextResponse } from 'next/server';
import { AppManifest, FALLBACK_BUILTIN_APPS } from '../../../lib/apps';
import { EXTERNAL_MANIFESTS } from '../../../lib/external-manifests';

// Type definition for GitHub API Repo response (partial)
interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  default_branch: string;
  topics: string[];
}

export async function GET() {
  const orgName = process.env.NEXT_PUBLIC_GITHUB_ORG;
  const token = process.env.GITHUB_PAT;

  if (!orgName) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_GITHUB_ORG is not configured in environment variables' },
      { status: 500 }
    );
  }

  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'RiikonCenter',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Fetch repositories from the organization
    // Using type=all to fetch both public and private repos if the token allows it
    const reposRes = await fetch(`https://api.github.com/orgs/${orgName}/repos?type=all&per_page=100`, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!reposRes.ok) {
      console.error('Failed to fetch repositories from GitHub:', await reposRes.text());
      // Fallback to built-in apps if GitHub API fails
      return NextResponse.json({ apps: FALLBACK_BUILTIN_APPS });
    }

    const repos: GitHubRepo[] = await reposRes.json();
    const thirdPartyApps: AppManifest[] = [];

    // Process each repo concurrently
    const repoPromises = repos.map(async (repo) => {
      // Ignore the riikoncenter repo itself if it's in the same org
      if (repo.name.toLowerCase() === 'riikoncenter') return null;

      try {
        // Attempt to fetch riikoncenter-manifest.json from the default branch
        const manifestUrl = `https://raw.githubusercontent.com/${orgName}/${repo.name}/${repo.default_branch}/riikoncenter-manifest.json`;
        
        const manifestRes = await fetch(manifestUrl, {
          headers: token ? { 'Authorization': `token ${token}` } : undefined,
          next: { revalidate: 3600 },
        });

        if (manifestRes.ok) {
          const manifestData = await manifestRes.json();
          
          let readme = undefined;
          try {
            const readmeRes = await fetch(`https://api.github.com/repos/${orgName}/${repo.name}/readme`, {
              headers: token ? { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3.raw'
              } : { 'Accept': 'application/vnd.github.v3.raw' },
              next: { revalidate: 3600 },
            });
            if (readmeRes.ok) {
              readme = await readmeRes.text();
            }
          } catch (e) {
            console.warn(`Failed to fetch readme for ${repo.name}`);
          }

          // Ensure it's marked as third-party and has a fallback repoUrl
          return {
            ...manifestData,
            type: 'third-party',
            repoUrl: manifestData.repoUrl || repo.html_url,
            readme: manifestData.readme || readme,
          } as AppManifest;
        }
      } catch (err) {
        console.warn(`Failed to fetch/parse manifest for ${repo.name}`, err);
      }

      let readme = undefined;
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${orgName}/${repo.name}/readme`, {
          headers: token ? { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3.raw'
          } : { 'Accept': 'application/vnd.github.v3.raw' },
          next: { revalidate: 3600 },
        });
        if (readmeRes.ok) {
          readme = await readmeRes.text();
        }
      } catch (e) {
        console.warn(`Failed to fetch readme for fallback ${repo.name}`);
      }

      // Fallback: If no remote manifest exists, check local config first
      const localConfig = EXTERNAL_MANIFESTS[repo.name] || {};

      return {
        id: localConfig.id || repo.name,
        name: localConfig.name || repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: localConfig.description || repo.description || 'No description provided.',
        category: localConfig.category || 'utility',
        type: 'third-party',
        icon: localConfig.icon || 'Box',
        version: localConfig.version || '1.0.0',
        author: localConfig.author || orgName,
        entryPath: localConfig.entryPath || repo.html_url, // For fallback apps, clicking "Open" will just go to the GitHub Repo
        tags: localConfig.tags || repo.topics || [],
        repoUrl: localConfig.repoUrl || repo.html_url,
        readme: localConfig.readme || readme,
        bannerBg: localConfig.bannerBg,
        iconUrl: localConfig.iconUrl,
        screenshots: localConfig.screenshots,
        status: localConfig.status,
      } as AppManifest;
    });

    const results = await Promise.all(repoPromises);
    
    // Filter out nulls
    results.forEach(app => {
      if (app) thirdPartyApps.push(app);
    });

    // Combine built-in apps with third-party apps
    const allApps = [...FALLBACK_BUILTIN_APPS, ...thirdPartyApps];

    return NextResponse.json({ apps: allApps });
  } catch (error) {
    console.error('API /apps error:', error);
    return NextResponse.json({ apps: FALLBACK_BUILTIN_APPS }, { status: 500 });
  }
}
