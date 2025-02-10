import { ThemeProvider } from "@emotion/react";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import SaveIcon from '@mui/icons-material/Save';
import Button from "@mui/material/Button";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { ImportMenu } from "features/schedule-storage/components/ImportMenu";
import { LoadMenu } from "features/schedule-storage/components/LoadMenu";
import { SaveMenu } from "features/schedule-storage/components/SaveMenu";
import { SnackbarProvider } from "notistack";
import { createContext, useEffect, useState } from "react";
import useWindowDimensions from "utils/WindowDimensions";
import { anteater } from "../assets";
import { CalendarPane } from "./pages/CalendarPane";
import { CoursesPane } from "./pages/CoursesPane";
import { themeOptions } from "./theme";
import { getCalendarTerms } from "api/PeterPortalGraphQL";

export const AvailableTermsContext = createContext({
	availableTerms: {} as Record<string, [string, string][]>,
	setAvailableTerms: (terms: Record<string, [string, string][]>) => { console.log(terms) }
});

// Navigation bar with calendar on the left, and everything else on the right.
export function App() {
	const { height, width } = useWindowDimensions();
	const aspect = width / height;

	const [availableTerms, setAvailableTerms] = useState({} as Record<string, [string, string][]>);

	useEffect(() => {
		(async () => {
			setAvailableTerms(await getCalendarTerms());
		})();
	}, []);

	return (
		<LocalizationProvider dateAdapter={AdapterMoment}>
			<ThemeProvider theme={themeOptions}>
				<AvailableTermsContext.Provider value={{ availableTerms, setAvailableTerms }}>
					<div className="relative h-[100dvh] flex text-white flex-col overflow-y-hidden overflow-x-hidden">
						<NavBar />
						<div id="main" className={`h-1 grow bg-secondary grid ${aspect >= 1 ? "grid-cols-2" : "grid-cols-1"}`}>
							{aspect >= 1 ? <CalendarPane /> : null}
							<CoursesPane includeCalendar={aspect < 1} />
						</div>
						<SnackbarProvider />
					</div>
				</AvailableTermsContext.Provider>
			</ThemeProvider>
		</LocalizationProvider>
	)
}

function NavBar() {
	const saveMenuState = useState(false);
	const loadMenuState = useState(false);
	const importMenuState = useState(false);
	const rememberMeState = useState(true);
	const { width, height } = useWindowDimensions();

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
				<Button variant="contained" color="primary" startIcon={<CloudDownloadIcon />} onClick={() => loadMenuState[1](true)}>
					Load
				</Button>
				<Button variant="contained" color="primary" startIcon={<DriveFileMoveIcon />} onClick={() => importMenuState[1](true)}>
					Import
				</Button>
			</div>

			<SaveMenu openState={saveMenuState} rememberMeState={rememberMeState} />
			<LoadMenu openState={loadMenuState} rememberMeState={rememberMeState} />
			<ImportMenu openState={importMenuState} rememberMeState={rememberMeState} />
		</nav>
	)
}