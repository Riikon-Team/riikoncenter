'use client';

import React, { useEffect, useState } from 'react';
import { githubService, GithubRepo } from '@/services/githubService';
import { useParams } from 'next/navigation';

import { FALLBACK_BUILTIN_APPS } from '@/lib/apps';

export default function ExternalGamePage() {
  const params = useParams();
  const id = params.id as string;
  const org = process.env.NEXT_PUBLIC_GITHUB_ORG || 'Riikon-Team';
  
  const [repo, setRepo] = useState<GithubRepo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepoInfo() {
      try {
        setLoading(true);
        // Fetch all repos for the org and find the one matching the id
        const repos = await githubService.getOrgRepos(org);
        const foundRepo = repos.find((r: GithubRepo) => r.name === id);
        
        if (foundRepo) {
          setRepo(foundRepo);
          return;
        }

        // If not found in GitHub repos, check local fallback
        const fallbackApp = FALLBACK_BUILTIN_APPS.find(a => a.id === id);
        if (fallbackApp && fallbackApp.iframeUrl) {
          setRepo({
            id: 0,
            name: fallbackApp.id,
            full_name: `${org}/${fallbackApp.id}`,
            description: fallbackApp.description,
            homepage: fallbackApp.iframeUrl,
            html_url: fallbackApp.repoUrl || `https://github.com/${org}/${fallbackApp.id}`,
          });
          return;
        }

        setError(`Game repository "${id}" not found.`);
      } catch (err: unknown) {
        // Fallback to local manifest if GitHub API fails
        const fallbackApp = FALLBACK_BUILTIN_APPS.find(a => a.id === id);
        if (fallbackApp && fallbackApp.iframeUrl) {
          setRepo({
            id: 0,
            name: fallbackApp.id,
            full_name: `${org}/${fallbackApp.id}`,
            description: fallbackApp.description,
            homepage: fallbackApp.iframeUrl,
            html_url: fallbackApp.repoUrl || `https://github.com/${org}/${fallbackApp.id}`,
          });
          return;
        }
        const message = err instanceof Error ? err.message : "Failed to load game metadata.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchRepoInfo();
    }
  }, [id, org]);

  if (loading) {
    return (
      <div className="w-full h-dvh bg-black flex flex-col items-center justify-center text-white relative">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold">Waking up external application...</h2>
        <p className="text-zinc-400 mt-2">Please wait a moment.</p>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="w-full h-dvh bg-black flex items-center justify-center text-red-500">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p>{error || "Application not found."}</p>
        </div>
      </div>
    );
  }

  if (!repo.homepage) {
    return (
      <div className="w-full h-dvh bg-black flex items-center justify-center text-yellow-500">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Not Deployed</h1>
          <p>The repository {repo.name} does not have a homepage configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-dvh bg-black flex flex-col relative overflow-hidden">
      <iframe 
        src={repo.homepage} 
        className="w-full h-full border-none bg-black"
        title={repo.name}
        allow="microphone; camera; display-capture"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}
