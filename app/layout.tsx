import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "위싱 찬양팀 로테이션",
    description: "위싱 찬양팀 예배 로테이션 공지",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <head>
                <link
                    rel="stylesheet"
                    as="style"
                    crossOrigin="anonymous"
                    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
                />
            </head>
            <body className="min-h-screen font-pretendard bg-slate-50 text-slate-900 antialiased selection:bg-brand-200 selection:text-brand-900">
                {children}
            </body>
        </html>
    );
}
