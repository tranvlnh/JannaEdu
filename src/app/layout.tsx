import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: { default: "Janna Edu", template: "%s | Janna Edu" },
  description: "Luyện thi IELTS thông minh với Giám khảo AI, phòng thi ảo và lộ trình cá nhân hóa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
