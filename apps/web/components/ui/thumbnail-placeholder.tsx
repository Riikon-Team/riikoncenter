import { cn } from "@riikoncenter/ui";

interface ThumbnailPlaceholderProps {
  icon: React.ComponentType<{ className?: string }>;
  iconUrl?: string;
  appName?: string;
  bannerBg?: string;
  className?: string;
  iconClassName?: string;
  size?: "default" | "sm";
}

export function ThumbnailPlaceholder({
  icon: Icon,
  iconUrl,
  appName = "App",
  bannerBg = "from-muted to-muted",
  className,
  iconClassName,
  size = "default"
}: ThumbnailPlaceholderProps) {
  return (
    <div className={cn(
      "absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br",
      bannerBg,
      className
    )}>
      {/* Decorative background shapes */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-background/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-foreground/5 rounded-full blur-xl" />
      
      {/* Center Icon */}
      <div className={cn(
        "relative z-10 bg-background/40 backdrop-blur-md border border-border/50 shadow-sm group-hover:scale-110 group-hover:bg-background/60 transition-all duration-500 overflow-hidden flex items-center justify-center",
        size === "sm" ? "p-1 rounded-md" : "p-4 rounded-2xl"
      )}>
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={iconUrl} alt={`${appName} icon`} className={cn("object-contain", size === "sm" ? "w-4 h-4" : "w-10 h-10", iconClassName)} />
        ) : (
          <Icon className={cn("text-foreground/70", size === "sm" ? "w-4 h-4" : "w-10 h-10", iconClassName)} />
        )}
      </div>
    </div>
  );
}
