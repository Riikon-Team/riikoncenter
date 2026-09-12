/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { X, Github, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { GitHubStats, AppSettings, GitHubTranslation } from '../types';
import { useTranslation } from 'react-i18next';
import GitHubProfileCard from './github/GitHubProfileCard';
import GitHubMetricsGrid from './github/GitHubMetricsGrid';
import GitHubCommitCalendar from './github/GitHubCommitCalendar';
import GitHubLangStats from './github/GitHubLangStats';

interface GitHubDialogProps {
  settings: AppSettings;
  onClose: () => void;
}

interface CommitCell {
  level: number;
  count: number;
  dateStr: string;
  dayOfWeek: number;
  dateObj: Date;
}

const DEFAULT_USER = 'torvalds';

function GitHubDialog({ settings, onClose }: GitHubDialogProps) {
  const { t: tHook, i18n } = useTranslation();
  const t = tHook('github', { returnObjects: true }) as unknown as GitHubTranslation;
  const isEn = settings.language === 'en';

  const [username, setUsername] = useState(() => {
    return localStorage.getItem('serene_github_username') || DEFAULT_USER;
  });
  const [inputVal, setInputVal] = useState(username);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [eventsMap, setEventsMap] = useState<Record<string, number>>({});
  const [recentActivity, setRecentActivity] = useState<{
    dateString: string;
    dayName: string;
    count: number;
    commits: number;
    prs: number;
    issues: number;
    others: number;
  }[]>([]);

  const fetchGitHubData = async (user: string, forceRefresh = false) => {
    setLoading(true);
    setErrorMsg('');
    const todayStr = new Date().toISOString().split('T')[0];

    // Priority caching: load today's fetched data if available
    if (!forceRefresh) {
      const cached = localStorage.getItem(`serene_github_cache_${user}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.timestamp === todayStr) {
            setStats(parsed.stats);
            setEventsMap(parsed.eventsMap);
            setRecentActivity(parsed.recentActivity);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Error parsing local cached data for GitHub", e);
        }
      }
    }

    try {
      let userData: any = null;
      let reposData: any = [];
      let eventsData: any[] = [];
      let isFallbackUsed = false;

      // Try fetching standard GitHub User profile
      try {
        const userRes = await fetch(`https://api.github.com/users/${user}`);
        if (userRes.ok) {
          userData = await userRes.json();
          const reposRes = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`);
          if (reposRes.ok) {
            reposData = await reposRes.json();
          }
        } else if (userRes.status === 403 || userRes.status === 429) {
          // Rate limited! Attempt profile-summary fallback api
          console.warn("GitHub API rate-limit detected. Trying profile-summary fallback API...");
          try {
            const fbRes = await fetch(`https://profile-summary-for-github.com/api/user/${user}`);
            if (fbRes.ok) {
              const fbData = await fbRes.json();
              if (fbData) {
                userData = fbData.user || fbData;
                reposData = fbData.repos || [];
                isFallbackUsed = true;
              }
            }
          } catch (fbErr) {
            console.error("Profile summary fallback request failed", fbErr);
          }
        } else if (userRes.status === 404) {
          throw new Error(t.userNotFound);
        }
      } catch (err) {
        console.warn("GitHub profile fetch failed/rate-limited, attempting silent continuation: ", err);
        if (err instanceof Error && err.message === t.userNotFound) {
          throw err;
        }
      }

      // If userData is still null, establish offline placeholders to display stats and load charts elegantly
      if (!userData) {
        userData = {
          login: user,
          name: user.charAt(0).toUpperCase() + user.slice(1),
          avatar_url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80`,
          bio: t.offlineBio || '',
          followers: 0,
          following: 0,
          public_repos: 0
        };
      }

      let stars = 0;
      let languagesMap: { [key: string]: number } = {};

      if (Array.isArray(reposData)) {
        reposData.forEach((repo: any) => {
          stars += repo.stargazers_count || repo.stargazersCount || 0;
          const lang = repo.language || repo.primaryLanguage;
          if (lang) {
            languagesMap[lang] = (languagesMap[lang] || 0) + 1;
          }
        });
      }

      const totalLangCount = Object.values(languagesMap).reduce((a, b) => a + b, 0);
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      const languages = Object.entries(languagesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, count], index) => ({
          name,
          percentage: totalLangCount > 0 ? Math.round((count / totalLangCount) * 100) : 0,
          color: colors[index % colors.length]
        }));

      const finalLanguages = languages;

      let topRepos: { name: string; description: string; stars: number; url: string; language: string; }[] = [];
      if (Array.isArray(reposData)) {
        topRepos = [...reposData]
          .sort((a, b) => (b.stargazers_count || b.stargazersCount || 0) - (a.stargazers_count || a.stargazersCount || 0))
          .slice(0, 3)
          .map(repo => ({
            name: repo.name || 'Unknown',
            description: repo.description || '',
            stars: repo.stargazers_count || repo.stargazersCount || 0,
            url: repo.html_url || repo.url || '#',
            language: repo.language || repo.primaryLanguage || ''
          }));
      }

      const publicRepos = userData.public_repos ?? userData.publicRepos ?? reposData.length ?? 0;
      const followersCount = userData.followers ?? 0;
      const followingCount = userData.following ?? 0;

      // 1. Fetch full-year/24-week raw contribution calendar from multiple highly reliable public endpoints
      let contributionsData: any[] = [];
      try {
        const contribRes = await fetch(`https://github-contributions-api.deno.dev/${user}.json`);
        if (contribRes.ok) {
          const resJson = await contribRes.json();
          if (Array.isArray(resJson)) {
            contributionsData = resJson;
          } else if (resJson && Array.isArray(resJson.contributions)) {
            contributionsData = resJson.contributions;
          }
        }
      } catch (err) {
        console.warn("Deno.dev contributions retrieval failed, trying failovers");
      }

      if (contributionsData.length === 0) {
        try {
          const vercelRes = await fetch(`https://github-contributions.vercel.app/api/v1/${user}`);
          if (vercelRes.ok) {
            const resJson = await vercelRes.json();
            if (Array.isArray(resJson)) {
              contributionsData = resJson;
            } else if (resJson && Array.isArray(resJson.contributions)) {
              contributionsData = resJson.contributions;
            }
          }
        } catch (err) {
          console.warn("Vercel contributions retrieval failed, trying third failover");
        }
      }

      if (contributionsData.length === 0) {
        try {
          const jasonetRes = await fetch(`https://github-contributions-api.jasonet.co/${user}.json`);
          if (jasonetRes.ok) {
            const resJson = await jasonetRes.json();
            if (Array.isArray(resJson)) {
              contributionsData = resJson;
            } else if (resJson && Array.isArray(resJson.contributions)) {
              contributionsData = resJson.contributions;
            }
          }
        } catch (err) {
          console.warn("Jasonet contributions retrieval failed.");
        }
      }

      // Flatten 2D contributions data if returned in weekly segments (as in deno-github-contributions-api)
      let flattenedContributions: any[] = [];
      if (Array.isArray(contributionsData)) {
        contributionsData.forEach((item: any) => {
          if (Array.isArray(item)) {
            flattenedContributions.push(...item);
          } else {
            flattenedContributions.push(item);
          }
        });
      }

      // Calculate highly authentic actual commits sum if the calendar successfully fetched
      let totalAnnualContributions = 0;
      if (flattenedContributions.length > 0) {
        totalAnnualContributions = flattenedContributions.reduce((sum, c) => {
          if (!c) return sum;
          const val = c.count !== undefined ? c.count : (c.contributionCount !== undefined ? c.contributionCount : (c.value || 0));
          return sum + val;
        }, 0);
      }

      // Fetch 7-day activity events direct early so we can parse fallback figures if needed
      if (!isFallbackUsed) {
        try {
          const eventsRes = await fetch(`https://api.github.com/users/${user}/events?per_page=100`);
          if (eventsRes.ok) {
            eventsData = await eventsRes.json();
          }
        } catch (e) {
          console.warn("Could not fetch user events details directly", e);
        }
      }

      // Fetch actual real contribution totals from GitHub Search API
      let totalCommits = totalAnnualContributions;
      try {
        const commitsRes = await fetch(`https://api.github.com/search/commits?q=author:${user}`, {
          headers: {
            Accept: 'application/vnd.github.cloak-preview+json'
          }
        });
        if (commitsRes.ok) {
          const commitsJson = await commitsRes.json();
          if (commitsJson && commitsJson.total_count !== undefined) {
            totalCommits = commitsJson.total_count;
          }
        }
      } catch (err) {
        console.warn("Could not fetch real commits count via search:", err);
      }

      let totalPRs = 0;
      try {
        const prsRes = await fetch(`https://api.github.com/search/issues?q=author:${user}+type:pr`);
        if (prsRes.ok) {
          const prsJson = await prsRes.json();
          totalPRs = prsJson.total_count || 0;
        }
      } catch (err) {
        console.warn("Could not fetch real PR count via search:", err);
      }

      let totalIssues = 0;
      try {
        const issuesRes = await fetch(`https://api.github.com/search/issues?q=author:${user}+type:issue`);
        if (issuesRes.ok) {
          const issuesJson = await issuesRes.json();
          totalIssues = issuesJson.total_count || 0;
        }
      } catch (err) {
        console.warn("Could not fetch real Issues count via search:", err);
      }

      // Fallback: If search was rate-limited or failed, scan local events history to avoid blank states
      if (totalPRs === 0 && Array.isArray(eventsData)) {
        totalPRs = eventsData.filter(e => e.type === 'PullRequestEvent').length;
      }
      if (totalIssues === 0 && Array.isArray(eventsData)) {
        totalIssues = eventsData.filter(e => e.type === 'IssuesEvent' || e.type === 'IssueCommentEvent').length;
      }

      const fetchedStats: GitHubStats = {
        username: userData.login || userData.username || user,
        fullName: userData.name || userData.login || user,
        avatarUrl: userData.avatar_url || userData.avatarUrl || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80`,
        bio: userData.bio || '',
        followers: String(followersCount),
        following: String(followingCount),
        stars,
        commits: totalCommits,
        prs: totalPRs,
        issues: totalIssues,
        reposCount: publicRepos,
        languages: finalLanguages,
        topRepos: topRepos
      };

      const now = new Date();
      const activityDays: any[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateString = `${yyyy}-${mm}-${dd}`;
        
        const mondayIndexed = d.getDay() === 0 ? 6 : d.getDay() - 1;
        const dayLabel = t.weekdays[mondayIndexed] || '';
        
        activityDays.push({
          dateString,
          dayName: dayLabel,
          count: 0,
          commits: 0,
          prs: 0,
          issues: 0,
          others: 0
        });
      }

      // Initialize events map with the real historical contributions!
      const allEventsMap: Record<string, number> = {};
      if (Array.isArray(flattenedContributions) && flattenedContributions.length > 0) {
        flattenedContributions.forEach((contrib: any) => {
          if (contrib) {
            const cDate = contrib.date || contrib.dateString || contrib.day;
            const cVal = contrib.count !== undefined ? contrib.count : (contrib.contributionCount !== undefined ? contrib.contributionCount : (contrib.value || 0));
            if (cDate) {
              allEventsMap[cDate] = cVal;
            }
          }
        });
      }

      // Overlay recent events on top of historical calendar block mapping
      if (Array.isArray(eventsData) && eventsData.length > 0) {
        eventsData.forEach((event) => {
          if (!event.created_at) return;
          const eventDateStr = event.created_at.split('T')[0];
          const type = event.type;
          
          let count = 0;
          let commitsCount = 0;
          let prsCount = 0;
          let issuesCount = 0;
          let othersCount = 0;

          if (type === 'PushEvent') {
            commitsCount = Array.isArray(event.payload?.commits) ? event.payload.commits.length : 1;
            count = commitsCount;
          } else if (type === 'PullRequestEvent') {
            prsCount = 1;
            count = 1;
          } else if (type === 'IssuesEvent' || type === 'IssueCommentEvent') {
            issuesCount = 1;
            count = 1;
          } else {
            othersCount = 1;
            count = 1;
          }

          // Keep the maximum value discovered from the calendar fetch and events
          const existing = allEventsMap[eventDateStr] || 0;
          allEventsMap[eventDateStr] = Math.max(existing, count);

          // Also accumulate to recent 7-day activity metrics
          const matchingDay = activityDays.find(dayObj => dayObj.dateString === eventDateStr);
          if (matchingDay) {
            matchingDay.commits += commitsCount;
            matchingDay.prs += prsCount;
            matchingDay.issues += issuesCount;
            matchingDay.others += othersCount;
          }
        });
      }

      // Fill in and align exact contribution values from the loaded raw calendar mapping
      activityDays.forEach((day) => {
        const calCount = allEventsMap[day.dateString] || 0;
        const eventsSum = day.commits + day.prs + day.issues + day.others;
        
        if (calCount > eventsSum) {
          const diff = calCount - eventsSum;
          day.commits += diff;
          day.count = calCount;
        } else {
          day.count = eventsSum;
        }
      });

      setEventsMap(allEventsMap);
      setRecentActivity(activityDays);
      setStats(fetchedStats);

      // Save cache data successfully
      const cacheObj = {
        stats: fetchedStats,
        eventsMap: allEventsMap,
        recentActivity: activityDays,
        timestamp: todayStr
      };
      localStorage.setItem(`serene_github_cache_${user}`, JSON.stringify(cacheObj));
      localStorage.setItem('serene_github_username', user);
    } catch (err) {
      const errorMsgText = err instanceof Error ? err.message : String(err);
      console.warn("GitHub API Limit or Network Error", err);
      setErrorMsg(errorMsgText || tHook('github.offlineBio'));
      
      // Errored fallback: Strictly 0 contributions and stats (NO faked mock numbers)
      const offlineStats: GitHubStats = {
        username: user,
        fullName: user.charAt(0).toUpperCase() + user.slice(1),
        avatarUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80`,
        bio: t.offlineBio || '',
        followers: '0',
        following: '0',
        stars: 0,
        commits: 0,
        prs: 0,
        issues: 0,
        reposCount: 0,
        languages: [],
        topRepos: []
      };
      setStats(offlineStats);

      const now = new Date();
      const activityDays = [];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateString = `${yyyy}-${mm}-${dd}`;
        
        const mondayIndexed = d.getDay() === 0 ? 6 : d.getDay() - 1;
        const dayLabel = t.weekdays[mondayIndexed] || '';
        
        activityDays.push({
          dateString,
          dayName: dayLabel,
          count: 0,
          commits: 0,
          prs: 0,
          issues: 0,
          others: 0
        });
      }

      setRecentActivity(activityDays);
      setEventsMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubData(username);
  }, [username]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const cleanUser = inputVal.trim();
    if (cleanUser) {
      if (cleanUser === username) {
        // Force refresh for the current user
        fetchGitHubData(cleanUser, true);
      } else {
        setUsername(cleanUser);
      }
    }
  };

  const generateCommitGrid = (): CommitCell[][] => {
    const grid = [];
    
    // Calculate current Monday to anchor Monday to Sunday weekly grid
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sun, 1 is Mon, 2 is Tue, ... 6 is Sat
    const daysToMon = currentDay === 0 ? 6 : currentDay - 1;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - daysToMon);
    currentMonday.setHours(0, 0, 0, 0);

    for (let c = 0; c < 24; c++) {
      const column = [];
      for (let r = 0; r < 7; r++) {
        const cellDate = new Date(currentMonday);
        cellDate.setDate(currentMonday.getDate() - (23 - c) * 7 + r);
        
        const yyyy = cellDate.getFullYear();
        const mm = String(cellDate.getMonth() + 1).padStart(2, '0');
        const dd = String(cellDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        let count = 0;
        let level = 0;

        if (cellDate <= today) {
          // Check if we have this date in our actual API events map
          if (eventsMap && eventsMap[dateStr] !== undefined) {
            count = eventsMap[dateStr];
          }
        }

        // Determine Github style intensity level (0 to 4)
        if (count === 0) level = 0;
        else if (count <= 2) level = 1;
        else if (count <= 5) level = 2;
        else if (count <= 9) level = 3;
        else level = 4;

        column.push({ level, count, dateStr, dayOfWeek: r, dateObj: cellDate });
      }
      grid.push(column);
    }
    return grid;
  };

  const commitGrid = generateCommitGrid();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all animate-fade-in" id="github-overlay">
      <div className="glass-dialog w-full max-w-3xl rounded-2xl p-6 relative flex flex-col max-h-[90vh] overflow-hidden animate-slide-up" id="github-dialog-box">
        
        {/* Header section */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4" id="github-dialog-header">
          <div className="flex items-center gap-2">
            <Github className="text-white" size={20} />
            <div>
              <h3 className="font-heading font-semibold text-lg text-white" id="github-dialog-title">
                {t.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            id="github-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Username Finder Row */}
        <div className="py-4 flex gap-2" id="github-search-row">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white transition-colors animate-fade-in"
                id="github-search-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-white text-slate-950 font-heading font-semibold text-xs rounded-lg shadow hover:bg-slate-100 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              id="github-search-submit"
            >
              {loading ? <RefreshCw size={12} className="animate-spin" /> : t.searchBtn}
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="mb-3 px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/10 text-[11px] text-amber-300 flex items-center gap-1.5" id="github-error-banner">
            <AlertCircle size={12} />
            <span>{tHook('github.previewBanner', { username, error: errorMsg })}</span>
          </div>
        )}

        {/* Profile Details area */}
        {stats && (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5" id="github-stats-container">
            <GitHubProfileCard stats={stats} t={t} />

            <GitHubMetricsGrid stats={stats} t={t} />

            <GitHubCommitCalendar commitGrid={commitGrid} t={t} isEn={isEn} />

            <GitHubLangStats stats={stats} t={t} />
          </div>
        )}



      </div>
    </div>
  );
}

export default React.memo(GitHubDialog);
