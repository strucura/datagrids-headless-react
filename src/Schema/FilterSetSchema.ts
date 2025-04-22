import { FilterSetOperator } from '@/Enums';
import { FilterSchema } from '@/Schema';

export interface FilterSetSchema {
    filter_set_operator: FilterSetOperator;
    filters: Array<FilterSchema>;
}
