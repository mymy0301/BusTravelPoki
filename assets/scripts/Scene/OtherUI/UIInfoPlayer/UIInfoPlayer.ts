import { _decorator, Component, EditBox, Label, Node, Sprite, SpriteFrame } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { GameManager } from '../../GameManager';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { UIInfo_UIEditName } from './UIInfo_UIEditName';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import * as I18n from 'db://i18n/LanguageData';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('UIInfoPlayer')
export class UIInfoPlayer extends UIBaseSys {
    @property({ group: "Header", type: Sprite }) avatarPlayer: Sprite;
    @property({ group: "Header", type: Label }) lbNamePlayer: Label;
    @property({ group: "Header", type: Label }) lbLevelPlayer: Label;

    @property({ group: "Body", type: Label }) lbBestWinStreak: Label;
    @property({ group: "Body", type: Label }) lbWinRate: Label;
    @property({ group: "Body", type: Label }) lbRaceWon: Label;
    @property({ group: "Body", type: Label }) lbCityCompleted: Label;
    @property({ group: "Body", type: Label }) lbLeaguesWon: Label;
    @property({ group: "Body", type: Label }) lbNewSkin: Label;


    @property(UIInfo_UIEditName) nUIEditName: UIInfo_UIEditName;

    public async PrepareDataShow(): Promise<void> {
        this.LoadImagePlayer();
        this.UpdateUIHeader();
        this.UpdateUIBody();

        // UI edit name
        this.nUIEditName.Hide();
        this.nUIEditName.RegistenCb(this.UpdateUIHeader.bind(this));
    }

    private UpdateUIHeader() {
        this.lbNamePlayer.string = MConfigFacebook.Instance.playerName;
        this.lbLevelPlayer.string = `${GameManager.Instance.levelPlayerNow}`;
    }

    private UpdateUIBody() {
        this.lbBestWinStreak.string = DataInfoPlayer.Instance.GetStreakWin().toString();
        this.lbWinRate.string = `${DataInfoPlayer.Instance.GetWinRate()}%`;

        // update lb lobby
        this.lbRaceWon.string = DataInfoPlayer.Instance.GetRaceWon().toString();
        this.lbCityCompleted.string = DataInfoPlayer.Instance.GetCityCompleted().toString();
        this.lbLeaguesWon.string = DataInfoPlayer.Instance.GetLeaguesWon().toString();
        this.lbNewSkin.string = DataInfoPlayer.Instance.GetNewSkin().toString();
    }

    private LoadImagePlayer() {
        const self = this;
        ResourceUtils.TryLoadImage(MConfigFacebook.Instance.playerPhotoURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
            if (pathAvatar == MConfigFacebook.Instance.playerPhotoURL && self.node != null && self.node.isValid) {
                self.avatarPlayer.spriteFrame = spriteFrame;
            }
        });
    }

    //#region FUNC BTN
    public onBtnShare() {
        // clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        // let jsonShare: IShareNormalData = {
        //     level: GameManager.Instance.levelPlayerNow + 1
        // }
        // ShareMyScorePopup.Instance.showShareMyScorePopup(jsonShare, TYPE_UI_SHARE.NORMAL, (base64Image: string) => {
        //     clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
        //     if (base64Image.length > 0) {
        //         FBInstantManager.Instance.ShareBestScore(base64Image);
        //     }
        // });
    }

    public onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIInfoPlayers");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_INFO_PLAYER, 1);
    }

    public onBtnShowEditName() {
        // popup UI edit name
        this.nUIEditName.Show();
    }
    //#endregion FUNC BTN
}


