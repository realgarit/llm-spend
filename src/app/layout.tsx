import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/lib/site";

const ibmSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-sans",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-mono",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic", "normal"],
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
