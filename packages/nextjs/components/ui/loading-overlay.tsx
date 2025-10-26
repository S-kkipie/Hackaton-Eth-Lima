"use client";

import { Card } from "@/components/ui/card";

interface LoadingOverlayProps {
    message?: string;
    isVisible?: boolean;
}

export function LoadingOverlay({
    message = "Cargando...",
    isVisible = true,
}: LoadingOverlayProps) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <Card className="flex flex-col items-center px-5 py-4">
                <div className="loader-dots relative mt-2 block h-5 w-20">
                    <div className="absolute top-0 mt-1 h-3 w-3 rounded-full bg-primary"></div>
                    <div className="absolute top-0 mt-1 h-3 w-3 rounded-full bg-primary"></div>
                    <div className="absolute top-0 mt-1 h-3 w-3 rounded-full bg-primary"></div>
                    <div className="absolute top-0 mt-1 h-3 w-3 rounded-full bg-primary"></div>
                </div>
                <div className="mt-2 text-center text-xs font-medium text-muted-foreground">
                    {message}
                </div>
                <style jsx>{`
                    .loader-dots div {
                        animation-timing-function: cubic-bezier(0, 1, 1, 0);
                    }
                    .loader-dots div:nth-child(1) {
                        left: 8px;
                        animation: loader-dots1 0.6s infinite;
                    }
                    .loader-dots div:nth-child(2) {
                        left: 8px;
                        animation: loader-dots2 0.6s infinite;
                    }
                    .loader-dots div:nth-child(3) {
                        left: 32px;
                        animation: loader-dots2 0.6s infinite;
                    }
                    .loader-dots div:nth-child(4) {
                        left: 56px;
                        animation: loader-dots3 0.6s infinite;
                    }
                    @keyframes loader-dots1 {
                        0% {
                            transform: scale(0);
                        }
                        100% {
                            transform: scale(1);
                        }
                    }
                    @keyframes loader-dots3 {
                        0% {
                            transform: scale(1);
                        }
                        100% {
                            transform: scale(0);
                        }
                    }
                    @keyframes loader-dots2 {
                        0% {
                            transform: translate(0, 0);
                        }
                        100% {
                            transform: translate(24px, 0);
                        }
                    }
                `}</style>
            </Card>
        </div>
    );
}
