import { _decorator, CCFloat, Component, director, game, Node, RealCurve, tween, UIOpacity, Vec3 } from 'cc';
import { SoundSys } from 'db://assets/scripts/Common/SoundSys';
import { UIBaseSys } from 'db://assets/scripts/Common/UIBaseSys';
import { MConst, TYPE_UI } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { FBInstantManager } from 'db://assets/scripts/Utils/facebooks/FbInstanceManager';
import { GameSoundEffect, IShowTTInGame } from 'db://assets/scripts/Utils/Types';
import { GameManager } from '../../../GameManager';
import { MConfigs, TYPE_GAME } from 'db://assets/scripts/Configs/MConfigs';
import { LogEventManager } from 'db://assets/scripts/LogEvent/LogEventManager';
import { SaveStepGameSys } from '../../Logic/SaveStepGameSys';
import { PageAreYourSure } from '../../../OtherUI/UIContinue/PageAreYourSure';
import { Utils } from 'db://assets/scripts/Utils/Utils';
import { DataTreasureTrailSys } from 'db://assets/scripts/DataBase/DataTreasureTrailSys';
import { STATE_TT } from '../../../OtherUI/UITreasureTrail/TypeTreasureTrail';
import { DataInfoPlayer } from '../../../DataInfoPlayer';
import { DataHatRace_christ } from 'db://assets/scripts/DataBase/DataHatRace_christ';
import { PageUIAreYouSureChrist } from '../../../OtherUI/PageUIAreYouSureChrist/PageAreYourSureChrist';
import { PokiSDKManager } from 'db://assets/scripts/Utils/poki/PokiSDKManager';
const { ccclass, property } = _decorator;

enum STATE_ANIM {
    IDLE_REPLAY,
    ANIM_PAGE,
    IDLE_LOST_EVENT
}

@ccclass('UIEnsureResetGame')
export class UIEnsureResetGame extends UIBaseSys {
    @property(Node) nPageReplay: Node;
    @property(PageAreYourSure) pageAreYouSure: PageAreYourSure;
    @property(PageUIAreYouSureChrist) pageAreYouSureChrist: PageUIAreYouSureChrist;

    private _isCustomUpdating = false;
    private _stateAnim: STATE_ANIM = STATE_ANIM.IDLE_REPLAY;

    //====================================================
    //#region base
    protected onEnable(): void {
        director.pause();
        this._isCustomUpdating = true;
        this.runCustomUpdate();
        this.AutoUpdateState();
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
        this.ShowShadow(false);
        this.node.active = true;
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

        // check lý do tắt UI
        this._isCustomUpdating = false;
        director.resume();
        switch (typeClose) {
            case 1:
                clientEvent.dispatchEvent(MConst.EVENT.RESUME_GAME);
                break;
            case 2:
                clientEvent.dispatchEvent(MConst.EVENT.RESET_GAME);
                break;
        }

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
        this.HideShadow(false);
        this.node.active = false;
    }
    //#endregion base
    //====================================================


    //====================================================
    //#region private
    private runCustomUpdate(): void {
        if (!this._isCustomUpdating) return;
        this.customUpdate();
        requestAnimationFrame(() => this.runCustomUpdate());
    }

    private customUpdate(): void {
        if (this._stateAnim == STATE_ANIM.ANIM_PAGE) {
            this.AnimUI();
        }
    }
    //#endregion private
    //====================================================

    //====================================================
    //#region anim
    @property(RealCurve) mCurlve: RealCurve = new RealCurve();
    @property(CCFloat) speedAnim: number = 0.3;
    private _m_dt: number = 0;
    private readonly DIFF_POS_X = 540;
    private AnimUI() {
        // increase time by my self
        this._m_dt += 1 / 60;

        if (this._m_dt < this.speedAnim) {
            // play anim
            const realXPage1 = this.DIFF_POS_X * this.mCurlve.evaluate(this._m_dt / this.speedAnim);
            const realXPage2 = this.DIFF_POS_X * this.mCurlve.evaluate((this.speedAnim - this._m_dt) / this.speedAnim);
            this.nPageReplay.position = new Vec3(-realXPage1, 0, 0);
            this.pageAreYouSure.node.position = new Vec3(realXPage2, 0, 0);
            this.pageAreYouSureChrist.node.position = new Vec3(realXPage2, 0, 0);
        } else {
            // end state anim
            this.UpdateState(STATE_ANIM.IDLE_LOST_EVENT);
        }

    }
    //#endregion anim
    //====================================================

    //====================================================
    //#region State
    private UpdateState(newState: STATE_ANIM) {
        this._stateAnim = newState;

        switch (this._stateAnim) {
            case STATE_ANIM.IDLE_REPLAY:
                this.nPageReplay.position = Vec3.ZERO.clone();
                this.pageAreYouSure.node.position = new Vec3(this.DIFF_POS_X, 0, 0);
                this.pageAreYouSureChrist.node.position = new Vec3(this.DIFF_POS_X, 0, 0);
                break;
            case STATE_ANIM.ANIM_PAGE:
                break;
            case STATE_ANIM.IDLE_LOST_EVENT:
                this.nPageReplay.position = Vec3.ZERO.clone();
                this.pageAreYouSure.node.position = new Vec3(this.DIFF_POS_X, 0, 0);
                this.pageAreYouSureChrist.node.position = new Vec3(this.DIFF_POS_X, 0, 0);
                break;
            // case STATE_ANIM.IDLE_LOST_EVENT:
            //     switch (GameManager.Instance.TypeGamePlay) {
            //         case TYPE_GAME.CHRISTMAS:
            //             this.pageAreYouSureChrist.SetUp();
            //             this.pageAreYouSureChrist.node.position = Vec3.ZERO.clone();
            //             break;
            //         default:
            //             this.pageAreYouSure.SetUp();
            //             this.pageAreYouSure.node.position = Vec3.ZERO.clone();
            //             break;
            //     }
            //     this.nPageReplay.position = new Vec3(-this.DIFF_POS_X, 0, 0);
            //     break;
        }
    }

    private AutoUpdateState() {
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.CHRISTMAS:
                if (DataHatRace_christ.Instance.GetIndexMutilply() > 0) {
                    this.pageAreYouSure.Hide();
                    this.pageAreYouSureChrist.Show(0);
                    this.UpdateState(STATE_ANIM.IDLE_LOST_EVENT);
                } else {
                    this.UpdateState(STATE_ANIM.IDLE_REPLAY);
                }
                break;
            default:
                if (this.pageAreYouSure.CanShowSelf()) {
                    this.pageAreYouSureChrist.Hide();
                    this.pageAreYouSure.Show(0);
                    this.UpdateState(STATE_ANIM.IDLE_LOST_EVENT);
                } else {
                    this.UpdateState(STATE_ANIM.IDLE_REPLAY);
                }
                break;
        }
    }
    //#endregion State
    //====================================================

    //====================================================
    //#region btn
    onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIEnsureResetGame");

        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CLICK);
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_ENSURE_RESET_GAME, 1);
    }

    async onBtnReset() {
        let logicRunning: boolean = true;

        LogEventManager.Instance.logButtonClick(`reset`, "UIEnsureResetGame");
        const valid2 = (!MConfigs.isMobile && GameManager.Instance.levelPlayerNow > MConfigs.LEVEL_CAN_SHOW_INTER_PC) || (MConfigs.isMobile)


        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CLICK);
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.TUTORIAL:
                LogEventManager.Instance.logStepGame(GameManager.Instance.levelPlayerNow, "R", SaveStepGameSys.Instance.GetListStepToLog());
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_ENSURE_RESET_GAME, 2);
                break;
            case TYPE_GAME.TOURNAMENT:
            case TYPE_GAME.WITH_FRIEND:
            case TYPE_GAME.NORMAL:
                LogEventManager.Instance.logStepGame(GameManager.Instance.levelPlayerNow, "R", SaveStepGameSys.Instance.GetListStepToLog());
                if (GameManager.Instance.levelPlayerNow > MConfigs.LEVEL_CAN_SHOW_INTER && valid2) {
                    logicRunning = false;
                    // FBInstantManager.Instance.Show_InterstitialAdAsync("reset game when playing", (error: Error | null, success: string) => {
                    //     logicRunning = true;
                    // });
                    PokiSDKManager.Instance.Show_InterstitialAdAsync("reset game when playing", (error: Error | null, success: string) => {
                        logicRunning = true;
                    });
                    await Utils.WaitReceivingDone(() => logicRunning);
                }

                // trong trường hợp thua event TreasureTrail => đợi show UI xong mới chạy tiếp UI
                // NOTE check có thể show hay không và cần kiểm tra khi chạy tiếp tục direction , âm thanh xe , những anim khác sẽ hoạt động ra sao
                if (DataTreasureTrailSys.Instance.STATE == STATE_TT.JOINING) {
                    director.resume();
                    logicRunning = false;
                    const dataCustomTT: IShowTTInGame = {
                        cbClose: () => {
                            logicRunning = true;
                        }
                    }
                    DataTreasureTrailSys.Instance.LoseGame(false); // bắt buộc phải lose game trước khi chạy anim
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TREASURE_TRAIL, 1, true, [dataCustomTT]);
                    this.nVisual.active = false;
                    await Utils.WaitReceivingDone(() => logicRunning);
                }
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_ENSURE_RESET_GAME, 2);
                break;
            case TYPE_GAME.CHRISTMAS:
                // LogEventManager.Instance.logStepGame(GameManager.Instance.levelPlayerNow, "R", SaveStepGameSys.Instance.GetListStepToLog());
                // gọi inter
                logicRunning = false;
                // FBInstantManager.Instance.Show_InterstitialAdAsync("reset game when playing christ", (error: Error | null, success: string) => {
                //     logicRunning = true;
                // });
                PokiSDKManager.Instance.Show_InterstitialAdAsync("reset game when playing christ", (error: Error | null, success: string) => {
                    logicRunning = true;
                });
                await Utils.WaitReceivingDone(() => logicRunning);
                DataInfoPlayer.Instance.LoseGameChrist();
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_ENSURE_RESET_GAME, 2);
                break;
        }
    }
    //#endregion btn
    //====================================================


    private BtnTest() {
        // this.tweenWhilePause.startTweenManually();
        this.UpdateState(STATE_ANIM.ANIM_PAGE);
    }
}


