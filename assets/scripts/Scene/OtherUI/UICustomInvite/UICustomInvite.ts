import { _decorator, Button, Component, EventTouch, Node, NodeEventType } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { UIInviteFriend } from '../UIInviteFriend/UIInviteFriend';
import { MConst } from '../../../Const/MConst';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { IShareNormalData, TYPE_UI_SHARE } from '../../../Utils/Types';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { PlayerData } from '../../../Utils/PlayerData';
import { clientEvent } from '../../../framework/clientEvent';
import { CanvasLoadingSys } from '../../../Utils/CanvasLoadingSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('UICustomInvite')
export class UICustomInvite extends UIBaseSys {
    @property(UIInviteFriend) uiInvite: UIInviteFriend = null;

    @property(Button)
    btnLike: Button;

    @property(Button)
    btnJoinGroup: Button;

    @property(Button)
    btnCreatShortcut: Button;

    @property(Button)
    btnShare: Button;

    protected start(): void {
        this.uiInvite.PrepareDataShow();
    }

    protected onEnable(): void {
        this.btnJoinGroup.node.on(MConst.CLICK, this.touchJoinGroup, this);
        this.btnCreatShortcut.node.on(MConst.CLICK, this.touchCreatShortcut, this);
        this.btnLike.node.on(MConst.CLICK, this.touchLike, this);
        this.btnShare.node.on(MConst.CLICK, this.touchShare, this);

        // this.showInfo();
    }

    protected onDisable(): void {
        this.btnJoinGroup.node.off(MConst.CLICK, this.touchJoinGroup, this);
        this.btnCreatShortcut.node.off(MConst.CLICK, this.touchCreatShortcut, this);
        this.btnLike.node.off(MConst.CLICK, this.touchLike, this);
        this.btnShare.node.off(MConst.CLICK, this.touchShare, this);
    }

    showInfo() {
        if (FBInstantManager.Instance.isCreateShortcutAvailable) {
            this.btnCreatShortcut.node.active = true;
        } else {
            this.btnCreatShortcut.node.active = false;
        }
    }

    touchLike() {
        LogEventManager.Instance.logButtonClick("Like", "UICustomInvite");
        FBInstantManager.Instance.followOfficialPage();
    }

    touchJoinGroup() {
        LogEventManager.Instance.logButtonClick("JoinGroup", "UICustomInvite");
        FBInstantManager.Instance.joinOfficialGroup();
    }

    touchCreatShortcut() {
        LogEventManager.Instance.logButtonClick("CreateShortcut", "UICustomInvite");
        FBInstantManager.Instance.CreateShortcut2((err, success) => {
            if (err) {

            } else {
                FBInstantManager.Instance.isCreateShortcutAvailable = false;
                this.btnCreatShortcut.node.active = false;
            }
        });
    }

    async touchShare() {
        LogEventManager.Instance.logButtonClick("Share", "UICustomInvite");

        let jsonShare: IShareNormalData = {
            level: PlayerData.Instance._levelPlayer
        }
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        const ins_share = await CanvasLoadingSys.Instance.GetSharePopUp();
        if (ins_share != null) {
            ins_share.showShareMyScorePopup(jsonShare, TYPE_UI_SHARE.NORMAL, (base64Image: string) => {
                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                if (base64Image.length > 0) {
                    // console.log(base64Image);
                    FBInstantManager.Instance.ShareBestScore(base64Image, (error, success) => { });
                }
            });
        } else {
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
        }
    }
}


