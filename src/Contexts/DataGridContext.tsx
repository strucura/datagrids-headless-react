import {
    DeleteBookmarkProps,
    RunBulkActionProps,
    RunInlineActionProps,
    StoreBookmarkProps,
    useBookmark,
    useBulkAction,
    useDataGrid,
    useInlineAction,
} from '@/Hooks';
import {
    ActionSchema,
    BookmarkSchema,
    ColumnSchema,
    DataGridSchema,
    FilterSetSchema,
    PaginationSchema,
    SortSchema,
} from '@/Schema';
import React, { createContext, Dispatch, JSX, ReactNode, SetStateAction, useContext } from 'react';

interface DataGridContextProps<T> {
    columns: ColumnSchema[];
    setColumns: Dispatch<SetStateAction<ColumnSchema[]>>;
    filterSets: FilterSetSchema[];
    setFilterSets: Dispatch<SetStateAction<FilterSetSchema[]>>;
    sorts: SortSchema[];
    setSorts: Dispatch<SetStateAction<SortSchema[]>>;
    data: T[];

    // Pagination
    pagination: PaginationSchema;
    setPagination: Dispatch<SetStateAction<PaginationSchema>>;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    goToPage: (page: number) => void;
    hasNextPage: () => boolean;
    hasPreviousPage: () => boolean;

    toggleColumn: (alias: string) => void;
    fetchData: () => void;
    isDataGridLoading: boolean;

    bulkActions: ActionSchema[];
    hasBulkActions: boolean;
    selectedRows: T[];
    setSelectedRows: Dispatch<SetStateAction<T[]>>;
    toggleRowSelection: (row: T) => void;
    runBulkAction: ({ action, onSuccess, onError }: RunBulkActionProps) => void;
    isRunningBulkAction: boolean;

    hasInlineActions: boolean;
    inlineActions: ActionSchema[];
    runInlineAction: ({ action, selectedRow, onSuccess, onError }: RunInlineActionProps<T>) => void;
    isRunningInlineAction: boolean;

    fetchBookmarks: () => void;
    setBookmarks: Dispatch<SetStateAction<BookmarkSchema[]>>;
    bookmarks: BookmarkSchema[];
    storeBookmark: ({ bookmarkName, filterSets, sorts, columns, onSuccess, onError }: StoreBookmarkProps) => void;
    deleteBookmark: ({ id, onSuccess, onError }: DeleteBookmarkProps) => void;
    isLoadingBookmarks: boolean;
    isDeletingBookmark: boolean;
    isStoringBookmark: boolean;
}

interface DataGridProviderProps {
    children: ReactNode;
    schema: DataGridSchema; // The schema for the data grid
}

const DataGridContext = createContext<DataGridContextProps<any> | undefined>(undefined);

export function DataGridProvider<T>({ children, schema }: DataGridProviderProps): JSX.Element {
    const {
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
        goToNextPage,
        goToPreviousPage,
        goToPage,
        hasNextPage,
        hasPreviousPage,
    } = useDataGrid<T>({ schema });

    const {
        bulkActions,
        hasBulkActions,
        selectedRows,
        setSelectedRows,
        toggleRowSelection,
        runBulkAction,
        isRunningBulkAction,
    } = useBulkAction<T>({ schema });

    const { hasInlineActions, inlineActions, runInlineAction, isRunningInlineAction } = useInlineAction({ schema });

    const {
        fetchBookmarks,
        setBookmarks,
        bookmarks,
        storeBookmark,
        deleteBookmark,
        isLoadingBookmarks,
        isDeletingBookmark,
        isStoringBookmark,
    } = useBookmark({ schema });

    return (
        <DataGridContext.Provider
            value={{
                // Data Grid
                columns,
                setColumns,
                toggleColumn,
                filterSets,
                setFilterSets,
                sorts,
                setSorts,
                data,
                fetchData,
                isDataGridLoading,

                // Pagination
                pagination,
                setPagination,
                goToNextPage,
                goToPreviousPage,
                goToPage,
                hasNextPage,
                hasPreviousPage,

                // Bulk Actions
                bulkActions,
                hasBulkActions,
                selectedRows,
                setSelectedRows,
                toggleRowSelection,
                runBulkAction,
                isRunningBulkAction,

                // Inline Actions
                hasInlineActions,
                inlineActions,
                runInlineAction,
                isRunningInlineAction,

                // Bookmarks
                fetchBookmarks,
                setBookmarks,
                bookmarks,
                storeBookmark,
                deleteBookmark,
                isLoadingBookmarks,
                isDeletingBookmark,
                isStoringBookmark,
            }}
        >
            {children}
        </DataGridContext.Provider>
    );
}

export function useDataGridContext<T>() {
    const context = useContext(DataGridContext);
    if (!context) {
        throw new Error('useDataGridContext must be used within a DataGridProvider');
    }
    return context as DataGridContextProps<T>;
}
