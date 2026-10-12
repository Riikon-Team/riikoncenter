import apiClient from "./apiClient";

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  homepage: string | null;
  html_url: string;
}

export const githubService = {
  getOrgRepos: async (org: string): Promise<GithubRepo[]> => {
    const response = await apiClient.get<{ data: GithubRepo[] }>(`/api/v1/github/org-repos/${org}`);
    // Extract through NestJS TransformInterceptor
    return response.data.data;
  },
};
