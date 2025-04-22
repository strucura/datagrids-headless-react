import { renderHook, act } from '@testing-library/react';
import {useInlineAction} from '@/Hooks';
import { DataGridSchema } from '@/Schema';
import { route } from 'ziggy-js';

jest.mock('ziggy-js', () => ({
    route: jest.fn(),
}));

global.fetch = jest.fn();

describe('useInlineAction', () => {
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
        inline_actions: [{ name: 'edit' }, { name: 'delete' }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with correct state', () => {
        const { result } = renderHook(() => useInlineAction({ schema: mockSchema }));

        expect(result.current.hasInlineActions).toBe(true);
        expect(result.current.inlineActions).toEqual(mockSchema.inline_actions);
        expect(result.current.isRunningInlineAction).toBe(false);
    });

    it('should run an inline action successfully', async () => {
        (route as jest.Mock).mockReturnValue('/actions/inline');
        (fetch as jest.Mock).mockResolvedValue({ ok: true });

        const { result } = renderHook(() => useInlineAction({ schema: mockSchema }));
        const onSuccess = jest.fn();

        await act(async () => {
            result.current.runInlineAction({
                action: 'edit',
                selectedRowKey: 1,
                onSuccess,
            });
        });

        expect(route).toHaveBeenCalledWith('/actions/inline');
        expect(fetch).toHaveBeenCalledWith('/actions/inline', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ action: 'edit', row_key: 1 }),
        }));
        expect(onSuccess).toHaveBeenCalled();
        expect(result.current.isRunningInlineAction).toBe(false);
    });

    it('should handle an invalid inline action', async () => {
        const { result } = renderHook(() => useInlineAction({ schema: mockSchema }));
        console.error = jest.fn();

        await act(async () => {
            result.current.runInlineAction({
                action: 'invalid-action',
                selectedRowKey: 1,
            });
        });

        expect(console.error).toHaveBeenCalledWith('Invalid inline action: "invalid-action"');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
        (route as jest.Mock).mockReturnValue('/actions/inline');
        (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useInlineAction({ schema: mockSchema }));
        const onError = jest.fn();

        await act(async () => {
            result.current.runInlineAction({
                action: 'edit',
                selectedRowKey: 1,
                onError,
            });
        });

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(result.current.isRunningInlineAction).toBe(false);
    });
});
