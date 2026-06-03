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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  },
  twitter: {
    card: "summary_large_image",
    title: "大津市・草津市の習い事検索｜LessonMap",
    description:
      "地図から探せる習い事検索サービス。曜日・時間・対象年齢で比較できます。",
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
      <body className="h-full flex flex-col">
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
