import { TimePicker } from "@mui/x-date-pickers";
import { useState } from "react";
import moment from "moment";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import { useDispatch, useSelector } from "react-redux";
import { addCustomEvent } from "../../schedules/slices/ScheduleSetSlice";
import { getColorCustomEvent } from "../../../utils/FullCalendar";
import { selectCurrentScheduleIndex } from "../../schedules/selectors/ScheduleSetSelectors";
import PlaceIcon from '@mui/icons-material/Place';
import NotesIcon from '@mui/icons-material/Notes';
import { CustomEvent } from "../../../types/CustomEvent";

export function CustomEventMenu(props: {closeMenu: () => void}) {
    const dispatch = useDispatch();
    const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
    const [days, setDays] = useState([false,false,false,false,false,false,false]);
    const [start, setStart] = useState(moment('10:10 AM', 'hh:mm A'));
    const [end, setEnd] = useState(moment('2:50 PM', 'hh:mm A'));
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    return (
        <Card className="w-3/4 h-3/4 p-4 flex flex-col content-center" elevation={3} onClick={e => e.stopPropagation()}>
            <h1>Add Custom Event</h1>
            <div className="flex flex-col p-2 gap-4">
                <input className="border-b-0 text-xl font-semibold" placeholder="Event Title" onChange={e => setTitle(e.currentTarget.value)}/>
                <Divider color="#808080"/>
                <div className="flex justify-around">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                        <Button 
                            color="white"
                            className={`${days[index] == true ? "!border-solid !border-blue-500 !text-blue-500" : ""} !font-semibold !rounded-full !min-w-fit !min-h-fit !w-8 !h-8 !aspect-square`}
                            style={{border: "1px"}}
                            key={index}
                            onClick={() => {
                                days[index] = !days[index];
                                setDays([...days]);
                            }}
                        >
                            {day}
                        </Button>
                    ))}
                </div>
                <Divider color="#808080"/>
                <div className="grid grid-cols-2 gap-4 justify-evenly">
                    <TimePicker
                        label="Start Time"
                        defaultValue={start}
                        onChange={val => {
                            if (val) {
                                setStart(val);
                            }
                        }}
                    />
                    <TimePicker
                        label="End Time"
                        defaultValue={end}
                        onChange={val => {
                            if (val) {
                                setEnd(val);
                            }
                        }}
                    />
                </div>
                <Divider color="#808080"/>
                <div className="flex gap-4 items-center">
                    <PlaceIcon/>
                    <input className="border-b-0 flex-grow text-base" placeholder="Add location" onChange={e => setTitle(e.currentTarget.value)}/>
                </div>
                <Divider color="#808080"/>
                <div className="flex gap-4 items-center">
                    <NotesIcon/>
                    <input className="border-b-0 flex-grow text-base" placeholder="Add description" onChange={e => setDescription(e.currentTarget.value)}/>
                </div>
                <Divider color="#808080"/>
                <div className="w-full flex justify-end gap-2">
                    <Button variant="contained" color="info" onClick={props.closeMenu}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={() => {
                        props.closeMenu();
                        const customEvent = {
                            id: -1, 
                            title, 
                            description,
                            startTime: start.clone().toISOString(), 
                            endTime: end.clone().toISOString(), 
                            days: [...days],
                            color: "#ffffff"
                        } as CustomEvent;
                        customEvent.color = getColorCustomEvent(customEvent);
                        dispatch(addCustomEvent({customEvent, index: currentScheduleIndex}));
                    }}>
                        Add Event
                    </Button>
                </div>
            </div>
        </Card>
    );
}