import { _decorator, Component, macro, Node } from 'cc';
import { IMyScrollView, ScrollViewBase2 } from '../../../Common/ScrollViewBase2';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { Utils } from '../../../Utils/Utils';
import { ItemTournament } from './ItemTournament';
import { PageTournamentSys } from '../../LobbyScene/PageSys/PageTournamentSys';
const { ccclass, property } = _decorator;

@ccclass('ListTournament')
export class ListTournament extends ScrollViewBase2 implements IMyScrollView {
    private _data = null;
    private _idInterval: number = -1;
    private _timeCheckInterval: number = 0;
    private readonly MAX_TIME_CHECK_INTERVAL = 5; // 1'

    protected onLoad(): void {
        this.InitScrollView(this, false);
    }

    protected onDestroy(): void {
        if (this._idInterval != -1) { clearInterval(this._idInterval); }
    }

    protected start(): void {
        PageTournamentSys.Instance.ShowUILoading();
        // call loading UI
        this.TryCallDataUntilHaveData();
        this.PrepareDataShow();
        this._data = DataLeaderboardSys.Instance.GetListTouringByContextId();
    }

    protected onEnable(): void {
        if(this._data != null) {
            PageTournamentSys.Instance.HideUILoading();
        }
    }

    //#region func IMyScrollView
    async AddData(out: (data: any[]) => void): Promise<void> {
        out(this._data);
    }

    async SetDataWhenInitNewItem(item: Node, index: number, data: any): Promise<void> {
        item.getComponent(ItemTournament).SetUp(data);
    }

    SetDataWhenRecycleNewItem(item: Node, index: number, data: any): void {
        item.getComponent(ItemTournament).SetUp(data);
    }
    //#endregion

    //#region func self
    private _hasData: boolean = false; public get HasDataInit() { return this._hasData; }
    private TryCallDataUntilHaveData() {
        this._idInterval = setInterval(() => {
            if (this._data != null && this._data.length > 0) {
                console.warn("has dataLeaderboardFirstCall TOURNAMENT", Array.from(this._data));
                this._hasData = true;
            } else {
                console.warn("no data tour");
                this.CheckDataAgain();
            }

            // add time
            this._timeCheckInterval += 1;

            if (this._hasData || this._timeCheckInterval == this.MAX_TIME_CHECK_INTERVAL) {
                console.warn("clear Interval TOURNAMENT because", this._hasData, this._timeCheckInterval);
                clearInterval(this._idInterval);
                PageTournamentSys.Instance.HideUILoading();
                this.PrepareDataShow();
            }
        }, 1000, macro.REPEAT_FOREVER, 0)
    }

    private CheckDataAgain() {
        // check if data == [] call to update again
        if (this._data == null || this._data.length == 0) {
            let data = DataLeaderboardSys.Instance.GetListTouringByContextId();
            // if (data != null && data.length > 0) {
            //     data.sort((a, b) => {
            //         const currentTime = Utils.getCurrTime();
            //         const aExpired = a.expireTime <= currentTime;
            //         const bExpired = b.expireTime <= currentTime;

            //         if (aExpired === bExpired) {
            //             return 0;
            //         } else if (aExpired) {
            //             return 1;
            //         } else {
            //             return -1;
            //         }
            //     });
            // }
            this._data = data;
        }
    }
    //#endregion self func
}


