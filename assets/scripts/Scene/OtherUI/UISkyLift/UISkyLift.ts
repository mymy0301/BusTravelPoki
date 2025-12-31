/**
 * 
 * anhngoxitin01
 * Wed Aug 27 2025 09:23:23 GMT+0700 (Indochina Time)
 * UISkyLift
 * db://assets/scripts/Scene/OtherUI/UISkyLift/UISkyLift.ts
*
*/
import { _decorator, Component, Label, Node, randomRangeInt, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { Utils } from '../../../Utils/Utils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { NotiSkyLiftSys } from './NotiSkyLiftSys';
import { CarSkyLift } from './CarSkyLift';
import { CONFIG_SL, instanceOfIOpenNewEvent, IOpenNewEvent, STATE_SL } from './TypeSkyLift';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
import * as I18n from 'db://i18n/LanguageData';
import { instanceOfIUIKeepTutAndReceiveLobby, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { ScrollViewSkyLift } from './ScrollViewSkyLift';
const { ccclass, property } = _decorator;

@ccclass('UISkyLift')
export class UISkyLift extends UIBaseSys {
    @property(NotiSkyLiftSys) notiSkyLiftSys: NotiSkyLiftSys;
    @property(InfoUIBase) infoUIBase: InfoUIBase;
    @property(CarSkyLift) carSkyLift: CarSkyLift;
    @property(ScrollViewSkyLift) scrollViewSkyLift: ScrollViewSkyLift;
    @property(Label) lbTime: Label;
    @property(Node) nBlockUI: Node;
    @property(Node) nBtnContinue: Node;
    @property(Node) nBtnCLose2: Node;
    @property(Node) nBtnClose: Node;

    private readonly TIME_SCROLL_INTRO: number = 1.8;
    private readonly TIME_DELAY_SCROLL_INTRO: number = 0.3;

    //==========================================
    //#region base
    protected onLoad(): void {
        this.scrollViewSkyLift.listFloorBase.InitMap();
    }

    protected onEnable(): void {
        super.onEnable();
        this.RegisterTime();
    }

    protected onDisable(): void {
        this.UnRegisterTime();
    }

    public async PrepareDataShow(): Promise<void> {
        // register event
        this.scrollViewSkyLift.RegisterEvent();

        // hide the ui
        this.infoUIBase.node.active = false;
        // hide noti
        this.notiSkyLiftSys.HideNoti();

        // set progress
        this.scrollViewSkyLift.listFloorBase.SetUpDataToMap(DataSkyLiftSys.Instance.ProgressOld);


        let dataOpenNewEvent: IOpenNewEvent = null;
        if (this._dataCustom != null && this._dataCustom.length > 0) {
            dataOpenNewEvent = this._dataCustom.find(dataCheck => instanceOfIOpenNewEvent(dataCheck));
        }

        switch (true) {
            /**- kiểm tra nếu như là lần đầu mở event từ việc tạo event mới thông qua dataCustom
            * nếu đúng thì ta phải set UI trượt lên trên trước sau đó trượt dần xuống dưới để hiển thị UI
            */
            case dataOpenNewEvent != null:
                if (dataOpenNewEvent.openNewEvent) {
                    this.scrollViewSkyLift.ScrollToProgress(CONFIG_SL.MAX_PROGRESS, true);
                }
                break;
            //**- trường hợp thua */
            case DataSkyLiftSys.Instance.ProgressOld > DataSkyLiftSys.Instance.ProgressNow:
                const progressShow = DataSkyLiftSys.Instance.ProgressNow + 1 > CONFIG_SL.MAX_PROGRESS ? CONFIG_SL.MAX_PROGRESS : DataSkyLiftSys.Instance.ProgressNow + 1;
                this.scrollViewSkyLift.ScrollToProgress(progressShow, true);
                break;
            //**- trường hợp bình thường*/
            case DataSkyLiftSys.Instance.ProgressOld == DataSkyLiftSys.Instance.ProgressNow:
                this.scrollViewSkyLift.ScrollToProgress(DataSkyLiftSys.Instance.ProgressOld, true);
                break;
            //**- trường hợp win*/
            case DataSkyLiftSys.Instance.ProgressOld < DataSkyLiftSys.Instance.ProgressNow:
                this.scrollViewSkyLift.ScrollToProgress(DataSkyLiftSys.Instance.ProgressNow, true);
                // update state
                if (DataSkyLiftSys.Instance.ProgressNow == CONFIG_SL.MAX_PROGRESS) {
                    DataSkyLiftSys.Instance.UpdateState(STATE_SL.WAIT_TO_RECEIVE);
                }
                break;
        }

        // set the car to right pos
        const wPosSetCar = this.scrollViewSkyLift.listFloorBase.GetWPosToSetCarWithProgress(DataSkyLiftSys.Instance.ProgressOld);
        this.carSkyLift.SetWPos(wPosSetCar);

        // hide btn continue
        this.nBtnContinue.active = false;

        // hide btn close 2
        this.nBtnCLose2.active = false;

        // kiểm tra nếu trong trường hợp đang đợi nhận thưởng thì event sẽ ẩn button close đi
        this.nBtnClose.active = DataSkyLiftSys.Instance.STATE != STATE_SL.WAIT_TO_RECEIVE;
    }

    public async UIShowDone(): Promise<void> {
        this.nBlockUI.active = true;

        let dataOpenNewEvent: IOpenNewEvent = null;
        if (this._dataCustom != null && this._dataCustom.length > 0) {
            dataOpenNewEvent = this._dataCustom.find(dataCheck => instanceOfIOpenNewEvent(dataCheck));
        }

        switch (true) {
            /**trường hợp mới mở event */
            case dataOpenNewEvent != null:
                await Utils.delay(this.TIME_DELAY_SCROLL_INTRO * 1000);
                if (dataOpenNewEvent.openNewEvent) {
                    this.scrollViewSkyLift.ScrollToProgressCustom(0, false, this.TIME_SCROLL_INTRO, 'cubicInOut');
                    await Utils.delay(this.TIME_SCROLL_INTRO * 1000);
                    this.infoUIBase.Show();
                }
                break;
            /**trường hợp old */
            case DataSkyLiftSys.Instance.ProgressNow < DataSkyLiftSys.Instance.ProgressOld:
                await this.DecreaseProgress();
                break;
            /**trường hợp win */
            case DataSkyLiftSys.Instance.ProgressNow > DataSkyLiftSys.Instance.ProgressOld:
                await this.IncreaseProgress();
                break;
            default:
                break;
        }

        // try show btn continue
        if (DataSkyLiftSys.Instance.STATE == STATE_SL.WAIT_TO_RECEIVE) {
            this.nBtnContinue.active = true;
        }else {
            this.nBtnCLose2.active = true;
        }

        this.nBlockUI.active = false;
    }

    public async PrepareDataClose(): Promise<void> {
        DataSkyLiftSys.Instance.TryEndGameByFullScore(false);
    }

    public async UICloseDone(): Promise<void> {
        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
        if (this._dataCustom != null && this._dataCustom.length > 0) {
            const dataKeepTut = this._dataCustom.find(dataAny => instanceOfIUIKeepTutAndReceiveLobby(dataAny))
            if (dataKeepTut != null) {
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
            }
        }
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private async IncreaseProgress() {
        const newProgress = DataSkyLiftSys.Instance.ProgressNow;
        const wPosCarMoveTo: Vec3 = this.scrollViewSkyLift.listFloorBase.GetWPosToSetCarWithProgress(newProgress);

        // ở đây chúng ta sẽ tính toán để nhận thưởng luôn
        DataSkyLiftSys.Instance.TryReceivePrize(false);
        DataSkyLiftSys.Instance.UpdateProgressOld();

        await Promise.all([
            // increase progress
            this.scrollViewSkyLift.listFloorBase.IncreaseProgress(newProgress),
            // fly up the car
            this.carSkyLift.FlyUpToWPos(wPosCarMoveTo)
        ]);

        //update list prize đã nhận
        DataSkyLiftSys.Instance.UpdateListPrizeReceived();
    }
    private async DecreaseProgress() {
        const newProgress = DataSkyLiftSys.Instance.ProgressNow;
        const oldProgress = DataSkyLiftSys.Instance.ProgressOld;
        const wPosCarMoveTo: Vec3 = this.scrollViewSkyLift.listFloorBase.GetWPosToSetCarWithProgress(newProgress);

        // const indexFloorOld = DataSkyLiftSys.Instance.GetIndexFloorProgress(oldProgress);
        // const indexFloorNew = DataSkyLiftSys.Instance.GetIndexFloorProgress(newProgress);
        // const distanceFloor = indexFloorOld - indexFloorNew;
        // const distanceLevel = oldProgress - newProgress;

        DataSkyLiftSys.Instance.UpdateProgressOld();

        const oldWPosCar = this.scrollViewSkyLift.listFloorBase.GetWPosToSetCarWithProgress(oldProgress);
        const nowWPosCar = this.scrollViewSkyLift.listFloorBase.GetWPosToSetCarWithProgress(newProgress);
        const distanceProgress = oldWPosCar.y - nowWPosCar.y;
        const timeDropCar = distanceProgress / CONFIG_SL.SPEED_DROP;

        await Promise.all([
            // increase progress
            this.scrollViewSkyLift.listFloorBase.DecreaseProgress(oldProgress, newProgress, timeDropCar),
            // fly up the car
            this.carSkyLift.DropToWPos(wPosCarMoveTo, timeDropCar)
        ]);
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region time
    private RegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        }
    }

    private UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }

    private UpdateUITime() {
        const timeShow = DataSkyLiftSys.Instance.GetTimeDisplay();
        if (timeShow < 0) {
            this.UnRegisterTime();
            this.lbTime.string = I18n.t("FINISHED");
        } else {
            this.lbTime.string = Utils.convertTimeLengthToFormat(timeShow);
        }
    }
    //#endregion time
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    public OnBtnInfo() {
        LogEventManager.Instance.logButtonClick(`info`, "UISkyLift");
        this.infoUIBase.Show();
    }
    public OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UISkyLift");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SKY_LIFT, 1);
    }
    public OnBtnContinue() {
        //log event
        LogEventManager.Instance.logButtonClick(`continue`, "UISkyLift");
        const paramToLogEvent = DataSkyLiftSys.Instance.GetParamToLogThisEvent();
        if(paramToLogEvent != null){
            LogEventManager.Instance.logEventEnd(TYPE_EVENT_GAME.SKY_LIFT, paramToLogEvent.progress_event, paramToLogEvent.num_play_event);
        }

        DataSkyLiftSys.Instance.SetReceivePrizeEndEvent();
        DataSkyLiftSys.Instance.UpdateStateAfterContinueUI();
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SKY_LIFT, 1);
        if (DataSkyLiftSys.Instance.GetTimeDisplay_Delay() > 0) {
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SKY_LIFT_DELAY, 1);
        } else {
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SKY_LIFT_PREPARE, 1);
        }
    }
    //#endregion btn
    //==========================================

    // //==========================================
    // //#region test
    // public async Test_PreShow_FirstTime() {
    //     const ioNewEvent: IOpenNewEvent = { openNewEvent: true };
    //     this._dataCustom = [ioNewEvent];
    //     this.PrepareDataShow();
    // }

    // public async Test_DropProgress(event: Event, customEventData: string) {

    //     if (customEventData != null && customEventData != "") {
    //         let scrollSet = 0;
    //         try {
    //             scrollSet = Number.parseInt(customEventData);
    //         } catch (e) {
    //             return;
    //         }

    //         // set scroll và scroll đến progress cần thiết
    //         PlayerData.Instance.SL_progressPlayer = scrollSet;
    //         DataSkyLiftSys.Instance.UpdateProgressOld();
    //         DataSkyLiftSys.Instance.LoseGame(false);
    //         this.scrollViewSkyLift.ScrollToProgress(DataSkyLiftSys.Instance.ProgressNow, true);
    //     } else {
    //         DataSkyLiftSys.Instance.LoseGame(false);
    //         this.scrollViewSkyLift.ScrollToProgress(DataSkyLiftSys.Instance.ProgressOld, true);
    //     }

    //     await this.DecreaseProgress();
    // }

    // public Test_showDone() {
    //     this.UIShowDone();
    // }

    // public Test_scrollToOffsetForce() {
    //     const progressTest = randomRangeInt(0, CONFIG_SL.MAX_PROGRESS);
    //     console.log("test", progressTest);
    //     this.scrollViewSkyLift.ScrollToProgress(progressTest, true);
    // }

    // public Test_scrollToOffSet() {
    //     const progressTest = randomRangeInt(0, CONFIG_SL.MAX_PROGRESS);
    //     console.log("test2", progressTest);
    //     this.scrollViewSkyLift.ScrollToProgress(progressTest, false);
    // }

    // public async Test_IncreaseProgress() {
    //     PlayerData.Instance.SL_progressPlayer += 1;
    //     this.IncreaseProgress();
    // }

    // public CheatLevel() {
    //     // PlayerData.Instance.SL_old_progressPlayer = 58;
    //     // PlayerData.Instance.SL_progressPlayer = 59;
    //     // PlayerData.Instance.SL_listBoolReceivePrize = new Array(CONFIG_SL.MAX_PRIZE_HAS).fill(false);
    //     // DataSkyLiftSys.Instance.UpdateListPrizeReceived();
    //     // DataSkyLiftSys.Instance.UpdateProgressOld();

    //     PlayerData.Instance.SL_old_progressPlayer = PlayerData.Instance.SL_progressPlayer = 1;
    // }
    // //#endregion test
    // //==========================================
}