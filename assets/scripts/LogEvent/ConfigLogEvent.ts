import { _decorator, Component, Node } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
const { ccclass, property } = _decorator;

@ccclass('ConfigLogEvent')
export class ConfigLogEvent {
    private static _instance: ConfigLogEvent = null;

    static get Instance() {
        if (this._instance == null) {
            this._instance = new ConfigLogEvent();
        }
        return this._instance;
    }

    //#region LOG EVENT
    log_CAMP_ID: string = "";
    log_ADSET_ID: string = "";
    log_ADS_ID: string = "";

    campID_session: string = "";
    adsetID_session: string = "";
    adsID_session: string = "";

    checkCampID(campID: string) {
        return campID == this.log_CAMP_ID;
    }

    addCampID(campID: string) {
        this.log_CAMP_ID = campID;
        PlayerData.Instance.SaveCampID(this.log_CAMP_ID);
    }

    checkAdsetID(adsetID: string) {
        return adsetID == this.log_ADSET_ID;
    }

    addAdsetID(adsetID: string) {
        this.log_ADSET_ID = adsetID;
        PlayerData.Instance.SaveAdsetID(this.log_ADSET_ID);
    }

    checkAdsID(adsID: string) {
        return adsID == this.log_ADS_ID;
    }

    addAdsID(adsID: string) {
        this.log_ADS_ID = adsID;
        PlayerData.Instance.SaveAdsID(this.log_ADS_ID);
    }

    log_TOUR_ID: string = "";
    tourID_session: string = "";

    checkTourID(tourID: string) {
        return tourID == this.log_TOUR_ID;
    }

    addTourID(tourID: string) {
        this.log_TOUR_ID = tourID;
        PlayerData.Instance.SaveTourID(this.log_TOUR_ID);
    }

    //#endregion

    isPaidUser:boolean = false;
}


