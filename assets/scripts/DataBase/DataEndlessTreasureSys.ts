import { _decorator, Component, Node } from 'cc';
import { InfoPackEndlessTreasure } from '../Utils/Types';
import { ReadDataJson } from '../ReadDataJson';
import { PlayerData } from '../Utils/PlayerData';
import { EVENT_ENDLESS_TREASURE, STATE_ET, STATE_INFO_PACK_ET, CONFIG_ET } from '../Scene/OtherUI/UIEndlessTreasure/TypeEventEndlessTreasure';
import { clientEvent } from '../framework/clientEvent';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;



@ccclass('DataEndlessTreasureSys')
export class DataEndlessTreasureSys {
    public static Instance: DataEndlessTreasureSys = null;

    private _dataPack: InfoPackEndlessTreasure[] = [];

    private _stateEvent: STATE_ET = STATE_ET.JOINING;

    constructor() {
        if (DataEndlessTreasureSys.Instance == null) {
            DataEndlessTreasureSys.Instance = this;
        }
    }

    public TryUpdateDataPack() {
        this._dataPack = ReadDataJson.Instance.GetDataEndlessTreasure();
        this._dataPack.forEach((pack, index) => { if (index < PlayerData.Instance.ET_numPackUnlocked) pack.isBought = true })
    }

    public GetDataPack() {
        return this._dataPack;
    }

    public IncreasePackUnlocked(needSaveData: boolean = true) {
        PlayerData.Instance.ET_numPackUnlocked += 1;
        this.TryUpdateDataPack();
        PlayerData.Instance.SaveEvent_EndlessTreasure(needSaveData);
        clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.UPDATE_UI_INCREASE_ENDLESS_TREASURE);
    }

    public GetStatePack(idBundle: string): STATE_INFO_PACK_ET {
        const indexPack = this._dataPack.findIndex(item => item.idBundle == idBundle);
        if (indexPack == PlayerData.Instance.ET_numPackUnlocked) {
            return STATE_INFO_PACK_ET.UNLOCK;
        } else if (indexPack < PlayerData.Instance.ET_numPackUnlocked) {
            return STATE_INFO_PACK_ET.BUY_DONE;
        } else {
            return STATE_INFO_PACK_ET.LOCK;
        }
    }

    public GetIndexPack(infoPack: InfoPackEndlessTreasure): number {
        return this._dataPack.findIndex(pack => pack.idBundle == infoPack.idBundle);
    }

    public HasAnyPackCanBuyOrClaim(): boolean {
        return this.GetDataPack().findIndex(pack => !pack.isBought) >= 0;
    }

    public IsNextPackIsFree(): boolean {
        if (this.STATE != STATE_ET.JOINING) { return false; }
        if (PlayerData.Instance.ET_numPackUnlocked == this._dataPack.length) { return false; }
        const infoPackNext: InfoPackEndlessTreasure = this._dataPack[PlayerData.Instance.ET_numPackUnlocked];
        return infoPackNext && infoPackNext.price == 0;
    }

    public GetTimeToDiplay(): number {
        const timeNow = Utils.getCurrTime();
        if (PlayerData.Instance.ET_id == 0
            || (timeNow - CONFIG_ET.TIME_DELAY_ENDLESS_TREASURE) > PlayerData.Instance.ET_timeResetPack) {
            return -1;
        } else {
            return PlayerData.Instance.ET_timeResetPack - CONFIG_ET.TIME_DELAY_ENDLESS_TREASURE - timeNow;
        }
    }

    /**
     * This func will be call in
     * unlock tut của logicCheckTutEndless
     * Auto update state
     * @param justCheckLogic 
     * @param needSaveData 
     * @returns 
     */
    public InitNewEvent(timeEndEvent: number = -1, needSaveData: boolean = true) {
        PlayerData.Instance.ET_id += 1;
        PlayerData.Instance.ET_timeResetPack = timeEndEvent > 0 ? timeEndEvent : (Utils.getCurrTime() + CONFIG_ET.TIME_LONG_ENDLESS_TREASURE + CONFIG_ET.TIME_DELAY_ENDLESS_TREASURE);
        PlayerData.Instance.ET_numPackUnlocked = 0;
        PlayerData.Instance.SaveEvent_EndlessTreasure(needSaveData);
        this.TryUpdateDataPack();
    }
    //=======================================
    //#region state
    public UpdateState(newState: STATE_ET) {
        this._stateEvent = newState;
        switch (this._stateEvent) {
            case STATE_ET.JOINING:
                break;
            case STATE_ET.DELAY_JOIN_AGAIN:
                break;
        }
    }

    public get STATE(): STATE_ET { return this._stateEvent; }
    public AutoUpdateState() {
        // check time
        const timeNow = Utils.getCurrTime();
        const timeEndEvent = PlayerData.Instance.ET_timeResetPack;
        const TOTAL_TIME_LONG_AND_DELAY = CONFIG_ET.TIME_LONG_ENDLESS_TREASURE + CONFIG_ET.TIME_DELAY_ENDLESS_TREASURE;

        const validInTimeLimit = timeNow < timeEndEvent;
        const diffTimeNowAndTimeEndEvent = (timeNow - timeEndEvent) % TOTAL_TIME_LONG_AND_DELAY;
        const diffTimeEndEventAndTimeNow = timeEndEvent - timeNow;

        switch (true) {
            case validInTimeLimit && diffTimeEndEventAndTimeNow > CONFIG_ET.TIME_DELAY_ENDLESS_TREASURE:
                this.UpdateState(STATE_ET.JOINING);
                break;
            case validInTimeLimit:
                this.UpdateState(STATE_ET.DELAY_JOIN_AGAIN);
                break;
            case !validInTimeLimit && diffTimeNowAndTimeEndEvent < CONFIG_ET.TIME_LONG_ENDLESS_TREASURE:
                this.UpdateState(STATE_ET.JOINING);
                const timeEndEventThisLoop = timeNow - diffTimeNowAndTimeEndEvent + TOTAL_TIME_LONG_AND_DELAY;
                this.InitNewEvent(timeEndEventThisLoop);
                break;
            case !validInTimeLimit:
                this.UpdateState(STATE_ET.DELAY_JOIN_AGAIN);
                break;
        }
    }

    public AutoUpdateState2() {
        //check time
        const timeNow = Utils.getCurrTime();
        const timeEndEvent = PlayerData.Instance.ET_timeResetPack;
        const TOTAL_TIME_LONG_AND_DELAY = CONFIG_ET.TIME_LONG_ENDLESS_TREASURE + CONFIG_ET.TIME_DELAY_ENDLESS_TREASURE;

        const validInTimeLimit = timeNow < timeEndEvent;
        const diffTimeEndEventAndTimeNow = timeEndEvent - timeNow;

        switch (true) {
            case validInTimeLimit && diffTimeEndEventAndTimeNow > CONFIG_ET.TIME_DELAY_ENDLESS_TREASURE:
                this.UpdateState(STATE_ET.JOINING);
                break;
            case validInTimeLimit:
                this.UpdateState(STATE_ET.DELAY_JOIN_AGAIN);
                break;
            case !validInTimeLimit:
                this.UpdateState(STATE_ET.JOINING);
                const timeEndEventThisLoop = timeNow + TOTAL_TIME_LONG_AND_DELAY;
                this.InitNewEvent(timeEndEventThisLoop);
                break;
        }
    }
    //#endregion state
    //=======================================
}


