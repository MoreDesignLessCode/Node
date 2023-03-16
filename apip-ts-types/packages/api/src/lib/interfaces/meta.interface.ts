
export interface Paging {
    limit: number;
    offset: number;
    total: number;
}

export interface Sorting {
    asc?: string[];
    desc?: string[];
}

export interface Fields {
    omitted?: string[];
    requested?: string[];
}

export interface Filtering {
    [key: string]: {
        operator: string;
        value: string;
    }
}

export interface IMeta {
    paging?: Paging;
    sorting?: Sorting;
    fields?: Fields;
    filters?: Filtering;
}
