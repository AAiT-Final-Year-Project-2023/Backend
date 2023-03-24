export interface FindPagination<T> {
    results: Promise<T[]>;
    total: Promise<number>;
}
