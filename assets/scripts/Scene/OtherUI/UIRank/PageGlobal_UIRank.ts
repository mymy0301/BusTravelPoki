import { _decorator, Component, macro, Node } from 'cc';
import { Utils } from '../../../Utils/Utils';
import { ListLeaderboardUI_2 } from './ListLeaderboardUI_2';
import { UILoadingSys_2 } from '../UILoadingSys_2';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('PageGlobal_UIRank')
export class PageGlobal_UIRank extends Component {
    @property(UILoadingSys_2) nLoading: UILoadingSys_2;
    @property(ListLeaderboardUI_2) listLeaderboardUI: ListLeaderboardUI_2;
    private isLoadData: boolean = false;

    private async LoadSv() {
        //update lại dữ liệu mới
        if (this.isLoadData) { 
            this.nLoading.Close();
            return;
         }

        this.isLoadData = true;
        this.listLeaderboardUI.RegisterCb(
            () => {
                this.nLoading.Close();
            }
        );

        await Utils.WaitReceivingDone(() => { return this.listLeaderboardUI._isInitInface });
        this.listLeaderboardUI.SetData();
        this.nLoading.Close();
    }

    protected onDestroy(): void {
        if (this._idInterval != -1) {
            clearInterval(this._idInterval);
        }
    }

    private _hasData: boolean = false;
    private _dataLeaderboardFirstCall: IDataPlayer_LEADERBOARD[] = [];
    private _idInterval: number = -1;
    private _timeCheckInterval: number = 0;
    private readonly MAX_TIME_CHECK_INTERVAL = 5; // 1'
    public TryCallDataUntilHaveData(forceUpdate: boolean = false) {
        if (this._hasData && !forceUpdate) { return; }

        this.nLoading.Show();
        this._idInterval = setInterval(() => {
            if (this._dataLeaderboardFirstCall.length > 0) {
                // console.warn("has dataLeaderboardFirstCall SOCIAL", Array.from(this._dataLeaderboardFirstCall));
                this._hasData = true;
            } else {
                this.CheckDataAgain();
            }

            // add time
            this._timeCheckInterval += 1;

            if (this._hasData || this._timeCheckInterval == this.MAX_TIME_CHECK_INTERVAL) {
                // console.warn("clear Interval SOCIAL because", this._hasData, this._timeCheckInterval);
                clearInterval(this._idInterval);
               

                this.LoadSv();
            }
        }, 1000, macro.REPEAT_FOREVER, 0)
    }

    private CheckDataAgain() {
        if (this._dataLeaderboardFirstCall.length == 0) {
            // check if the data leaderboard was change => reload data
            let listFriendPlayerNow: IDataPlayer_LEADERBOARD[] = Array.from(DataLeaderboardSys.Instance.GetLeaderboard(MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD));

            if (listFriendPlayerNow.length > 0) {
                this._dataLeaderboardFirstCall = Array.from(listFriendPlayerNow);
            }
        }
    }
}


