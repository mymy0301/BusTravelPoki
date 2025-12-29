import { _decorator, Component, Node } from 'cc';
import { ItemGameInfo } from '../SerilazationData/ItemGameInfo';
const { ccclass, property } = _decorator;

//#region LIFE
export function LIFE_ConvertDataToJson(numLife: number, timeInfinityLife: number, lastTimeSaveLife: number, lastTimeSaveInfinityLife: number): string {
    return `${numLife},${timeInfinityLife},${lastTimeSaveLife},${lastTimeSaveInfinityLife}`;
}

export function LIFE_ConvertJsonToData(json: string): { 
    numLife: number, 
    lastTimeSaveLife: number,
    timeInfinityLife: number,
    lastTimeSaveInfinityLife: number
} {
    let dataSplit = json.split(',');
    return {
        numLife: Number.parseInt(dataSplit[0]),
        lastTimeSaveLife: Number.parseInt(dataSplit[1]),
        timeInfinityLife: Number.parseInt(dataSplit[2]),
        lastTimeSaveInfinityLife: Number.parseInt(dataSplit[3])
    }
}
//#endregion LIFE




