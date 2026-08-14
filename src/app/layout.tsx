import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/lib/site";

// Self-hosted via next/font/local: the Azure Static Web Apps build container
// cannot reach fonts.gstatic.com, so fetching these at build time (which the
// Google-Fonts-backed next/font loader does) fails there even though it
// works locally and in CI. These woff2 files are the same Google Fonts
// assets, vendored under ./fonts and bundled directly with no network call.
const ibmSans = localFont({
  src: "./fonts/IBMPlexSans-Variable.woff2",
  weight: "100 700",
  style: "normal",
  variable: "--font-ibm-sans",
  display: "swap",
});

const ibmMono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexMono-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/IBMPlexMono-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-ibm-mono",
  display: "swap",
});

const newsreader = localFont({
  src: [
    { path: "./fonts/Newsreader-Variable.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/Newsreader-Variable-Italic.woff2", weight: "200 800", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author }],
  keywords: [
    "LLM pricing",
    "API cost",
    "prompt caching",
    "token pricing",
    "Azure AI Foundry",
    "Microsoft Foundry",
    "Azure OpenAI",
    "DeepSeek",
    "Claude",
    "Gemini",
    "GLM",
    "Kimi",
    "cost verification",
  ],
  openGraph: {
    type: "website",
    title: `${site.name}: ${site.tagline}`,
    description: site.description,
    siteName: site.name,
    url: site.url,
    images: [{ url: "/icon.svg", width: 64, height: 64, alt: `${site.name} mark` }],
  },
  twitter: {
    card: "summary",
    title: `${site.name}: ${site.tagline}`,
    description: site.description,
    images: ["/icon.svg"],
  },
  robots: { index: true, follow: true },
};

// Set the theme before paint to avoid a flash of the wrong palette.
const themeScript = `(function(){try{var t=localStorage.getItem('llm-spend-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${ibmSans.variable} ${ibmMono.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
