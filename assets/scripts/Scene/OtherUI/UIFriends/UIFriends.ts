import { _decorator, Button, Component, Label, Node } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { FriendDataInfo, IShareNormalData, TYPE_UI_SHARE } from '../../../Utils/Types';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { FriendLeaderBoardGroupManager } from './FriendLeaderBoardGroupManager';
import { clientEvent } from '../../../framework/clientEvent';
import { GameManager } from '../../GameManager';
import { I18n } from '../../../../../extensions/i18n/@types/editor/i18n';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { WithFriendDataInfo } from '../../../WithFriend/WithFriendDataInfo';
import { lodash } from '../../../framework/lodash';
import { CanvasLoadingSys } from '../../../Utils/CanvasLoadingSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('UIFriends')
export class UIFriends extends UIBaseSys {
    @property(Button)
    btnPlayWithFriend: Button = null;

    @property(FriendLeaderBoardGroupManager)
    friendLeaderBoardGroupManager: FriendLeaderBoardGroupManager = null;

    @property(Node)
    nodeNotFriend: Node;

    @property(Button)
    btnInvite: Button = null;

    @property(Node)
    nodeCompeteWithGroup: Node = null;

    @property(Label)
    txtFriend: Label = null;

    @property(Node)
    nodeFriend: Node = null;

    @property(Button)
    btnClose: Button = null;

    protected onEnable(): void {
        this.btnPlayWithFriend.node.on(MConst.CLICK, this.touchPlayWithFriend, this);
        this.btnInvite.node.on(MConst.CLICK, this.touchInvite, this);
        this.btnClose.node.on(MConst.CLICK, this.touchClose, this);

        clientEvent.on(MConst.EVENT.ITEMFRIEND_TOUCHPLAY, this.setItemFriend_TouchPlay, this);
    }

    protected onDisable(): void {
        this.btnPlayWithFriend.node.off(MConst.CLICK, this.touchPlayWithFriend, this);
        this.btnInvite.node.off(MConst.CLICK, this.touchInvite, this);
        this.btnClose.node.off(MConst.CLICK, this.touchClose, this);

        clientEvent.off(MConst.EVENT.ITEMFRIEND_TOUCHPLAY, this.setItemFriend_TouchPlay, this);
    }

    public async PrepareDataShow(): Promise<void> {
        this.nodeCompeteWithGroup.active = false;
        this.friendLeaderBoardGroupManager.resetRankGroup();
        let arrFriends: IDataPlayer_LEADERBOARD[] = DataLeaderboardSys.Instance.GetLeaderboard(MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND);
        this.nodeNotFriend.active = false;
        this.friendLeaderBoardGroupManager.node.active = true;
        // if (arrFriends.length > 1) {
        //     this.nodeNotFriend.active = false;
        //     this.friendLeaderBoardGroupManager.node.active = true;
        // } else {
        //     this.nodeNotFriend.active = true;
        //     this.friendLeaderBoardGroupManager.node.active = false;
        // }
    }

    public async UIShowDone(): Promise<void> {
        this.friendLeaderBoardGroupManager.initRankGroup();
    }

    setItemFriend_TouchPlay(_dataItem: IDataPlayer_LEADERBOARD) {
        this.nodeCompeteWithGroup.active = true;
        this.nodeFriend.active = true;
        this.txtFriend.string = `${_dataItem.name}!`;
        FBInstantManager.Instance.PlayWithFriend_ID(_dataItem.playerId, (err, success) => {
            if (err) {
                this.nodeCompeteWithGroup.active = false;
            } else {
                DataInfoPlayer.Instance.currWithFriendDataInfo = new WithFriendDataInfo();
                DataInfoPlayer.Instance.currWithFriendDataInfo.senderAvatarURL = FBInstantManager.Instance.getPhotoUrl();
                DataInfoPlayer.Instance.currWithFriendDataInfo.senderName = FBInstantManager.Instance.getName();
                DataInfoPlayer.Instance.currWithFriendDataInfo.senderID = FBInstantManager.Instance.getID();
                DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore = 9999;
                DataInfoPlayer.Instance.currWithFriendDataInfo.level = lodash.random(5, 10);
                DataInfoPlayer.Instance.currWithFriendDataInfo.receiverAvatarURL = _dataItem.avatar;
                DataInfoPlayer.Instance.currWithFriendDataInfo.receiverName = _dataItem.name;
                DataInfoPlayer.Instance.currWithFriendDataInfo.receiverID = _dataItem.playerId;
                DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore = 9999;
                GameManager.Instance.PreparePlayWithFriend();

                this.updateContextWithFriend();
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_FRIENDS, 1);
            }
        });
    }


    touchPlayWithFriend() {
        LogEventManager.Instance.logButtonClick(`play`, "UIFriends");

        this.nodeCompeteWithGroup.active = true;
        this.nodeFriend.active = false;
        FBInstantManager.Instance.PlayWithFriend_ChooseAsync((err, success) => {
            if (err) {
                this.nodeCompeteWithGroup.active = false;
            } else {
                DataInfoPlayer.Instance.currWithFriendDataInfo = new WithFriendDataInfo();
                DataInfoPlayer.Instance.currWithFriendDataInfo.senderAvatarURL = FBInstantManager.Instance.getPhotoUrl();
                DataInfoPlayer.Instance.currWithFriendDataInfo.senderName = FBInstantManager.Instance.getName();
                DataInfoPlayer.Instance.currWithFriendDataInfo.senderID = FBInstantManager.Instance.getID();
                DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore = 9999;
                DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore = 9999;
                DataInfoPlayer.Instance.currWithFriendDataInfo.level = lodash.random(5, 10);
                GameManager.Instance.PreparePlayWithFriend();
                this.updateContextWithFriend();
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_FRIENDS, 1);
            }
        });
    }

    async touchInvite() {
        LogEventManager.Instance.logButtonClick(`invite`, "UIFriends");

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
                        //     clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, "Friend invitation failed");
                        // } else if (success == MConst.FB_CALLBACK_SUCCESS) {
                        //     clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, "Friend invitation succeeded");
                        // }
                    })
                } else {
                    // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, "Friend invitation failed");
                }
            });
        } else {
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
        }
    }

    async updateContextWithFriend() {
        const ins_share = await CanvasLoadingSys.Instance.GetSharePopUp();
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        if (ins_share != null) {
            ins_share.showShareMyScorePopup(DataInfoPlayer.Instance.currWithFriendDataInfo, TYPE_UI_SHARE.WITH_FRIEND, (base64Image: string) => {
                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                if (base64Image.length > 0) {
                    // console.log(base64Image);
                    FBInstantManager.Instance.UpdateContext_WithFriend(base64Image, DataInfoPlayer.Instance.currWithFriendDataInfo, (err, succ) => { });
                }
            });
        } else {
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
        }
    }

    touchClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIFriends");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_FRIENDS, 1);
    }
}


