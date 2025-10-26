import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import type * as React from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getCommonPinningStyles } from "@/lib/data-table";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface DataTableProps<TData extends { id: string | number }>
    extends React.ComponentProps<"div"> {
    table: TanstackTable<TData>;
    actionBar?: React.ReactNode;
    clickable?: string;
}

export function DataTable<TData extends { id: string | number }>({
    table,
    actionBar,
    children,
    className,
    clickable,
    ...props
}: DataTableProps<TData>) {
    const router = useRouter();

    return (
        <div
            className={cn(
                "flex w-full flex-col gap-2.5 overflow-auto",
                className,
            )}
            {...props}
        >
            {children}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        style={{
                                            ...getCommonPinningStyles({
                                                column: header.column,
                                            }),
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef
                                                    .header,
                                                header.getContext(),
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row
                                        .getVisibleCells()
                                        .map((cell, index) => (
                                            <TableCell
                                                key={cell.id}
                                                style={{
                                                    ...getCommonPinningStyles({
                                                        column: cell.column,
                                                    }),
                                                    cursor:
                                                        clickable &&
                                                        index !== 0 &&
                                                        row.getVisibleCells()
                                                            .length -
                                                            1 !==
                                                            index
                                                            ? "pointer"
                                                            : undefined,
                                                }}
                                                onClick={() => {
                                                    if (
                                                        clickable &&
                                                        index !== 0 &&
                                                        row.getVisibleCells()
                                                            .length -
                                                            1 !==
                                                            index
                                                    ) {
                                                        router.push(
                                                            clickable +
                                                                String(
                                                                    row.original
                                                                        .id,
                                                                ),
                                                        );
                                                    }
                                                }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getAllColumns().length}
                                    className="h-24 text-center"
                                >
                                    Sin resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {table.getRowModel().rows?.length ? (
                        <TableFooter>
                            {table.getFooterGroups().map((footerGroup) => (
                                <TableRow key={footerGroup.id}>
                                    {footerGroup.headers.map((footer) => (
                                        <TableCell key={footer.id}>
                                            {flexRender(
                                                footer.column.columnDef.footer,
                                                footer.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableFooter>
                    ) : (
                        <></>
                    )}
                </Table>
            </div>
            <div className="flex flex-col gap-2.5">
                <DataTablePagination table={table} />
                {actionBar &&
                    table.getFilteredSelectedRowModel().rows.length > 0 &&
                    actionBar}
            </div>
        </div>
    );
}
