import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import { requestGrades } from "api/PeterPortalGraphQL";
import { BpCheckbox } from "components/BpCheckbox";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCourseGrades } from "stores/slices/Grades";
import { addInstructorReview } from "stores/slices/Reviews";
import { setState } from "stores/slices/ScheduleSet";
import { searchProfessor } from "utils/RateMyProfessors";
import { loadUser as loadUser2 } from "features/schedule-storage/utils/SaveLoad";
import { selectGrades } from "stores/selectors/Grades";
import { selectReviews } from "stores/selectors/Reviews";

export function LoadMenu(props: { openState: [boolean, (val: boolean) => void], rememberMeState: [boolean, (val: boolean) => void] }) {
    const [open, setOpen] = props.openState;
    const [input, setInput] = useState("");
    const [rememberMe, setRememberMe] = props.rememberMeState;
    const allReviews = useSelector(selectReviews);
    const allGrades = useSelector(selectGrades);
    const dispatch = useDispatch();

    useEffect(() => {
        setInput(rememberMe ? localStorage.getItem("userID") || "" : "")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const loadUser = async (userId: string) => {
        const state = await loadUser2(userId);
        if (state) {
            dispatch(setState(state));
            dispatch({ type: "schedules/clearHistory" })
            const grades = await requestGrades(state.scheduleSet.map(({ courses }) => courses).flat().filter(({ department, number }) => !(`${department} ${number}` in allGrades)));
            Object.keys(grades).forEach(courseName => dispatch(addCourseGrades({ courseName, grades: grades[courseName] })))
            const instructors = [...new Set(state.scheduleSet.map(
                ({ courses }) => courses.map(
                    ({ offerings }) => offerings.map(
                        ({ instructors }) => instructors.map(
                            ({ shortened_name }) => shortened_name
                        )
                    )
                )
            ).flat(4).filter(instructor => instructor !== "STAFF" && !(instructor in allReviews)))];
            for (const instructor of instructors) {
                const review = await searchProfessor(instructor);
                dispatch(addInstructorReview({ instructor, review }));
            }
        }

    };

    useEffect(() => {
        const userID = localStorage.getItem("userID");
        if (userID) loadUser(userID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
        >
            <div className="p-4">
                <h1 className="px-2">Load</h1>
                <p className="px-2 text-neutral-300 font-semibold">Enter your unique user id to load your schedules.</p>
                <div className="p-2">
                    <TextField label="User ID" variant="standard" color="primary" className="w-full" value={input} onChange={e => setInput(e.currentTarget.value)} />
                </div>
                <div className="flex items-center">
                    <BpCheckbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    <span className="text-neutral-300 font-semibold">Remember Me</span>
                </div>
                <div className="flex justify-end gap-4 px-2">
                    <button className="font-semibold" onClick={() => setOpen(false)}>Cancel</button>
                    <button className="font-semibold" onClick={() => {
                        if (input) {
                            loadUser(input);
                            if (rememberMe) {
                                localStorage.setItem("userID", input);
                            }
                        }
                        setOpen(false);
                    }}>
                        Load
                    </button>
                </div>
            </div>
        </Dialog>
    )
}