export default interface PaginationSchema {
    currentPage: number;
    perPage: number;
    lastPage: number;
    total: number;
    from: number;
    to: number;
}
