export interface FindPagination<T> {
    results: Promise<T[]>;
    total: Promise<number>;
}

export interface UserJwtPayload {
    id: string,
    username: string
}