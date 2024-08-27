import { Button, Card } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { useState } from "react";
import moment from "moment";

export function CustomEventMenu(props: {closeMenu: () => void}) {
    const [days, setDays] = useState([false,false,false,false,false,false,false]);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);

    return (
        <Card className="w-3/4 h-3/4 p-4 flex flex-col content-center" elevation={3} onClick={e => e.stopPropagation()}>
            <h1>Add Custom Event</h1>
            <div className="flex flex-col p-2 gap-4">
                <input className="" placeholder="Event Title"/>
                <div className="flex justify-around">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                        <Button 
                            color="white"
                            className={`${days[index] == true ? "!border-solid !border-blue-500 !text-blue-500" : ""} !font-semibold !rounded-full !min-w-fit !min-h-fit !w-8 !h-8 !aspect-square`}
                            style={{border: "1px"}}
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
                        defaultValue={moment('10:10 AM', 'hh:mm A')}
                    />
                    <TimePicker
                        label="End Time"
                        defaultValue={moment('2:50 PM', 'hh:mm A')}
                    />
                </div>
                <div className="w-full flex justify-end gap-4">
                    <Button variant="contained" color="info" onClick={props.closeMenu}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={() => {
                        props.closeMenu();
                    }}>
                        Add Event
                    </Button>
                </div>
            </div>
        </Card>
    );
}