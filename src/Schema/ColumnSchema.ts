export default interface ColumnSchema {
    alias: string;
    type: string;
    is_sortable: boolean;
    is_filterable: boolean;
    is_row_key: boolean;
    hidden: boolean;
    meta: Record<string, unknown>;
}
