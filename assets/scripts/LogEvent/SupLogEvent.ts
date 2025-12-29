/**
 * 
 * anhngoxitin01
 * Fri Oct 03 2025 09:08:04 GMT+0700 (Indochina Time)
 * SupLogEvent
 * db://assets/scripts/LogEvent/SupLogEvent.ts
*
*/
import { _decorator, Component, Node } from 'cc';
import { IParamLogLoseEventInGameIAP, TYPE_EVENT_GAME } from '../Utils/Types';
import { LogEventManager } from './LogEventManager';

class SupLogEvent {
    private constructor() { }
    static Instance = new SupLogEvent();

    private _isInWayLogLoseEventStreak: boolean = false;
    public set SetIsInWayLogLoseEventStreak(isInWay: boolean) { this._isInWayLogLoseEventStreak = isInWay; }
    private _isInWayLogLoseNormal: boolean = false;
    public set SetIsInWayLogLoseNormal(isInWay: boolean) { this._isInWayLogLoseNormal = isInWay; }

    public LogEventWithIAP(data: IParamLogLoseEventInGameIAP, packName: string, price: number, idPack: string, location: string) {
        if (this._isInWayLogLoseEventStreak) {
            LogEventManager.Instance.lose2PackNameEvent(data.streakSL, data.streakTT, data.typeEventGoingOn, data.numLoopEventGoingOn, packName, price, idPack);
            LogEventManager.Instance.lose2TotalPurchase(price, idPack);
        }
        LogEventManager.Instance.loseTotalPurchase(price, idPack);
    }

    public LogEventWithReward(data: IParamLogLoseEventInGameIAP, price: number, idPack: string, location: string) {
        if (this._isInWayLogLoseEventStreak) {
            LogEventManager.Instance.lose2RWPosition(data.streakSL, data.streakTT, data.typeEventGoingOn, data.numLoopEventGoingOn, location, price, idPack);
            LogEventManager.Instance.lose2TotalRw(location);
        }
        LogEventManager.Instance.loseTotalRw(location);
    }
}

export default SupLogEvent.Instance;