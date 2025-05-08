import { renderHook, act } from '@testing-library/react';
import { useBookmark } from '@/Hooks';
import { DataGridSchema } from '@/Schema';
import { route } from 'ziggy-js';

jest.mock('ziggy-js', () => ({
    route: jest.fn(),
}));

global.fetch = jest.fn();

describe('useBookmark', () => {
    const mockSchema: DataGridSchema = {
        routes: {
            data: '/data',
            schema: '/schema',
            actions: {
                inline: '/actions/inline',
                bulk: '/actions/bulk',
            },
            bookmarks: {
                index: '/bookmarks/index',
                store: '/bookmarks/store',
                destroy: '/bookmarks/destroy',
            },
        },
        grid_key: 'test-grid',
        columns: [],
        default_sorts: [],
        bulk_actions: [],
        inline_actions: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with correct state', async () => {
        const mockResponse = { bookmarks: [] };

        (route as jest.Mock).mockReturnValue('/bookmarks/index');
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const { result } = renderHook(() => useBookmark({ schema: mockSchema }));

        await act(async () => {
            // Wait for the useEffect to complete
        });

        expect(result.current.isLoadingBookmarks).toBe(false);
        expect(result.current.isDeletingBookmark).toBe(false);
        expect(result.current.isStoringBookmark).toBe(false);
        expect(result.current.bookmarks).toEqual([]);
    });

    it('should fetch bookmarks successfully', async () => {
        const mockResponse = { bookmarks: [{ id: 1, name: 'Test Bookmark', filter_sets: [], sorts: [], columns: {} }] };

        (route as jest.Mock).mockReturnValue('/bookmarks/index');
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const { result } = renderHook(() => useBookmark({ schema: mockSchema }));

        await act(async () => {
            result.current.fetchBookmarks();
        });

        expect(route).toHaveBeenCalledWith('/bookmarks/index');
        expect(fetch).toHaveBeenCalledWith('/bookmarks/index');
        expect(result.current.bookmarks).toEqual(mockResponse.bookmarks);
        expect(result.current.isLoadingBookmarks).toBe(false);
    });

    it('should store a bookmark successfully', async () => {
        // Mock for fetchBookmarks
        const initialBookmarksResponse = { bookmarks: [{ id: 1, name: 'Existing Bookmark', filter_sets: [], sorts: [], columns: {} }] };
        (route as jest.Mock).mockReturnValueOnce('/bookmarks/index');
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue(initialBookmarksResponse),
        });

        const { result } = renderHook(() => useBookmark({ schema: mockSchema }));

        // Wait for fetchBookmarks to complete
        await act(async () => {});

        // Mock for storeBookmark
        const newBookmarkResponse = { bookmark: { id: 2, name: 'New Bookmark', filter_sets: [], sorts: [], columns: {} } };
        (route as jest.Mock).mockReturnValueOnce('/bookmarks/store');
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue(newBookmarkResponse),
        });

        const onSuccess = jest.fn();

        await act(async () => {
            result.current.storeBookmark({
                bookmarkName: 'New Bookmark',
                filterSets: [],
                sorts: [],
                columns: [],
                onSuccess,
            });
        });

        expect(route).toHaveBeenCalledWith('/bookmarks/store');
        expect(fetch).toHaveBeenCalledWith('/bookmarks/store', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                name: 'New Bookmark',
                filter_sets: [],
                sorts: [],
                columns: [],
            }),
        }));
        expect(result.current.bookmarks).toContainEqual(newBookmarkResponse.bookmark);
        expect(onSuccess).toHaveBeenCalled();
        expect(result.current.isStoringBookmark).toBe(false);
    });

    it('should store a bookmark successfully', async () => {
        // Mock for fetchBookmarks
        const initialBookmarksResponse = { bookmarks: [{ id: 1, name: 'Existing Bookmark', filter_sets: [], sorts: [], columns: {} }] };
        (route as jest.Mock).mockReturnValueOnce('/bookmarks/index');
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue(initialBookmarksResponse),
        });

        const { result } = renderHook(() => useBookmark({ schema: mockSchema }));

        // Wait for fetchBookmarks to complete
        await act(async () => {});

        // Mock for storeBookmark
        const newBookmarkResponse = { bookmark: { id: 2, name: 'New Bookmark', filter_sets: [], sorts: [], columns: {} } };
        (route as jest.Mock).mockReturnValueOnce('/bookmarks/store');
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue(newBookmarkResponse),
        });

        const onSuccess = jest.fn();

        await act(async () => {
            result.current.storeBookmark({
                bookmarkName: 'New Bookmark',
                filterSets: [],
                sorts: [],
                columns: [],
                onSuccess,
            });
        });

        expect(route).toHaveBeenCalledWith('/bookmarks/store');
        expect(fetch).toHaveBeenCalledWith('/bookmarks/store', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                name: 'New Bookmark',
                filter_sets: [],
                sorts: [],
                columns: [],
            }),
        }));
        expect(result.current.bookmarks).toContainEqual(newBookmarkResponse.bookmark);
        expect(onSuccess).toHaveBeenCalled();
        expect(result.current.isStoringBookmark).toBe(false);
    });

    it('should handle errors when storing a bookmark', async () => {
        (route as jest.Mock).mockReturnValue('/bookmarks/store');
        console.error = jest.fn(); // Mock console.error to suppress the error output
        (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useBookmark({ schema: mockSchema }));
        const onError = jest.fn();

        await act(async () => {
            result.current.storeBookmark({
                bookmarkName: 'New Bookmark',
                filterSets: [],
                sorts: [],
                columns: [],
                onError,
            });
        });

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(result.current.isStoringBookmark).toBe(false);
    });

    it('should handle errors when deleting a bookmark', async () => {
        const originalConsoleError = console.error; // Save the original implementation
        console.error = jest.fn(); // Mock console.error
        (route as jest.Mock).mockReturnValue('/bookmarks/destroy');
        (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useBookmark({ schema: mockSchema }));
        const onError = jest.fn();

        await act(async () => {
            result.current.deleteBookmark({ id: 1, onError });
        });

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(result.current.isDeletingBookmark).toBe(false);
        console.error = originalConsoleError; // Restore the original implementation
    });
});
