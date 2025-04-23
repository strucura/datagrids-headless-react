// src/Utils/getRowKeyColumn.ts
import { ColumnSchema, DataGridSchema } from '@/Schema';

/**
 * Extracts the column marked as `is_row_key` from the DataGridSchema.
 * @param schema - The DataGridSchema containing the columns.
 * @returns The column schema marked as `is_row_key`, or undefined if not found.
 */
export const getRowKeyAlias = (schema: DataGridSchema): ColumnSchema | undefined => {
    return schema.columns.find((column) => column.is_row_key);
};
