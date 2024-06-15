import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@nextui-org/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import NavBar  from "@/components/NavBar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark", children:[]}}>
          <div className="relative flex flex-col h-screen">
            <NavBar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-3">
              <span className="text-default-600">Made by</span>
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://github.com/lumafepe/"
                title="Luís Pereira homepage"
              >
                <p className="text-primary"> Luís Pereira </p>
              </Link>
              &
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://github.com/tiago-bacelar/"
                title="Tiago Pereira homepage"
              >
                <p className="text-primary"> Tiago Pereira </p>
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
