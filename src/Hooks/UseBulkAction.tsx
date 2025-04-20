import { DataGridSchema } from '@/Schema/index.js';
import { useCallback, useState } from 'react';
import { route } from 'ziggy-js';

interface UseBulkActionProps {
    schema: DataGridSchema;
}

interface PerformBulkActionProps {
    action: string;
    selectedRowKeys: string | number[];
    onSuccess?: (response: Response) => void;
    onError?: (error: Error) => void;
}

const useBulkAction = <T,>({ schema }: UseBulkActionProps) => {
    const [selectedRows, setSelectedRows] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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
                    setIsLoading(false);
                    onSuccess?.(response);
                })
                .catch((error) => {
                    setIsLoading(false);
                    onError?.(error);
                });
        },
        [schema.bulk_actions, schema.routes.actions.bulk],
    );

    return {
        bulkActions: schema.bulk_actions,
        hasBulkActions: !!schema.bulk_actions.length,
        selectedRows,
        setSelectedRows,
        toggleRowSelection,
        runBulkAction,
        isRunningBulkAction: isLoading,
    };
};

export default useBulkAction;
