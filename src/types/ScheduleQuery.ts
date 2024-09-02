/**
 * Query type used for making a schedule request to the PeterPortal GraphQL API.
 */
export type ScheduleQuery = {
    // Required:
    quarter: string
    year: string
    // At least one of:
    department?: string
    ge?: string
    section_codes?: string
    // Optional:
    number?: string
}