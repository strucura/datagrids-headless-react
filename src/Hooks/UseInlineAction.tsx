import { DataGridSchema } from '@/Schema/index.js';
import { useCallback, useState } from 'react';
import { route } from 'ziggy-js';

interface UseInlineActionProps {
    schema: DataGridSchema;
}

interface PerformInlineActionProps {
    action: string;
    selectedRowKey: string | number;
    onSuccess?: (response: Response) => void;
    onError?: (error: Error) => void;
}

const useInlineAction = ({ schema }: UseInlineActionProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const runInlineAction = useCallback(
        ({ action, selectedRowKey, onSuccess, onError }: PerformInlineActionProps) => {
            if (!schema.inline_actions.some((a) => a.name === action)) {
                console.error(`Invalid inline action: "${action}"`);
                return;
            }

            setIsLoading(true);

            fetch(route(schema.routes.actions.inline), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ action, row_key: selectedRowKey }),
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
        [schema.inline_actions, schema.routes.actions.inline],
    );

    return {
        hasInlineActions: !!schema.inline_actions.length,
        inlineActions: schema.inline_actions,
        runInlineAction,
        isRunningInlineAction: isLoading,
    };
};

export default useInlineAction;
