import { renderHook, act } from '@testing-library/react';
import useDataGrid from '@/Hooks/UseDataGrid';
import { DataGridSchema } from '@/Schema';
import { route } from 'ziggy-js';

jest.mock('ziggy-js', () => ({
    route: jest.fn(),
}));

global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({}),
})

describe('useDataGrid', () => {
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
        columns: [
            { alias: 'name', type: 'string', is_sortable: true, is_filterable: true, is_row_key: false, is_hidden: false, meta: {} },
            { alias: 'age', type: 'number', is_sortable: true, is_filterable: true, is_row_key: false, is_hidden: false, meta: {} },
        ],
        default_sorts: [],
        bulk_actions: [],
        inline_actions: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch data successfully', async () => {
        const mockResponse = {
            current_page: 1,
            last_page: 2,
            per_page: 10,
            total: 20,
            from: 1,
            to: 10,
            data: [{ id: 1, name: 'John Doe', age: 30 }],
        };

        (route as jest.Mock).mockReturnValue('/data');
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const { result } = renderHook(() => useDataGrid({ schema: mockSchema }));

        await act(async () => {
            result.current.fetchData();
        });

        expect(route).toHaveBeenCalledWith('/data');
        expect(fetch).toHaveBeenCalledWith('/data', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                page: 1,
                per_page: 10,
                sorts: [],
                filter_sets: [],
            }),
        }));
        expect(result.current.data).toEqual(mockResponse.data);
        expect(result.current.pagination).toEqual({
            currentPage: 1,
            lastPage: 2,
            perPage: 10,
            total: 20,
            from: 1,
            to: 10,
        });
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle fetch errors', async () => {
        (route as jest.Mock).mockReturnValue('/data');
        (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const onError = jest.fn();
        const { result } = renderHook(() => useDataGrid({ schema: mockSchema, onError }));

        await act(async () => {
            result.current.fetchData();
        });

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(result.current.isLoading).toBe(false);
    });

    it('should toggle column visibility', () => {
        const { result } = renderHook(() => useDataGrid({ schema: mockSchema }));

        act(() => {
            result.current.toggleColumn('name');
        });

        expect(result.current.columns).toEqual([
            { alias: 'name', type: 'string', is_sortable: true, is_filterable: true, is_row_key: false, is_hidden: true, meta: {} },
            { alias: 'age', type: 'number', is_sortable: true, is_filterable: true, is_row_key: false, is_hidden: false, meta: {} },
        ]);
    });
});
