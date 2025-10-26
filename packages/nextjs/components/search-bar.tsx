"use client";
import { RefreshCwIcon, SearchIcon } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FULL_TEXT_SEARCH_PARAM_NAME } from "@/lib/Constants";
import { useMutateSearchParams } from "@/hooks/UIHooks/use-mutate-search";

type SearchBarProps = {
  /** @default paramName = "s" */
  paramName?: string;

  formProps?: React.ComponentProps<"form">;
  inputProps?: React.ComponentProps<"input">;
};

const SEARCH_INPUT_ID = "search-input";

/**
 * by default the paramName is "s", be sure to track it with your searchParams
 */
export function SearchBar({
  paramName = FULL_TEXT_SEARCH_PARAM_NAME,
  formProps,
  inputProps,
}: SearchBarProps) {
  const { replaceSet, replaceDelete, searchParams } = useMutateSearchParams();

  return (
    <form
      {...formProps}
      className={cn("relative flex gap-2", formProps?.className)}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const s = formData.get(SEARCH_INPUT_ID);

        if (s) {
          replaceSet(paramName, (s as string).toUpperCase());
          return;
        }

        replaceDelete(paramName);
      }}
    >
      <Input
        type="text"
        placeholder="Buscar..."
        {...inputProps}
        id={SEARCH_INPUT_ID}
        name={SEARCH_INPUT_ID}
        className={cn("flex-1 uppercase", inputProps?.className)}
        defaultValue={searchParams.get(paramName) ?? ""}
      />
      <Button type="submit" variant="outline" title="Buscar">
        <SearchIcon className="mr-2 h-4 w-4" /> Buscar
      </Button>
      <Button
        type="reset"
        variant="outline"
        size="icon"
        title="Borrar busqueda"
        onClick={() => {
          replaceDelete(paramName);
        }}
      >
        <RefreshCwIcon className="h-4 w-4" />
      </Button>
    </form>
  );
}

export function SearchBarContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="">{children}</div>;
}
