/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useRouter } from "next/navigation";
import { type TRPCQueryKey } from "@trpc/tanstack-react-query";
import { useQueryClient } from "@tanstack/react-query";

export function useMutationWithRefresh<TOptions extends object>(
    baseOptions: TOptions,
    queryKey: TRPCQueryKey,
) {
    const queryClient = useQueryClient();
    const router = useRouter();

    return {
        ...baseOptions,
        onSuccess: async (...args: any[]) => {
            const [data, variables, context] = args;

            if (
                "onSuccess" in baseOptions &&
                typeof baseOptions.onSuccess === "function"
            ) {
                await baseOptions.onSuccess(data, variables, context);
            }

            await queryClient.invalidateQueries({ queryKey });
            router.refresh();
        },
    };
}
