import { BookmarkSchema } from '@/Schema/BookmarkSchema.js';
import FilterSetSchema from '@/Schema/FilterSetSchema.js';
import { DataGridSchema } from '@/Schema/index.js';
import SortSchema from '@/Schema/SortSchema.js';
import { useCallback, useEffect, useState } from 'react';
import { route } from 'ziggy-js';

export interface UseBookmarkProps {
    schema: DataGridSchema;
}

export interface DeleteBookmarkProps {
    id: number;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export interface StoreBookmarkProps {
    bookmarkName: string;
    filterSets: FilterSetSchema[];
    sorts: SortSchema[];
    columns: Record<string, boolean>;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

const useBookmark = ({ schema }: UseBookmarkProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [bookmarks, setBookmarks] = useState<BookmarkSchema[]>([]);

    const fetchBookmarks = useCallback(() => {
        fetch(route(schema.routes.bookmarks.index))
            .then((response) => response.json())
            .then((data) => {
                setBookmarks(data.bookmarks);
            })
            .catch((error) => {
                console.error('Error fetching bookmarks:', error);
            });
    }, [schema.routes.bookmarks.index]);

    // Fetch bookmarks when the hook is initialized
    useEffect(() => {
        fetchBookmarks();
    }, [fetchBookmarks]);

    const storeBookmark = useCallback(
        ({ bookmarkName, filterSets, sorts, columns, onSuccess, onError }: StoreBookmarkProps) => {
            setIsLoading(true);
            fetch(route(schema.routes.bookmarks.store), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    name: bookmarkName,
                    filter_sets: filterSets,
                    sorts: sorts,
                    columns: columns,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    setBookmarks((prevBookmarks) => [...prevBookmarks, data.bookmark]);
                })
                .then(() => {
                    onSuccess?.();
                })
                .catch((error) => {
                    onError?.(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [schema.routes.bookmarks.store, bookmarks],
    );

    const deleteBookmark = useCallback(
        ({ id, onSuccess, onError }: DeleteBookmarkProps) => {
            setIsLoading(true);
            fetch(
                route(schema.routes.bookmarks.destroy, {
                    id,
                }),
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                },
            )
                .then((response) => response.json())
                .then(() => {
                    setBookmarks((prevBookmarks) => prevBookmarks.filter((bookmark) => bookmark.id !== id));
                })
                .then(() => {
                    onSuccess?.();
                })
                .catch((error) => {
                    onError?.(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [schema.routes.bookmarks.destroy, bookmarks],
    );

    return {
        fetchBookmarks,
        setBookmarks,
        bookmarks,
        storeBookmark,
        deleteBookmark,
        isLoadingBookmarks: isLoading,
    };
};

export default useBookmark;
