import { RootState } from "app/store";

export const selectGrades = (state: RootState) => state.grades.values;