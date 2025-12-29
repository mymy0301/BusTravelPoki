/**
 * 
 * anhngoxitin01
 * Mon Oct 27 2025 10:35:14 GMT+0700 (Indochina Time)
 * DataHalloweenSys
 * db://assets/scripts/DataBase/DataHalloweenSys.ts
*
*/
import { _decorator, Component, Node } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { Utils } from '../Utils/Utils';
import { EnumReasonEndPack, InfoPack } from '../Utils/Types';
import { ReadDataJson } from '../ReadDataJson';
import { clientEvent } from '../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
const { ccclass, property } = _decorator;

const MAX_PACK = 4;
const TIME_LONG = 604800;

@ccclass('DataHalloweenSys')
export class DataHalloweenSys {
    public static Instance: DataHalloweenSys = null;
    private _infoPackWoring: InfoPack = null;
    private _forceTurnOffPack: boolean = true; public set ForceChangeActivePack(newState: boolean) { this._forceTurnOffPack = newState; }

    public get InfoPackHalloweenWorking() {
        if (!PlayerData.Instance._hlw_isActive || this._forceTurnOffPack) {
            return null;
        }
        return this._infoPackWoring;
    }
    constructor() {
        if (DataHalloweenSys.Instance == null) {
            DataHalloweenSys.Instance = this;
        }
    }

    /**
     * Func này sẽ được gọi trong onLoad và gọi sau khi đã có bộ dữ liệu người dùng
     * @param needSaveData 
     */
    public LoadPackFirstTime(needSaveData: boolean = true) {
        if (this._forceTurnOffPack == true) { return; }

        switch (true) {
            case PlayerData.Instance._hlw_timeInitPack <= 0 && PlayerData.Instance._hlw_isActive:
                PlayerData.Instance._hlw_timeInitPack = Utils.getCurrTime();
                this.TryGenPack(PlayerData.Instance._hlw_indexPack);
                if (needSaveData) {
                    PlayerData.Instance.SaveEvent_HLW(needSaveData);
                }
                break;
            case PlayerData.Instance._hlw_timeInitPack > 0 && PlayerData.Instance._hlw_isActive:
                this.TryGenPack(PlayerData.Instance._hlw_indexPack);
                break;
        }
    }

    public TryGenPack(indexPack: number) {
        if (this._forceTurnOffPack == true) { return; }

        if (!PlayerData.Instance._hlw_isActive) { return; }
        // dựa theo indexPack
        this._infoPackWoring = new InfoPack();
        const dataPack = ReadDataJson.Instance.GetDataPacksHalloween()[indexPack];
        this._infoPackWoring.readDataFromJson_WhenInit(dataPack);
    }

    public BuyPackSuccess(needSaveData: boolean = true) {
        // noti remove pack
        clientEvent.dispatchEvent(MConst.EVENT_PACK.REMOVE_PACK, EnumReasonEndPack.Force, ReadDataJson.Instance.GetDataPacksHalloween()[PlayerData.Instance._hlw_indexPack].namePack);

        PlayerData.Instance._hlw_indexPack += 1;
        if (PlayerData.Instance._hlw_indexPack >= MAX_PACK) {
            PlayerData.Instance._hlw_isActive = false;
        } else {
            this._infoPackWoring = null;
        }

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_HLW(needSaveData);
        }
    }

    public GetIndexPackNow() { return PlayerData.Instance._hlw_indexPack; }
    public GetTimeEnd() { return PlayerData.Instance._hlw_timeInitPack + TIME_LONG; }
    public GetTimeRemain() {
        if (this._forceTurnOffPack == true) { return -1; }

        if (!PlayerData.Instance._hlw_isActive) { return -1; }
        return this.GetTimeEnd() - Utils.getCurrTime();
    }

    //============================================================
    //#region time
    /**
     * Func này sẽ được gọi trong onLoad và gọi sau khi đã init pack
     * @param needSaveData 
     */
    public StartTime() {
        if (this._forceTurnOffPack == true) { return; }

        this.RegitsterTime();
    }
    private RegitsterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        }
    }

    private UpdateTime() {
        // check is end time of event
        const isEndTimeEventLoop = this.GetTimeRemain() < 0;
        if (isEndTimeEventLoop) {
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
            PlayerData.Instance._hlw_isActive = false;
            this._infoPackWoring = null;
            PlayerData.Instance.SaveEvent_HLW();
            clientEvent.dispatchEvent(MConst.EVENT_PACK.REMOVE_PACK, EnumReasonEndPack.Force, ReadDataJson.Instance.GetDataPacksHalloween()[PlayerData.Instance._hlw_indexPack].namePack);
        }
    }
    //#endregion time
    //============================================================

    //============================================================
    //#region price
    public TotalPriceSpendingMoney(): number {
        let result: number = 0;
        try {
            // check id + dồn id cũ
            const listPackData = ReadDataJson.Instance.GetDataPacksHalloween()
            for (let indexPack = 0; indexPack < PlayerData.Instance._hlw_indexPack; indexPack++) {
                const infoPackHlw = listPackData[indexPack];
                if (infoPackHlw == null) { continue; }
                result += Number.parseFloat(infoPackHlw.price);
            }
            return result;
        } catch (e) {

        }
        return result;
    }
    //#endregion price
    //============================================================
}