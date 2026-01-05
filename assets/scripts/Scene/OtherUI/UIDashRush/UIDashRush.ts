import { _decorator, Component, Label, Node, Tween, tween, TweenAction, UIOpacity, Vec2, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { VisualCarDashRush } from './VisualCarDashRush';
import { DataDashRush } from '../../DataDashRush';
import { InfoBot_DashRush, instanceOfIOpenUIBaseWithInfo, IPrize, instanceOfIUIKeepTutAndReceiveLobby, TYPE_RECEIVE_PRIZE_LOBBY, GameSoundEffect, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { Utils } from '../../../Utils/Utils';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import * as I18n from 'db://i18n/LanguageData';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { MConfigs } from '../../../Configs/MConfigs';
import { UIPageHomeSys } from '../../LobbyScene/PageSys/UIPageHomeSys';
import { CONFIG_DR, STATE_DR, EVENT_DASH_RUSH } from './TypeDashRush';
import { BubbleSys } from '../Others/Bubble/BubbleSys';
import { TYPE_BUBBLE } from '../Others/Bubble/TypeBubble';
import { SoundSys } from '../../../Common/SoundSys';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
import { DataEventsSys } from '../../DataEventsSys';
const { ccclass, property } = _decorator;

@ccclass('UIDashRush')
export class UIDashRush extends UIBaseSys {
    @property(Node) nBtnClaim: Node;
    @property(Node) nBtnTryAgain: Node;
    @property(Node) nBtnPlay: Node;
    @property([VisualCarDashRush]) visualCarDashRush: VisualCarDashRush[] = [];
    @property(InfoUIBase) infoUIBase: InfoUIBase;
    @property(Label) lbTime: Label;
    @property(Node) nStartCar: Node;
    @property(Node) nEndCar: Node;
    @property(Node) nPrize: Node;
    @property(Label) lbMaxGas: Label;
    @property(Node) nLbWin: Node;
    @property(Node) nLbLose: Node;
    @property(Node) nLbPlaying: Node;

    private _listDataPlayerRushThisTurnShow: InfoBot_DashRush[] = [];
    private _speedCar: number = 400;
    private _posXPrizeBase: number = 0;
    private readonly distanceYPrize = 50;
    private readonly timeShowPrize = 0.3;
    private readonly timeHideUI = 0.5;
    private readonly timeShowUI = 0.5;

    private _isAnimShowingUI: boolean = false;
    private _isEndTime: boolean = false;    // lý do tồn tại thuộc tính này vì 1 lý do nào đó UpdateUITime đc gọi nhiều hơn một lần dù chỉ định code sẽ chỉ lắng nghe 1 lần.

    //=======================================
    //#region base UI
    protected onLoad(): void {
        this._posXPrizeBase = this.nPrize.position.x;
        this.lbMaxGas.string = CONFIG_DR.DR_MAX_PROGRESS.toString();
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_DASH_RUSH.UPDATE_BOT_RACE, this.UpdateCarByTime, this)
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }


    public async PrepareDataShow(): Promise<void> {
        this._isAnimShowingUI = true;
        this._isEndTime = false;
        // const time = DataEventsSys.Instance.GetTimeGroupEventRemain(TYPE_EVENT_GAME.DASH_RUSH, 1);
        const time = DataDashRush.Instance.GetTimeDisplay();
        if (time > 0) {
            this.UpdateUITime(false);
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        } else {
            this.UpdateUITime(false);
        }

        Tween.stopAllByTarget(this.nPrize);

        this.infoUIBase.node.active = false;

        this.PrepareAnim();

        clientEvent.dispatchEvent(EVENT_DASH_RUSH.NOTIFICATION_FORCE_CLOSE);
    }

    public async PrepareDataClose(): Promise<void> {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);

        // in case TryAgain => auto reset event

    }

    public async UIShowDone(): Promise<void> {
        if (this._dataCustom != null && instanceOfIOpenUIBaseWithInfo(this._dataCustom)) {
            this.infoUIBase.Show();
        }
        // SoundSys.Instance.playSoundEffectWithLoop(GameSoundEffect.SOUND_RUSH_BG,1);

        await this.AnimMoveCar();
    }

    public async UICloseDone(): Promise<void> {
        if (this._dataCustom != null && instanceOfIUIKeepTutAndReceiveLobby(this._dataCustom)) {
            clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
        }
        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
    }
    //#endregion base UI
    //=======================================

    //=======================================
    //#region self
    private UpdateUITime(canCheckUpdateUI: boolean = true) {
        // const time = DataEventsSys.Instance.GetTimeGroupEventRemain(TYPE_EVENT_GAME.DASH_RUSH, 1);
        const time = DataDashRush.Instance.GetTimeDisplay();
        if (time <= 0) {
            // ko lắng nghe sự kiện clock time
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
            this.lbTime.string = I18n.t("FINISHED");
            // check có thể cập nhật UI dc không
            if (!this._isEndTime && canCheckUpdateUI && !this._isAnimShowingUI) {
                this._isEndTime = true;
                if (!DataDashRush.Instance.IsEndEventAndPlayerNotWin()) {
                    this.UpdateOtherUIAfterCarMove();
                }
            }
        } else {
            const resultTime = Utils.convertTimeLengthToFormat_ForEvent(time);
            this.lbTime.string = resultTime;
        }
    }

    private ShowPrize() {
        let indexCarWin = DataDashRush.Instance.GetIndexBestScorePlayer();
        let nCar = this.visualCarDashRush[indexCarWin];
        if (nCar == null) { nCar = this.visualCarDashRush[0] }  /// this code is not good because i do not know where make the data wrong so i just cover the bug
        const posYCar = this.visualCarDashRush[indexCarWin].node.position.y;
        this.nPrize.position = new Vec3(this._posXPrizeBase, posYCar + this.distanceYPrize);
        const opaPrize = this.nPrize.getComponent(UIOpacity);

        // show Prize
        tween(this.nPrize)
            .to(this.timeShowPrize, { position: new Vec3(this._posXPrizeBase, posYCar) }, {
                easing: "smooth",
                onUpdate(target, ratio) {
                    opaPrize.opacity = 255 * ratio;
                },
            })
            .start();
    }

    private HideUI() {
        const opaVisual = this.nVisual.getComponent(UIOpacity);
        this.nShadowSelf.Hide();
        tween(this.nVisual)
            .to(this.timeHideUI, {}, {
                onUpdate(target, ratio) {
                    opaVisual.opacity = (1 - ratio) * 255;
                },
            })
            .call(() => { this.nVisual.active = false; })
            .start();
    }

    private ShowUIAgain() {
        const self = this;
        this._isAnimShowingUI = true;
        this._isEndTime = false;
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        }
        this.nShadowSelf.Show();

        // set UI to again
        this.PrepareAnim();

        // anim UI again
        const opaVisual = this.nVisual.getComponent(UIOpacity);
        this.nVisual.active = true;
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        tween(this.nVisual)
            .to(this.timeShowUI, {}, {
                onUpdate(target, ratio) {
                    opaVisual.opacity = ratio * 255;
                },
            })
            .call(async () => {
                await self.AnimMoveCar();
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            })
            .start()
    }

    private async UpdateCarByTime() {
        const posXCarEnd = this.nEndCar.position.x;
        const poxXCarStart = this.nStartCar.position.x;
        const distanceXEachProgress = (posXCarEnd - poxXCarStart) / CONFIG_DR.DR_MAX_PROGRESS;

        let timeMax = 0;

        this.visualCarDashRush.forEach((visual, index) => {
            const dataProgress = this._listDataPlayerRushThisTurnShow[index];
            if (dataProgress != null) {
                const newPorgress = dataProgress.progress
                const endX = poxXCarStart + distanceXEachProgress * newPorgress;
                const time = distanceXEachProgress / this._speedCar;

                if (timeMax < time) timeMax = time;
                visual.MoveByUpdate(endX, time, newPorgress);
            }
        })

        // if someOne win => show prize + btnUpdate
        if (DataDashRush.Instance.GetPlayerMaxScore() != null && !DataDashRush.Instance.IsPlayerWin()) {
            await Utils.delay(timeMax * 1000);
            this.ShowPrize();
            this.nBtnPlay.active = false;
            this.nBtnTryAgain.active = true;
            this.Active1Lb('Lose');
        }
    }

    private Active1Lb(lbActive: 'Lose' | 'Playing' | 'Win') {
        this.nLbLose.active = this.nLbPlaying.active = this.nLbWin.active = false;
        switch (lbActive) {
            case 'Lose': this.nLbLose.active = true; break;
            case 'Playing': this.nLbPlaying.active = true; break;
            case 'Win': this.nLbWin.active = true; break;
        }
    }
    //#endregion self
    //=======================================

    //=======================================
    //#region btn
    private OnBtnInfo() {
        LogEventManager.Instance.logButtonClick(`info`, "UIDashRush");
        this.infoUIBase.Show();
    }

    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIDashRush");
        //trong trường hợp người chơi thua thì khi close cho reset data luôn.
        if (this.nBtnTryAgain.active) {
            DataDashRush.Instance.ResetData();
        }
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_DASH_RUSH, 1);
    }

    private async OnBtnClaim() {
        LogEventManager.Instance.logButtonClick(`claim`, "UIDashRush");
        const prize = DataDashRush.Instance.GetPrize();
        PrizeSys.Instance.AddPrize(prize, "UIDashRush", false, false);

        let isContinueLogicPageHome: boolean = false;
        if (this._dataCustom != null && instanceOfIUIKeepTutAndReceiveLobby(this._dataCustom)) {
            this._dataCustom = null;
            isContinueLogicPageHome = true;
        }

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_DASH_RUSH, 1);

        DataDashRush.Instance.ResetData();
        // call show UIReceive
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.DASH_RUSH, prize, "UIDashRush", null, null, "DASH RUSH");

        // show UI PrepareDashRush
        // let dataSend = null;
        // if (this._dataCustom != null && instanceOfIUIKeepTutAndReceiveLobby(this._dataCustom)) {
        //     dataSend = this._dataCustom;
        //     this._dataCustom = null;
        // }

        // close UI + show Ui prepare
        DataDashRush.Instance.UpdateStateEvent(STATE_DR.DELAY_WIN);
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_DASH_RUSH, 1);
        isContinueLogicPageHome && clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
        // clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_DASH_RUSH_PREPARE, 1, true, dataSend);

        // block UI Until show done
        // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        // await Utils.delay(1 * 1000);
        // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }

    private async OnBtnTryAgain() {
        LogEventManager.Instance.logButtonClick('TryAgain', "UIDashRush");
        DataDashRush.Instance.ResetData(false);

        // // show UI PrepareDashRush
        // let dataSend = null;
        // if (this._dataCustom != null && instanceOfIUIKeepTutAndReceiveLobby(this._dataCustom)) {
        //     dataSend = this._dataCustom;
        //     this._dataCustom = null;
        // }


        // close UI + show Ui prepare
        DataDashRush.Instance.UpdateTimeDelay();
        DataDashRush.Instance.UpdateStateEvent(STATE_DR.DELAY_LOSE);
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_DASH_RUSH, 1);

        // clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_DASH_RUSH_PREPARE, 1, true, dataSend);
        // block UI Until show done
        // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        // await Utils.delay(1 * 1000);
        // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }

    private async OnBtnPlay() {
        LogEventManager.Instance.logButtonClick('Play', "UIDashRush");
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        clientEvent.off(EVENT_DASH_RUSH.UPDATE_BOT_RACE, this.UpdateCarByTime, this)

        // vô luôn game
        await UIPageHomeSys.Instance.PlayGame();
    }

    private async OnClickPrize() {
        const listPrize: IPrize[] = DataDashRush.Instance.GetPrize();
        const wLocShowNotification = this.nPrize.worldPosition.clone();
        clientEvent.dispatchEvent(EVENT_DASH_RUSH.NOTIFICATION_ITEMS
            , Array.from(listPrize)
            , TYPE_BUBBLE.BOTTOM_RIGHT
            , wLocShowNotification
            , false
            , null
            , null
            , new Vec2(110, 130)
        );
    }
    //#endregion btn
    //=======================================

    //=======================================
    //#region Anim DashRush
    public PrepareAnim() {
        const poxXCarStart = this.nStartCar.position.x;
        this.nBtnClaim.active = false;
        this.nBtnTryAgain.active = false;
        this.nBtnPlay.active = false;

        this._listDataPlayerRushThisTurnShow = DataDashRush.Instance.GetDataBot();

        // console.log("data bot", this._listDataPlayerRushThisTurnShow);

        this._listDataPlayerRushThisTurnShow.forEach((player, index) => {
            this.visualCarDashRush[index].PrepareMove(player, poxXCarStart);
        })

        //prize
        this.nPrize.getComponent(UIOpacity).opacity = 0;
    }

    public async AnimMoveCar() {
        const posXCarEnd = this.nEndCar.position.x;
        const poxXCarStart = this.nStartCar.position.x;
        const distanceXEachProgress = (posXCarEnd - poxXCarStart) / CONFIG_DR.DR_MAX_PROGRESS;

        let timeMax = 0;

        this.visualCarDashRush.forEach((visual, index) => {
            const dataPlayerRushThisTurnShow = this._listDataPlayerRushThisTurnShow[index];
            if (dataPlayerRushThisTurnShow != null) {
                const endX = poxXCarStart + distanceXEachProgress * dataPlayerRushThisTurnShow.progress;
                const time = (endX - poxXCarStart) / this._speedCar;

                if (timeMax < time) timeMax = time;
                visual.MoveTo(endX, time);
            }
        })

        if (DataDashRush.Instance.GetMaxScore() > 0) {
            if (DataDashRush.Instance.GetPlayerMaxScore() != null) {
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_RUSH_SPEED_RUN);
            } else {
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_RUSH_PROGRESS);
            }
        }


        await Utils.delay(timeMax * 1000);
        // You can do something in here after move done;

        await this.UpdateOtherUIAfterCarMove();
    }

    private async UpdateOtherUIAfterCarMove() {
        const isHasPlayerMaxScore = DataDashRush.Instance.GetPlayerMaxScore() != null;
        const isEventEndTime = DataDashRush.Instance.IsEndTime();
        // const isGroupEventEndTime = DataEventsSys.Instance.GetTimeGroupEventRemain(TYPE_EVENT_GAME.DASH_RUSH, 1) <= 0;
        const isGroupEventEndTime = DataDashRush.Instance.GetTimeDisplay() <= 0;
        const isPlayerWin = DataDashRush.Instance.IsPlayerWin();
        switch (true) {
            // case win
            case isHasPlayerMaxScore && isPlayerWin:
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_RUSH_WIN);
                this.nBtnClaim.active = true;
                this.Active1Lb('Win');
                clientEvent.off(EVENT_DASH_RUSH.UPDATE_BOT_RACE, this.UpdateCarByTime, this);
                break;
            // case lose
            case (isHasPlayerMaxScore || isEventEndTime) && !isPlayerWin:
            case isGroupEventEndTime:
                this.nBtnTryAgain.active = true;
                this.Active1Lb('Lose');
                clientEvent.off(EVENT_DASH_RUSH.UPDATE_BOT_RACE, this.UpdateCarByTime, this);
                break;
            // case playing
            case !isHasPlayerMaxScore && !isEventEndTime:
                this.nBtnPlay.active = true;
                this.Active1Lb('Playing');
                if (clientEvent.isOnEvent(EVENT_DASH_RUSH.UPDATE_BOT_RACE, this.UpdateCarByTime, this)) {
                    clientEvent.on(EVENT_DASH_RUSH.UPDATE_BOT_RACE, this.UpdateCarByTime, this);
                }
                break;
        }

        this.ShowPrize();

        await Utils.delay(this.timeShowPrize * 1000);
        try {
            this._isAnimShowingUI = false;
        } catch (e) {

        }
    }
    //#endregion Anim DashRush
    //=======================================

    public Close(typeClose?: number): Promise<void> {
        SoundSys.Instance.stopSoundLoop();
        return super.Close(typeClose);
    }
}


