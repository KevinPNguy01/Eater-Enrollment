import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import { BpCheckbox } from "components/BpCheckbox";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentScheduleIndex, selectScheduleSet } from "stores/selectors/ScheduleSet";
import { saveUser } from "../utils/SaveLoad";

export function SaveMenu(props: { openState: [boolean, (val: boolean) => void], rememberMeState: [boolean, (val: boolean) => void] }) {
	const [open, setOpen] = props.openState;
	const [input, setInput] = useState("");
	const [rememberMe, setRememberMe] = props.rememberMeState;
	const scheduleSet = useSelector(selectScheduleSet);
	const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);

	useEffect(() => {
		setInput(rememberMe ? localStorage.getItem("userID") || "" : "")
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open])

	const submitHandler = (e: React.FormEvent | React.MouseEvent) => {
		e.preventDefault();
		setTimeout(() => (document.activeElement as HTMLElement)?.blur(), 0)
		if (input) {
			saveUser(input, scheduleSet, currentScheduleIndex);
			if (rememberMe) {
				localStorage.setItem("userID", input);
			}
		}
		setOpen(false);
	}

	return (
		<Dialog
			open={open}
			onClose={() => setOpen(false)}
		>
			<form className="p-4" onSubmit={submitHandler}>
				<h1 className="px-2">Save</h1>
				<p className="px-2 text-neutral-300 font-semibold">Enter a unique user id to save your schedules under.</p>
				<div className="p-2">
					<TextField label="User ID" variant="standard" color="primary" className="w-full" value={input} onChange={e => setInput(e.currentTarget.value)} />
				</div>
				<div className="flex items-center">
					<BpCheckbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
					<span className="text-neutral-300 font-semibold">Remember Me</span>
				</div>
				<div className="flex justify-end gap-4 px-2">
					<button type="reset" className="font-semibold" onClick={e => { e.preventDefault(); setOpen(false) }}>Cancel</button>
					<button type="submit" className="font-semibold" onClick={submitHandler}>
						Save
					</button>
				</div>
			</form>
		</Dialog>
	)
}