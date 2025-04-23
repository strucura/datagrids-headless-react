import { renderHook, act } from '@testing-library/react';
import { useBulkAction } from '@/Hooks';
import { DataGridSchema } from '@/Schema';
import { route } from 'ziggy-js';

jest.mock('ziggy-js', () => ({
    route: jest.fn(),
}));

global.fetch = jest.fn();

describe('useBulkAction', () => {
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
            { alias: 'id', type: 'number', is_sortable: true, is_filterable: true, is_row_key: true, is_hidden: false, meta: {} },
        ],
        default_sorts: [],
        bulk_actions: [{ name: 'approve', meta: {} }, { name: 'reject', meta: {} }],
        inline_actions: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with correct state', () => {
        const { result } = renderHook(() => useBulkAction({ schema: mockSchema }));

        expect(result.current.hasBulkActions).toBe(true);
        expect(result.current.bulkActions).toEqual(mockSchema.bulk_actions);
        expect(result.current.selectedRows).toEqual([]);
        expect(result.current.isRunningBulkAction).toBe(false);
    });

    it('should toggle row selection', () => {
        const { result } = renderHook(() => useBulkAction<{ id: number }>({ schema: mockSchema }));

        act(() => {
            result.current.toggleRowSelection({ id: 1 });
        });
        expect(result.current.selectedRows).toEqual([{ id: 1 }]);

        act(() => {
            result.current.toggleRowSelection({ id: 1 });
        });
        expect(result.current.selectedRows).toEqual([]);
    });

    it('should run a bulk action successfully', async () => {
        (route as jest.Mock).mockReturnValue('/actions/bulk');
        (fetch as jest.Mock).mockResolvedValue({ ok: true });

        const { result } = renderHook(() => useBulkAction<{ id: number }>({ schema: mockSchema }));
        const onSuccess = jest.fn();

        await act(() => {
            result.current.toggleRowSelection({ id: 1 });
            result.current.toggleRowSelection({ id: 2 });
        });


        console.log(result.current.selectedRows);

        await act(async () => {
            result.current.runBulkAction({
                action: 'approve',
                onSuccess,
            });
        });


        expect(route).toHaveBeenCalledWith('/actions/bulk');
        expect(fetch).toHaveBeenCalledWith('/actions/bulk', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ action: 'approve', row_keys: [1, 2] }),
        }));
        expect(onSuccess).toHaveBeenCalled();
        expect(result.current.isRunningBulkAction).toBe(false);
    });

    it('should handle an invalid bulk action', async () => {
        const { result } = renderHook(() => useBulkAction<{ id: number }>({ schema: mockSchema }));
        console.error = jest.fn();

        await act(async () => {
            result.current.runBulkAction({
                action: 'invalid-action',
            });
        });

        expect(console.error).toHaveBeenCalledWith('Invalid bulk action: "invalid-action"');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
        (route as jest.Mock).mockReturnValue('/actions/bulk');
        (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useBulkAction<{ id: number }>({ schema: mockSchema }));
        const onError = jest.fn();

        act(() => {
            result.current.toggleRowSelection({ id: 1 });
            result.current.toggleRowSelection({ id: 2 });
        });

        await act(async () => {
            result.current.runBulkAction({
                action: 'approve',
                onError,
            });
        });

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(result.current.isRunningBulkAction).toBe(false);
    });
});
