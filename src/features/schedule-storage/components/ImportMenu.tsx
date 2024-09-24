import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import { BpCheckbox } from "components/BpCheckbox";
import { importUser } from "features/schedule-storage/utils/SaveLoad";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setState } from "stores/slices/ScheduleSet";

export function ImportMenu(props: { openState: [boolean, (val: boolean) => void], rememberMeState: [boolean, (val: boolean) => void] }) {
    const [open, setOpen] = props.openState;
    const [input, setInput] = useState("");
    const [rememberMe, setRememberMe] = props.rememberMeState;
    const dispatch = useDispatch();

    useEffect(() => {
        setInput(rememberMe ? localStorage.getItem("userID") || "" : "")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const importUserId = async (userId: string) => {
        const state = await importUser(userId);
        if (state) {
            dispatch(setState(state));
            dispatch({ type: "schedules/clearHistory" })
        }
    }

    const submitHandler = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        (document.activeElement as HTMLElement)?.blur();
        if (input) {
            importUserId(input);
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
                <h1 className="px-2">Import</h1>
                <p className="px-2 text-neutral-300 font-semibold">Enter your unique user id from AntAlmanac to import your schedules.</p>
                <div className="p-2">
                    <TextField label="User ID" variant="standard" color="primary" className="w-full" value={input} onChange={e => setInput(e.currentTarget.value)} />
                </div>
                <div className="flex items-center">
                    <BpCheckbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    <span className="text-neutral-300 font-semibold">Remember Me</span>
                </div>
                <div className="flex justify-end gap-4 px-2">
                    <button className="font-semibold" onClick={() => setOpen(false)}>Cancel</button>
                    <button className="font-semibold" onClick={submitHandler}>
                        Import
                    </button>
                </div>
            </form>
        </Dialog>
    )
}