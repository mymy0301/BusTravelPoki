import { _decorator, Component, Node, director, macro } from 'cc';
import { clientEvent } from './framework/clientEvent';
import { EVENT_CLOCK_ON_TICK } from './Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ClockGameSys_2')
export class ClockGameSys_2 {
    private static _instance: ClockGameSys_2 = null;

    private _mapCallback: Map<number, CallableFunction> = new Map();
    private autoIncreaseId = 0;

    public static get Instance(): ClockGameSys_2 {
        if (ClockGameSys_2._instance == null) {
            ClockGameSys_2._instance = new ClockGameSys_2();
            ClockGameSys_2._instance.StartClock();
            ClockGameSys_2._instance.RegisterFocus();
        }
        return ClockGameSys_2._instance;
    }

    /**
     * 
     * @param callableFunction 
     * @returns id call back
     */
    public registerCallBack(callableFunction: CallableFunction): number {
        this.autoIncreaseId += 1;
        this._mapCallback.set(this.autoIncreaseId, callableFunction);
        return this.autoIncreaseId;
    }

    public unregisterCallBack(idCallback: number): boolean {
        return this._mapCallback.delete(idCallback);
    }

    private StartClock() {
        setInterval(() => {
            this.IncreaseTime();
        }, 1000, macro.REPEAT_FOREVER, 0);
        // this.schedule(this.IncreaseTime.bind(this), 1, macro.REPEAT_FOREVER, 0);
    }

    public IncreaseTime() {
        // call all register call back in here
        this._mapCallback.forEach((value, key) => {
            value();
        })
        clientEvent.dispatchEvent(EVENT_CLOCK_ON_TICK);
    }


    /*═══════════════════════════════════════════════════
    ║                  Focus in game                    ║
    ═══════════════════════════════════════════════════*/
    //#region Focus
    private _isFocusInGame: boolean = true;
    private RegisterFocus() {
        document.addEventListener('visibilitychange', this.ChangeVisiblity.bind(this));
    }

    private UnRegisterFocus() {
        document.addEventListener('visibilitychange', this.ChangeVisiblity.bind(this));
    }

    private ChangeVisiblity() {
        this._isFocusInGame = document.hidden;
        // console.log("visibilitychange: ", document.hidden);
    }
    //#endregion Focus
    //═══════════════════════════════════════════════════
}


