import { _decorator, Color, Component, Label, Node, tween, Tween, Vec3 } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('AutoTimeInGameSys')
export class AutoTimeInGameSys {
    private _time: number = 0;
    private _speedIncreaseTime: number = 1;

    constructor() {
        clientEvent.on(MConst.EVENT.PAUSE_GAME, this.PauseTime, this);
        clientEvent.on(MConst.EVENT.RESET_GAME, this.ResetTime, this);
        clientEvent.on(MConst.EVENT.RESUME_GAME, this.StartTime, this);
        clientEvent.on(MConst.EVENT.START_TIME_GAME, this.StartTime, this);
    }

    /**
     * remmber call it when destroy obj
     */
    unRegisterEvent() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.InRunTime, this);
        clientEvent.on(MConst.EVENT.PAUSE_GAME, this.PauseTime, this);
        clientEvent.on(MConst.EVENT.RESET_GAME, this.ResetTime, this);
        clientEvent.on(MConst.EVENT.RESUME_GAME, this.StartTime, this);
        clientEvent.on(MConst.EVENT.START_TIME_GAME, this.StartTime, this);
    }

    public SetUpTime(second: number, speedIncreaseTime: number = 1) {
        this._time = second;
        this._speedIncreaseTime = speedIncreaseTime;
    }

    public StartTime() {
        let isHasListenEvent: boolean = clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.InRunTime, this);
        if (this._time >= 0 && !isHasListenEvent) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.InRunTime, this);
        }
    }

    public ResetTime() {
        this._time = 0;
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.InRunTime, this);
    }

    public PauseTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.InRunTime, this);
    }

    /**
    * @param timeAdd second
    */
    public AddTime(timeAdd: number) {
        //add time
        this._time += timeAdd;
    }

    private InRunTime() {
        //increase time and update UI
        this._time += this._speedIncreaseTime;
    }

    public GetTime(): number {
        return this._time;
    }
}


