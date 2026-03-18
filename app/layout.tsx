import type { Metadata } from "next";

import "@mantine/core/styles.css";

import "@mantine/dates/styles.css";

import "./globals.css";

import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { SupabaseProvider } from "@/lib/supabase-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "EM To Do – Eisenhower Matrix To Do",
  description:
    "A calm, intimate productivity app built around the Eisenhower Matrix to help you focus on what truly matters."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body className={`${inter.variable} bg-navy-900 text-text-primary`}>
        <SupabaseProvider>
          <MantineProvider
            defaultColorScheme="dark"
            theme={{
              fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
              defaultRadius: "md",
              colors: {
                dark: [
                  "#0B132B",
                  "#151B37",
                  "#1F2A44",
                  "#253155",
                  "#2E3A63",
                  "#384571",
                  "#42507F",
                  "#4C5C8D",
                  "#56679B",
                  "#6073A9"
                ]
              }
            }}
          >
            <ModalsProvider>{children}</ModalsProvider>
          </MantineProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}

