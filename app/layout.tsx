import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { Sidebar } from "@/components/Sidebar";
import { RopeToggle } from "@/components/RopeToggle";

const inter = Inter({
  variable: "--font-text",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-header",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schedulium",
  description: "Manage your tasks in isolated workspaces with a premium interactive experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} font-text antialiased min-h-screen bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider>
          <WorkspaceProvider>
            <div className="flex">
              <Sidebar />
              <main className="flex-1 ml-64 min-h-screen relative">
                <RopeToggle />
                {children}
              </main>
            </div>
          </WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
