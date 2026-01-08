import { _decorator, Component, Node, sys } from 'cc';
import { MConsolLog } from '../Common/MConsolLog';
const { ccclass, property } = _decorator;

@ccclass('PlayerSave')
export class PlayerSave {
    public static GAME_ID = "BusTravelPoki_002";
    public static dataJson = {};

    //#region FUNC SAVE GAME
    public static saveDataStorageNoKeyOnLocal(data) {
        sys.localStorage.setItem(PlayerSave.GAME_ID, data);
    }

    public static removeDataStorageNoKeyOnLocal() {
        sys.localStorage.removeItem(PlayerSave.GAME_ID);
    }

    //#endregion FUNC SAVE GAME

    public static getDataStorage() {
        let dataSave = JSON.parse(sys.localStorage.getItem(PlayerSave.GAME_ID));
        MConsolLog.Log(dataSave);
        return dataSave;
    }

    public static getDataLocal(key: string, needJson: boolean = true): any {
        let dataSave = needJson ? JSON.parse(sys.localStorage.getItem(key)) : JSON.parse(sys.localStorage.getItem(key), this.reviver);
        return dataSave;
    }

    public static saveDataLocal(key: string, value: any, needJson: boolean = true) {
        let dataSave = needJson ? JSON.stringify(value) : JSON.stringify(value, this.replacerMap);
        sys.localStorage.setItem(key, dataSave);
    }

    private static replacerMap(key, value) {
        if (value instanceof Map) {
            return {
                dataType: 'Map',
                value: Array.from(value.entries()), // or with spread: value: [...value]
            };
        } else {
            return value;
        }
    }

    private static reviver(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            }
        }
        return value;
    }
}