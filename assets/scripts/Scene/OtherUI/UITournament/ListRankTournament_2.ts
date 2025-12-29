import { _decorator, Component, Node } from 'cc';
import { B_ScrollViewSys, IScrollAnchor, IScrollViewSys } from '../../../Common/UltimateScrollView/B_ScrollViewSys';
import { ItemRankTournament } from './ItemRankTournament';
import { IPrize } from '../../../Utils/Types';
import { IDataPlayer_LEADERBOARD, IInfoLeaderboardByContextId } from '../../../Utils/server/ServerPegasus';
import { ReadJsonOptimized } from '../../../ReadDataJson';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { BubbleSys } from '../Others/Bubble/BubbleSys';
const { ccclass, property } = _decorator;

@ccclass('ListRankTournament_2')
export class ListRankTournament_2 extends B_ScrollViewSys implements IScrollViewSys, IScrollAnchor {
    @property(BubbleSys) bubbleSys: BubbleSys;
    private _listPrize: IPrize[][] = [];
    private _infoLeaderboardByContextId: IInfoLeaderboardByContextId = null;
    private _indexPlayer: number = -1;


    protected onLoad(): void {
        super.onLoad();
        this.SetUp_interface(this, this);
    }

    protected start(): void {
        this.bubbleSys.SetAnchorView(this.nView.worldPosition);
    }


    // private _isInit: boolean = false;
    public SetUpData(iInfoLeaderboardByContextId: IInfoLeaderboardByContextId) {
        // if (this._isInit) {
        //     return;
        // }
        // this._isInit = true;

        // Save data

        this._infoLeaderboardByContextId = iInfoLeaderboardByContextId;
        console.log(this._infoLeaderboardByContextId);

        // gán dữ liệu cho phần thưởng
        if (this._infoLeaderboardByContextId.rewards != null) {
            // set up prize
            this._listPrize = this._infoLeaderboardByContextId.rewards;
        } else if (this._infoLeaderboardByContextId.data != null) {
            let jsonData = JSON.parse(this._infoLeaderboardByContextId.data);
            this._infoLeaderboardByContextId.levels = jsonData.levels;
            for (let i = 0; i < jsonData.rewards.length; i++) {
                let infoPrize = ReadJsonOptimized(jsonData.rewards[i]);
                this._infoLeaderboardByContextId.rewards.push(infoPrize);
            }
            this._listPrize = this._infoLeaderboardByContextId.rewards;
        }

        // tìm kiếm dữ liệu trên server và gán vào scroll
        let dataLeaderboard: IDataPlayer_LEADERBOARD[] = DataLeaderboardSys.Instance.GetLeaderboard(this._infoLeaderboardByContextId.contextId);
        this._indexPlayer = dataLeaderboard.findIndex(obj => obj.playerId == MConfigFacebook.Instance.playerID);
        // trong trường hợp người chơi chưa chơi thì sẽ gán tạm dữ liệu như này
        if (this._indexPlayer == -1) {
            console.log("index player not found: ", this._indexPlayer, MConfigFacebook.Instance.playerID);
            let myPlayer: IDataPlayer_LEADERBOARD = {
                rank: dataLeaderboard.length + 1,
                score: -10000,
                playerId: "" + MConfigFacebook.Instance.playerID,
                name: MConfigFacebook.Instance.playerName,
                avatar: MConfigFacebook.Instance.playerPhotoURL
            }
            this._indexPlayer = dataLeaderboard.length;
            dataLeaderboard.push(myPlayer);
        }


        this.SetUp_data(dataLeaderboard);
        this.InitItemsFirstTime();
    }

    private IsPlayer(data: any): boolean {
        if (data == null || data == '' || data == undefined) { return false; }
        let dataCheck = data as IDataPlayer_LEADERBOARD;
        if (dataCheck.rank == this._indexPlayer) { return true; }
        return false;
    }

    //#region IMyScrollView
    SetUpItemData(nItem: Node, data: any, index: number, cbShowAnchor: CallableFunction, cbHideAnchor: CallableFunction, isUseAnim: boolean): void {
        nItem.getComponent(ItemRankTournament).SetUpData_ItemUltimateSV(data, false, this.IsPlayer.bind(this), cbShowAnchor, cbHideAnchor);
        nItem.getComponent(ItemRankTournament).SetUp(data, this._listPrize);
    }
    //#endregion IMyScrollView

    //#region IScrollAnchor
    SetAnchorData(nAnchor: Node, dataAll: any): void {
        const dataCheck = dataAll[this._indexPlayer];
        nAnchor.getComponent(ItemRankTournament).SetUpData_ItemUltimateSV(dataCheck, true, this.IsPlayer.bind(this), null, null);
        nAnchor.getComponent(ItemRankTournament).SetUp(dataCheck, this._listPrize);
    }

    GetIndexDataAnchor(dataShowing: any): number {
        // check in data has player show
        const dataCheck = dataShowing as IDataPlayer_LEADERBOARD[];
        let indexPlayer = dataCheck.findIndex(obj => obj.rank == this._indexPlayer);
        return indexPlayer;
    }
    //#endregion IScrollAnchor

}


