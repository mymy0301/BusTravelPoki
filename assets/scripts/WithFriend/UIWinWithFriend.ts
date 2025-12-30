import { _decorator, Button, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { UIBaseSys } from '../Common/UIBaseSys';
import { WithFriendDataInfo } from './WithFriendDataInfo';
import { LogEventManager } from '../LogEvent/LogEventManager';
import { FBInstantManager } from '../Utils/facebooks/FbInstanceManager';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
import { ChangeSceneSys } from '../Common/ChangeSceneSys';
import { GameSoundEffect, TYPE_SPECIAL_LOBBY, TYPE_UI_SHARE } from '../Utils/Types';
import { GameManager } from '../Scene/GameManager';
import { DataInfoPlayer } from '../Scene/DataInfoPlayer';
import { ResourceUtils } from '../Utils/ResourceUtils';
import { MConfigFacebook } from '../Configs/MConfigFacebook';
import { Utils } from '../Utils/Utils';
import { CanvasLoadingSys } from '../Utils/CanvasLoadingSys';
import { SoundSys } from '../Common/SoundSys';
import { PokiSDKManager } from '../Utils/poki/PokiSDKManager';
const { ccclass, property } = _decorator;

@ccclass('UIWinWithFriend')
export class UIWinWithFriend extends UIBaseSys {

    @property(Sprite)
    playerAvatar: Sprite = null;

    @property(Label)
    playerName: Label = null;

    @property(Label)
    playerScore: Label = null;

    @property(Node)
    nodePlayerWin: Node;

    @property(Sprite)
    friendAvatar: Sprite = null;

    @property(Label)
    friendName: Label = null;

    @property(Label)
    friendScore: Label = null;

    @property(Node)
    nodeFriendWin: Node;

    @property(SpriteFrame)
    sfAvatarDefault: SpriteFrame = null;

    @property(Button)
    btnShare: Button = null;

    @property(Button)
    btnHome: Button = null;

    @property(Button)
    btnReplay: Button = null;

    public async PrepareDataShow(): Promise<void> {
        SoundSys.Instance.pauseMusic();
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CONFETII);
        // console.log("UIWinWithFriend PrepareDataShow", DataInfoPlayer.Instance.currWithFriendDataInfo);
        const self = this;
        this.playerName.string = `${FBInstantManager.Instance.getName()}`;
        ResourceUtils.TryLoadImage(MConfigFacebook.Instance.playerPhotoURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
            if (pathAvatar == MConfigFacebook.Instance.playerPhotoURL && self.playerAvatar != null && self.playerAvatar.isValid) {
                self.playerAvatar.spriteFrame = spriteFrame;
            }
        });

        this.friendAvatar.spriteFrame = this.sfAvatarDefault;
        this.nodePlayerWin.active = false;
        this.nodeFriendWin.active = false;
        if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderID == FBInstantManager.Instance.getID()) {
            //SENDER == PLAYER
            this.playerScore.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore))}`;
            if (DataInfoPlayer.Instance.currWithFriendDataInfo.receiverName.length == 0) {
                this.friendName.string = `Your friend`;
            } else {
                this.friendName.string = `${DataInfoPlayer.Instance.currWithFriendDataInfo.receiverName}`;
            }
            if (DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore >= 9999) {
                this.friendScore.string = `???`;
                this.nodePlayerWin.active = true;
            } else {
                this.friendScore.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore))}`;
                if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore >= DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore) {
                    this.nodePlayerWin.active = true;
                } else {
                    this.nodeFriendWin.active = true;
                }
            }

            if (DataInfoPlayer.Instance.currWithFriendDataInfo.receiverAvatarURL.length == 0) {

            } else {
                ResourceUtils.TryLoadImage(DataInfoPlayer.Instance.currWithFriendDataInfo.receiverAvatarURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                    if (pathAvatar == DataInfoPlayer.Instance.currWithFriendDataInfo.receiverAvatarURL && self.friendAvatar != null && self.friendAvatar.isValid) {
                        self.friendAvatar.spriteFrame = spriteFrame;
                    }
                });
            }
        } else if (DataInfoPlayer.Instance.currWithFriendDataInfo.receiverID == FBInstantManager.Instance.getID()) {
            //RECEIVER == PLAYER
            this.playerScore.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore))}`;
            if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderName.length == 0) {
                this.friendName.string = `Your friend`;
            } else {
                this.friendName.string = `${DataInfoPlayer.Instance.currWithFriendDataInfo.senderName}`;
            }
            if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore >= 9999) {
                this.friendScore.string = `???`;
                this.nodePlayerWin.active = true;
            } else {
                this.friendScore.string = `${Utils.convertTimeToFormat(Math.floor(DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore))}`;
                if (DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore >= DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore) {
                    this.nodePlayerWin.active = true;
                } else {
                    this.nodeFriendWin.active = true;
                }
            }
            if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderAvatarURL.length == 0) {

            } else {
                ResourceUtils.TryLoadImage(DataInfoPlayer.Instance.currWithFriendDataInfo.senderAvatarURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                    if (pathAvatar == DataInfoPlayer.Instance.currWithFriendDataInfo.senderAvatarURL && self.friendAvatar != null && self.friendAvatar.isValid) {
                        self.friendAvatar.spriteFrame = spriteFrame;
                    }
                });
            }
        }
        // FBInstantManager.Instance.Show_InterstitialAdAsync("ui_win_with_friend", (error: Error | null, success: string) => {

        // });

        PokiSDKManager.Instance.Show_InterstitialAdAsync("ui_win_with_friend", (error: Error | null, success: string) => { });
    }

    public async UIShowDone(): Promise<void> {
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
    }

    //#region btn func
    private onBtnClose() {
        LogEventManager.Instance.logButtonClick("close", "UIWinWithFriend");
        LogEventManager.Instance.logPopupClose("close", "UIWinWithFriend");
        FBInstantManager.Instance.resetContextForced((err, success) => { });
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.LOBBY);
    }

    private onBtnTryAgain() {
        LogEventManager.Instance.logButtonClick("try_again", "UIWinWithFriend");
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
        GameManager.Instance.PreparePlayWithFriend();
    }

    private async onBtnShare() {
        LogEventManager.Instance.logButtonClick("share", "UIWinWithFriend");
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        const ins_share = await CanvasLoadingSys.Instance.GetSharePopUp();
        if (ins_share != null) {
            ins_share.showShareMyScorePopup(DataInfoPlayer.Instance.currWithFriendDataInfo, TYPE_UI_SHARE.WITH_FRIEND, (base64Image: string) => {
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
    //#endregion btn func
}


