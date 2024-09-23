import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import { BpCheckbox } from "components/BpCheckbox";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentScheduleIndex, selectScheduleSet } from "stores/selectors/ScheduleSet";
import { saveUser } from "../utils/SaveLoad";

export function SaveMenu(props: { openState: [boolean, (open: boolean) => void] }) {
	const [open, setOpen] = props.openState;
	const [input, setInput] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const scheduleSet = useSelector(selectScheduleSet);
	const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);

	return (
		<Dialog
			open={open}
			onClose={() => setOpen(false)}
		>
			<div className="p-4">
				<h1 className="px-2">Save</h1>
				<p className="px-2 text-neutral-300 font-semibold">Enter a unique user id to save your schedules under.</p>
				<div className="p-2">
					<TextField id="standard-basic" label="User ID" variant="standard" color="primary" className="w-full" onChange={e => setInput(e.currentTarget.value)} />
				</div>
				<div className="flex items-center">
					<BpCheckbox onChange={e => setRememberMe(e.target.checked)} />
					<span className="text-neutral-300 font-semibold">Remember Me</span>
				</div>
				<div className="flex justify-end gap-4 px-2">
					<button className="font-semibold" onClick={() => setOpen(false)}>Cancel</button>
					<button className="font-semibold" onClick={() => {
						if (input) {
							saveUser(input, scheduleSet, currentScheduleIndex);
							if (rememberMe) {
								localStorage.setItem("userID", input);
							}
						}
						setOpen(false);
					}}>
						Save
					</button>
				</div>
			</div>
		</Dialog>
	)
}