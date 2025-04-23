import { getRowKeyValue } from '@/Utils/GetRowKeyValue';
import { DataGridSchema } from '@/Schema';

describe('getRowKeyValue', () => {
    it('should return the value of the column marked as is_row_key', () => {
        const schema: DataGridSchema = {
            routes: {
                data: '/data',
                schema: '/schema',
                actions: { inline: '/inline', bulk: '/bulk' },
                bookmarks: { index: '/index', store: '/store', destroy: '/destroy' },
            },
            grid_key: 'test_grid',
            columns: [
                { alias: 'id', type: 'number', is_sortable: true, is_filterable: true, is_row_key: true, is_hidden: false, meta: {} },
                { alias: 'name', type: 'string', is_sortable: true, is_filterable: true, is_row_key: false, is_hidden: false, meta: {} },
            ],
            default_sorts: [],
            bulk_actions: [],
            inline_actions: [],
        };

        const row = { id: 123, name: 'Test Name' };

        const result = getRowKeyValue(schema, row);
        expect(result).toBe(123);
    });

    it('should return undefined if no column is marked as is_row_key', () => {
        const schema: DataGridSchema = {
            routes: {
                data: '/data',
                schema: '/schema',
                actions: { inline: '/inline', bulk: '/bulk' },
                bookmarks: { index: '/index', store: '/store', destroy: '/destroy' },
            },
            grid_key: 'test_grid',
            columns: [
                { alias: 'id', type: 'number', is_sortable: true, is_filterable: true, is_row_key: false, is_hidden: false, meta: {} },
                { alias: 'name', type: 'string', is_sortable: true, is_filterable: true, is_row_key: false, is_hidden: false, meta: {} },
            ],
            default_sorts: [],
            bulk_actions: [],
            inline_actions: [],
        };

        const row = { id: 123, name: 'Test Name' };

        const result = getRowKeyValue(schema, row);
        expect(result).toBeUndefined();
    });

    it('should return undefined if the row does not contain the key', () => {
        const schema: DataGridSchema = {
            routes: {
                data: '/data',
                schema: '/schema',
                actions: { inline: '/inline', bulk: '/bulk' },
                bookmarks: { index: '/index', store: '/store', destroy: '/destroy' },
            },
            grid_key: 'test_grid',
            columns: [
                { alias: 'id', type: 'number', is_sortable: true, is_filterable: true, is_row_key: true, is_hidden: false, meta: {} },
                { alias: 'name', type: 'string', is_sortable: true, is_filterable: true, is_row_key: false, is_hidden: false, meta: {} },
            ],
            default_sorts: [],
            bulk_actions: [],
            inline_actions: [],
        };

        const row = { name: 'Test Name' };

        const result = getRowKeyValue(schema, row);
        expect(result).toBeUndefined();
    });
});
