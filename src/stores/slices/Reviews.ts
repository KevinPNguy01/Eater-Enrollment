import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Review } from "types/Review";

export const reviewsSlice = createSlice({
    name: "reviews",
    initialState: {
        values: {} as Record<string, Review>
    },
    reducers: {
        addInstructorReview: (state, action: PayloadAction<{ instructor: string, review: Review }>) => {
            const { instructor, review } = action.payload;
            state.values[instructor] = review;
        }
    }
});

export const { addInstructorReview } = reviewsSlice.actions;

export default reviewsSlice.reducer;