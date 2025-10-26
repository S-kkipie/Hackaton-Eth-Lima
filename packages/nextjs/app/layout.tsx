import { Metadata } from "next";
import { ScaffoldStarkAppWithProviders } from "../components/ScaffoldStarkAppWithProviders";
import { ThemeProvider } from "../components/ThemeProvider";
import "./globals.css";
export const metadata: Metadata = {
  title: "EcoTrace",
  description:
    "Plataforma para mejorar la trazabilidad de productos enfocado en optimizar una economia circular en las MIPYMES peruanas.",
  icons: "/logo.ico",
};

const ScaffoldStarkApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ScaffoldStarkAppWithProviders>
            {children}
          </ScaffoldStarkAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldStarkApp;
