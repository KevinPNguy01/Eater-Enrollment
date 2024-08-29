import FullCalendar from "@fullcalendar/react";
import { CalendarApi } from "fullcalendar/index.js";
import { MutableRefObject, createContext, useRef, useState, useEffect } from "react";
import { RGBColor } from "react-color";
import { anteater } from "../assets";
import { requestSchedule } from "../utils/PeterPortal";
import { CoursesPane } from "./pages/CoursesPane";
import { CalendarPane } from "./pages/CalendarPane";
import useWindowDimensions from "../utils/WindowDimensions";
import { ThemeProvider } from "@emotion/react";
import { ThemeOptions, createTheme } from '@mui/material/styles';
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import SaveIcon from '@mui/icons-material/Save';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import Card from "@mui/material/Card";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentScheduleIndex, addOffering, addSchedule, clearScheduleSet } from "../features/schedules/slices/ScheduleSetSlice";
import { selectScheduleSet } from "../features/schedules/selectors/ScheduleSetSelectors";

const theme = createTheme();
const themeOptions: ThemeOptions = createTheme(theme, {
	palette: {
		mode: 'light',
		primary: {
			main: '#008000',
		},
		secondary: {
			main: '#0080ff',
		},
		background: {
			default: '#303030',
			paper: '#404040',
		},
		text: {
			primary: 'rgba(255,255,255,0.95)',
			secondary: 'rgba(255,255,255,0.85)',
			disabled: 'rgba(255,255,255,0.75)',
		},
		info: {
			main: '#808080',
		},
		white: theme.palette.augmentColor({color: {main: "#fff"}}),
		black: theme.palette.augmentColor({color: {main: "#000"}})
	},

	typography: {
		button: {
			textTransform: 'none'
		}
	}
});

declare module "@mui/material/styles" {
	interface Palette {
		white: string;
		black: string;
	}
	interface PaletteOptions {
		white: string;
		black: string;
	}
}

declare module "@mui/material/Button" {
	interface ButtonPropsColorOverrides {
		white: true;
		black: true;
	}
}

declare module "@mui/material/IconButton" {
	interface IconButtonPropsColorOverrides {
		white: true;
		black: true;
	}
}

// Define the context type of schedule related functions and data.
type ScheduleContextType = {
	calendarReference: MutableRefObject<FullCalendar>,
	colorRules: Map<string, RGBColor>,
	setColorRules: (rules: Map<string, RGBColor>) => void
}

// Context provider for accessing schedule functions and data.
export const ScheduleContext = createContext(
	{} as ScheduleContextType
);

const insertData = async (userID: string, schedules: string, colors: string) => {
    await fetch('/api/data', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ userID, schedules, colors }),
    });
  };

const getData = async (userID: string) => {
	const response = await fetch(`/api/data/${userID}`);
	const data = await response.json();
	const schedules = data.schedules as string;
	const colors = data.colors as string;
	return {schedules, colors};
};

// Navigation bar with calendar on the left, and everything else on the right.
export function App() {
	const scheduleSet = useSelector(selectScheduleSet);
	const dispatch = useDispatch();

	const calendarRef = useRef(null as unknown as FullCalendar);
	const [colorRules, setColorRules] = useState(new Map<string, RGBColor>());
	const [updateCounter, setUpdateCounter] = useState(0);
	const [showingFinals, setShowingFinals] = useState(false);
	const {height, width} = useWindowDimensions();
	const aspect = width/height;


	const saveUser = (username: string) => {
		const schedules = scheduleSet.map(
			({name, courses}) => (
				name + ":" + courses.map(
					(course) => course.offerings.map(
						(offering) => `${offering.quarter},${offering.year},${offering.section.code}`
					)
				).flat().join(";")
			)
		).join("\n");
		const colors = Array.from(colorRules.entries()).map(([offering, rgb]) => `${offering}:${rgb.r} ${rgb.g} ${rgb.b}`).join("\n")
		insertData(username, schedules, colors);
		enqueueSnackbar(`Scheduled saved under "${username}"`, {variant: "success"});
	}

	const loadUser = async (username: string) => {
		const {schedules: schedulesString, colors} = await getData(username);
		if (!schedulesString) {
			enqueueSnackbar(`No schedule found for "${username}"`, {variant: "error"});
			return;
		}
		enqueueSnackbar(`Loaded schedule for "${username}"`, {variant: "success"});

		localStorage.setItem("userID", username);
		const calendar = (calendarRef.current! as InstanceType<typeof FullCalendar>)?.getApi() as CalendarApi;
		dispatch(setCurrentScheduleIndex(0));
		calendar?.removeAllEvents();

		setUpdateCounter(a => a+1)

		dispatch(clearScheduleSet());
		schedulesString!.split("\n").forEach(
			(schedule) => {
				const [name] = schedule.split(":");
				dispatch(addSchedule({id: -1, name, courses: [], customEvents: []}));
			}
		);

		if (colors) colors.split("\n").forEach(rule => {
			const [offering, color] = rule.split(":")
			const [r, g, b] = color.split(" ");
			colorRules.set(offering, {r: parseInt(r), g: parseInt(g), b: parseInt(b)} as RGBColor);
		})

		schedulesString!.split("\n").forEach(async (schedule, index) => {
			const quarterYearGroups = new Map<string, string[]>();
			const [, offeringsString] = schedule.split(":");
			if (offeringsString === "") return;
			offeringsString.split(";").forEach((offeringString) => {
				const values = offeringString.split(",");
				const quarterYear = values[0] + " " + values[1];
				const code = values[2];
				if (!quarterYearGroups.has(quarterYear)) quarterYearGroups.set(quarterYear, []);
				quarterYearGroups.get(quarterYear)!.push(code)
			})

			for (const [quarterYear, codes] of quarterYearGroups) {
				const [quarter, year] = quarterYear.split(" ");
				const courses = await requestSchedule([{
					quarter: quarter, 
					year: year, 
					section_codes: codes.join(",")
				}], () => setUpdateCounter(a => a+1));
				courses.forEach(({offerings}) => offerings.forEach((offering) => dispatch(addOffering({offering, index}))));
			
			}
		});
	};

	useEffect(() => {
		if(!updateCounter) {
			const userID = localStorage.getItem("userID");
			if (userID) loadUser(userID);
		}
	}, []);


	const calendarPane = <CalendarPane showingFinals={showingFinals} setShowingFinals={setShowingFinals}/>;

	return (    
		<LocalizationProvider dateAdapter={AdapterMoment}>
			<ThemeProvider theme={themeOptions}>
				<ScheduleContext.Provider value={
					{ 
						calendarReference: calendarRef,
						colorRules: colorRules,
						setColorRules: setColorRules
					}
				}>
					<div className="relative h-[100dvh] flex text-white flex-col overflow-y-hidden overflow-x-hidden">
						<NavBar save={saveUser} load={loadUser}/>
						<div id="main" className={`h-1 grow bg-secondary grid ${aspect >= 1 ? "grid-cols-2" : "grid-cols-1"}`}>
							{aspect >= 1 ? calendarPane : null}
							<CoursesPane calendarPane={aspect < 1 ? calendarPane : undefined}/>
						</div>
						<SnackbarProvider/>
					</div>
				</ScheduleContext.Provider>
			</ThemeProvider>
		</LocalizationProvider>
	)
}

function NavBar(props: {save: (_: string) => void, load: (_: string) => void}) {
	const {save, load} = props;
	const [saveMenuOpen, setSaveMenuOpen] = useState(false);
	const [loadMenuOpen, setLoadMenuOpen] = useState(false);

	return (
		<nav className="bg-primary flex justify-between items-center">
			<div className="flex items-center">
				<img src={anteater} alt="Anteater Logo" className="w-[96px] h-[48px"/>
				<h1 className="text-nowrap">
					Eater Enrollment
				</h1>
			</div>
			<div className="flex gap-2 mr-8">
				<Button variant="contained" color="primary" startIcon={<SaveIcon/>} onClick={() => setSaveMenuOpen(!saveMenuOpen)}>
					Save
				</Button>
				<Button variant="contained" color="primary" startIcon={<CloudDownloadIcon/>} onClick={() => setLoadMenuOpen(!loadMenuOpen)}>
					Load
				</Button>
			</div>

			{saveMenuOpen ? <SaveLoadMenu name="Save" submit={save} cancel={() => setSaveMenuOpen(false)}/> : null}
			{loadMenuOpen ? <SaveLoadMenu name="Load" submit={load} cancel={() => setLoadMenuOpen(false)}/> : null}
		</nav>
	)
}

function SaveLoadMenu(props: {name: string, submit: (_: string) => void, cancel: () => void}) {
	const {name, submit, cancel} = props;
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
				<input ref={inputRef} placeholder='User ID'/>
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