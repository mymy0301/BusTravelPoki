import { _decorator, Component, Node, randomRangeInt } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { PlayerData } from '../Utils/PlayerData';
import { Utils } from '../Utils/Utils';
import { ReadDataJson } from '../ReadDataJson';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
import { LogEventManager } from '../LogEvent/LogEventManager';
import { CheatingSys } from '../Scene/CheatingSys';
import { IInfoPrizeProgressSpin, IInfoPrizeSpin, IPrize, TYPE_EVENT_GAME } from '../Utils/Types';
import { MConfigs } from '../Configs/MConfigs';
import { RandomSys } from '../Utils/RandomSys';
const { ccclass, property } = _decorator;

@ccclass('DataSpinSys')
export class DataSpinSys {
    // player will have free spin each day and 3 watch ads to spin 
    // when player have max spin => hide the node spin
    public static Instance: DataSpinSys = null;
    private idRegisterNewDay: number = -1;

    constructor() {
        if (DataSpinSys.Instance == null) {
            DataSpinSys.Instance = this;
            clientEvent.on(MConst.EVENT_SPIN.EVENT_CHECK_NEW_DAY, this.SetUp, this);
        }
    }

    //#region self func
    /*
    * this will be only call onload of PageHomeSys
    * and when pageHome is open
    */
    private SetUp() {
        const timeGenSpin = PlayerData.Instance._infoEventSpin.timeGen;

        // console.log(timeGenSpin, Utils.compareDateIsNextDay(timeGenSpin),this.HasFreeSpinToday() );

        // check is new week
        if (Utils.compareDateIsPassWeek(timeGenSpin)) {
            PlayerData.Instance._numPrizeSpecialCanReceive = 1;
        }

        // check is new day
        if (timeGenSpin == 0 || Utils.compareDateIsNextDay(timeGenSpin) || CheatingSys.Instance.IsAutoResetSpin) {
            // kiểm tra xem thời gian của người chơi đã phải thuộc về tuần cũ hay chưa , nếu đã thuộc về tuần cũ thì ta sẽ reset lại việc có thể nhận phần thưởng đặc biệt
            if (Utils.compareDateIsPassWeek(timeGenSpin)) {
                PlayerData.Instance._numPrizeSpecialCanReceive = 1;
                this.IncreaseIdPrizeSpin();
            }

            PlayerData.Instance._numUseAdsSpin = 0;
            PlayerData.Instance._infoEventSpin.timeGen = Utils.getTimeToDayUTC();
            PlayerData.Instance._isUseFreeSpin = false;
            PlayerData.Instance.SaveEvent_Spin();
        }

        if (this.idRegisterNewDay == -1) {
            // register listener new day
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.CheckNewDay, this);
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.CheckNewDay, this);
        }

    }

    private CheckNewDay() {
        const timeGenSpin = PlayerData.Instance._infoEventSpin.timeGen;

        if (Utils.compareDateIsNextDay(timeGenSpin)) {
            clientEvent.dispatchEvent(MConst.EVENT_SPIN.UPDATE_UI_SPIN);
        }

        if (!this.HasFreeSpinToday()) {
            const timeReduceNewSpin = (Utils.getTimeLastDayUTCWithTime(timeGenSpin) - Utils.getCurrTime() * 1000);
            if (timeReduceNewSpin > 0) {
                clientEvent.dispatchEvent(MConst.EVENT_SPIN.UPDATE_LABEL_TIME_REDUCE_NEW_SPIN, Utils.convertTimeLengthToFormat(Math.floor(timeReduceNewSpin / 1000)));
            }
        } else {
            clientEvent.dispatchEvent(MConst.EVENT_SPIN.HIDE_LABEL_REDUCE_SPIN_LOBBY);
        }
    }

    private TryHideEvent() {
        if (this.IsMaxSpinAdsToday() && !this.HasFreeSpinToday()) {
            clientEvent.dispatchEvent(MConst.EVENT_SPIN.HIDE_SPIN, TYPE_EVENT_GAME.SPIN);
        }
    }
    //#endregion

    //#region common func
    public useSpinAds() {
        LogEventManager.Instance.logSpinAD();
        this.IncreaseProgress(false);
        PlayerData.Instance._numUseAdsSpin += 1;
        PlayerData.Instance._timeLastWatchAdsSpin = Utils.getCurrTime();
        PlayerData.Instance.SaveEvent_Spin();
    }

    public useSpinFree() {
        LogEventManager.Instance.logSpinFree();
        this.IncreaseProgress(false);
        PlayerData.Instance._isUseFreeSpin = true;
        PlayerData.Instance.SaveEvent_Spin();
    }

    public HasFreeSpinToday(): boolean {
        return !PlayerData.Instance._isUseFreeSpin;
    }

    public getNumSpinAdsTodayWasUse(): number {
        return PlayerData.Instance._numUseAdsSpin;
    }

    public IsMaxSpinAdsToday(): boolean {
        return this.getNumSpinAdsTodayWasUse() >= MConfigs.MAX_SPIN_ADS_PER_DAY;
    }

    public IsMaxSpinToday(): boolean {
        return !this.HasFreeSpinToday() && this.IsMaxSpinAdsToday();
    }

    public GetListPrizeToday(indexPrizeSpe: number): IInfoPrizeSpin[] {
        const prizeSpinNormal: IInfoPrizeSpin[] = ReadDataJson.Instance.GetListPrizeSpin();
        const listPrizeSpeSpin = ReadDataJson.Instance.GetListPrizeSpinSpecialSlot();
        if (indexPrizeSpe > listPrizeSpeSpin.length - 1 || indexPrizeSpe < 0) indexPrizeSpe = 0;
        let lastPrizeSpinSpecial: IInfoPrizeSpin = listPrizeSpeSpin[indexPrizeSpe];

        // kiểm tra trong trường hợp không thể roll ra vật phẩm đặc biệt => nếu ko thể thì chỉnh sửa rate lại thành 0
        if (!this.IsSpecialPrizeUnlock()) {
            lastPrizeSpinSpecial.rate = 0;
        }

        return [lastPrizeSpinSpecial, ...prizeSpinNormal];
    }

    public randomPrizeReceiveSpin(listInfoPrize: IInfoPrizeSpin[]): number {
        const listRate: number[] = listInfoPrize.map(value => value.rate);
        const maxIndexResult = listRate.length;
        let indexResult: number = RandomSys.randomRatio(listRate);
        return indexResult < 0 || indexResult >= maxIndexResult ? maxIndexResult : indexResult;
    }

    public getTimeLastUseSpinAds(): number {
        return PlayerData.Instance._timeLastWatchAdsSpin;
    }
    //#endregion


    //#region Progress spin
    public getJsonProgressSpin(): IInfoPrizeProgressSpin[] {
        return ReadDataJson.Instance.GetListPrizeProgressSpin();
    }

    public IncreaseProgress(needSaveData: boolean = false) {
        PlayerData.Instance._infoEventSpin.progress += 1;
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_Spin();
        }
    }
    public ProgressSpinNow(): number {
        return PlayerData.Instance._infoEventSpin.progress;
    }
    public IsPrizeProgressWasReceive(index: number): boolean {
        return PlayerData.Instance._listPrizeSpinIsReceive[index];
    }
    public GetPrizeProgressAtIndex(index: number): IPrize[] {
        return Array.from(ReadDataJson.Instance.GetListPrizeProgressSpin()[index].listItem);
    }
    public ClaimPrizeProgress(index: number) {
        PlayerData.Instance._listPrizeSpinIsReceive[index] = true;
        PlayerData.Instance.SaveEvent_Spin();
    }

    public LogicCheckIndexPrizeProgressCanReceived(progress: number): number {
        let indexPrizeNotReceivedYet = 0;
        const listJsonSpin = ReadDataJson.Instance.GetListPrizeProgressSpin();
        if (progress >= listJsonSpin[listJsonSpin.length - 1].progress) {
            indexPrizeNotReceivedYet = 4;
        } else if (progress >= listJsonSpin[listJsonSpin.length - 2].progress) {
            indexPrizeNotReceivedYet = 3;
        } else if (progress >= listJsonSpin[listJsonSpin.length - 3].progress) {
            indexPrizeNotReceivedYet = 2;
        } else if (progress >= listJsonSpin[listJsonSpin.length - 4].progress) {
            indexPrizeNotReceivedYet = 1;
        } else if (progress >= listJsonSpin[listJsonSpin.length - 5].progress) {
            indexPrizeNotReceivedYet = 0;
        } else {
            indexPrizeNotReceivedYet = -1;
        }

        return indexPrizeNotReceivedYet;
    }

    public IsPrizeProgressCanReceivedButNotReceived(): boolean {
        // logic get progress => check can receive or not => check prize is received or not
        const progressNow = this.ProgressSpinNow();
        const indexPrizeCanReceived = this.LogicCheckIndexPrizeProgressCanReceived(progressNow);
        if (indexPrizeCanReceived == -1) return false;

        let result = false;
        for (let i = 0; i <= indexPrizeCanReceived; i++) {
            if (!PlayerData.Instance._listPrizeSpinIsReceive[i]) {
                result = true;
                break;
            }
        }

        return result;
    }

    public GetMaxSpin(): number {
        return this.getJsonProgressSpin()[this.getJsonProgressSpin().length - 1].progress;
    }

    public Reset30DaySpin() {
        PlayerData.Instance._infoEventSpin.progress -= 30;
        PlayerData.Instance._listPrizeSpinIsReceive.fill(false, 0, PlayerData.Instance._listPrizeSpinIsReceive.length);
        PlayerData.Instance.SaveEvent_Spin();
    }

    public IsSpecialPrizeUnlock(): boolean {
        return PlayerData.Instance._numPrizeSpecialCanReceive > 0;
    }

    public ReceveiSpecialItem() {
        PlayerData.Instance._numPrizeSpecialCanReceive -= 1;
        PlayerData.Instance.SaveEvent_Spin();
    }

    //#endregion Progress spin

    // #region new Logic
    public GetIndexPrizeSpeSlotSpinToday(): number {
        const idSpinNow = PlayerData.Instance._infoEventSpin.id;
        const listPrizeSpeSpin = ReadDataJson.Instance.GetListPrizeSpinSpecialSlot();
        return idSpinNow % listPrizeSpeSpin.length;
    }

    public IncreaseIdPrizeSpin() {
        PlayerData.Instance._infoEventSpin.id += 1;
    }

    public GetIdPrizeSpeSpin(): number {
        return PlayerData.Instance._infoEventSpin.id;
    }
    // #endregion new Logic
}


