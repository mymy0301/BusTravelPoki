import { _decorator, Component, macro, Node } from 'cc';
import { ListLeaderboardUI_2 } from './ListLeaderboardUI_2';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { UILoadingSys_2 } from '../UILoadingSys_2';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { MConst } from '../../../Const/MConst';
import { clientEvent } from '../../../framework/clientEvent';
import { IShareNormalData, TYPE_UI_SHARE } from '../../../Utils/Types';
import { GameManager } from '../../GameManager';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import * as I18n from 'db://i18n/LanguageData';
import { CanvasLoadingSys } from '../../../Utils/CanvasLoadingSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('PageFriend_UIRank')
export class PageFriend_UIRank extends Component {
    @property(UILoadingSys_2) nLoading: UILoadingSys_2;
    @property(ListLeaderboardUI_2) listLeaderboardUI: ListLeaderboardUI_2;
    @property(Node) nUINoFriend: Node;
    @property(Node) nBlockUI: Node;
    private isLoadData: boolean = false;

    private LoadSv() {
        if (this.isLoadData) {
            this.nLoading.Close();
            return;
        }
        this.isLoadData = true;
        this.listLeaderboardUI.RegisterCb(() => { this.nLoading.Close(); });
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
    public TryCallDataUntilHaveData() {
        if (MConfigFacebook.Instance.arrConnectedPlayerInfos == null || MConfigFacebook.Instance.arrConnectedPlayerInfos.length == 0) {
            this.nUINoFriend.active = true;
            this.listLeaderboardUI.node.active = false;
            this.nBlockUI.active = false;
            this.nLoading.Close();
            return;
        }

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


                // check to show UINoFriend
                this.nUINoFriend.active = this._dataLeaderboardFirstCall.length == 0;
                this.listLeaderboardUI.node.active = !this.nUINoFriend.active;

                this.LoadSv();
            }
        }, 1000, macro.REPEAT_FOREVER, 0)
    }

    private CheckDataAgain() {
        if (this._dataLeaderboardFirstCall.length == 0) {
            // check if the data leaderboard was change => reload data
            let listFriendPlayerNow: IDataPlayer_LEADERBOARD[] = Array.from(DataLeaderboardSys.Instance.GetLeaderboard(MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND));
            // remove the player of the list
            listFriendPlayerNow = listFriendPlayerNow.filter(item => item.playerId != MConfigFacebook.Instance.playerID && item.playerId != null);

            if (listFriendPlayerNow.length > 0) {
                this.nUINoFriend.active = false;
                this.listLeaderboardUI.node.active = true;
                this._dataLeaderboardFirstCall = Array.from(listFriendPlayerNow);
            } else {
                this.nUINoFriend.active = true;
                this.listLeaderboardUI.node.active = false;
                // because in sv you turn on the UIBlock when load data => turn off it
                this.nBlockUI.active = false;
            }
        }
    }

    private async onBtnInvite() {
        LogEventManager.Instance.logButtonClick("Invite", "PageRank_Friend");

        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        let jsonShare: IShareNormalData = {
            level: GameManager.Instance.levelPlayerNow
        }
        const ins_share = await CanvasLoadingSys.Instance.GetSharePopUp();
        if (ins_share != null) {
            ins_share.showShareMyScorePopup(jsonShare, TYPE_UI_SHARE.INVITE, (base64Image: string) => {
                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                if (base64Image.length > 0) {
                    FBInstantManager.Instance.inviteFriend_222(base64Image, (err, success) => {
                        clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                        // if (success == MConst.FB_CALLBACK_FAIL) {
                        //     clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Friend invitation failed"));
                        // } else if (success == MConst.FB_CALLBACK_SUCCESS) {
                        //     clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Friend invitation succeeded"));
                        // }
                    })
                } else {
                    // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Friend invitation failed"));
                }
            });
        } else {
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
        }
    }
}


