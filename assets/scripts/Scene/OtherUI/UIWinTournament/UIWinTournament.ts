import { _decorator, Button, Component, Label, Node, ParticleSystem, Sprite, SpriteFrame } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { ShowNodeWithOpacity } from '../../../Common/ShowNodeWithOpacity';
import { ItemPlayerLeaderboard } from '../Item/ItemPlayerLeaderboard';
import { AutoGenIncreaseRank } from '../../GameScene/OtherUI/AutoGenIncreaseRank';
import { ItemRankTournament } from '../UITournament/ItemRankTournament';
import { LightWinTween } from '../../../Utils/Effects/LightWinTween';
import { GameManager } from '../../GameManager';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { Utils } from '../../../Utils/Utils';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { MConst } from '../../../Const/MConst';
import { MConsolLog } from '../../../Common/MConsolLog';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { clientEvent } from '../../../framework/clientEvent';
import { ChangeSceneSys } from '../../../Common/ChangeSceneSys';
import { GameSoundEffect, IShareTournamentData, TYPE_SPECIAL_LOBBY, TYPE_UI_SHARE } from '../../../Utils/Types';
import { CanvasLoadingSys } from '../../../Utils/CanvasLoadingSys';
import { SoundSys } from '../../../Common/SoundSys';
import { PokiSDKManager } from '../../../Utils/poki/PokiSDKManager';
const { ccclass, property } = _decorator;

@ccclass('UIWinTournament')
export class UIWinTournament extends UIBaseSys {
    @property(Sprite) spAvatar: Sprite;
    @property(Sprite) spAvatarPlayerTour: Sprite;
    @property(ShowNodeWithOpacity) listShowNodeWithOpacity: ShowNodeWithOpacity[] = [];
    @property(ItemRankTournament) myItemRankTournament: ItemRankTournament;
    @property(Node) nodeBtnTryAgain: Node;
    @property(Node) nodeBtnClose: Node;
    @property(Button) btnShare: Button;
    @property(Label) nLabelNameTournament: Label;
    @property(LightWinTween) lightWinTween: LightWinTween;
    @property(AutoGenIncreaseRank) autoGenIncreaseRank: AutoGenIncreaseRank;
    @property(Label) lbScoreTournament: Label;
    @property([ParticleSystem]) listSpark: ParticleSystem[] = [];

    newScore: number = -10000;
    public async PrepareDataShow(): Promise<void> {
        this.LoadImagePlayer();
        this.nodeBtnClose.active = false;
        this.nodeBtnTryAgain.active = false;
        this.lightWinTween.TransParent();
        this.nLabelNameTournament.getComponent(Label).string = GameManager.Instance.ModeGame.TOURNAMENT.name_leaderboard;
        const contentIdTournament: string = GameManager.Instance.ModeGame.TOURNAMENT.context_tournament;
        let newDataPlayer = DataLeaderboardSys.Instance.GetDataPlayerOfLeaderboard(contentIdTournament);
        console.log(this._dataCustom);
        if (this._dataCustom != null && this._dataCustom.score) {
            this.newScore = -this._dataCustom.score
            this.lbScoreTournament.string = this.newScore <= -10000 ? `???` : Utils.convertTimeToFormat(-this.newScore);
        }
        SoundSys.Instance.pauseMusic();
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CONFETII);
        // prepare spark
        this.listSpark.forEach(item => {
            item.node.active = false;
            item.stop();
        });

        // check data
        if (newDataPlayer != null) {
            this.myItemRankTournament.SetUp(newDataPlayer, null, false);

            // this.newScore = newDataPlayer.score;
        } else {
            let myPlayer: IDataPlayer_LEADERBOARD = {
                rank: 1,
                score: this.newScore,
                playerId: "" + MConfigFacebook.Instance.playerID,
                name: MConfigFacebook.Instance.playerName,
                avatar: MConfigFacebook.Instance.playerPhotoURL
            }
            this.myItemRankTournament.SetUp(myPlayer, null, false);
        }

        // noti to facebook
        // FBInstantManager.Instance.Show_InterstitialAdAsync("ui_win_tournament", (error: Error | null, success: string) => {
        //     const scroreShareTour = this.newScore < 0 ? -this.newScore : this.newScore;
        //     // push score to the tournament
        //     // remmember convert to miliseconds
        //     FBInstantManager.Instance.ShareTournamentScore(scroreShareTour * 1000, (err, succ) => {
        //         if (succ == MConst.FB_CALLBACK_FAIL) {
        //             MConsolLog.Error(err);
        //         }
        //     });
        // });

        PokiSDKManager.Instance.Show_InterstitialAdAsync("ui_win_tournament", (error: Error | null, success: string) => {
            const scroreShareTour = this.newScore < 0 ? -this.newScore : this.newScore;
            // push score to the tournament
            // remmember convert to miliseconds
            // PokiSDKManager.Instance.ShareTournamentScore(scroreShareTour * 1000, (err, succ) => {
            //     if (succ == MConst.FB_CALLBACK_FAIL) {
            //         MConsolLog.Error(err);
            //     }
            // });
        });
    }

    public async UIShowDone(): Promise<void> {
        this.nodeBtnClose.active = true;
        this.nodeBtnTryAgain.active = true;
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);

        // play anim
        this.PlayAnim();
    }

    //#region self func
    private LoadImagePlayer() {
        const self = this;
        ResourceUtils.TryLoadImage(MConfigFacebook.Instance.playerPhotoURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
            if (pathAvatar == MConfigFacebook.Instance.playerPhotoURL && self.node != null && self.node.isValid) {
                self.spAvatar.spriteFrame = spriteFrame;
                self.spAvatarPlayerTour.spriteFrame = spriteFrame;
            }
        });
    }

    private async PlayAnim() {
        //play spark
        this.listSpark.forEach(item => {
            item.node.active = true;
            item.play();
        })
    }
    //#endregion

    //#region btn func
    private onBtnClose() {
        LogEventManager.Instance.logButtonClick("close", "UIWinTournament");
        LogEventManager.Instance.logPopupClose("close", "UIWinTournament");
        FBInstantManager.Instance.resetContextForced((err, success) => { });
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.LOBBY, TYPE_SPECIAL_LOBBY.SHOW_TOURNAMENT);
    }

    private onBtnTryAgain() {
        LogEventManager.Instance.logButtonClick("try_again", "UIWinTournament");
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
        GameManager.Instance.PreparePlayTournament(GameManager.Instance.ModeGame.TOURNAMENT);
    }

    private async onBtnShareTournament() {
        LogEventManager.Instance.logButtonClick("share", "UIWinTournament");
        let dataPlayerLeaderboard: IDataPlayer_LEADERBOARD[] = DataLeaderboardSys.Instance.GetLeaderboard(GameManager.Instance.ModeGame.TOURNAMENT.context_tournament)
        dataPlayerLeaderboard = Array.from(dataPlayerLeaderboard).splice(0, 3).filter(item => item != null);
        let listSfAvatar: SpriteFrame[] = [];
        for (let i = 0; i < dataPlayerLeaderboard.length; i++) {
            const pathAva = dataPlayerLeaderboard[i].avatar;
            await ResourceUtils.TryLoadImage(pathAva, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                spriteFrame.name = pathAvatar;
                listSfAvatar.push(spriteFrame);
            });
        }

        // remember add 1 because the json we save is index
        let jsonShare: IShareTournamentData = {
            nameTournament: GameManager.Instance.ModeGame.TOURNAMENT.name_leaderboard,
            score: this.newScore,
            dataTop3: dataPlayerLeaderboard,
            sfAvatarTop: listSfAvatar
        }
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        const ins_share = await CanvasLoadingSys.Instance.GetSharePopUp();
        if (ins_share != null) {
            ins_share.showShareMyScorePopup(jsonShare, TYPE_UI_SHARE.TOURNAMENT, (base64Image: string) => {
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


