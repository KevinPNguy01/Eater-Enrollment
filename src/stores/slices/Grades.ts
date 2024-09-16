import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GradeDistributionCollection } from "types/GradeDistributionCollection";

export const gradesSlice = createSlice({
    name: "grades",
    initialState: {
        values: {} as Record<string, Record<string, GradeDistributionCollection>>
    },
    reducers: {
        addCourseGrades: (state, action: PayloadAction<{ courseName: string, grades: Record<string, GradeDistributionCollection> }>) => {
            const { courseName, grades } = action.payload;
            state.values[courseName] = grades;
        }
    }
});

export const { addCourseGrades } = gradesSlice.actions;

export default gradesSlice.reducer;