"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation, Trans } from "react-i18next";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useApps } from "../../../../../lib/hooks/useApps";
import { 
  ArrowLeft, 
  Box, 
  Clock, 
  GraduationCap, 
  Gamepad2, 
  BarChart3, 
  Kanban, 
  Trophy, 
  ExternalLink,
  Info,
  Code2,
  FileJson,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  BookOpen
} from "lucide-react";
import { cn } from "@riikoncenter/ui";
import { ThumbnailPlaceholder } from "../../../../../components/ui/thumbnail-placeholder";
import { useAppStore } from "../../../../../store/useAppStore";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  GraduationCap,
  Gamepad2,
  BarChart3,
  Kanban,
  Trophy,
};

export default function AppDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation("common");
  const { addRecentApp } = useAppStore();
  
  const appId = typeof params.id === 'string' ? params.id : '';
  const { apps, isLoading } = useApps();
  const app = useMemo(() => apps.find((a) => a.id === appId), [apps, appId]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full mb-4"></div>
          <div className="w-32 h-4 bg-muted rounded mb-2"></div>
          <div className="w-24 h-3 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t("app_details.not_found_title")}</h1>
        <p className="text-muted-foreground max-w-md text-center mb-6">
          <Trans i18nKey="app_details.not_found_desc" values={{ id: appId }}>
            Ứng dụng có id <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground"></span> không tồn tại hoặc chưa được định nghĩa trong hệ thống manifest.
          </Trans>
        </p>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          {t("app_details.back_to_hub")}
        </button>
      </div>
    );
  }

  const IconComponent = ICON_MAP[app.icon] || Box;
  const isThirdParty = app.type === "third-party";

  const appName = t(`apps.${app.id}.name`, app.name);
  const appDesc = t(`apps.${app.id}.description`, app.description);

  return (
    <div className="min-h-full bg-background">
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50 px-6 py-3 flex items-center">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("app_details.back_to_hub_nav")}
        </Link>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* App Header Profile */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
          <div className={cn(
            "rounded-2xl border border-border/60 shadow-sm shrink-0 overflow-hidden flex items-center justify-center relative",
            app.thumbnail ? "w-32 h-32 md:w-40 md:h-40" : "w-24 h-24 md:w-32 md:h-32"
          )}>
            {app.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={app.thumbnail} alt={appName} className="w-full h-full object-cover" />
            ) : (
              <ThumbnailPlaceholder icon={IconComponent} iconUrl={app.iconUrl} appName={appName} bannerBg={app.bannerBg} />
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {appName}
              </h1>
              <span className={cn(
                "text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-normal",
                isThirdParty 
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" 
                  : "bg-teal-500/10 text-teal-400 border-teal-500/30"
              )}>
                {isThirdParty ? t("app_details.badge_org") : t("app_details.badge_builtin")}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                {t("app_details.version", { version: app.version })}
              </span>
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                {app.author}
              </span>
            </div>
          </div>
          
          <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
            {isThirdParty ? (
              <a 
                href={app.repoUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
              >
                {t("app_details.action_repo")} <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <Link
                href={app.entryPath}
                onClick={() => addRecentApp(app.id)}
                className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg shadow-primary/20"
              >
                {t("app_details.action_open")}
              </Link>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 pt-8 border-t border-border/50">
          
          <div className="lg:col-span-2 space-y-8">
            {app.readme ? (
              <section className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {t("app_details.section_desc")}
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-6 rounded-2xl border border-border/50 custom-scrollbar overflow-x-auto">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>{app.readme}</ReactMarkdown>
                </div>
              </section>
            ) : (
              <section className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  {t("app_details.section_desc")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {appDesc}
                </p>
              </section>
            )}

            {app.tags && app.tags.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-lg font-bold">{t("app_details.section_tags")}</h3>
                <div className="flex flex-wrap gap-2">
                  {app.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-sm font-medium border border-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}



            {/* Screenshots */}
            <section className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                {t("app_details.section_screenshots", "Screenshots")}
              </h3>
              
              {!app.screenshots || app.screenshots.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl bg-muted/30">
                  <ImageIcon className="w-8 h-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {t("app_details.no_screenshots", "Chưa có ảnh chụp màn hình")}
                  </p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                  {app.screenshots.map((url, i) => (
                    <div key={i} className="shrink-0 w-[280px] md:w-[400px] aspect-video rounded-xl overflow-hidden border border-border shadow-sm snap-center bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`${appName} screenshot ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                {t("app_details.section_tech")}
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs mb-1">{t("app_details.tech_id")}</div>
                  <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-bold">{app.id}</code>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">{t("app_details.tech_entry")}</div>
                  <code className="bg-muted px-1.5 py-0.5 rounded">{app.entryPath}</code>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">{t("app_details.tech_type")}</div>
                  <div className="font-medium">
                    {isThirdParty ? t("app_details.type_third_party") : t("app_details.type_builtin")}
                  </div>
                </div>
                {isThirdParty && app.repoUrl && (
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">{t("app_details.tech_repo")}</div>
                    <a href={app.repoUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline break-all">
                      {app.repoUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <FileJson className="w-4 h-4 text-primary" />
                {t("app_details.section_manifest")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("app_details.manifest_desc")}
              </p>
              <div className="p-3 bg-muted rounded-lg text-xs font-mono overflow-x-auto text-muted-foreground border border-border">
                <pre>{JSON.stringify(app, null, 2)}</pre>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-500 mt-2">
                <CheckCircle2 className="w-4 h-4" /> {t("app_details.manifest_valid")}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
