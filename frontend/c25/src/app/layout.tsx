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
      > <div
  className="
    fixed inset-0 -z-10 pointer-events-none
    bg-[radial-gradient(120rem_90rem_at_40%_40%,rgba(0,0,0,0)_55%,rgba(0,0,0,0.12)_78%,rgba(0,0,0,0.24)_100%),radial-gradient(70rem_70rem_at_72%_58%,rgba(255,210,64,0.85)_0%,rgba(255,150,40,0.55)_38%,rgba(255,92,64,0.30)_60%,transparent_75%),radial-gradient(90rem_90rem_at_12%_70%,rgba(21,199,178,0.40)_0%,rgba(21,199,178,0.22)_40%,transparent_70%),linear-gradient(135deg,#0b1220_0%,#0b1220_35%,#0f172a_100%)]
    blur-[70px] sm:blur-[90px] saturate-[1.18] brightness-[1.06]
    scale-105
  "
/>

        {children}
      </body>
    </html>
  );
}
