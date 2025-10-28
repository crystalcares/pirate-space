import { cn } from "@/lib/utils";
import { useAppConfig } from "@/contexts/AppConfigContext";

export function PirateLogo({ className }: { className?: string }) {
  const config = useAppConfig();
  const logoUrl = config?.site_logo_url;
  const defaultLogo = "https://media.discordapp.net/attachments/1429039353870680084/1431616762125750374/pirate-arrr.gif?ex=68ff6202&is=68fe1082&hm=12478fb149bbb3dca4ded63d0975128b8743b1fd8aac5703617009683b3b7c64&=&width=242&height=242";

  return (
    <div className={cn("flex items-center gap-3 font-display", className)}>
        <img 
            src={logoUrl || defaultLogo}
            alt="Pirate Logo"
            className="w-10 h-10 object-contain"
        />
        <span className="font-bold text-xl text-foreground">Pirate</span>
    </div>
  );
}
