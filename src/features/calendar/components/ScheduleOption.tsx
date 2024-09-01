import { useState } from "react";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import "bootstrap-icons/font/bootstrap-icons.css";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentScheduleIndex, selectScheduleSet } from "../../store/selectors/ScheduleSetSelectors";
import { duplicateSchedule, removeSchedule, renameSchedule, setCurrentScheduleIndex } from "../../store/slices/ScheduleSetSlice";

export function ScheduleOption(props: {name: string, index: number, setMenu: (menu: React.JSX.Element | null) => void} & React.HTMLAttributes<HTMLDivElement>) {
    const scheduleSet = useSelector(selectScheduleSet);
    const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
    const dispatch = useDispatch();
    const {name, index, setMenu} = props;
    const [renaming, setRenaming] = useState(false);    // Whether the schedule is being renamed.
    const [menuOpen, setMenuOpen] = useState(false);    // Whether the action menu is open.

    // Menu for editing actions.
    const ActionMenu = (props: {menuPos: {left: number, top: number}}) => (
        <Backdrop 
            className="hover:cursor-default !z-30"
            open invisible
            onClick={e => {
                e.stopPropagation();
                setMenuOpen(false);
                setMenu(null);
            }}
        >
            <Card className="absolute translate-x-4 -translate-y-1/2 flex flex-col w-fit" style={props.menuPos}>
                {/** Duplicate schedule. */}
                <Button 
                    className="!px-4 !justify-start !align-center" 
                    color="white" 
                    startIcon={<i className="bi bi-copy"></i>}
                    onClick={() => {
                        dispatch(duplicateSchedule(index));
                    }} 
                >
                    Duplicate
                </Button>
                {/** Rename schedule. */}
                <Button 
                    className="!px-4 !justify-start !align-center" 
                    color="white" 
                    startIcon={<i className="bi bi-pencil-square"></i>}
                    onClick={() => {
                        setRenaming(true);
                    }} 
                >
                    Rename
                </Button>
                {/** Delete schedule. */}
                <Button 
                    className="!px-4 !justify-start !align-center" 
                    color="white" 
                    startIcon={<i className="bi bi-trash"></i>}
                    onClick={() => {
                        dispatch(removeSchedule(index));
                    }} 
                >
                    Delete
                </Button>
            </Card>
        </Backdrop>
    );

    return (
        <div 
            onClick={() => dispatch(setCurrentScheduleIndex(index))}
            style={props.style}
            className={`flex items-center px-1 py-0 gap-2 rounded-lg ${menuOpen && "!bg-tertiary"} font-semibold ${currentScheduleIndex === index ? "!bg-quaternary text-white" : "text-neutral-300"} hover:bg-tertiary hover:cursor-pointer ${props.className}`}
        > 
            {/** Drag handle. */}
            <div className="cursor-move touch-none" onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart}>
                <DragIndicatorIcon fontSize="medium" style={{color: "#fff4"}}/>
            </div>
            {/** Schedule name/input field. */}
            {renaming ? (
                <input 
                    className="min-w-0 flex-grow"
                    autoFocus 
                    defaultValue={scheduleSet[index].name} 
                    onBlur={() => {
                        setTimeout(() => setRenaming(false), 100);
                    }}
                    onChange={e => {
                        dispatch(renameSchedule({index, name: e.currentTarget.value}))
                    }}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            setRenaming(false);
                        }
                    }}
                />
                ) : <p className="flex-grow text-nowrap whitespace-pre">{name}</p>
            }
            {/** Button to open menu for editing actions. */}
            <IconButton 
                className="hover:!bg-[#fff1]"
                onClick={e => {
                    e.stopPropagation();
                    props.setMenu(menuOpen ? null : <ActionMenu menuPos={{left: e.clientX, top: e.clientY}}/>);
                    setMenuOpen(!menuOpen);
                }}
            >
                <MoreHorizIcon fontSize="small" style={{color: "#fff8"}}/>
            </IconButton>
        </div>
    )
}