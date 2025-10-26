"use client";

import type { Column, Table } from "@tanstack/react-table";
import { Filter, X } from "lucide-react";
import * as React from "react";

import { DataTableDateFilter } from "@/components/data-table/data-table-date-filter";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableSliderFilter } from "@/components/data-table/data-table-slider-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import {
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    Drawer,
} from "../ui/drawer";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
    table: Table<TData>;
}

export function DataTableToolbar<TData>({
    table,
    children,
    className,
    ...props
}: DataTableToolbarProps<TData>) {
    const [open, setOpen] = React.useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const isFiltered = table.getState().columnFilters.length > 0;

    const columns = React.useMemo(
        () => table.getAllColumns().filter((column) => column.getCanFilter()),
        [table],
    );

    const activeFiltersCount = React.useMemo(() => {
        return table.getState().columnFilters.length;
    }, [table]);

    const onReset = React.useCallback(() => {
        table.resetColumnFilters();
    }, [table]);

    if (isMobile) {
        return (
            <div
                role="toolbar"
                aria-orientation="horizontal"
                className={cn(
                    "flex w-full items-center justify-between gap-2 p-1",
                    className,
                )}
                {...props}
            >
                <div className="flex items-center gap-2">
                    <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="relative bg-transparent"
                            >
                                <Filter className="h-4 w-4" />
                                Filtros
                                {activeFiltersCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                                    >
                                        {activeFiltersCount}
                                    </Badge>
                                )}
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader className="">
                                <DrawerTitle>Filtros</DrawerTitle>
                                <DrawerDescription>
                                    Configura los filtros para refinar los
                                    resultados de la tabla.
                                </DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 space-y-4">
                                {columns.map((column) => (
                                    <div key={column.id} className="space-y-2">
                                        <DataTableToolbarFilter
                                            column={column}
                                        />
                                    </div>
                                ))}
                            </div>
                            {isFiltered && (
                                <DrawerFooter className="gap-2 sm:space-x-0">
                                    <Button
                                        aria-label="Reset filters"
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed bg-transparent"
                                        onClick={onReset}
                                    >
                                        <X />
                                        Limpiar filtros
                                    </Button>
                                </DrawerFooter>
                            )}
                        </DrawerContent>
                    </Drawer>
                </div>

                <div className="flex items-center gap-2">
                    {children}
                    <DataTableViewOptions table={table} />
                </div>
            </div>
        );
    }

    return (
        <div
            role="toolbar"
            aria-orientation="horizontal"
            className={cn(
                "flex w-full items-start justify-between gap-2 p-1",
                className,
            )}
            {...props}
        >
            <div className="flex flex-1 flex-wrap items-center gap-2">
                {columns.map((column) => (
                    <DataTableToolbarFilter key={column.id} column={column} />
                ))}
                {isFiltered && (
                    <Button
                        aria-label="Reset filters"
                        variant="outline"
                        size="sm"
                        className="border-dashed bg-transparent"
                        onClick={onReset}
                    >
                        <X />
                        Limpiar filtros
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
                {children}
                <DataTableViewOptions table={table} />
            </div>
        </div>
    );
}

interface DataTableToolbarFilterProps<TData> {
    column: Column<TData>;
}

function DataTableToolbarFilter<TData>({
    column,
}: DataTableToolbarFilterProps<TData>) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const columnMeta = column.columnDef.meta;

    const onFilterRender = React.useCallback(() => {
        if (!columnMeta?.variant) return null;

        switch (columnMeta.variant) {
            case "text":
                return (
                    <Input
                        placeholder={columnMeta.placeholder ?? columnMeta.label}
                        value={(column.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            column.setFilterValue(event.target.value)
                        }
                        className={cn(
                            "h-8",
                            isMobile ? "w-full" : "w-40 lg:w-56",
                        )}
                    />
                );

            case "number":
                return (
                    <div className="relative">
                        <Input
                            type="number"
                            inputMode="numeric"
                            placeholder={
                                columnMeta.placeholder ?? columnMeta.label
                            }
                            value={(column.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                column.setFilterValue(event.target.value)
                            }
                            className={cn(
                                "h-8",
                                isMobile ? "w-full" : "w-[120px]",
                                columnMeta.unit && "pr-8",
                            )}
                        />
                        {columnMeta.unit && (
                            <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                                {columnMeta.unit}
                            </span>
                        )}
                    </div>
                );

            case "range":
                return (
                    <DataTableSliderFilter
                        column={column}
                        title={columnMeta.label ?? column.id}
                    />
                );

            case "date":
            case "dateRange":
                return (
                    <DataTableDateFilter
                        column={column}
                        title={columnMeta.label ?? column.id}
                        multiple={columnMeta.variant === "dateRange"}
                    />
                );

            case "select":
            case "multiSelect":
                return (
                    <DataTableFacetedFilter
                        column={column}
                        title={columnMeta.label ?? column.id}
                        options={columnMeta.options ?? []}
                        multiple={columnMeta.variant === "multiSelect"}
                    />
                );

            default:
                return null;
        }
    }, [column, columnMeta, isMobile]);

    return onFilterRender();
}
