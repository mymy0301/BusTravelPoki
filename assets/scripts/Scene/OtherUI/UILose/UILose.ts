import { _decorator, AnimationComponent, Button, Component, Node, UIOpacity, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { GameManager } from '../../GameManager';
import { GameSoundEffect, TYPE_EVENT_GAME, TYPE_QUEST_DAILY } from '../../../Utils/Types';
import { ChangeSceneSys } from '../../../Common/ChangeSceneSys';
import { MConfigs, TYPE_GAME } from '../../../Configs/MConfigs';
import { GameInfoSys } from '../../GameScene/GameInfoSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { LE_ID_MODE, LE_RESULT_END_LEVEL } from '../../../LogEvent/TypeLogEvent';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { SoundSys } from '../../../Common/SoundSys';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { SaveStepGameSys } from '../../GameScene/Logic/SaveStepGameSys';
import { UILose_anim_2 } from './UILose_anim_2';
import { OtherUILose } from './OtherUILose';
import { CONFIG_LR_CHRIST } from '../UIChristmasEvent/LightRoad/TypeLightRoad';
import { DataHatRace_christ } from '../../../DataBase/DataHatRace_christ';
import { UISupHatRace } from '../SupHatRace/UISupHatRace';
const { ccclass, property } = _decorator;

@ccclass('UILose')
export class UILose extends UIBaseSys {

    @property(UILose_anim_2) uiLoseAnim2: UILose_anim_2;
    @property(Node) nBtnHome: Node;
    @property(Node) nBtnReplay: Node;
    @property(Node) nBodyLose: Node;
    @property(OtherUILose) otherUILose: OtherUILose;


    private readonly POS_BODY_LOSE_WHEN_HAVE_SUB: Vec3 = new Vec3(0, 130, 0);
    private readonly POS_BODY_LOSE_WHEN_HAVE_NO_SUB: Vec3 = Vec3.ZERO.clone().add3f(0, 30, 0);

    //#region func base UI
    public async PrepareDataShow(): Promise<void> {
        const typeGamePlaying = GameManager.Instance.TypeGamePlay

        const valid2 = (!MConfigs.isMobile && GameManager.Instance.levelPlayerNow > MConfigs.LEVEL_CAN_SHOW_INTER_PC) || (MConfigs.isMobile);

        if (valid2) {
            switch (typeGamePlaying) {
                case TYPE_GAME.TUTORIAL: break;
                case TYPE_GAME.NORMAL:
                    if (GameManager.Instance.levelPlayerNow >= MConfigs.LEVEL_CAN_SHOW_INTER) { FBInstantManager.Instance.Show_InterstitialAdAsync("uilose", (error: Error | null, success: string) => { }); }
                    break;
                case TYPE_GAME.TOURNAMENT:
                    FBInstantManager.Instance.Show_InterstitialAdAsync("uilose", (error: Error | null, success: string) => { });
                    break;
                case TYPE_GAME.CHRISTMAS:
                    FBInstantManager.Instance.Show_InterstitialAdAsync("uilose", (error: Error | null, success: string) => { });
                    break;

            }
        }

        // log event
        switch (typeGamePlaying) {
            case TYPE_GAME.NORMAL || TYPE_GAME.TUTORIAL:
                const levelPlayerNow = GameManager.Instance.GetLevelPlayerNow();
                const numRetry = DataInfoPlayer.Instance.GetStreakLose();
                const timePlayerPlay: number = GameInfoSys.Instance._autoTimeInGameSys.GetTime();
                LogEventManager.Instance.logLevelEnd(levelPlayerNow, LE_ID_MODE.NORMAL, numRetry, LE_RESULT_END_LEVEL.LOSE, timePlayerPlay);
                LogEventManager.Instance.logLevelLose(levelPlayerNow, LE_ID_MODE.NORMAL, numRetry);
                LogEventManager.Instance.logStepGame(levelPlayerNow, "L", SaveStepGameSys.Instance.GetListStepToLog());
                break;
            case TYPE_GAME.CHRISTMAS:
                LogEventManager.Instance.logLevelLose(GameManager.Instance.JsonPlayChristmas.LEVEL, LE_ID_MODE.CHRIST, 0);
                break;
        }

        //================== check is pass level tutorial ============
        if (typeGamePlaying == TYPE_GAME.WITH_FRIEND || typeGamePlaying == TYPE_GAME.TOURNAMENT || typeGamePlaying == TYPE_GAME.CHRISTMAS) {
            this.nBtnHome.active = true;
            this.nBtnReplay.active = true;
            this.nBtnHome.position = new Vec3(-145, 0);
            this.nBtnReplay.position = new Vec3(145, 0);
        } else {
            if (GameManager.Instance.levelPlayerNow <= MConfigs.LEVEL_CAN_CHANGE_SCENE_TO_LOBBY) {
                this.nBtnHome.active = false;
                const basePos = this.nBtnReplay.position.clone();
                this.nBtnReplay.position = new Vec3(0, basePos.y);
            } else {
                this.nBtnHome.active = true;
                this.nBtnReplay.active = true;
                this.nBtnHome.position = new Vec3(-145, 0);
                this.nBtnReplay.position = new Vec3(145, 0);
            }
        }

        // =============== Data ====================
        this.HideShadow(false, 0);
        this.uiLoseAnim2.PrepareAnim(this._dataCustom);
        this.node.position = Vec3.ZERO;


        //================= other ui ================
        this.otherUILose.TryHideUIShowing();
        // check can show sub to decide pos body lose
        const canShowOtherUI = this.otherUILose.TryInitUIShowing();
        this.nBodyLose.position = canShowOtherUI ? this.POS_BODY_LOSE_WHEN_HAVE_SUB : this.POS_BODY_LOSE_WHEN_HAVE_NO_SUB;
    }

    public async UICustomShow(): Promise<void> {
        this.nVisual.active = true;
        // stop sound bg
        SoundSys.Instance.pauseMusic();
        // play sound
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_LOSE);

        this.ShowShadow(true, 0.2);
        this.nVisual.active = true;
        this.nVisual.getComponent(UIOpacity).opacity = 255;
        this.nVisual.position = Vec3.ZERO;
        await this.uiLoseAnim2.PlayAnim(() => {
            try {
                this.otherUILose.TryShowUIShowing();
            } catch (e) {

            }
        });
    }

    public async UIShowDone(): Promise<void> { }

    public async PrepareDataClose(): Promise<void> {
        this.otherUILose.TryHideUIShowing();
    }

    //#endregion func base UI

    private BtnTryAgain() {
        LogEventManager.Instance.logButtonClick(`try_again`, "UILose");
        const typeGamePlaying = GameManager.Instance.TypeGamePlay

        switch (true) {
            case typeGamePlaying == TYPE_GAME.TUTORIAL:
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_LOSE, 1);
                clientEvent.dispatchEvent(MConst.EVENT.RESET_GAME);
                break;
            case typeGamePlaying == TYPE_GAME.NORMAL:
                if (GameManager.Instance.levelPlayerNow >= MConfigs.LEVEL_CAN_SHOW_INTER) {
                    FBInstantManager.Instance.Show_InterstitialAdAsync("reset game from lose", (error: Error | null, success: string) => {
                        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_LOSE, 1);
                        clientEvent.dispatchEvent(MConst.EVENT.RESET_GAME);
                    });
                } else {
                    clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_LOSE, 1);
                    clientEvent.dispatchEvent(MConst.EVENT.RESET_GAME);
                }

                break;
            case typeGamePlaying == TYPE_GAME.WITH_FRIEND || GameManager.Instance.TypeGamePlay == TYPE_GAME.TOURNAMENT:
                FBInstantManager.Instance.Show_InterstitialAdAsync("reset game from lose", (error: Error | null, success: string) => {
                    clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_LOSE, 1);
                    clientEvent.dispatchEvent(MConst.EVENT.RESET_GAME);
                });
                break;
            case typeGamePlaying == TYPE_GAME.CHRISTMAS:
                FBInstantManager.Instance.Show_InterstitialAdAsync("reset game from lose", (error: Error | null, success: string) => {
                    clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_LOSE, 1);
                    clientEvent.dispatchEvent(MConst.EVENT.RESET_GAME);
                });
                break;
        }
    }

    private BtnComeBackHome() {
        LogEventManager.Instance.logButtonClick(`home`, "UILose");

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.CHRISTMAS:
                CONFIG_LR_CHRIST.AUTO_SHOW_AT_HOME = true;
                break;
        }
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.LOBBY);
    }
}