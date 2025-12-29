import { _decorator, Component, Label, Node } from 'cc';
import { B_ScrollViewSys, IScrollAnchor, IScrollViewSys } from '../../../Common/UltimateScrollView/B_ScrollViewSys';
import { MConst } from '../../../Const/MConst';
import { ItemPlayerLeaderboard } from '../Item/ItemPlayerLeaderboard';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { DataWeeklySys } from '../../../DataBase/DataWeeklySys';
const { ccclass, property } = _decorator;

@ccclass('ListLeaderboardUI_2')
export class ListLeaderboardUI_2 extends B_ScrollViewSys implements IScrollViewSys, IScrollAnchor {
    @property({ type: MConst.ID_LEADER_BOARD }) idLeaderboard = MConst.ID_LEADER_BOARD.FRIEND;
    @property(Label) lbTitleShadow: Label;
    @property(Label) lbTitle: Label;
    private _indexPlayer: number = -1;
    private _contextIdLeaderboard: string = null;
    private _cbLoadDataDone: CallableFunction;
    public _isInitInface = false;


    protected onLoad(): void {
        super.onLoad();
        this.SetUp_interface(this, this);

        this._isInitInface = true;
    }

    public RegisterCb(cbLoadDataDone: CallableFunction) {
        this._cbLoadDataDone = cbLoadDataDone;
    }

    public async SetData() {
        //========== get data ===========
        this._contextIdLeaderboard = this.GetRightContextIDSuitWithIDLeaderboardCustomInCode(this.idLeaderboard);
        if (this._contextIdLeaderboard == null) {
            this._contextIdLeaderboard = MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD;
        }

        let listLeaderBoard = JSON.parse(JSON.stringify(DataLeaderboardSys.Instance.GetLeaderboard(this._contextIdLeaderboard)));
        this._indexPlayer = DataLeaderboardSys.Instance.GetIndexPlayerLeaderboard(this._contextIdLeaderboard);
        // check player có trong leaderboard hay không? Nếu không có thì auto add và xếp hạng sau cùng
        if (this.idLeaderboard == MConst.ID_LEADER_BOARD.WEEKLY && !listLeaderBoard.some(player => player.playerId == MConfigFacebook.Instance.playerID)) {
            let dataPlayerTemp = DataLeaderboardSys.Instance.GetInfoPlayerTemp();
            dataPlayerTemp.score = DataWeeklySys.Instance.GetProgressPlayer();
            this._indexPlayer = listLeaderBoard.length;
            dataPlayerTemp.rank = listLeaderBoard.length + 1;
            listLeaderBoard = [...listLeaderBoard, dataPlayerTemp];
        }

        //========== set init ==========
        this.SetUp_data(listLeaderBoard);
        this.InitItemsFirstTime();

        //========== set label =========
        if (this.idLeaderboard == MConst.ID_LEADER_BOARD.WEEKLY) {
            const infoLeaderboard = DataLeaderboardSys.Instance.GetInfoLeaderboardByContextId(this._contextIdLeaderboard);
            const nameLeaderboard = infoLeaderboard != null && infoLeaderboard.name != '' && infoLeaderboard.name != null ? infoLeaderboard.name : 'Weekly Leaderboard';
            this.lbTitle.string = nameLeaderboard;
            this.lbTitleShadow.string = nameLeaderboard;
        }

        // ==========================================
        // ==========================================
        // ================ NOT GOOD       ==========
        // ==========================================
        // ==========================================
        this._cbLoadDataDone();
    }

    private GetRightContextIDSuitWithIDLeaderboardCustomInCode(idLeaderboard: number): string {
        switch (idLeaderboard) {
            case MConst.ID_LEADER_BOARD.FRIEND: return MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND;
            case MConst.ID_LEADER_BOARD.WEEKLY: return DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY;
            case MConst.ID_LEADER_BOARD.WORLD: return MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD;
        }
        return null;
    }

    private IsPlayer(data: any): boolean {
        if (data == null || data == '' || data == undefined) { return false; }
        let dataCheck = data as IDataPlayer_LEADERBOARD;
        if (dataCheck.rank == this._indexPlayer) { return true; }
        return false;
    }

    //#region IScrollViewSys
    SetUpItemData(nItem: Node, data: any, index: number, cbShowAnchor: CallableFunction, cbHideAnchor: CallableFunction, isUseAnim: boolean): void {
        nItem.getComponent(ItemPlayerLeaderboard).SetUpData_ItemUltimateSV(data, false, this.IsPlayer.bind(this), cbShowAnchor, cbHideAnchor);
        nItem.getComponent(ItemPlayerLeaderboard).SetUp(data, this._contextIdLeaderboard);
    }
    //#endregion IScrollViewSys

    //#region IScrollAnchor
    SetAnchorData(nAnchor: Node, dataAll: any): void {
        // hide the anchor if not found player
        if (this._indexPlayer == -1) {
            nAnchor.active = false;
            return;
        }
        // show anchor if found player
        const dataCheck = dataAll[this._indexPlayer];

        nAnchor.getComponent(ItemPlayerLeaderboard).SetUpData_ItemUltimateSV(dataCheck, true, this.IsPlayer.bind(this), null, null);
        nAnchor.getComponent(ItemPlayerLeaderboard).SetUp(dataCheck, this._contextIdLeaderboard);
    }

    GetIndexDataAnchor(dataShowing: any): number {
        if (this._indexPlayer < 0) { return -1; }

        // check in data has player show
        const dataCheck = dataShowing as IDataPlayer_LEADERBOARD[];
        //===================================================================================================
        //===================================================================================================
        // NOTE ở phần này bạn nên kiểm tra xem lại UIRank xem rank có +1 hay không.
        // nếu trong trường hợp global và weekly chyaj theo index thì bên friend cần phải làm exception riêng
        //===================================================================================================
        //===================================================================================================
        let indexPlayer = dataCheck.findIndex(obj => obj.rank == this._indexPlayer + 1);

        return indexPlayer;
    }
    //#endregion IScrollAnchor
}


