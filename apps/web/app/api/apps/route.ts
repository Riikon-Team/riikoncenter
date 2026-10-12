import { NextResponse } from 'next/server';
import { AppManifest, FALLBACK_BUILTIN_APPS } from '../../../lib/apps';
import { EXTERNAL_MANIFESTS } from '../../../lib/external-manifests';
import { isAppAllowed, isUrlBlocked, isNameBlocked, isIframeDisabled } from '../../../lib/app-filters';

// Type definition for GitHub API Repo response (partial)
interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  default_branch: string;
  topics: string[];
}

export async function GET() {
  const orgName = process.env.NEXT_PUBLIC_GITHUB_ORG;

  if (!orgName) {
    console.warn('NEXT_PUBLIC_GITHUB_ORG is not configured in environment variables. Falling back to built-in apps.');
    return NextResponse.json({ apps: FALLBACK_BUILTIN_APPS });
  }

  try {

    // Fetch repositories from our Backend using GitHub App auth
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8008';
    const reposRes = await fetch(`${apiUrl}/api/v1/github/org-repos/${orgName}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!reposRes.ok) {
      console.error('Failed to fetch repositories from GitHub:', await reposRes.text());
      // Fallback to built-in apps if GitHub API fails
      return NextResponse.json({ apps: FALLBACK_BUILTIN_APPS });
    }

    const responseJson = await reposRes.json();
    // Support both raw array (old) and standardized { data } envelope (new)
    const repos: GitHubRepo[] = Array.isArray(responseJson) ? responseJson : (responseJson.data || []);
    const thirdPartyApps: AppManifest[] = [];

    // Process each repo concurrently
    const repoPromises = repos.map(async (repo) => {
      // Ignore the riikoncenter repo itself if it's in the same org
      if (repo.name.toLowerCase() === 'riikoncenter') return null;

      // Ignore vibe-card-game repo since it is already registered as an org game
      if (repo.name.toLowerCase() === 'vibe-card-game') return null;

      // Ignore repos that point to blocked URLs (e.g. npmjs) or blocked names
      if (isNameBlocked(repo.name) || isUrlBlocked(repo.html_url) || isUrlBlocked(repo.homepage)) return null;

      try {
        // Fetch manifest via backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8008';
        const manifestUrl = `${apiUrl}/api/v1/github/org-repos/${orgName}/${repo.name}/file/riikoncenter-manifest.json`;
        const manifestRes = await fetch(manifestUrl, {
          next: { revalidate: 3600 },
        });

        if (manifestRes.ok) {
          const { data: rawManifest } = await manifestRes.json();
          if (rawManifest) {
            const manifestData = typeof rawManifest === 'string' ? JSON.parse(rawManifest) : rawManifest;
            
            let readme = undefined;
            try {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8008';
              const readmeRes = await fetch(`${apiUrl}/api/v1/github/org-repos/${orgName}/${repo.name}/readme`, {
                next: { revalidate: 3600 },
              });
              if (readmeRes.ok) {
                const { data } = await readmeRes.json();
                if (data) readme = data;
              }
            } catch (e) {
              console.warn(`Failed to fetch readme for ${repo.name}`);
            }

            // If repo or manifest has a deployed homepage, record it as iframeUrl (unless disabled)
            const shouldDisableIframe = isIframeDisabled(repo.name) || isIframeDisabled(manifestData.id);
            const homepageUrl = shouldDisableIframe ? undefined : (manifestData.homepage || repo.homepage);
            const category = manifestData.category || 'utility';
            const dynamicEntryPath = homepageUrl
              ? (category === 'game' ? `/games/${repo.name}` : `/apps/${repo.name}`)
              : manifestData.entryPath;

            // Ensure it's marked as third-party and has a fallback repoUrl
            return {
              ...manifestData,
              type: 'third-party',
              repoUrl: manifestData.repoUrl || repo.html_url,
              readme: manifestData.readme || readme,
              iframeUrl: homepageUrl || undefined,
              entryPath: dynamicEntryPath || manifestData.entryPath || repo.html_url,
            } as AppManifest;
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch/parse manifest for ${repo.name}`, err);
      }

      let readme = undefined;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8008';
        const readmeRes = await fetch(`${apiUrl}/api/v1/github/org-repos/${orgName}/${repo.name}/readme`, {
          next: { revalidate: 3600 },
        });
        if (readmeRes.ok) {
          const { data } = await readmeRes.json();
          if (data) readme = data;
        }
      } catch (e) {
        console.warn(`Failed to fetch readme for fallback ${repo.name}`);
      }

      // Fallback: If no remote manifest exists, check local config first
      const localConfig = EXTERNAL_MANIFESTS[repo.name] || {};
      const shouldDisableFallbackIframe = isIframeDisabled(repo.name) || isIframeDisabled(localConfig.id);
      const fallbackHomepage = shouldDisableFallbackIframe ? undefined : (localConfig.iframeUrl || repo.homepage);
      const fallbackCategory = localConfig.category || 'utility';
      const fallbackEntryPath = fallbackHomepage
        ? (fallbackCategory === 'game' ? `/games/${repo.name}` : `/apps/${repo.name}`)
        : (localConfig.entryPath || repo.html_url);

      return {
        id: localConfig.id || repo.name,
        name: localConfig.name || repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: localConfig.description || repo.description || 'No description provided.',
        category: fallbackCategory,
        type: 'third-party',
        icon: localConfig.icon || 'Box',
        version: localConfig.version || '1.0.0',
        author: localConfig.author || orgName,
        entryPath: fallbackEntryPath,
        iframeUrl: fallbackHomepage || undefined,
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
    
    // Filter out nulls and blocked URL patterns (e.g. npmjs)
    results.forEach(app => {
      if (app && isAppAllowed(app)) {
        // If repo is 'tools', it merges with builtin 'konnns-extension-tools'
        if (app.id === 'tools' || app.name.toLowerCase() === 'tools') {
          // If the repo has a homepage, we can enhance konnns-extension-tools
          const existingTools = FALLBACK_BUILTIN_APPS.find(b => b.id === 'konnns-extension-tools');
          if (existingTools && app.iframeUrl) {
            existingTools.iframeUrl = app.iframeUrl;
          }
          return; // Do not add duplicate 'tools' card
        }

        // Skip vibe-card-game or any app already defined in FALLBACK_BUILTIN_APPS
        if (app.id === 'vibe-card-game' || FALLBACK_BUILTIN_APPS.some(b => b.id === app.id)) {
          return;
        }

        thirdPartyApps.push(app);
      }
    });

    // Combine built-in apps with third-party apps, filtering out any blocked apps
    const allApps = [...FALLBACK_BUILTIN_APPS, ...thirdPartyApps].filter(isAppAllowed);

    return NextResponse.json({ apps: allApps });
  } catch (error) {
    console.error('API /apps error:', error);
    return NextResponse.json({ apps: FALLBACK_BUILTIN_APPS.filter(isAppAllowed) });
  }
}
