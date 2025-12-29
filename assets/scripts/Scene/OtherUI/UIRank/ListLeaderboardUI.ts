import { _decorator, Component, Enum, Node } from 'cc';
import { IMyScrollView, IScrollWithAnchorView, ScrollViewBase2 } from '../../../Common/ScrollViewBase2';
import { MConst } from '../../../Const/MConst';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { ItemPlayerLeaderboard } from '../Item/ItemPlayerLeaderboard';
import { MConsolLog } from '../../../Common/MConsolLog';
const { ccclass, property } = _decorator;

Enum(MConst.ID_LEADER_BOARD);
@ccclass('ListLeaderboardUI')
export class ListLeaderboardUI extends ScrollViewBase2 implements IMyScrollView, IScrollWithAnchorView {
    @property({ type: MConst.ID_LEADER_BOARD }) idLeaderboard = MConst.ID_LEADER_BOARD.FRIEND;
    private indexPlayer: number = -1;
    private _contextIdLeaderboard: string = null;
    private _cbLoadDataDone: CallableFunction;
    public isInitInface = false;

    protected onLoad(): void {
        // console.error('ListLeaderboardUI onLoad');
        this.InitScrollView(this, false);
        this.InitScrollViewWithAnchor(this);
        this.isInitInface = true;
    }

    public RegisterCb(cbLoadDataDone: CallableFunction) {
        this._cbLoadDataDone = cbLoadDataDone;
    }

    async MCallbackPlayAnimDone(): Promise<void> {
        // logic ở đây là khi load dữ liệu xong <tức là add hết dữ liệu người chơi vào rùi thì ta sẽ gọi cb LoadDataDone để tắt block screen loading đi>
        if (this._cbLoadDataDone != null)
            this._cbLoadDataDone();
    }

    async AddData(out: (data: any[]) => void): Promise<void> {
        this._contextIdLeaderboard = this.GetRightContextIDSuitWithIDLeaderboardCustomInCode(this.idLeaderboard);
        if (this._contextIdLeaderboard == null) {
            this._contextIdLeaderboard = MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD;
        }

        this.indexPlayer = DataLeaderboardSys.Instance.GetIndexPlayerLeaderboard(this._contextIdLeaderboard);
        let listLeaderBoard = Array.from(DataLeaderboardSys.Instance.GetLeaderboard(this._contextIdLeaderboard));

        out(listLeaderBoard);
    }

    async SetDataWhenInitNewItem(item: Node, index: number, data: any): Promise<void> {
        await item.getComponent(ItemPlayerLeaderboard).SetUp(data, this._contextIdLeaderboard);
    }

    SetDataWhenRecycleNewItem(item: Node, index: number, data: any): void {
        item.getComponent(ItemPlayerLeaderboard).SetUp(data, this._contextIdLeaderboard);
    }

    async LogicCanSetDataAnchorView(nAnchor: Node, data: any, out: (hadPlayer: boolean) => void): Promise<void> {
        let hadPlayer = false;

        for (let i = 0; i < data.length; i++) {
            const info: IDataPlayer_LEADERBOARD = data[i];
            if (info.playerId == MConfigFacebook.Instance.playerID) {
                await nAnchor.getComponent(ItemPlayerLeaderboard).SetUp(info, this._contextIdLeaderboard);
                hadPlayer = true;
                break;
            }
        }

        out(hadPlayer);
    }

    LogicShowAnchorView(nAnchor: Node, itemShowing: Map<number, Node>): boolean {
        let result: boolean = false;

        if (nAnchor != null && itemShowing.size >= 0) {
            let indexPlayer = -1;
            itemShowing.forEach((item: Node, key: number) => {
                // MConsolLog.Log(item);
                if (item.getComponent(ItemPlayerLeaderboard).CheckIsPlayer()) {
                    indexPlayer = key;
                }
            });

            // MConsolLog.Log(indexPlayer);

            if (indexPlayer == -1) {
                result = true;
            }
        }
        // MConsolLog.Log(result);

        return result;
    }

    LogicCanAddEmptyFixView(data: any, numberItemShowLastView: number): boolean {
        if (this.indexPlayer > -1 && this.indexPlayer >= data.length - numberItemShowLastView) {
            return false;
        }
        return true;
    }

    //#region SELF FUNC
    private GetRightContextIDSuitWithIDLeaderboardCustomInCode(idLeaderboard: number): string {
        switch (idLeaderboard) {
            case MConst.ID_LEADER_BOARD.FRIEND: return MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND;
            case MConst.ID_LEADER_BOARD.WEEKLY: return DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY;
            case MConst.ID_LEADER_BOARD.WORLD: return MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD;
        }
        return null;
    }
    //#endregion SELF FUNC
}


