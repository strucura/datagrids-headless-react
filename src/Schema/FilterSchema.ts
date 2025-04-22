import { FilterOperator } from '@/Enums';

export interface FilterSchema {
    alias: string;
    filter_operator: FilterOperator;
    value: number | string | boolean | null | undefined;
}
