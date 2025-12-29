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
import { GameInfoSys } from '../../GameScene/GameInfoSys';
import { LE_ID_MODE, LE_RESULT_END_LEVEL } from '../../../LogEvent/TypeLogEvent';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { ChangeSceneSys } from '../../../Common/ChangeSceneSys';
import { PageAreYourSure } from '../UIContinue/PageAreYourSure';
const { ccclass, property } = _decorator;

@ccclass('UIQuit')
export class UIQuit extends UIBaseSys {
    @property(PageAreYourSure) pageAreYouSure: PageAreYourSure;

    //====================================================
    //#region baseUI
    protected onEnable(): void {
        super.onEnable();
    }

    public async PrepareDataShow(): Promise<void> {
        this.pageAreYouSure.SetUp(false);
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

        // lose game
        if (GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL) {
            DataInfoPlayer.Instance.LoseAGame();
        }

        // log event
        if (GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL || GameManager.Instance.TypeGamePlay == TYPE_GAME.TUTORIAL) {
            const levelPlayerNow = GameManager.Instance.GetLevelPlayerNow();
            const numRetry = DataInfoPlayer.Instance.GetStreakLose();
            const timePlayerPlay: number = GameInfoSys.Instance._autoTimeInGameSys.GetTime();
            LogEventManager.Instance.logLevelEnd(levelPlayerNow, LE_ID_MODE.NORMAL, numRetry, LE_RESULT_END_LEVEL.QUIT, timePlayerPlay);
        } else if (GameManager.Instance.TypeGamePlay == TYPE_GAME.WITH_FRIEND || GameManager.Instance.TypeGamePlay == TYPE_GAME.TOURNAMENT) {
            FBInstantManager.Instance.resetContextForced((err, success) => { });
        }

        //================ change scene ==================//
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.LOBBY);
    }
    //#endregion self
    //====================================================

    //====================================================
    //#region btn
    onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIQuit");

        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CLICK);
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_QUIT, 1);
    }

    onBtnYes() {
        LogEventManager.Instance.logButtonClick(`Yes`, "UIQuit");

        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CLICK);

        //come back home
        this.logicBackHome();
    }
    //#endregion btn
    //====================================================
}


