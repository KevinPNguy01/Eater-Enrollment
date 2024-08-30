import { TimePicker } from "@mui/x-date-pickers";
import { useState } from "react";
import moment from "moment";
import { CustomEvent } from "../../../constants/Types";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import { useDispatch, useSelector } from "react-redux";
import { addCustomEvent } from "../../schedules/slices/ScheduleSetSlice";
import { getColorCustomEvent } from "../../../utils/FullCalendar";
import { selectCurrentScheduleIndex } from "../../schedules/selectors/ScheduleSetSelectors";

export function CustomEventMenu(props: {closeMenu: () => void}) {
    const dispatch = useDispatch();
    const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
    const [days, setDays] = useState([false,false,false,false,false,false,false]);
    const [start, setStart] = useState(moment('10:10 AM', 'hh:mm A'));
    const [end, setEnd] = useState(moment('2:50 PM', 'hh:mm A'));
    const [title, setTitle] = useState("");

    return (
        <Card className="w-3/4 h-3/4 p-4 flex flex-col content-center" elevation={3} onClick={e => e.stopPropagation()}>
            <h1>Add Custom Event</h1>
            <div className="flex flex-col p-2 gap-4">
                <input className="" placeholder="Event Title" onChange={e => setTitle(e.currentTarget.value)}/>
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
                <div className="flex justify-evenly">
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
                <div className="w-full flex justify-end gap-4">
                    <Button variant="contained" color="info" onClick={props.closeMenu}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={() => {
                        props.closeMenu();
                        const customEvent = {
                            id: -1, 
                            title, 
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