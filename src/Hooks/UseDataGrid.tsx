import { ColumnSchema, DataGridSchema, FilterSetSchema, PaginationSchema, SortSchema } from '@/Schema';
import { useCallback, useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface UseDataGridProps<T> {
    schema: DataGridSchema;
    onSuccess?: (data: T[]) => void;
    onError?: (error: Error) => void;
}

export const useDataGrid = <T,>({ schema, onSuccess, onError }: UseDataGridProps<T>) => {
    const [data, setData] = useState<T[]>([]);
    const [isDataGridLoading, setIsDataGridLoading] = useState(false);
    const [filterSets, setFilterSets] = useState<FilterSetSchema[]>([]);
    const [sorts, setSorts] = useState<SortSchema[]>(schema.default_sorts || []);
    const [columns, setColumns] = useState<ColumnSchema[]>(schema.columns);
    const [pagination, setPagination] = useState<PaginationSchema>({
        currentPage: 1,
        perPage: 10,
        lastPage: 1,
        total: 0,
        from: 0,
        to: 0,
    });

    const fetchData = useCallback(() => {
        setIsDataGridLoading(true);
        const requestBody = {
            page: pagination.currentPage,
            per_page: pagination.perPage,
            sorts,
            filter_sets: filterSets,
        };

        fetch(route(schema.routes.data), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(requestBody),
        })
            .then((res) => res.json())
            .then((data) => {
                setPagination({
                    currentPage: data.current_page,
                    lastPage: data.last_page,
                    perPage: data.per_page,
                    total: data.total,
                    from: data.from,
                    to: data.to,
                });
                setData(data.data);
                onSuccess?.(data.data);
            })
            .catch((err) => {
                console.error('Error fetching data:', err);
                onError?.(err);
            })
            .finally(() => setIsDataGridLoading(false));
    }, [pagination.currentPage, pagination.perPage, sorts, filterSets, schema.routes.data]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleColumn = useCallback((alias: string) => {
        setColumns((cols) => cols.map((col) => (col.alias === alias ? { ...col, is_hidden: !col.is_hidden } : col)));
    }, []);

    return {
        columns,
        setColumns,
        filterSets,
        setFilterSets,
        sorts,
        setSorts,
        data,
        pagination,
        setPagination,
        toggleColumn,
        isDataGridLoading,
        fetchData,
    };
};
