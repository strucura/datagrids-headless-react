import { getRowKeyAlias } from '@/Utils/GetRowKeyAlias';
import { DataGridSchema } from '@/Schema';

describe('getRowKeyAlias', () => {
    it('should return the column marked as is_row_key', () => {
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

        const result = getRowKeyAlias(schema);
        expect(result).toEqual(schema.columns[0]);
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

        const result = getRowKeyAlias(schema);
        expect(result).toBeUndefined();
    });

    it('should return undefined if the schema has no columns', () => {
        const schema: DataGridSchema = {
            routes: {
                data: '/data',
                schema: '/schema',
                actions: { inline: '/inline', bulk: '/bulk' },
                bookmarks: { index: '/index', store: '/store', destroy: '/destroy' },
            },
            grid_key: 'test_grid',
            columns: [],
            default_sorts: [],
            bulk_actions: [],
            inline_actions: [],
        };

        const result = getRowKeyAlias(schema);
        expect(result).toBeUndefined();
    });
});
