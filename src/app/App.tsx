import { ThemeProvider } from "@emotion/react";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import SaveIcon from '@mui/icons-material/Save';
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { requestGrades } from "api/PeterPortalGraphQL";
import { SaveMenu } from "features/schedule-storage/components/SaveMenu";
import { importUser, loadUser as loadUser2 } from "features/schedule-storage/utils/SaveLoad";
import { SnackbarProvider } from "notistack";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectGrades } from "stores/selectors/Grades";
import { selectReviews } from "stores/selectors/Reviews";
import { addCourseGrades } from "stores/slices/Grades";
import { addInstructorReview } from "stores/slices/Reviews";
import { setState } from "stores/slices/ScheduleSet";
import { searchProfessor } from "utils/RateMyProfessors";
import useWindowDimensions from "utils/WindowDimensions";
import { anteater } from "../assets";
import { CalendarPane } from "./pages/CalendarPane";
import { CoursesPane } from "./pages/CoursesPane";
import { themeOptions } from "./theme";

// Navigation bar with calendar on the left, and everything else on the right.
export function App() {
	const allReviews = useSelector(selectReviews);
	const allGrades = useSelector(selectGrades);
	const dispatch = useDispatch();

	const { height, width } = useWindowDimensions();
	const aspect = width / height;

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
	}, []);

	return (
		<LocalizationProvider dateAdapter={AdapterMoment}>
			<ThemeProvider theme={themeOptions}>
				<div className="relative h-[100dvh] flex text-white flex-col overflow-y-hidden overflow-x-hidden">
					<NavBar load={loadUser} />
					<div id="main" className={`h-1 grow bg-secondary grid ${aspect >= 1 ? "grid-cols-2" : "grid-cols-1"}`}>
						{aspect >= 1 ? <CalendarPane /> : null}
						<CoursesPane includeCalendar={aspect < 1} />
					</div>
					<SnackbarProvider />
				</div>
			</ThemeProvider>
		</LocalizationProvider>
	)
}

function NavBar(props: { load: (_: string) => void }) {
	const { load } = props;
	const saveMenuState = useState(false);
	const [loadMenuOpen, setLoadMenuOpen] = useState(false);
	const [importMenuOpen, setImportMenuOpen] = useState(false);
	const { width, height } = useWindowDimensions();
	const dispatch = useDispatch();

	const importUserId = async (userId: string) => {
		const state = await importUser(userId);
		if (state) {
			dispatch(setState(state));
			dispatch({ type: "schedules/clearHistory" })
		}
	}

	return (
		<nav className="bg-primary flex justify-between items-center">
			<div className="flex items-center">
				<img src={anteater} alt="Anteater Logo" className="w-[96px] h-[48px" />
				{width >= height && <h1 className="text-nowrap">
					Eater Enrollment
				</h1>}
			</div>
			<div className="flex gap-2 mr-8">
				<Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={() => saveMenuState[1](true)}>
					Save
				</Button>
				<Button variant="contained" color="primary" startIcon={<CloudDownloadIcon />} onClick={() => setLoadMenuOpen(!loadMenuOpen)}>
					Load
				</Button>
				<Button variant="contained" color="primary" startIcon={<DriveFileMoveIcon />} onClick={() => setImportMenuOpen(!importMenuOpen)}>
					Import
				</Button>
			</div>

			<SaveMenu openState={saveMenuState} />
			{loadMenuOpen ? <SaveLoadMenu name="Load" submit={load} cancel={() => setLoadMenuOpen(false)} /> : null}
			{importMenuOpen ? <SaveLoadMenu name="Import" submit={importUserId} cancel={() => setImportMenuOpen(false)} /> : null}
		</nav>
	)
}

function SaveLoadMenu(props: { name: string, submit: (_: string) => void, cancel: () => void }) {
	const { name, submit, cancel } = props;
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<Backdrop open className="z-[1000]" onClick={cancel}>
			<Card
				className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-tertiary border border-quaternary p-4 flex flex-col justify-between gap-4"
				onClick={e => e.stopPropagation()}
			>
				<h1>
					{name}
				</h1>
				<input ref={inputRef} placeholder='User ID' />
				<div className="flex justify-end gap-4">
					<button onClick={cancel}>Cancel</button>
					<button onClick={() => {
						const input = inputRef.current?.value;
						if (input) {
							submit(input);
						}
						cancel();
					}}>
						{name}
					</button>
				</div>
			</Card>
		</Backdrop>
	)
}