import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { SortBy, SortDirection, SortOptions } from "../types/options";
import { Dialog } from '@mui/material';
import { BpCheckbox } from 'components/BpCheckbox';

export function SortingMenu(props: { optionsState: [SortOptions, (options: SortOptions) => void], openState: [boolean, (val: boolean) => void] }) {
    const [options, setOptions] = props.optionsState;
    const [open, setOpen] = props.openState;
    const { sortBy, direction, sortWithin } = options;

    // Event handlers that for the inputs and buttons.
    const updateOptions = () => setOptions(Object.assign({}, options));
    const setSortBy = (option: SortBy) => () => { options.sortBy = option; updateOptions() };
    const setDirection = (option: SortDirection) => () => { options.direction = option; updateOptions() };
    const setSortWithin = (option: boolean) => { options.sortWithin = option; updateOptions() };

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
        >
            <div className="whitespace-pre flex items-center justify-end">
                <IconButton color="info" onClick={() => setOpen(false)}>
                    <CloseIcon />
                </IconButton>
            </div>
            <div className="flex w-fit gap-16 px-8 pb-4 justify-between">
                <div className="flex flex-col gap-1 items-start">
                    <span className="w-full font-semibold border-b border-quaternary pb-1 mb-1">{"Sort By"}</span>
                    {Object.values(SortBy).map(option =>
                        <button key={option} className={option === sortBy ? "font-bold" : ""} onClick={setSortBy(option)}>{option}</button>
                    )}
                </div>
                <div className="flex flex-col gap-1 items-start w-fit">
                    <span className="w-fit font-semibold border-b border-quaternary pb-1 mb-1">{"Sort Direction"}</span>
                    {Object.values(SortDirection).map(option =>
                        <button key={option} className={option === direction ? "font-bold" : ""} onClick={setDirection(option)}>{option}</button>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1 border-t border-quaternary pt-2 mx-8 my-4">
                <BpCheckbox checked={sortWithin} onChange={e => setSortWithin(e.currentTarget.checked)} />
                Sort within courses
            </div>
        </Dialog>
    )
}