/**
 * 
 * anhngoxitin01
 * Mon Sep 15 2025 14:40:10 GMT+0700 (Indochina Time)
 * ListItemCheatLoop
 * db://assets/scripts/Cheat/UICheatEvents/ListItemCheatLoop.ts
*
*/
import { _decorator, Component, Node } from 'cc';
import { ItemCheatLoop } from './ItemCheatLoop';
import { DataEventsSys } from '../../Scene/DataEventsSys';
import { ItemCheatEventLP } from './ItemCheatEventLP';
import { DataLevelPassSys } from '../../DataBase/DataLevelPassSys';
import { DataSeasonPassSys } from '../../DataBase/DataSeasonPassSys';
import { ItemCheatEventSP } from './ItemCheatEventSP';
import { DataSkyLiftSys } from '../../DataBase/DataSkyLiftSys';
import { ItemCheatSkyLift } from './ItemCheatSkyLift';
import { ItemCheatDashRush } from './ItemCheatDashRush';
import { ItemCheatTreasureTrail } from './ItemCheatTreasureTrail';
import { DataDashRush } from '../../Scene/DataDashRush';
import { DataTreasureTrailSys } from '../../DataBase/DataTreasureTrailSys';
const { ccclass, property } = _decorator;

@ccclass('ListItemCheatLoop')
export class ListItemCheatLoop extends Component {
    @property(ItemCheatLoop) listItemCheatLoop: ItemCheatLoop[] = [];
    @property(ItemCheatEventLP) itemCheatEventLP: ItemCheatEventLP;
    @property(ItemCheatEventSP) itemCheatEventSP: ItemCheatEventSP;
    @property(ItemCheatSkyLift) itemCheatSkyLift: ItemCheatSkyLift;
    @property(ItemCheatDashRush) itemCheatDashRush: ItemCheatDashRush;
    @property(ItemCheatTreasureTrail) itemCheatTreasureTrail: ItemCheatTreasureTrail;
    //==========================================
    //#region base
    public SetUp() {
        this.InitListGroupEvent();
        this.InitListEvents();
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private InitListGroupEvent() {
        if (DataEventsSys.Instance == null) { return; }
        const listGroupEvent = DataEventsSys.Instance.GetListGroupEvent();

        let indexGroupWasSet: number = 0;
        for (let i = 0; i < listGroupEvent.length; i++) {
            const iGroup = listGroupEvent[i];
            // setUp group
            this.listItemCheatLoop[indexGroupWasSet].SetUp(iGroup);

            indexGroupWasSet += 1;
        }
    }

    private InitListEvents() {
        // LevelPass
        if (DataLevelPassSys.Instance == null || this.itemCheatEventLP == null) { return; }
        this.itemCheatEventLP.SetUp();

        //SeasonPass
        if (DataSeasonPassSys.Instance == null || this.itemCheatEventSP == null) { return; }
        this.itemCheatEventSP.SetUp();

        //SkyLift
        if (DataSkyLiftSys.Instance == null || this.itemCheatSkyLift == null) { return; }
        this.itemCheatSkyLift.SetUp();

        //DashRush
        if (DataDashRush.Instance == null || this.itemCheatDashRush == null) { return; }
        this.itemCheatDashRush.SetUp();

        //TreasureTrail
        if (DataTreasureTrailSys.Instance == null || this.itemCheatTreasureTrail == null) { return; }
        this.itemCheatTreasureTrail.SetUp();
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}