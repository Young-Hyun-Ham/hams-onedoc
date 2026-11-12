import type { Metadata } from "next";
import { AppStoreProvider } from "@/components/providers/app-store-provider";
import { THEME_KEY } from "@/stores/ui-store";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HAMS onedoc · 프로젝트 문서 통합관리",
    template: "%s | HAMS onedoc",
  },
  description:
    "요구사항부터 설계, 변경 이력, 최종 산출물까지. 프로젝트 문서를 하나의 흐름으로 관리합니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem(${JSON.stringify(THEME_KEY)})==='dark'?'dark':'light'}catch{document.documentElement.dataset.theme='light'}`,
          }}
        />
      </head>
      <body>
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  );
}
