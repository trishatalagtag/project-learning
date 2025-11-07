"use client";

import * as React from "react";
import { twJoin, twMerge } from "tailwind-merge";

const DataTableContext = React.createContext<{
    bleed?: boolean;
    grid?: boolean;
    striped?: boolean;
}>({});

interface TableProps extends React.ComponentProps<"table"> {
    bleed?: boolean;
    grid?: boolean;
    striped?: boolean;
}

const Table = ({ className, bleed = false, grid = false, striped = false, ...props }: TableProps) => {
    return (
        <DataTableContext.Provider value={{ bleed, grid, striped }}>
            <div className="flow-root">
                <div className={twMerge("-mx-(--gutter) relative overflow-x-auto whitespace-nowrap [--gutter-y:--spacing(2)]", className)}>
                    <div className={twJoin("inline-block min-w-full align-middle", !bleed && "sm:px-(--gutter)")}>
                        <table className="w-full min-w-full caption-bottom text-sm/6 outline-hidden [--table-selected-bg:var(--color-secondary)]/50" {...props} />
                    </div>
                </div>
            </div>
        </DataTableContext.Provider>
    );
};

const TableHeader = ({ className, ...props }: React.ComponentProps<"thead">) => (
    <thead className={twMerge("border-b", className)} {...props} />
);

const TableBody = ({ className, ...props }: React.ComponentProps<"tbody">) => (
    <tbody {...props} />
);

const TableRow = ({ className, ...props }: React.ComponentProps<"tr">) => {
    const { striped } = React.useContext(DataTableContext);
    return (
        <tr
            className={twMerge(
                "group relative cursor-default text-muted-fg outline outline-transparent hover:bg-(--table-selected-bg) hover:text-fg data-[state=selected]:bg-(--table-selected-bg) data-[state=selected]:text-fg",
                striped && "even:bg-muted",
                className
            )}
            {...props}
        />
    );
};

const TableHead = ({ className, ...props }: React.ComponentProps<"th">) => {
    const { bleed, grid } = React.useContext(DataTableContext);
    return (
        <th
            className={twMerge(
                twJoin([
                    "px-4 py-(--gutter-y) text-left font-medium text-muted-fg first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2))",
                    !bleed && "sm:last:pr-1 sm:first:pl-1",
                    grid && "border-l first:border-l-0",
                ]),
                className
            )}
            {...props}
        />
    );
};

const TableCell = ({ className, ...props }: React.ComponentProps<"td">) => {
    const { bleed, grid, striped } = React.useContext(DataTableContext);
    return (
        <td
            className={twMerge(
                twJoin([
                    "px-4 py-(--gutter-y) align-middle first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2))",
                    !striped && "border-b",
                    grid && "border-l first:border-l-0",
                    !bleed && "sm:last:pr-1 sm:first:pl-1",
                ]),
                className
            )}
            {...props}
        />
    );
};

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
