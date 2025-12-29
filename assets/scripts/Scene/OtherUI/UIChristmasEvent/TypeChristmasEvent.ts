import { Enum, Node } from "cc";
import { shuffleArrayWithSeed } from "../../../framework/randomSeed";

const EVENT_CHRISTMAS_EVENT = {
    BLOCK_UI: "EVENT_CHRISTMAS_EVENT_BLOCK_UI",
    CHANGE_PAGE: "EVENT_CHRISTMAS_CHANGE_PAGE",
    SHOW_NCOIN_TICKET: "EVENT_CHRISTMAS_SHOW_NCOIN_TICKET",
    HIDE_NCOIN_TICKET: "EVENT_CHRISTMAS_HIDE_NCOIN_TICKET"
}

const MCONST_CHRISTMAS_EVENT = {
    MAX_LEVEL_CHRIST: 359
}

const MCONFIG_CHRISTMAS_EVENT = {
    IS_SHOW_FIRST_TIME: true,
    DATE_VALID_END_EVENT_MONTH: 1,
    MONTH_VALID_INIT: [11]
}

function GetLevelChristGame(level: number): number {
    const maxLevel = MCONST_CHRISTMAS_EVENT.MAX_LEVEL_CHRIST;
    const minLevel = 1;
    let result = level;

    if (level > maxLevel) {
        const numLoop = Math.floor((level - maxLevel) / (maxLevel - minLevel));
        const listLevelRandom: number[] = randomLevelWithSeed(numLoop, minLevel, maxLevel);
        const indexRead = (level - 1 - maxLevel) % (maxLevel - minLevel)
        result = listLevelRandom[indexRead];
    }

    console.log(result);

    return result;
}

function randomLevelWithSeed(seed: number, minLevelStart: number, totalLevel: number): number[] {
    const levels = Array.from({ length: totalLevel }, (_, i) => i + 1 + (minLevelStart - 1));
    const result = shuffleArrayWithSeed(seed.toString(), levels);
    return result;
}

//============================================================
//#region dataCustom
export interface IDataUIEventChristmas {
    nPrizes: Node[]
}
function IsIDataUIEventChristmas(object: any): object is IDataUIEventChristmas {
    return object != null && 'nPrizes' in object;
}

export interface IDataUIEventReceiveHatRaceFromHome { isFromHome: boolean }
function IsIDataUIEventReceiveHatRaceFromHome(object: any): object is IDataUIEventReceiveHatRaceFromHome {
    return object != null && 'isFromHome' in object;
}
//#endregion dataCustom


export enum PAGE_VIEW_CHRISTMAS_EVENT {
    LIGHT_ROAD,
    HAT_RACE
}
Enum(PAGE_VIEW_CHRISTMAS_EVENT);

export {
    EVENT_CHRISTMAS_EVENT,
    MCONFIG_CHRISTMAS_EVENT,

    IsIDataUIEventChristmas,
    IsIDataUIEventReceiveHatRaceFromHome,

    GetLevelChristGame
}