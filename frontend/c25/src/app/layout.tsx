import type { Metadata } from "next";
import { Space_Grotesk} from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable}`}>
      <body
        className="font-sans antialiased" style={{ fontFamily: "var(--font-space-grotesk)" }}
      > <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-15rem] right-[-5rem] h-[40rem] w-[40rem] rounded-full bg-orange-500/90 dark:bg-slate-400/30 blur-[8rem] sm:h-[50rem] sm:w-[50rem] sm:right-[5rem]"></div>
          <div className="absolute top-[-10rem] left-[-15rem] h-[45rem] w-[45rem] rounded-full bg-cyan-700/90 dark:bg-zinc-400/30 blur-[8rem] sm:h-[55rem] sm:w-[55rem] sm:left-[-5rem] lg:left-[0rem]"></div>
          <div className="absolute bottom-[-20rem] left-1/2 transform -translate-x-1/2 h-[50rem] w-[50rem] rounded-full bg-red-800/50 dark:bg-gray-700/55 blur-[8rem] sm:h-[60rem] sm:w-[60rem]"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
