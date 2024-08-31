import { GradeDistribution } from "./GradeDistribution"
import { GradeDistributionCollectionAggregate } from "./GradeDistributionCollectionAggregate"

export type GradeDistributionCollection = {
    aggregate: GradeDistributionCollectionAggregate
    grade_distributions: GradeDistribution[]
    instructors: string[]
}