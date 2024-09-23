import NotesIcon from '@mui/icons-material/Notes';
import PlaceIcon from '@mui/icons-material/Place';
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { TimePicker } from "@mui/x-date-pickers";
import { buildingIds } from "constants/BuildingIds";
import { buildings } from "constants/Buildings";
import moment from "moment";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentScheduleIndex } from "stores/selectors/ScheduleSet";
import { addCustomEvent, updateCustomEvent } from "stores/slices/ScheduleSet";
import { CustomEvent } from "types/CustomEvent";
import { stringColor } from 'utils/FullCalendar';

export function CustomEventMenu(props: { event: CustomEvent, closeMenu: () => void }) {
    const dispatch = useDispatch();
    const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
    const { event, closeMenu } = props;
    const [days, setDays] = useState(event.days);
    const [start, setStart] = useState(moment(event.startTime, 'hh:mm A'));
    const [end, setEnd] = useState(moment(event.endTime, 'hh:mm A'));
    const [title, setTitle] = useState(event.title);
    const [description, setDescription] = useState(event.description);
    const [location, setLocation] = useState(event.location);
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);

    return (
        <Dialog open>
            <div className="p-6 gap-4 flex flex-col content-center" onClick={e => e.stopPropagation()}>
                <h1>{event.id === -1 ? "Add" : "Update"} Custom Event</h1>
                <TextField label="Event Title" variant="standard" color="primary" value={title} onChange={e => setTitle(e.currentTarget.value)} />
                <div className="flex justify-around py-1">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                        <Button
                            color="white"
                            className={`${days & (1 << (6 - index)) ? "!border-solid !border-blue-500 !text-blue-500" : ""} !font-semibold !rounded-full !min-w-fit !min-h-fit !w-8 !h-8 !aspect-square`}
                            style={{ border: "1px" }}
                            key={index}
                            onClick={() => {
                                setDays(days ^ (1 << (6 - index)));
                            }}
                        >
                            {day}
                        </Button>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4 justify-evenly">
                    <TimePicker
                        label="Start Time"
                        defaultValue={start}
                        onChange={val => {
                            if (val) {
                                setStart(val);
                            }
                        }}
                        sx={{
                            "& .MuiButtonBase-root": {
                                color: "white !important"
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "gray"
                            }
                        }}
                        open={startOpen}
                        onOpen={() => {
                            setStartOpen(true);
                            setEndOpen(false)
                        }}
                        onClose={() => setStartOpen(false)}
                    />
                    <TimePicker
                        label="End Time"
                        defaultValue={end}
                        onChange={val => {
                            if (val) {
                                setEnd(val);
                            }
                        }}
                        sx={{
                            "& .MuiButtonBase-root": {
                                color: "white !important"
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "gray"
                            }
                        }}
                        open={endOpen}
                        onOpen={() => {
                            setEndOpen(true);
                            setStartOpen(false)
                        }}
                        onClose={() => setEndOpen(false)}
                    />
                </div>
                <Divider color="#808080" />
                <div className="flex gap-4 items-center">
                    <PlaceIcon />
                    <Autocomplete
                        color="primary"
                        className="flex-grow"
                        renderInput={(params) => <TextField {...params} variant="standard" label="Add location" sx={{ "& .MuiButtonBase-root": { color: "white !important" } }} />}
                        value={{ code: location, label: buildingIds[location] ? buildings[buildingIds[location]].name : location }}
                        options={Object.keys(buildingIds).map((code) => {
                            const id = buildingIds[code];
                            return {
                                code,
                                label: buildings[id].name
                            };
                        }).toSorted(
                            (a, b) => {
                                const aStartsNum = '0' <= a.label.charAt(0) && a.label.charAt(0) <= '9';
                                const bStartsNum = '0' <= b.label.charAt(0) && b.label.charAt(0) <= '9';
                                if (aStartsNum && !bStartsNum) {
                                    return 1;
                                } else if (!aStartsNum && bStartsNum) {
                                    return -1;
                                } else {
                                    return a.label.localeCompare(b.label);
                                }
                            }
                        )}
                        onChange={(_, val) => setLocation(val?.code || "")}
                        sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "gray"
                            }
                        }}
                    />
                </div>
                <div className="flex gap-4 items-center">
                    <NotesIcon />
                    <TextField className="w-full" variant="standard" label="Add description" value={description} onChange={e => setDescription(e.currentTarget.value)} />
                </div>
                <div className="flex justify-end gap-4 px-2">
                    <button className="font-semibold" color="white" onClick={closeMenu}>
                        Cancel
                    </button>
                    <button className="font-semibold" color="white" onClick={() => {
                        closeMenu();
                        const customEvent = {
                            id: event.id,
                            title,
                            description,
                            location: location,
                            startTime: start.format('hh:mm A'),
                            endTime: end.format('hh:mm A'),
                            days: days,
                        } as CustomEvent;
                        if (customEvent.id === -1) {
                            customEvent.color = stringColor(title);
                        }
                        dispatch((event.id === -1 ? addCustomEvent : updateCustomEvent)({ customEvent, index: currentScheduleIndex }));
                    }}>
                        Save
                    </button>
                </div>
            </div>
        </Dialog>

    );
}