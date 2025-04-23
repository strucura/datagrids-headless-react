import { DataGridSchema } from '@/Schema';
import { getRowKeyValue } from '@/Utils';
import { useCallback, useState } from 'react';
import { route } from 'ziggy-js';

interface UseBulkActionProps {
    schema: DataGridSchema;
}

export interface RunBulkActionProps {
    action: string;
    onSuccess?: (response: Response) => void;
    onError?: (error: Error) => void;
}

export const useBulkAction = <T,>({ schema }: UseBulkActionProps) => {
    const [selectedRows, setSelectedRows] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [bulkActions, setBulkActions] = useState(schema.bulk_actions);

    const toggleRowSelection = (row: T) => {
        const rowKey = getRowKeyValue(schema, row);

        if (rowKey === undefined || rowKey === null) {
            console.error('Row key is undefined or null. Cannot toggle selection.');
            return;
        }

        setSelectedRows((prev) => {
            const rowKeyExists = prev.some((r) => getRowKeyValue(schema, r) === rowKey);
            if (rowKeyExists) {
                return prev.filter((r) => getRowKeyValue(schema, r) !== rowKey);
            } else {
                return [...prev, row];
            }
        });
    };

    const runBulkAction = useCallback(
        ({ action, onSuccess, onError }: RunBulkActionProps) => {
            if (!bulkActions.some((a) => a.name === action)) {
                console.error(`Invalid bulk action: "${action}"`);
                return;
            }

            setIsLoading(true);

            const rowKeys = selectedRows
                .map((row) => getRowKeyValue(schema, row))
                .filter((key) => key !== undefined && key !== null);

            fetch(route(schema.routes.actions.bulk), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ action, row_keys: rowKeys }),
            })
                .then((response) => {
                    onSuccess?.(response);
                })
                .catch((error) => {
                    onError?.(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [bulkActions, selectedRows, schema.routes.actions.bulk],
    );

    return {
        bulkActions,
        setBulkActions,
        hasBulkActions: bulkActions.length > 0,
        selectedRows,
        setSelectedRows,
        toggleRowSelection,
        runBulkAction,
        isRunningBulkAction: isLoading,
    };
};
