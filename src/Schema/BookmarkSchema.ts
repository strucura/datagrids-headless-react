import { FilterSetSchema, SortSchema } from '@/Schema';

export interface BookmarkSchema {
    id: number;
    name: string;
    filter_sets: FilterSetSchema[];
    sorts: SortSchema[];
    columns: Record<string, boolean>;
}
