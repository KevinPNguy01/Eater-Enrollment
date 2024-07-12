import { buildingIds } from "../../map/constants/BuildingIds";
import { buildings } from "../../map/constants/Buildings";

export function BuildingLink(props: {location: string}) {
    const {location} = props;
    const tokens = location.split(" ");
    const code = tokens.slice(0, -1).join(" ");
    //const number = tokens[tokens.length-1];
    const id = buildingIds[code];
    const building = buildings[id];

    return (
        <a 
            className="group relative text-sky-500 hover:cursor-pointer" 
            href={`https://map.uci.edu/?id=463#!ct/61979?m/${id}?s/${code}`} 
            target="_blank" 
            rel="noopener noreferrer"
        >
            {location}
            <div className="hidden group-hover:absolute group-hover:block bottom-full left-1/2 -translate-x-1/2 bg-tertiary border border-quaternary p-2 mb-2 rounded">
                <p className="text-white whitespace-nowrap text-base">
                    {building?.name}
                </p>
            </div>
        </a>
    )
}