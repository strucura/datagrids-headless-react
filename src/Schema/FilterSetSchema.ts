import { FilterSetOperator } from '@/Enums';
import { FilterSchema } from '@/Schema';

interface FilterSet {
    filter_set_operator: FilterSetOperator;
    filters: Array<FilterSchema>;
}

export default FilterSet;
