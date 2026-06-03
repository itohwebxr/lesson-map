import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://www.lessonmap.app";

const GTM_ID = "GTM-KHJ7BXMF";
const isProd = process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/favicon.ico",
  },
  title: "大津市・草津市の習い事検索｜地図で探せるLessonMap",
  description:
    "大津市・草津市の習い事を地図で検索。サッカー、スイミング、英会話、ピアノ、ダンスなどの教室情報をまとめて掲載。曜日・時間・対象年齢で比較しながら探せます。",
  keywords: [
    "大津市 習い事",
    "草津市 習い事",
    "子ども 習い事",
    "習い事検索",
    "サッカー教室",
    "スイミングスクール",
    "英会話教室",
    "ピアノ教室",
    "ダンス教室",
  ],
  openGraph: {
    title: "大津市・草津市の習い事検索｜LessonMap",
    description:
      "地図から探せる習い事検索サービス。曜日・時間・対象年齢で比較できます。",
    siteName: "LessonMap",
    locale: "ja_JP",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/ogp.png`,
        width: 1200,
        height: 630,
        alt: "大津市・草津市の習い事検索｜LessonMap",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "大津市・草津市の習い事検索｜LessonMap",
    description:
      "地図から探せる習い事検索サービス。曜日・時間・対象年齢で比較できます。",
    images: [`${SITE_URL}/ogp.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {isProd && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}
      </head>
      <body className="h-full flex flex-col">
        {isProd && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "LessonMap",
              url: SITE_URL,
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
