export enum SortBy {
    Name = "Name",
    GPA = "GPA",
    RMP = "RMP"
}

export enum SortDirection {
    Ascending = "Ascending",
    Descending = "Descending"
}

export type SortOptions = {
    sortBy: SortBy
    direction: SortDirection
    sortWithin: boolean
}

export type FilterOptions = {
    sectionTypes: Set<string>
    statusTypes: Set<string>
    dayTypes: Set<string>
    restrictionTypes: Set<string>
    levelTypes: Set<string>
    timeRange: [number, number]
}