import { ColumnSchema, DataGridSchema, FilterSetSchema, SortSchema } from '@/Schema';
import { useCallback, useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface UseTableProps {
    schema: DataGridSchema;
    localStorageKeyPrefix?: string; // Optional prefix for local storage keys
}

export interface PaginationState {
    currentPage: number;
    perPage: number;
    lastPage: number;
    total: number;
    from: number;
    to: number;
}

const useDataGrid = <T,>({ schema }: UseTableProps) => {
    /**
     * Initialize Row Data
     */
    const [data, setData] = useState<T[]>([]);

    /**
     * Initialize State for our selected rows, filter sets, sorts, and columns
     */
    const [selectedRows, setSelectedRows] = useState<T[]>([]);
    const [filterSets, setFilterSets] = useState<FilterSetSchema[]>([]);
    const [sorts, setSorts] = useState<SortSchema[]>(schema.default_sorts || []);
    const [columns, setColumns] = useState<ColumnSchema[]>(schema.columns);

    /**
     * Initialize State for our data and pagination
     */
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        perPage: 10,
        lastPage: 1,
        total: 0,
        from: 0,
        to: 0,
    });

    /**
     * Fetch data from the server based on the current state of pagination, sorts, and filterSets
     */
    const fetchData = useCallback(() => {
        fetch(route(schema.routes.data), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                page: pagination.currentPage,
                per_page: pagination.perPage,
                sorts: sorts,
                filter_sets: filterSets,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                setPagination({
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    perPage: data.per_page,
                    total: data.total,
                    from: data.from,
                    to: data.to,
                });
                setSelectedRows([]);
                setData(data.data);
            });
    }, [pagination.currentPage, pagination.perPage, sorts, filterSets, schema.routes.data]);

    /**
     * Fetch data when the component mounts or when any of the dependencies change
     */
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        selectedRows,
        setSelectedRows,
        columns,
        setColumns,
        filterSets,
        setFilterSets,
        sorts,
        setSorts,
        data,
        pagination,
        setPagination,
    };
};

export default useDataGrid;
