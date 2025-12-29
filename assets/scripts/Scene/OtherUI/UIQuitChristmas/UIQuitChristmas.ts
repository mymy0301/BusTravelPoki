import { _decorator, Component, director, Node, PhysicsSystem2D, Tween } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { SoundSys } from '../../../Common/SoundSys';
import { GameSoundEffect } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { GameManager } from '../../GameManager';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { TYPE_GAME } from '../../../Configs/MConfigs';
import { ChangeSceneSys } from '../../../Common/ChangeSceneSys';
import { PageUIAreYouSureChrist } from '../PageUIAreYouSureChrist/PageAreYourSureChrist';
import { CONFIG_LR_CHRIST } from '../UIChristmasEvent/LightRoad/TypeLightRoad';
const { ccclass, property } = _decorator;

@ccclass('UIQuitChristmas')
export class UIQuitChristmas extends UIBaseSys {
    @property(PageUIAreYouSureChrist) pageAreYouSureChrist: PageUIAreYouSureChrist;

    //====================================================
    //#region baseUI
    protected onEnable(): void {
        super.onEnable();
    }

    public async PrepareDataShow(): Promise<void> {
        this.pageAreYouSureChrist.SetUp(false);
    }

    public async UICustomShow(typeShow: number): Promise<void> {
        this.node.active = true;
        this.ShowShadow(false);
    }

    public async UICustomClose(typeClose: number): Promise<void> {
        this.HideShadow(false);
        this.node.active = false;
    }
    //#endregion baseUI
    //====================================================

    //====================================================
    //#region self
    private logicBackHome() {
        // stop physic2D in game => it will turn in func start of GameSys
        PhysicsSystem2D.instance.enable = false;
        Tween.stopAll();
        director.resume();


        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.NORMAL || TYPE_GAME.TUTORIAL:
                // DataInfoPlayer.Instance.LoseAGame();
                // const levelPlayerNow = GameManager.Instance.GetLevelPlayerNow();
                // const numRetry = DataInfoPlayer.Instance.GetStreakLose();
                // const timePlayerPlay: number = GameInfoSys.Instance._autoTimeInGameSys.GetTime();
                // LogEventManager.Instance.logLevelEnd(levelPlayerNow, LE_ID_MODE.NORMAL, numRetry, LE_RESULT_END_LEVEL.QUIT, timePlayerPlay);
                break;
            case TYPE_GAME.WITH_FRIEND || TYPE_GAME.TOURNAMENT:
                // FBInstantManager.Instance.resetContextForced((err, success) => { });
                break;
            case TYPE_GAME.CHRISTMAS:
                CONFIG_LR_CHRIST.AUTO_SHOW_AT_HOME = true;
                DataInfoPlayer.Instance.LoseGameChrist();
                break;
        }

        //================ change scene ==================//
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.LOBBY);
    }
    //#endregion self
    //====================================================

    //====================================================
    //#region btn
    onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIQuitChristmas");

        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CLICK);
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_QUIT_CHRISTMAS, 1);
    }

    onBtnYes() {
        LogEventManager.Instance.logButtonClick(`Yes`, "UIQuitChristmas");

        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CLICK);

        //come back home
        this.logicBackHome();
    }
    //#endregion btn
    //====================================================
}


