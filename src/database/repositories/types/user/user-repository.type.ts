export interface MongoError {
    code: number;
}

export interface UserCreationRepoParams {
    sub: string;
    googleSub: string;
    facebookSub: string;
}

export interface UserSortParams {
    name?: 'asc' | 'desc';
    price?: 'asc' | 'desc';
}

export interface UserFilterParams {
    googleSub?: string;
    facebookSub?: string;
}

export interface UserGetAllRepoParams {

    filter?: UserFilterParams;
    sort?: UserSortParams;
    page?: number;
    limit?: number;
}

export interface UserUpdateRepoParams {
    id: string;
    sub?: string;
    googleSub?: string;
    facebookSub?: string;
}