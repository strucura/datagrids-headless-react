import { ActionSchema, ColumnSchema, SortSchema } from '@/Schema';

export interface DataGridSchema {
    routes: {
        data: string;
        schema: string;
        actions: {
            inline: string;
            bulk: string;
        };
        bookmarks: {
            index: string;
            store: string;
            destroy: string;
        };
    };
    grid_key: string;
    columns: ColumnSchema[];
    default_sorts: SortSchema[];
    bulk_actions: ActionSchema[];
    inline_actions: ActionSchema[];
}
