import { _decorator, AnimationComponent, Button, Component, EventMouse, EventTouch, game, Label, Node, PageView, ParticleSystem, RealCurve, Sprite, SpriteFrame, tween, UIOpacity, UITransform, Vec3, view } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { clientEvent } from '../../../framework/clientEvent';
import { CurrencySys } from '../../CurrencySys';
import { UIContinue_PagePack } from './UIContinue_PagePack';
import { ParamCustomUILose } from '../UILose/Type_UILose';
import { GameInfoSys } from '../../GameScene/GameInfoSys';
import { DataCustomUIShop, PAGE_VIEW_SHOP, PAGE_VIEW_SHOP_2 } from '../UIShop/TypeShop';
import { MConfigs, TYPE_GAME } from '../../../Configs/MConfigs';
import { GameSoundEffect, IShowTTInGame, TYPE_CURRENCY } from '../../../Utils/Types';
import { GameSys } from '../../GameScene/GameSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { GameManager } from '../../GameManager';
import { Utils } from '../../../Utils/Utils';
import { SoundSys } from '../../../Common/SoundSys';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { PageAreYourSure } from './PageAreYourSure';
import { DataTreasureTrailSys } from '../../../DataBase/DataTreasureTrailSys';
import { STATE_TT } from '../UITreasureTrail/TypeTreasureTrail';
import SupLogEvent from '../../../LogEvent/SupLogEvent';
import { DataEventsSys } from '../../DataEventsSys';
import { PageUIAreYouSureChrist } from '../PageUIAreYouSureChrist/PageAreYourSureChrist';
import { DataHatRace_christ } from '../../../DataBase/DataHatRace_christ';
import { PokiSDKManager } from '../../../Utils/poki/PokiSDKManager';
const { ccclass, property } = _decorator;

enum NAME_ANIM {
    IDLE = "IdleUI",
    OPEN_UI = "OpenUI",
    UNLOCK = "Unlock",
    UNLOCK_2 = "Unlock_2"
}

enum STATE_UI_CONTINUE {
    SHOW_UNLOCK_PARKING,
    SHOW_LOST_EVENT,
    SHOW_LOST_EVENT_CHRIST
}

@ccclass('UIContinue')
export class UIContinue extends UIBaseSys {
    // @property(UIContinue_PagePack) pagePack: UIContinue_PagePack;
    @property(Node) nUnlockParking: Node;
    @property(Sprite) spIc: Sprite;
    @property(SpriteFrame) sfAds: SpriteFrame;
    @property(SpriteFrame) sfTicket: SpriteFrame;
    @property(Label) lbWatchedAds: Label;
    @property(Label) lbShadowWatchedAds: Label;
    @property(PageAreYourSure) pageAreYouSure: PageAreYourSure;
    @property(PageUIAreYouSureChrist) pageAreYouSureChrist: PageUIAreYouSureChrist;

    // anim
    @property(AnimationComponent) animationComponent: AnimationComponent;
    @property(Node) nIcParking: Node;
    @property(ParticleSystem) par1: ParticleSystem;
    @property(ParticleSystem) par2: ParticleSystem;
    @property(RealCurve) cr1_x: RealCurve = new RealCurve();
    @property(RealCurve) cr1_y: RealCurve = new RealCurve();

    @property(Node)
    btnShowUI: Node;

    @property(UIOpacity)
    groupUIOPacity: UIOpacity;

    @property(Node) nBtnWatchAds: Node;
    @property(Node) nBtnCoin: Node;
    @property(Node) nBtnCoin_Disable: Node;
    private readonly _posNBtnCoinWhen2Btn: Vec3 = new Vec3(-142, -85.812, 0);

    @property(Node) nVisualSys: Node;
    private readonly _posWhenHavePackLose: Vec3 = new Vec3(0, 0, 0);
    private readonly _posWhenHaveNoPackLose: Vec3 = new Vec3(0, -120, 0);

    @property(PageView) pv: PageView;

    @property(Node) nBlock: Node;

    touchStartTime: number = 0;
    isTouching: boolean = false;
    isShowUI: boolean = true;

    private _state: STATE_UI_CONTINUE = STATE_UI_CONTINUE.SHOW_UNLOCK_PARKING;

    //==============================
    //#region func base UI
    protected onEnable(): void {
        // this.btnShowUI.on(Node.EventType.TOUCH_START, this.ShowUI_TouchStart, this);
        // this.btnShowUI.on(Node.EventType.TOUCH_END, this.ShowUI_TouchEnd, this);
        // this.btnShowUI.on(Node.EventType.TOUCH_CANCEL, this.ShowUI_TouchEnd, this);
        // this.btnShowUI.on(Node.EventType.TOUCH_MOVE, this.ShowUI_TouchMove, this);
        // document.removeEventListener("pointerleave", this.onPointerLeave.bind(this));

        // this.btnShowUI.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // this.btnShowUI.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);
        // this.btnShowUI.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);

        document.addEventListener("mousemove", this.onGlobalMouseMove.bind(this), { passive: false });

        // this.pagePack.SetCB(this.TryUpdateUIWhenNoPack.bind(this));
        // if (GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL) {
        //     this.pagePack.TryInitPack();
        // }

        this.UpdateBtnAds();
    }

    protected onDisable(): void {
        // this.btnShowUI.off(Node.EventType.TOUCH_START, this.ShowUI_TouchStart, this);
        // this.btnShowUI.off(Node.EventType.TOUCH_END, this.ShowUI_TouchEnd, this);
        // this.btnShowUI.off(Node.EventType.TOUCH_CANCEL, this.ShowUI_TouchEnd, this);
        // this.btnShowUI.off(Node.EventType.TOUCH_MOVE, this.ShowUI_TouchMove, this);
        // document.removeEventListener("pointerleave", this.onPointerLeave.bind(this));

        // this.btnShowUI.off(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // this.btnShowUI.off(Node.EventType.MOUSE_UP, this.onMouseUp, this);
        // this.btnShowUI.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);

        // document.removeEventListener("mousemove", this.onGlobalMouseMove.bind(this));
    }

    public async PrepareDataShow(): Promise<void> {
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_POPUP_FAILED);
        this.UpdateUI();

        this.animationComponent.play(NAME_ANIM.IDLE);
        this.par1.stop();
        this.par2.stop();

        this.pageAreYouSure.Hide();
        this.pageAreYouSureChrist.Hide();

        this.SetState(STATE_UI_CONTINUE.SHOW_UNLOCK_PARKING);
    }

    public async UIShowDone(): Promise<void> {
        this.animationComponent.play(NAME_ANIM.OPEN_UI);
    }
    //#endregion func base UI
    //==============================

    private async AddParkingSuccess() {
        // logEvent
        SupLogEvent.SetIsInWayLogLoseEventStreak = false;
        SupLogEvent.SetIsInWayLogLoseNormal = false;

        //play anim
        switch (this.State) {
            case STATE_UI_CONTINUE.SHOW_LOST_EVENT:
                this.animationComponent.play(NAME_ANIM.UNLOCK_2);
                await Utils.delay(this.GetTimeAnim(NAME_ANIM.UNLOCK_2) * 1000);
                break;
            case STATE_UI_CONTINUE.SHOW_UNLOCK_PARKING:
                this.animationComponent.play(NAME_ANIM.UNLOCK);
                await Utils.delay(this.GetTimeAnim(NAME_ANIM.UNLOCK) * 1000);
                break;
            case STATE_UI_CONTINUE.SHOW_LOST_EVENT_CHRIST:
                this.animationComponent.play(NAME_ANIM.UNLOCK_2);
                await Utils.delay(this.GetTimeAnim(NAME_ANIM.UNLOCK_2) * 1000);
                break;
        }
    }

    private UpdateBtnAds() {
        // if (CurrencySys.Instance.GetTicket() > 0) {
        //     this.spIc.spriteFrame = this.sfTicket;
        //     this.lbWatchedAds.string = "Free(1)";
        //     this.lbShadowWatchedAds.string = "Free(1)";
        // } else {
        //     this.spIc.spriteFrame = this.sfAds;
        //     this.lbWatchedAds.string = "Free(1)";
        //     this.lbShadowWatchedAds.string = "Free(1)";
        // }
    }

    protected update(dt: number): void {
        if (this.isTouching) {
            let touchDuration = (Date.now() - this.touchStartTime) / 1000;
            // console.log(touchDuration);
            if (touchDuration >= 0.2 && this.isShowUI) {
                // console.log("Touch đang kéo dài");
                this.setHideUI();
            }
        }
    }

    private setHideUI() {
        // console.log("setHideUI")
        this.isShowUI = false;
        clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_GAME, true, 0.2);
        this.groupUIOPacity.opacity = 0;
    }

    //==============================
    //#region state
    private async SetState(newState: STATE_UI_CONTINUE) {
        this._state = newState;

        switch (this._state) {
            case STATE_UI_CONTINUE.SHOW_UNLOCK_PARKING:
                SupLogEvent.SetIsInWayLogLoseNormal = true;
                this.pv.enabled = true;
                this.pv.scrollToPage(0, 0);
                this.nUnlockParking.getComponent(UIOpacity).opacity = 255;
                this.pageAreYouSure.Hide();
                this.pageAreYouSureChrist.Hide();
                this.pv.enabled = false;
                break;
            case STATE_UI_CONTINUE.SHOW_LOST_EVENT:
                // logEvent
                SupLogEvent.SetIsInWayLogLoseEventStreak = true;


                this.pv.enabled = true;
                this.nBlock.active = true;
                const timeShowAndHide = 0.1;

                tween(this.nUnlockParking.getComponent(UIOpacity))
                    .to(timeShowAndHide, { opacity: 0 })
                    .start();

                // check isPlayingEvent can show [TreasureTrail , SkyLift , SpeedRace]
                this.pageAreYouSure.SetUp();
                this.pageAreYouSure.Show(timeShowAndHide);
                this.pv.scrollToPage(1);

                await Utils.delay((timeShowAndHide + 0.2) * 1000);
                this.pv.enabled = false;
                this.nBlock.active = false;
                break;
            case STATE_UI_CONTINUE.SHOW_LOST_EVENT_CHRIST:
                this.pv.enabled = true;
                this.nBlock.active = true;
                const timeShowAndHide_christ = 0.1;

                tween(this.nUnlockParking.getComponent(UIOpacity))
                    .to(timeShowAndHide_christ, { opacity: 0 })
                    .start();

                // check isPlayingEvent can show [TreasureTrail , SkyLift , SpeedRace]
                // this.pageAreYouSure.SetUp();
                // this.pageAreYouSure.Show(timeShowAndHide);
                this.pageAreYouSureChrist.SetUp();
                this.pageAreYouSureChrist.Show(timeShowAndHide_christ);
                this.pv.scrollToPage(2);

                await Utils.delay((timeShowAndHide_christ + 0.2) * 1000);
                this.pv.enabled = false;
                this.nBlock.active = false;
                break;
        }
    }

    private get State(): STATE_UI_CONTINUE {
        return this._state;
    }
    //#endregion state
    //==============================

    //==============================
    //#region anim
    private PlayParticle() {
        this.par1.play();
        this.par2.play();
    }

    /**
     * emit to move the block
     */
    private async MoveBlock() {
        const timeMoveBlock = 0.5;
        const wPosParkingUnlock = this._dataCustom as Vec3;
        const distanceX: number = wPosParkingUnlock.x - this.nIcParking.worldPosition.x;
        const distanceY: number = wPosParkingUnlock.y - this.nIcParking.worldPosition.y;
        const baseWPosIc = this.nIcParking.worldPosition.clone();
        const self = this;
        const scaleRoot = this.nIcParking.scale.clone();
        const scaleEnd = new Vec3(0.2, 0.2, 0.2);
        // tween di chuyển block đến vị trí mở khóa
        this.nShadowSelf.Hide(true, timeMoveBlock * 2 / 3);
        tween(this.nIcParking)
            .to(timeMoveBlock, {}, {
                onUpdate(target, ratio) {
                    const newDistanceX = self.cr1_x.evaluate(ratio) * distanceX;
                    const newDistanceY = self.cr1_y.evaluate(ratio) * distanceY;
                    self.nIcParking.worldPosition = new Vec3(baseWPosIc.x + newDistanceX, baseWPosIc.y + newDistanceY, baseWPosIc.z);
                    let scaleRight: Vec3 = new Vec3();
                    Vec3.lerp(scaleRight, scaleRoot, scaleEnd, self.cr1_x.evaluate(ratio));
                    self.nIcParking.scale = scaleRight.clone();
                },
            })
            .start();
        await Utils.delay(timeMoveBlock * 1000);

        clientEvent.dispatchEvent(MConst.EVENT_PARKING.UNLOCK_1_NORMAL_PARKING);
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_CONTINUE, 2);
        clientEvent.dispatchEvent(MConst.EVENT.RESUME_GAME);
        // clientEvent.dispatchEvent(MConst.EVENT_CAR.TRIGGER_CAR_AUTO_MOVE_FORWARD);

        this.UpdateBtnAds();
        this.UpdateUI();
    }

    private GetTimeAnim(nameAnim: NAME_ANIM): number {
        const clip = this.animationComponent.clips[Utils.getIndexOfEnum(NAME_ANIM, nameAnim)];
        return clip.duration * clip.speed;
    }
    //#endregion anim
    //==============================


    //==============================
    //#region UI
    private UpdateUI() {
        // let canShowBtnWatchAds: boolean = true;
        // // kiểm tra xem có ticket sử dụng hay không
        // if (CurrencySys.Instance.GetTicket() > 0) {
        //     canShowBtnWatchAds = true;
        // }
        // // kiểm tra xem lượt này có xem được quảng cáo hya không
        // if (GameSys.Instance.CheckWatchedAdsContinue()) {
        //     canShowBtnWatchAds = false;
        // }

        // if (canShowBtnWatchAds) {
        //     this.nBtnCoin.position = this._posNBtnCoinWhen2Btn;
        //     this.nBtnWatchAds.active = true;
        // } else {
        //     this.nBtnCoin.position = new Vec3(0, this._posNBtnCoinWhen2Btn.y, 0);
        //     this.nBtnWatchAds.active = false;
        // }

        // // Kiểm tra xem có pack lose nào ko?
        // this.TryUpdateUIWhenNoPack();

        if(CurrencySys.Instance.GetMoney() >= 1500) {
            this.nBtnCoin_Disable.active = false;
        } else {
            this.nBtnCoin_Disable.active = true;
        }
    }

    private TryUpdateUIWhenNoPack(anim: boolean = false) {
        // const isTypeGameNormalOrTut = GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL || GameManager.Instance.TypeGamePlay == TYPE_GAME.TUTORIAL;
        // const isHasAnyPackLose = this.pagePack.IsHasAnyPackCanInit();
        // const locEnd = isHasAnyPackLose && isTypeGameNormalOrTut ? this._posWhenHavePackLose.clone() : this._posWhenHaveNoPackLose;
        // if (!anim) {
        //     this.nVisualSys.position = locEnd;
        // } else {
        //     const timeMove = 0.5;
        //     tween(this.nVisualSys)
        //         .to(timeMove, { position: locEnd }, { easing: "smooth" })
        //         .start();
        // }
    }
    //#endregion UI
    //==============================


    //==============================
    //#region func btn
    private BtnWatchAds() {
        //Log event
        LogEventManager.Instance.logButtonClick(`buying_by_ads`, "UIContinue");

        const self = this;

        async function useSuccess() {
            // log event
            const dataEventLog = DataEventsSys.Instance.GetParamEventWhenBoughtIAPSuccess();
            SupLogEvent.LogEventWithReward(dataEventLog, 0, "ads_parking", "UIContinue");

            self.AddParkingSuccess();
            self.UpdateBtnAds();
            self.UpdateUI();
        }

        if (CurrencySys.Instance.GetTicket() > 0) {
            CurrencySys.Instance.AddTicket(-1, `UIContinue_addParking`);
            useSuccess();
            return;
        }

        // FBInstantManager.Instance.Show_RewardedVideoAsync(this.node.name, "btnWatchAds", async (err, succ) => {
        //     if (succ == MConst.FB_REWARD_CALLBACK_SUCCESS) {
        //         GameSys.Instance.SetWatchedAdsContinue();
        //         useSuccess();
        //     }
        // })

        PokiSDKManager.Instance.Show_RewardedVideoAsync(this.node.name, "btnWatchAds", async (err, succ) => {
            if (succ == MConst.FB_REWARD_CALLBACK_SUCCESS) {
                GameSys.Instance.SetWatchedAdsContinue();
                useSuccess();
            }
        })
    }

    private BtnAddParkingByCoin() {
        LogEventManager.Instance.logButtonClick(`buying_by_coin`, "UIContinue");

        if (CurrencySys.Instance.AddMoney(-1500, `UIContinue_addParking`, true)) {
            // log event
            const dataEventLog = DataEventsSys.Instance.GetParamEventWhenBoughtIAPSuccess();
            LogEventManager.Instance.lose2PackNameEvent(dataEventLog.streakSL, dataEventLog.streakTT, dataEventLog.typeEventGoingOn, dataEventLog.numLoopEventGoingOn, "coin", 0, "coin_parking");
            // call success
            this.AddParkingSuccess();
        } else {
            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, "Not enough Coins!");

            // // Close this UI and open UIShop to coin
            // clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI_WITHOUT_TURN_OFF_SHADOW, TYPE_UI.UI_CONTINUE, 2);
            // // if pass all case show ui shop
            // let dataCustomUIShop: DataCustomUIShop = {
            //     isActiveClose: true,
            //     openUIAfterClose: TYPE_UI.UI_CONTINUE,
            //     pageViewShop_ScrollTo: MConfigs.numIAPTicketHave > 0 ? PAGE_VIEW_SHOP.COIN : PAGE_VIEW_SHOP_2.COIN,
            //     canAutoResumeGame: false,
            //     dataCustom: this._dataCustom
            // }
            // clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SHOP_SHORT, 2, true, dataCustomUIShop, false);
        }
    }

    private async BtnClose() {
        const self = this;
        LogEventManager.Instance.logButtonClick(`close`, "UIContinue");

        function closeUI() {
            // logEvent
            SupLogEvent.SetIsInWayLogLoseEventStreak = false;
            SupLogEvent.SetIsInWayLogLoseNormal = false;

            // save info player
            const typeGame = GameManager.Instance.TypeGamePlay;
            switch (typeGame) {
                case TYPE_GAME.NORMAL:
                    DataInfoPlayer.Instance.LoseAGame();
                    break;
                case TYPE_GAME.CHRISTMAS:
                    DataInfoPlayer.Instance.LoseGameChrist();
                    break;
            }

            clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI_WITHOUT_TURN_OFF_SHADOW, TYPE_UI.UI_CONTINUE, 1, async () => {

                // kiểm tra nếu như event TT đang ở trạng thái lose thì
                if (DataTreasureTrailSys.Instance.STATE == STATE_TT.LOSE) {

                    let isShowingTT: boolean = true;
                    const dataCustomShowTT: IShowTTInGame = {
                        cbClose: () => {
                            isShowingTT = false;
                        }
                    }
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TREASURE_TRAIL, 1, true, [dataCustomShowTT]);
                    self.nVisual.active = false;
                    await Utils.WaitReceivingDone(() => !isShowingTT);
                }

                // get the json param when open ui win and pass to uiWin
                let jsonCustom: ParamCustomUILose = {
                    time: GameInfoSys.Instance._autoTimeInGameSys.GetTime(),
                    car: GameInfoSys.Instance.getNumCarPickedUp(),
                    passenger: GameInfoSys.Instance.getNumPassengerPickedUp(),
                }
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LOSE, 1, true, jsonCustom);
            });
        }

        // kiểm tra có thể chuyển sang chế độ thông báo lose streak ko?
        // nếu có thì hiển thị UILoseStreak
        const typeGamePlaying = GameManager.Instance.TypeGamePlay;
        switch (true) {
            case typeGamePlaying == TYPE_GAME.NORMAL && this.State == STATE_UI_CONTINUE.SHOW_UNLOCK_PARKING && this.pageAreYouSure.CanShowSelf():
                this.SetState(STATE_UI_CONTINUE.SHOW_LOST_EVENT);
                break;
            case typeGamePlaying == TYPE_GAME.CHRISTMAS && this.State == STATE_UI_CONTINUE.SHOW_UNLOCK_PARKING && DataHatRace_christ.Instance.GetIndexMutilply() > 0:
                this.SetState(STATE_UI_CONTINUE.SHOW_LOST_EVENT_CHRIST);
                break;
            default:
                closeUI();
                break;
        }
    }
    //#endregion func btn
    //==============================


    private ShowUI_TouchStart() {
        // document.addEventListener("touchmove", this.onTouchMove, { passive: false });
        // document.addEventListener("mousemove", this.onTouchMove, { passive: false });
        this.touchStartTime = Date.now();
        this.isTouching = true;
        this.isShowUI = true;
        // clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_GAME, true, 0.2);
        // this.groupUIOPacity.opacity = 0;
    }

    private ShowUI_TouchEnd() {
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_SHADOW_GAME, false);
        this.groupUIOPacity.opacity = 255;
        this.isTouching = false;
        this.isShowUI = true;
    }

    private ShowUI_TouchMove(event: EventTouch) {
        if (!this.isTouching) return;

        const touchPos = event.getUILocation();
        // console.log(touchPos);
        // Kiểm tra nếu touchPos ra ngoài Canvas
        if (
            touchPos.x < 0 || touchPos.x > 720 ||
            touchPos.y < 0 || touchPos.y > 1280
        ) {
            console.error("User moved out of the canvas!");
            this.ShowUI_TouchEnd();
        }
    }

    // onPointerLeave() {
    //     console.log("Pointer Left Canvas - Canceling Touch");
    //     this.ShowUI_TouchEnd();
    // }

    // onTouchMove(event: TouchEvent) {
    //     console.log("Touch Move:", event.touches[0].clientX, event.touches[0].clientY);
    // }

    // onMouseDown(event: EventMouse) {
    //     console.log("Mouse Down");

    //     // Đăng ký sự kiện mousemove trên document
    //     document.addEventListener("mousemove", this.onMouseMove.bind(this), { passive: false });
    // }

    // isMouseOutside = false;

    // onMouseMove(event: MouseEvent) {
    //     // if (!this.isTouching) return;
    //     console.log("Mouse Move:", event.clientX, event.clientY);
    //     // if (
    //     //     event.clientX < 0 || event.clientX > 720 ||
    //     //     event.clientY < 0 || event.clientY > 1280
    //     // ) {
    //     //     document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    //     //     this.ShowUI_TouchEnd();
    //     // }
    //     const canvasRect = game.canvas.getBoundingClientRect();
    //     const { clientX, clientY } = event;

    //     // Kiểm tra nếu chuột ra ngoài vùng canvas
    //     if (
    //         clientX < canvasRect.left || 
    //         clientX > canvasRect.right || 
    //         clientY < canvasRect.top || 
    //         clientY > canvasRect.bottom
    //     ) {
    //         if (!this.isMouseOutside) {
    //             console.log("Mouse is OUTSIDE canvas");
    //             this.isMouseOutside = true;
    //         }
    //     } else {
    //         if (this.isMouseOutside) {
    //             console.log("Mouse is BACK inside canvas");
    //             this.isMouseOutside = false;
    //         }
    //     }
    // }

    // onMouseUp(event: EventMouse) {
    //     console.log("Mouse Up");
    // }

    // onMouseLeave(event: EventMouse) {
    //     console.log("Mouse Leave");

    //     // Gỡ sự kiện mousemove khi chuột rời khỏi canvas
    //     document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    // }

    // onMouseMove(event: EventMouse) {
    //     // console.log("Mouse is inside canvas");
    //     this.isMouseOutside = false;
    // }

    // onMouseLeave(event: EventMouse) {
    //     // console.log("Mouse left the canvas");
    //     this.isMouseOutside = true;
    // }

    onGlobalMouseMove(event: MouseEvent) {
        // if (!this.isTouching) return;
        const canvasRect = game.canvas.getBoundingClientRect();
        const { clientX, clientY } = event;
        // console.log("Mouse Move:", clientX, clientY, canvasRect);
        // Kiểm tra nếu chuột ra ngoài vùng canvas
        if (
            clientX < canvasRect.left ||
            clientX > canvasRect.right ||
            clientY < canvasRect.top ||
            clientY > canvasRect.bottom
        ) {
            // if (!this.isMouseOutside) {
            //     console.log("Mouse is OUTSIDE canvas");
            //     this.isMouseOutside = true;
            // }
            // console.error("Mouse is OUTSIDE canvas");
            // this.ShowUI_TouchEnd();
        }
        // else {
        //     if (this.isMouseOutside) {
        //         console.log("Mouse is BACK inside canvas");
        //         this.isMouseOutside = false;
        //     }
        // }
    }
}


