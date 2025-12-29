import { _decorator, Component, Node } from 'cc';
import { Utils } from '../Utils';
const { ccclass, property } = _decorator;

@ccclass('LogicGenContextIdWeekly')
export class LogicGenContextIdWeekly {
    private readonly time_start_weekly: number = 1739750400; // timeStamp

    private _contextIDThisGamePhase: string = null; public get ContextIdThisGamePhase(): string { return this._contextIDThisGamePhase; }
    private _contextIDPreviousGamePhase: string = null; public get ContextIdPreviousGamePhase(): string { return this._contextIDPreviousGamePhase; }

    constructor() {
        this._contextIDThisGamePhase = this.GetContextIdLeaderboardWeekly();
        this._contextIDPreviousGamePhase = this.GetContextIdPreviousLeaderboardWeekly();
    }

    private GetContextIdLeaderboardWeekly(): string {
        let idCaculNumWeek = this.CaculNumWeek();
        // console.log("1111111111111", idCaculNumWeek);
        return idCaculNumWeek >= 0 ? `weekly_${idCaculNumWeek}` : null;
    }

    private GetContextIdPreviousLeaderboardWeekly(): string {
        let idCaculPreviousNumWeek = this.CaculPreviousNumWeek();
        // console.log("222222222", idCaculPreviousNumWeek);
        return idCaculPreviousNumWeek >= 0 ? `weekly_${idCaculPreviousNumWeek}` : null;
    }

    private CaculNumWeek(): number {
        // get time now and check the player in which week
        let timeNow = Utils.getCurrTime();
        let weekOlder = Math.floor((timeNow - this.time_start_weekly) / (60 * 60 * 24 * 7));
        return weekOlder >= 0 ? weekOlder : -1;
    }

    private CaculPreviousNumWeek(): number {
        // get time now and check the player in which week
        let timeNow = Utils.getCurrTime();
        let weekOlder = Math.floor((timeNow - this.time_start_weekly) / (60 * 60 * 24 * 7)) - 1;
        return weekOlder >= 0 ? weekOlder : -1;
    }
}


