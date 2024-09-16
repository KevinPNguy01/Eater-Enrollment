import { RootState } from "app/store";

export const selectReviews = (state: RootState) => state.reviews.values;