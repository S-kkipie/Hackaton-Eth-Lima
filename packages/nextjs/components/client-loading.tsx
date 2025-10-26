"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { LoadingOverlay } from "./ui/loading-overlay";

type ClientLoadingContextType = {
    clientLoading: boolean;
     
    setClientLoading: (value: boolean) => void;
};

export const ClientLoadingContext = createContext<
    ClientLoadingContextType | undefined
>(undefined);

export const ClientLoadingProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [clientLoading, setClientLoading] = useState<boolean>(false);

    return (
        <ClientLoadingContext.Provider
            value={{ clientLoading, setClientLoading }}
        >
            {children}
        </ClientLoadingContext.Provider>
    );
};

export const useClientLoading = () => {
    const context = useContext(ClientLoadingContext);
    if (!context) {
        throw new Error(
            "useClientLoading debe usarse dentro de ClientLoadingProvider",
        );
    }
    return context;
};

export function LoadingOverlayWrapper() {
    const { clientLoading } = useClientLoading();

    return <LoadingOverlay isVisible={clientLoading} />;
}
