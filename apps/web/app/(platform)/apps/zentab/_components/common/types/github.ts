/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GitHubStats {
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  followers: string;
  following: string;
  stars: number;
  commits: number;
  prs: number;
  issues: number;
  reposCount: number;
  languages: { name: string; percentage: number; color: string }[];
  topRepos: { name: string; description: string; stars: number; url: string; language: string; }[];
}
