import { _decorator, Component, Node } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { LogEventManager } from './LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('DataLogEventSys')
export class DataLogEventSys {
    public static Instance: DataLogEventSys = null;

    constructor() {
        if (DataLogEventSys.Instance == null) {
            DataLogEventSys.Instance = this;
        }
    }

    //splash_to_home
    public _splashStartTime: number = 0;
    public _isLogSplashToHome: boolean = false;

    public SetSplashStartTime(timeSplash: number) {
        this._splashStartTime = timeSplash;
    }

    public GetTimeSplashToHome(timeHome: number) {
        return timeHome - this._splashStartTime;
    }

    public GetIsLogSplashToHome() {
        return this._isLogSplashToHome;
    }

    public SetIsLogSplashToHome(isLog: boolean) {
        this._isLogSplashToHome = isLog;
    }

    public Add_adRewardWatch(numAdd: number = 1, needSaveData: boolean = true) {
        PlayerData.Instance._adRewardWatch += numAdd;
        if (needSaveData) {
            PlayerData.Instance.SaveLogEvent();
        }

        LogEventManager.Instance.logAdRwWatched(PlayerData.Instance._adRewardWatch);
    }

    public Add_adInterWatch(numAdd: number = 1, needSaveData: boolean = true) {
        PlayerData.Instance._adInterWatch += numAdd;
        if (needSaveData) {
            PlayerData.Instance.SaveLogEvent();
        }

        LogEventManager.Instance.logAdInterWatched(PlayerData.Instance._adInterWatch);
    }

    public WinLevel() {
        LogEventManager.Instance.logBestLevel(PlayerData.Instance._levelPlayer);
    }
}


