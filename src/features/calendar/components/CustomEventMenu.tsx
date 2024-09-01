import { TimePicker } from "@mui/x-date-pickers";
import { useState } from "react";
import moment from "moment";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import { useDispatch, useSelector } from "react-redux";
import { addCustomEvent, updateCustomEvent } from "../../schedules/slices/ScheduleSetSlice";
import { selectCurrentScheduleIndex } from "../../schedules/selectors/ScheduleSetSelectors";
import PlaceIcon from '@mui/icons-material/Place';
import NotesIcon from '@mui/icons-material/Notes';
import { CustomEvent } from "../../../types/CustomEvent";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { buildings } from "../../map/constants/Buildings";
import { buildingIds } from "../../map/constants/BuildingIds";
import { getColorCustomEvent } from "../../../utils/FullCalendar";

export function CustomEventMenu(props: {event: CustomEvent, closeMenu: () => void}) {
    const dispatch = useDispatch();
    const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
    const {event, closeMenu} = props;
    const [days, setDays] = useState(event.days);
    const [start, setStart] = useState(moment(event.startTime, 'hh:mm A'));
    const [end, setEnd] = useState(moment(event.endTime, 'hh:mm A'));
    const [title, setTitle] = useState(event.title);
    const [description, setDescription] = useState(event.description);
    const [location, setLocation] = useState(event.location);

    return (
        <Card className="w-3/4 h-fit p-4 flex flex-col content-center" elevation={3} onClick={e => e.stopPropagation()}>
            <h1>{event.id === -1 ? "Add" : "Update"} Custom Event</h1>
            <div className="flex flex-col p-2 gap-4">
                <input className="border-b-0 text-xl font-semibold" placeholder="Event Title" value={title} onChange={e => setTitle(e.currentTarget.value)}/>
                <Divider color="#808080"/>
                <div className="flex justify-around">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                        <Button 
                            color="white"
                            className={`${days & (1 << (6-index)) ? "!border-solid !border-blue-500 !text-blue-500" : ""} !font-semibold !rounded-full !min-w-fit !min-h-fit !w-8 !h-8 !aspect-square`}
                            style={{border: "1px"}}
                            key={index}
                            onClick={() => {
                                setDays(days ^ (1 << (6-index)));
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
                    <Autocomplete 
                        color="warning"
                        className="flex-grow"
                        renderInput={(params) => <TextField {...params} label="Add location" />} 
                        value={{code: location, label: buildingIds[location] ? buildings[buildingIds[location]].name : location}}
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
                    />
                </div>
                <Divider color="#808080"/>
                <div className="flex gap-4 items-center">
                    <NotesIcon/>
                    <input className="border-b-0 flex-grow text-base" placeholder="Add description" value={description} onChange={e => setDescription(e.currentTarget.value)}/>
                </div>
                <Divider color="#808080"/>
                <div className="w-full flex justify-end gap-2">
                    <Button variant="contained" color="info" onClick={closeMenu}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={() => {
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
                            customEvent.color = getColorCustomEvent(customEvent);
                        }
                        dispatch((event.id === -1 ? addCustomEvent : updateCustomEvent)({customEvent, index: currentScheduleIndex}));
                    }}>
                        {event.id === -1 ? "Add" : "Update"} Event
                    </Button>
                </div>
            </div>
        </Card>
    );
}