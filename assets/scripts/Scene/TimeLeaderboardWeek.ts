import { _decorator, Component, Node } from 'cc';
import { ITimeEventSys, TimeEventSys } from '../TimeEventSys';
import { clientEvent } from '../framework/clientEvent';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('TimeLeaderboardWeek')
export class TimeLeaderboardWeek extends TimeEventSys implements ITimeEventSys {
    private timeStartLeaderboardWeek: number = 1725499500;

    constructor() {
        super();
        this.InitClass(this);
        clientEvent.on(this.nameEventUpdateTime, this.LogTime, this);
    }

    //#region ITimeEventSys
    nameEventUpdateTime: string = "TimeLeaderboardWeek_nameEventUpdateTime";
    nameEventEndTimeWhenRunning: string = "TimeLeaderboardWeek_nameEventEndTimeWhenRunning";
    nameEventEndTimeWhenInit: string = "TimeLeaderboardWeek_nameEventEndTimeWhenInit";
    nameEventForceStopTime: string = "TimeLeaderboardWeek_nameEventForceStopTime";
    nameEventAddTime: string = "TimeLeaderboardWeek_nameEventAddTime";

    SaveData(): void {
        // throw new Error('Method not implemented.');
    }
    GetTimeLength(): number {
        // return 1 week
        return 60 * 60 * 24 * 7 * 2;
    }
    SetTimeLength(timeSet: number, needSave: boolean): void {
        // throw new Error('Method not implemented.');
    }
    GetTimeStart(): number {
        return this.timeStartLeaderboardWeek;
        // throw new Error('Method not implemented.');
    }
    SetTimeStart(timeSet: number, needSave: boolean): void {
        // throw new Error('Method not implemented.');
    }
    async ResetData(): Promise<void> {
        // throw new Error('Method not implemented.');
    }
    //#endregion ITimeEventSys

    //#region self func
    private LogTime(timeRemaining: number) {
        console.log("TimeLeaderboardWeek: " + Utils.convertTimeToFormat(timeRemaining));
    }
    //#endregion self func
}


