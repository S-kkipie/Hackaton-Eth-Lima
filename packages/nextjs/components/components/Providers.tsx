"use client";

import { ClientLoadingProvider, LoadingOverlayWrapper } from "./client-loading";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
          <ClientLoadingProvider>
            <NuqsAdapter>
              <LoadingOverlayWrapper />
              {children}
            </NuqsAdapter>
          </ClientLoadingProvider>
  );
}
