import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { PlayerAwareness } from "@/components/player-awareness";
import { DeathReactions } from "@/components/death-reactions";
import appCss from "../styles.css?url";
import bootCss from "../boot-screen.css?url";
import menuCss from "../main-menu.css?url";
import pauseCss from "../pause-menu.css?url";
import awarenessCss from "../player-awareness.css?url";
import deathCss from "../death-reactions.css?url";

const APP_NAME = "WAITING";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#07070A" },
      {
        name: "description",
        content: "A gentle yellow pegasus found a game about herself. She knows you are outside it.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: bootCss },
      { rel: "stylesheet", href: menuCss },
      { rel: "stylesheet", href: pauseCss },
      { rel: "stylesheet", href: awarenessCss },
      { rel: "stylesheet", href: deathCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
          <PlayerAwareness />
          <DeathReactions />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
