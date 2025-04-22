import { DataGridSchema } from '@/Schema';
import { useCallback, useState } from 'react';
import { route } from 'ziggy-js';

interface UseBulkActionProps {
    schema: DataGridSchema;
}

export interface PerformBulkActionProps {
    action: string;
    selectedRowKeys: string | number[];
    onSuccess?: (response: Response) => void;
    onError?: (error: Error) => void;
}

export const useBulkAction = <T,>({ schema }: UseBulkActionProps) => {
    const [selectedRows, setSelectedRows] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [bulkActions, setBulkActions] = useState(schema.bulk_actions);

    const toggleRowSelection = (row: T) => {
        setSelectedRows((prev) => (prev.includes(row) ? prev.filter((r) => r !== row) : [...prev, row]));
    };

    const runBulkAction = useCallback(
        ({ action, selectedRowKeys, onSuccess, onError }: PerformBulkActionProps) => {
            if (!schema.bulk_actions.some((a) => a.name === action)) {
                console.error(`Invalid bulk action: "${action}"`);
                return;
            }

            setIsLoading(true);

            fetch(route(schema.routes.actions.bulk), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ action, row_keys: selectedRowKeys }),
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
        [bulkActions, schema.routes.actions.bulk],
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
