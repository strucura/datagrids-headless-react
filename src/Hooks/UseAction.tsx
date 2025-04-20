import { DataGridSchema } from '@/Schema/';
import { ActionSchema } from '@/Schema/index.js';
import { useMemo } from 'react';
import { route } from 'ziggy-js';

interface PerformBulkActionProps {
    action: string;
    selectedRowKeys: string | number[];
    onSuccess?: (response: Response) => void;
    onError?: (error: Error) => void;
}

interface PerformInlineActionProps {
    action: string;
    selectedRowKey: string | number;
    onSuccess?: (response: Response) => void;
    onError?: (error: Error) => void;
}

export const useAction = (schema: DataGridSchema) => {
    const bulkActionSchemas = useMemo(() => schema.bulk_actions, [schema]);
    const inlineActionSchemas = useMemo(() => schema.inline_actions, [schema]);

    const isValidAction = (action: string, actionSchemas: ActionSchema[]): boolean => {
        /**
         * Check if the action is valid by checking if it exists in the action schemas
         */
        return actionSchemas.some((actionSchema) => actionSchema.name === action);
    };

    const performBulkAction = ({ action, selectedRowKeys, onSuccess, onError }: PerformBulkActionProps) => {
        if (!isValidAction(action, bulkActionSchemas)) {
            console.error(`Action "${action}" is not a valid bulk action.`);
            return;
        }

        /**
         * Send the row keys off to the server for processing
         */
        fetch(route(schema.routes.actions.bulk), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                action: action,
                row_keys: selectedRowKeys,
            }),
        })
            .then((response) => onSuccess?.(response))
            .catch((error) => onError?.(error));
    };

    const performInlineAction = ({ action, selectedRowKey, onSuccess, onError }: PerformInlineActionProps) => {
        if (!isValidAction(action, inlineActionSchemas)) {
            console.error(`Action "${action}" is not a valid inline action.`);
            return;
        }

        fetch(route(schema.routes.actions.inline), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ action: action, row_key: selectedRowKey }),
        })
            .then((response) => onSuccess?.(response))
            .catch((error) => onError?.(error));
    };

    return {
        bulkActionSchemas,
        inlineActionSchemas,
        performBulkAction,
        performInlineAction,
    };
};
