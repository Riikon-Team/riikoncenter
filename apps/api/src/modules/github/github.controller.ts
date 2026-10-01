import { Controller, Get, Param } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('stats/:username')
  async getStats(@Param('username') username: string) {
    return this.githubService.getAggregatedStats(username);
  }

  @Get('org-repos/:org')
  async getOrgRepos(@Param('org') org: string) {
    return this.githubService.getOrganizationRepos(org);
  }

  @Get('org-repos/:org/:repo/readme')
  async getRepoReadme(@Param('org') org: string, @Param('repo') repo: string) {
    return this.githubService.getRepoReadme(org, repo);
  }

  @Get('org-repos/:org/:repo/file/:path(*)')
  async getRepoFile(@Param('org') org: string, @Param('repo') repo: string, @Param('path') path: string) {
    return this.githubService.getRepoFile(org, repo, path);
  }
}
