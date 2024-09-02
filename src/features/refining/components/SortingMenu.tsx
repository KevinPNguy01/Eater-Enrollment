import CloseIcon from '@mui/icons-material/Close';
import Backdrop from "@mui/material/Backdrop";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import { SortBy, SortDirection, SortOptions } from "../types/options";

export function SortingMenu(props: { optionsState: [SortOptions, (options: SortOptions) => void], close: () => void }) {
    const [options, setOptions] = props.optionsState;
    const { sortBy, direction, sortWithin } = options;

    // Event handlers that for the inputs and buttons.
    const updateOptions = () => setOptions(Object.assign({}, options));
    const setSortBy = (option: SortBy) => () => { options.sortBy = option; updateOptions() };
    const setDirection = (option: SortDirection) => () => { options.direction = option; updateOptions() };
    const setSortWithin = (option: boolean) => { options.sortWithin = option; updateOptions() };

    return (
        <Backdrop className="!absolute z-20" open onClick={props.close}>
            <Card
                className="bg-secondary border top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 border-quaternary absolute text-base text-left"
                elevation={3}
                onClick={e => e.stopPropagation()}
            >
                <div className="whitespace-pre flex items-center justify-end">
                    <IconButton color="info" onClick={props.close}>
                        <CloseIcon />
                    </IconButton>
                </div>
                <div className="flex w-fit gap-16 px-8 pb-4 justify-between">
                    <div className="flex flex-col gap-1 items-start">
                        <span className="w-full font-semibold border-b border-quaternary pb-1 mb-1">{"Sort By"}</span>
                        {Object.values(SortBy).map(option =>
                            <button className={option === sortBy ? "font-bold" : ""} onClick={setSortBy(option)}>{option}</button>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 items-start w-fit">
                        <span className="w-fit font-semibold border-b border-quaternary pb-1 mb-1">{"Sort Direction"}</span>
                        {Object.values(SortDirection).map(option =>
                            <button className={option === direction ? "font-bold" : ""} onClick={setDirection(option)}>{option}</button>
                        )}
                    </div>
                </div>
                <div className="flex border-t border-quaternary pt-2 mx-8 my-4">
                    <input type="checkbox" className="mr-1" defaultChecked={sortWithin} onChange={e => setSortWithin(e.currentTarget.checked)} />
                    Sort within courses
                </div>
            </Card>
        </Backdrop>
    )
}