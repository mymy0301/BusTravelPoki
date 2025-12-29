import { _decorator, Component, director, Label, Node } from 'cc';
import { UISceneSysBase } from '../../Common/UISceneSysBase';
import { ShadowGameUI } from '../../Scene/GameScene/OtherUI/ShadowGameUI';
import { UISignUpNumPassenger } from '../../Scene/GameScene/OtherUI/UISignUpNumPassenger';
import { NotificationLevelUp } from '../../Scene/GameScene/OtherUI/UINotificationLevelUp/NotificationLevelUp';
import { clientEvent } from '../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../Const/MConst';
import { Utils } from '../../Utils/Utils';
import { MConstBuildGame } from '../MConstBuildGame';
import { UILoseTestGameSys } from './UILoseTestGameSys';
import { UICooldownTimeCar } from '../../Scene/GameScene/OtherUI/UICooldownTimeCar/UICooldownTimeCar';
const { ccclass, property } = _decorator;

@ccclass('TestUIGameSys')
export class TestUIGameSys extends UISceneSysBase {
    public static Instance: TestUIGameSys = null;
    @property(ShadowGameUI) shadowGameUI: ShadowGameUI;
    @property(UISignUpNumPassenger) uiSignUpNumPassenger: UISignUpNumPassenger;
    @property(Label) lbLevel: Label;
    @property(UILoseTestGameSys) uiLoseTestGameSys: UILoseTestGameSys;
    @property(UICooldownTimeCar) uiCooldownTimeCar: UICooldownTimeCar;

    public MLoad(): void {
        if (TestUIGameSys.Instance == null) TestUIGameSys.Instance = this;
        this.shadowGameUI.Hide();
        clientEvent.on(MConst.EVENT.SHOW_SHADOW_GAME, this.ShowShadowGame, this);
        clientEvent.on(MConst.EVENT.HIDE_SHADOW_GAME, this.HideShadowGame, this);
        clientEvent.on(MConst.EVENT.RESET_GAME, this.ResetNewGame, this);
        clientEvent.on(MConst.EVENT.RESUME_GAME, this.ResumeGame, this);
        clientEvent.on(MConst.EVENT.PAUSE_GAME, this.PauseGame, this);

        // Utils.DrawPhysicsDebugging();
    }

    public MOnDestroy(): void {
        TestUIGameSys.Instance = null;
        clientEvent.off(MConst.EVENT.SHOW_SHADOW_GAME, this.ShowShadowGame, this);
        clientEvent.off(MConst.EVENT.HIDE_SHADOW_GAME, this.HideShadowGame, this);
        clientEvent.off(MConst.EVENT.RESET_GAME, this.ResetNewGame, this);
        clientEvent.off(MConst.EVENT.RESUME_GAME, this.ResumeGame, this);
        clientEvent.off(MConst.EVENT.PAUSE_GAME, this.PauseGame, this);
    }

    public MStart(): void {
        this.ResetNewGame(true);
    }

    //#region self func
    private ResetNewGame(isFromStart: boolean = false) {
        // NOTE 
        // you can set your logic here in 2 case
        // 1. call another scene to scene game
        // 2. call from in game scene like: btnResetGame or something like that
        this.uiCooldownTimeCar.ReUseAllNoti();
    }

    private ResumeGame() {
        //NOTE update UI in here
    }

    private PauseGame() {
        //NOTE update UI in here
    }

    override callbackWhenPrepareShowUI(typeUI: TYPE_UI, showShadow: boolean): void {
        if (showShadow) {
            this.shadowGameUI.Show();
        }
    }

    private ShowShadowGame() {
        this.shadowGameUI.Show();
    }

    private HideShadowGame(isUseOpacity: boolean = true) {
        this.shadowGameUI.Hide(isUseOpacity);
    }

    override callbackWhenShowUIDone(typeUI: TYPE_UI): void {

    }

    override callbackWhenCloseUIDone(typeUI: TYPE_UI): void {
        // MConsolLog.Log("call callbackWhenCloseUIDone: " + !this.CheckHasAnyUIShow());

        if (!this.CheckHasAnyUIShow()) {
            this.shadowGameUI.Hide();
            // you can do something in here such as popup event
        }
    }

    override callbackWhenCloseAllUIDone(): void {
        this.shadowGameUI.Hide();
    }
    //#endregion self func

    //#region setUI
    public SetGamePreparePlayNormal(level: number, numPassengers: number) {
        this.uiSignUpNumPassenger.SetNumPassenger(numPassengers);
        this.lbLevel.string = `Level ${level}`;
    }
    //#endregion setUI

    //#region btnUI
    private BtnReset() {
        clientEvent.dispatchEvent(MConst.EVENT.PAUSE_GAME);
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_ENSURE_RESET_GAME, 1);
    }

    private BtnShowDebug() {
        Utils.DrawPhysicsDebugging();
    }

    private BtnHideDebug() {
        Utils.UnDrawPhysicsDebugging();
    }

    private BtnReturnBuild() {
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
        director.loadScene(MConstBuildGame.NAME_SCENE.BUILD_GAME);
    }
    //#endregion btnUI

}


