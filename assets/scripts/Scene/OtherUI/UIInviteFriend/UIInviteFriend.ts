import { _decorator, Component, Label, Node, ProgressBar, Size, Sprite, Vec3, UITransform, UIOpacity, tween, SpriteFrame, CCBoolean } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { ListPrizeFriendJoined } from './ListPrizeFriendJoined';
import { UIReceivePrizeInviteFriend } from './UIReceivePrizeInviteFriend';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { DataFriendJoinedSys } from '../../../DataBase/DataFriendJoinedSys';
import { instanceOfIOpenUIBaseWithInfo, instanceOfIOpenUIInviteFriend, IPrize, IShareNormalData, TYPE_EVENT_GAME, TYPE_PRIZE, TYPE_RECEIVE, TYPE_RECEIVE_PRIZE_LOBBY, TYPE_UI_SHARE } from '../../../Utils/Types';
import { GameManager } from '../../GameManager';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { ChangeTransformCustom } from '../../../Common/ChangeTransformCustom';
import * as I18n from 'db://i18n/LanguageData';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { ShowPlayerSys } from './ShowPlayerSys';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { CanvasLoadingSys } from '../../../Utils/CanvasLoadingSys';
import { UILobbySys } from '../../LobbyScene/UILobbySys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('UIInviteFriend')
export class UIInviteFriend extends UIBaseSys {
    @property(InfoUIBase) info: InfoUIBase;
    @property(ListPrizeFriendJoined) listPrizeFriendJoined: ListPrizeFriendJoined;
    @property(ShowPlayerSys) showPlayerSys: ShowPlayerSys;
    @property(Node) ui: Node;
    @property(SpriteFrame) sfCoin: SpriteFrame;
    @property(Node) nBtnClose: Node;

    @property({ group: "Header", type: Sprite }) spIcPrize: Sprite;
    @property({ group: "Header", type: Label }) lbPrize: Label;
    @property({ group: "Header", type: Label }) lbProgress: Label;
    @property({ group: "Header", type: ProgressBar }) progress: ProgressBar;

    @property(Sprite) spBg: Sprite;
    @property(SpriteFrame) sfBgNoBtnClose: SpriteFrame;
    @property(SpriteFrame) sfBgHasBtnClose: SpriteFrame;

    @property(CCBoolean) autoChangeInfoToUIOther: boolean = false;

    protected onLoad(): void {
        this.info.registerCallback(this.OnCloseInfoPlayer.bind(this));
        // clientEvent.on(MConst.EVENT_INVITE_FRIEND.RECEIVE, this.UpdateProgress, this);
    }

    protected onDestroy(): void {
        // clientEvent.off(MConst.EVENT_INVITE_FRIEND.RECEIVE, this.UpdateProgress, this);
    }

    public async PrepareDataShow(): Promise<void> {
        // check data custom is true or false to know is click from tutorial 
        if (instanceOfIOpenUIInviteFriend(this._dataCustom)) {
            // show btn close and change bg to bg has close btn
            this.nBtnClose.active = true;
            this.spBg.spriteFrame = this.sfBgHasBtnClose;
            // try show info
            // this._dataCustom.iOpenUIBaseWithInfo.isShowInfo && this.info.Show();
            this.TryReceivePrize();
        } else {
            this.nBtnClose.active = false;
            this.spBg.spriteFrame = this.sfBgNoBtnClose;
        }

        this.listPrizeFriendJoined.Init();

        //NOTE : you can change to set the old previous before receive prize in here then anim then update right UI too
        this.UpdateRightUI();
    }

    public async UICloseDone(): Promise<void> {
        clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
    }

    //#region self func
    private _dataTempToReceive: { listIdPlayerNew: IDataPlayer_LEADERBOARD[], listPrize: IPrize[] } = null;
    private async TryReceivePrize() {
        const data = DataFriendJoinedSys.Instance.GetInfoToReceivePrize();
        this._dataTempToReceive = data;
        if (data != null && data.listPrize != null && data.listPrize.length > 0) {
            this.ui.active = false;
            // save the data prize + data invite friend
            // remember the prize ticket and money will be added in the code anim later
            PrizeSys.Instance.AddPrize(data.listPrize, "UIInviteFriend", true, false);
            DataFriendJoinedSys.Instance.SaveReceivePrizeUntilNow(this._dataTempToReceive.listIdPlayerNew);

            // show anim player
            await this.showPlayerSys.ShowPlayer(data);
            this.showPlayerSys.AutoReUseAllDataHave();

            // show UI prize
            this.nShadowSelf.Hide(false);
            await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.INVITE_FRIEND, data.listPrize, "UIInviteFriend", 0, null, "New Friends Rewards");
            this.nShadowSelf.Show();
            this.UpdateRightUI();
            this.OnDoneReceivePrizeInviteFriend();
            // update notification
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.INVITE_FRIEND, false);
        }
    }

    private UpdateRightUI() {
        this.UpdateProgress();
        this.SetIconPrize(DataFriendJoinedSys.Instance.GetPrizePlayerReceiveNext());

    }
    //#endregion self func

    //#region func listen
    private OnCloseInfoPlayer() {
        // call try receive prize
        // just show info not do more anything
        // this.TryReceivePrize();
    }

    private OnDoneReceivePrizeInviteFriend() {
        const self = this;
        this.ui.getComponent(UIOpacity).opacity = 0;
        this.ui.active = true;
        const timeOpacity: number = 0.5;
        tween(this.ui)
            .to(timeOpacity, {}, {
                onUpdate(target, ratio) {
                    self.ui.getComponent(UIOpacity).opacity = 255 * ratio;
                },
            })
            .start();
    }

    private UpdateProgress() {
        const dataProgress = DataFriendJoinedSys.Instance.GetProgressToShowUI();
        this.progress.progress = dataProgress.progress / dataProgress.maxProgress;
        this.lbProgress.string = `${dataProgress.progress}/${dataProgress.maxProgress}`;
    }
    //#endregion func listen

    //#region FUNC Button
    private async onBtnInvite() {
        LogEventManager.Instance.logButtonClick(`invite`, "UIInviteFriends");

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

    private onBtnShowInfo() {
        LogEventManager.Instance.logButtonClick(`info`, "UIInviteFriends");

        // move node info to UIOther => than show it in there
        // check if it already on UIOther => just show it normal
        if (this.autoChangeInfoToUIOther && this.info.node.parent != UILobbySys.Instance.nOtherUIs) {
            this.info.node.parent = UILobbySys.Instance.nOtherUIs;
        }
        this.info.Show();
    }

    private onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIInviteFriends");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_INVITE_FRIEND, 1);
    }
    //#endregion FUNC Button

    //#region set icon prize
    private SetIconPrize(iPrize: IPrize) {

        // hide the prize if player can reach max
        if (iPrize == null) {
            this.spIcPrize.node.active = false;
            this.lbPrize.node.active = false;
            return;
        }

        //bạn có thể hiệu chỉnh angle hoặc size phù hợp với UI mà bạn muốn trong những trường hợp đặc biệt
        // this.spIcPrize.node.angle = iPrize.typePrize == TYPE_PRIZE.LIGHTNING ? -17 : 0;

        (async () => {
            try {
                switch (iPrize.typePrize) {
                    case TYPE_PRIZE.MONEY:
                        this.spIcPrize.spriteFrame = this.sfCoin;
                        break;
                    default:
                        await MConfigResourceUtils.setImageItem(this.spIcPrize, iPrize.typePrize, iPrize.typeReceivePrize, 0);
                        break;
                }
                this.spIcPrize.node.getComponent(ChangeTransformCustom).UpdateUITransform(this.spIcPrize.spriteFrame);
            } catch (e) {
                // case này chỉ xảy ra khi destroy object trước khi kịp update
            }
        })()

        // check for suit with label
        if (iPrize.typeReceivePrize == TYPE_RECEIVE.NUMBER) {
            if (iPrize.typePrize == TYPE_PRIZE.MONEY) {
                // skip set image
                this.lbPrize.string = `${iPrize.value}`;
            } else {
                this.lbPrize.string = `x${iPrize.value}`;
            }
        } else {
            this.lbPrize.string = `${iPrize.value}${iPrize.typeReceivePrize == TYPE_RECEIVE.TIME_MINUTE ? "m" : "h"}`;
        }
    }
    //#endregion set icon prize
}


