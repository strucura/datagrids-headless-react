import { DataGridSchema } from '@/Schema';
import { getRowKeyAlias } from './GetRowKeyAlias';

/**
 * Retrieves the value of the column marked as `is_row_key` from the row data.
 * @param schema - The DataGridSchema containing the columns.
 * @param row - The row data object.
 * @returns The value of the row key column, or undefined if not found.
 */
export const getRowKeyValue = <T,>(schema: DataGridSchema, row: T): unknown => {
    const rowKeyColumn = getRowKeyAlias(schema);
    return rowKeyColumn ? row[rowKeyColumn.alias as keyof T] : undefined;
};
