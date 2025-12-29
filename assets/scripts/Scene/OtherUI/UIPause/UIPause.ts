import { _decorator, Button, director, Label, Node, PhysicsSystem2D, Size, Tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { SoundSys } from '../../../Common/SoundSys';
import { GameMusicDisplay, GameSoundEffect } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { VisualBtnPause } from './VisualBtnPause';
import { PlayerData } from '../../../Utils/PlayerData';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../../../Common/ChangeSceneSys';
import { Utils } from '../../../Utils/Utils';
import { GameManager } from '../../GameManager';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { LE_ID_MODE, LE_RESULT_END_LEVEL } from '../../../LogEvent/TypeLogEvent';
import { MConfigs, TYPE_GAME } from '../../../Configs/MConfigs';
import { GameInfoSys } from '../../GameScene/GameInfoSys';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { UISetting_CustomToggle } from '../UISetting/UISetting_CustomToggle';
import { DataTreasureTrailSys } from '../../../DataBase/DataTreasureTrailSys';
import { STATE_TT } from '../UITreasureTrail/TypeTreasureTrail';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { STATE_SL } from '../UISkyLift/TypeSkyLift';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
import { STATE_SPEED_RACE } from '../UISpeedRace/TypeEventSpeedRace';
import { DataHatRace_christ } from '../../../DataBase/DataHatRace_christ';
import { CONFIG_LR_CHRIST } from '../UIChristmasEvent/LightRoad/TypeLightRoad';
const { ccclass, property } = _decorator;

@ccclass('UIPause')
export class UIPause extends UIBaseSys {
    @property(UISetting_CustomToggle) toggleMusic: UISetting_CustomToggle;
    @property(UISetting_CustomToggle) toggleEffect: UISetting_CustomToggle;
    @property(Label) lbVer: Label;
    @property(Button) btnHome: Button;
    @property(Node) nBg: Node;
    @property(Vec3) pos_WhenHasNoBtnHome: Vec3 = new Vec3(0, 80, 0);
    @property(Size) size_WhenHasNoBtnHome: Size = new Size(632, 695);
    @property(Node) nDash: Node;
    @property([Node]) listNChangeWhenNoBtnHome: Node[] = [];

    protected onLoad(): void {
        const stateEffect = SoundSys.Instance.getSoundEffStatus;
        const stateMusic = SoundSys.Instance.getMusicStatus;
        const stateVibration = PlayerData.Instance._vibrationStatus;

        this.toggleMusic.SetUp(stateMusic);
        this.toggleEffect.SetUp(stateEffect);

        this.lbVer.string = `VER ${PlayerData.Instance._version}`;

        // check if level player smaller than level tutorial => not show button home
        if (GameManager.Instance.levelPlayerNow <= MConfigs.LEVEL_CAN_SHOW_UI) {
            this.btnHome.node.active = false;
            this.nBg.position = this.pos_WhenHasNoBtnHome;
            this.nDash.active = false;
            this.nBg.getComponent(UITransform).contentSize = this.size_WhenHasNoBtnHome;
            this.listNChangeWhenNoBtnHome.forEach(item => {
                item.position = item.position.clone().add3f(0, -20, 0);
            })
        }
    }

    protected onEnable(): void {
        super.onEnable();
        director.pause();
    }

    protected onDisable(): void {
        director.resume();
    }

    public async UICustomShow(typeShow: number): Promise<void> {
        // this.node.scale = Vec3.ONE;
        // // target.setWorldPosition(underMidWPosScene);
        // const posStart: Vec3 = Vec3.ZERO.clone().add3f(0, -Utils.getSizeWindow().height / 2, 0);
        // this.node.position = posStart;
        // const mOpacity = this.node.getComponent(UIOpacity);
        // mOpacity.opacity = 0;
        // this.node.active = true;
        // for (let i = posStart.y; i <= 0; i += 10) {
        //     this.node.position = new Vec3(0, i, 0);
        //     mOpacity.opacity = 255 * Math.abs((i - posStart.y) / posStart.y)
        //     await new Promise<void>(resolve => setTimeout(() => { resolve() }, 1));
        // }

        // this.node.position = Vec3.ZERO;

        this.node.active = true;
        this.ShowShadow(false);
    }

    public async UICustomClose(typeClose: number): Promise<void> {
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
        // const posEnd: Vec3 = Vec3.ZERO.clone().add3f(0, -Utils.getSizeWindow().height / 2, 0);
        // let stepHeight: number = Utils.getSizeWindow().height / 20;
        // for (let i = 0, step = 0; i >= -Utils.getSizeWindow().height; i -= 20, step++) {
        //     this.node.position = new Vec3(0, i, 0);
        //     const mOpacity = this.node.getComponent(UIOpacity);
        //     mOpacity.opacity = 255 * (stepHeight - step);
        //     await new Promise<void>(resolve => setTimeout(() => { resolve() }, 1));
        // }


        director.resume();
        switch (typeClose) {
            default:
                clientEvent.dispatchEvent(MConst.EVENT.RESUME_GAME);
                break;
        }

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
        this.HideShadow(false);
        this.node.active = false;
    }

    //====================================================
    //#region self
    private logicBackHome() {
        // stop physic2D in game => it will turn in func start of GameSys
        PhysicsSystem2D.instance.enable = false;
        Tween.stopAll();
        director.resume();

        // lose game
        if (GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL) {
            DataInfoPlayer.Instance.LoseAGame();
        }

        // log event
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.NORMAL || TYPE_GAME.TUTORIAL:
                const levelPlayerNow = GameManager.Instance.GetLevelPlayerNow();
                const numRetry = DataInfoPlayer.Instance.GetStreakLose();
                const timePlayerPlay: number = GameInfoSys.Instance._autoTimeInGameSys.GetTime();
                LogEventManager.Instance.logLevelEnd(levelPlayerNow, LE_ID_MODE.NORMAL, numRetry, LE_RESULT_END_LEVEL.QUIT, timePlayerPlay);
                break;
            case TYPE_GAME.TOURNAMENT || TYPE_GAME.WITH_FRIEND:
                FBInstantManager.Instance.resetContextForced((err, success) => { });
                break;
            case TYPE_GAME.CHRISTMAS:
                CONFIG_LR_CHRIST.AUTO_SHOW_AT_HOME = true;
                break;
        }

        //================ change scene ==================//
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.LOBBY);
    }

    private logicShowUIQuit() {
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_QUIT, 1);
    }

    private logicShowUIQuitChristmas() {
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_QUIT_CHRISTMAS, 1);
    }
    //#endregion self
    //====================================================

    //====================================================
    //#region btn
    private onBtnChangeStateEffect() {

        SoundSys.Instance.changeStateEffect();
        const statusNow = SoundSys.Instance.getSoundEffStatus;
        LogEventManager.Instance.logButtonClick(`effect_${statusNow}`, "UIPause");
        this.toggleEffect.SetUp(statusNow);
    }

    private onBtnChangeStateMusic() {
        SoundSys.Instance.changeStateMusic();
        if (ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.LOBBY) {
            SoundSys.Instance.playMusic(GameMusicDisplay.MUSIC_BACKGROUND_LOOBY);
        } else {
            SoundSys.Instance.playMusic(GameManager.Instance.TypeGamePlay == TYPE_GAME.CHRISTMAS ? GameMusicDisplay.MUSIC_BACKGROUND_CHRIST : GameMusicDisplay.MUSIC_BACKGROUND_GAMEPLAY);
        }
        const statusNow = SoundSys.Instance.getMusicStatus;
        LogEventManager.Instance.logButtonClick(`music_${statusNow}`, "UIPause");
        this.toggleMusic.SetUp(statusNow);
    }

    private onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIPause");

        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CLICK);
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PAUSE, 1);
    }

    private onBtnHome() {
        LogEventManager.Instance.logButtonClick(`home`, "UIPause");

        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CLICK);

        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.NORMAL:
                // check logic trong PageAreYourSure func CanShowSelf và cóp sang đây
                const validSR = DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.JOINING && GameManager.Instance.JsonAllTypeGame.SPEED_RACE_CACHE != null && GameManager.Instance.JsonAllTypeGame.SPEED_RACE_CACHE > 0;
                const validTT = DataTreasureTrailSys.Instance.STATE == STATE_TT.JOINING;
                const progressNowSL = DataSkyLiftSys.Instance.ProgressNow;
                const validSL = DataSkyLiftSys.Instance.STATE == STATE_SL.JOINING
                    && progressNowSL > 0
                    && !DataSkyLiftSys.Instance.IsIndexIsSavePoint(progressNowSL);
                if (validSL || validSR || validTT) {
                    this.logicShowUIQuit();
                } else {
                    this.logicBackHome();
                }
                break;
            case TYPE_GAME.CHRISTMAS:
                if (DataHatRace_christ.Instance.GetIndexMutilply() > 0) {
                    this.logicShowUIQuitChristmas();
                } else {
                    this.logicBackHome();
                }
                break;
            default:
                this.logicBackHome();
                break;
        }
    }

    private async onBtnJoinGroup() {
        LogEventManager.Instance.logButtonClick(`join_group`, "UIPause");

        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CLICK);
        FBInstantManager.Instance.joinOfficialGroup();
    }

    private async onBtnFollowPage() {
        LogEventManager.Instance.logButtonClick(`follow_page`, "UIPause");

        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CLICK);
        FBInstantManager.Instance.followOfficialPage();
    }
    //#endregion btn
    //====================================================
}


