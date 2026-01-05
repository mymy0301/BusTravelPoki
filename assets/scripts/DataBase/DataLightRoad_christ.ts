/**
 * 
 * anhngoxitin01
 * Thu Nov 06 2025 17:51:08 GMT+0700 (Indochina Time)
 * DataLightRoad_christ
 * db://assets/scripts/DataBase/DataLightRoad_christ.ts
*
*/
import { _decorator, Component, Node } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { ReadDataJson } from '../ReadDataJson';
import { CONFIG_LR_CHRIST, IInfoChestLightRoad, IInfoUIUpdateLR } from '../Scene/OtherUI/UIChristmasEvent/LightRoad/TypeLightRoad';
import { Utils } from '../Utils/Utils';
import { clientEvent } from '../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK } from '../Const/MConst';
import { IPrize } from '../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('DataLightRoad_christ')
export class DataLightRoad_christ {
    public static Instance: DataLightRoad_christ = null;
    constructor() {
        if (DataLightRoad_christ.Instance == null) {
            DataLightRoad_christ.Instance = this;
        }
    }

    //=============================================================
    //#region public
    public InitNewEvent(needSaveData: boolean = true) {
        PlayerData.Instance.XMAX_LR_id += 1;
        // PlayerData.Instance.XMAX_LR_isPlayTut = false;
        PlayerData.Instance.XMAX_LR_isReceiveReward = false;
        PlayerData.Instance.XMAX_LR_oldProgressPlayer = PlayerData.Instance.XMAX_LR_progressPlayer = 0;
        PlayerData.Instance.XMAX_LR_timeDelay = 0;
        // kiểm tra nếu thời gian từ ngày hiện tại đến hết tháng 4 hàng năm lơn hơn thời gian active thì ta sẽ set theo thời gian active
        // nếu thời gain còn lại đến đến hết tháng 4 hàng năm ít hơn thời gian active thì ta sẽ set là thời gian còn lại của event
        const yearInit = this.GetYearInitEventNow()
        // const timeDayValid = Utils.getTimeByData(1, CONFIG_LR_CHRIST.DATE_VALID_END_EVENT_MONTH, yearInit);
        // const timeNow = Utils.getCurrTime();
        // const timeRemaining = timeDayValid - timeNow < CONFIG_LR_CHRIST.TIME_ACTIVE ? timeDayValid - timeNow : CONFIG_LR_CHRIST.TIME_ACTIVE;
        // PlayerData.Instance.XMAX_LR_timeEnd = Utils.getCurrTime() + timeRemaining;
        
        const timeRemaining = CONFIG_LR_CHRIST.TIME_ACTIVE;
        PlayerData.Instance.XMAX_LR_timeEnd = Utils.getCurrTime() + timeRemaining;
        
        PlayerData.Instance.XMAX_LR_progressPlayer_listBoolReceivePrize = new Array(CONFIG_LR_CHRIST.MAX_PRIZE).fill(false);
        PlayerData.Instance.XMAX_LR_year_init = yearInit;

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_LightRoad();
        }
    }

    public InitNewLoopForce(needSaveData: boolean) {
        PlayerData.Instance.XMAX_LR_timeEnd = 0;
        PlayerData.Instance.XMAX_LR_timeDelay = 0;
        PlayerData.Instance.XMAX_LR_isReceiveReward = true;
        PlayerData.Instance.XMAX_LR_progressPlayer = 0;  // level player reach
        PlayerData.Instance.XMAX_LR_oldProgressPlayer = 0;
        PlayerData.Instance.XMAX_LR_progressPlayer_listBoolReceivePrize = new Array(CONFIG_LR_CHRIST.MAX_PRIZE).fill(false);

        PlayerData.Instance.XMAX_LR_year_init = this.GetYearInitEventNow();

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_LightRoad();
        }
    }

    public LoadDataFromLoad(needSaveData: boolean = true) {
        // PlayerData.Instance.XMAX_LR_progressPlayer = PlayerData.Instance.XMAX_LR_oldProgressPlayer;
        PlayerData.Instance.XMAX_LR_oldProgressPlayer = PlayerData.Instance.XMAX_LR_progressPlayer;
        this.RegisterTime();

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_LightRoad();
        }
    }

    public GetProgressNow() { return PlayerData.Instance.XMAX_LR_progressPlayer; }
    public GetProgressOld() { return PlayerData.Instance.XMAX_LR_oldProgressPlayer; }
    public GetPrizeByIndex(indexInput: number) {
        const dataRoot = ReadDataJson.Instance.GetDataLightRoad()[indexInput];
        return dataRoot;
    }

    public IncreaseProgress(progressAdd: number, needSaveData: boolean = true) {
        PlayerData.Instance.XMAX_LR_progressPlayer += progressAdd;


        if (needSaveData) {
            PlayerData.Instance.SaveEvent_LightRoad();
        }
    }

    public ReceivePrize(indexPrize: number, needSaveData: boolean = true) {
        PlayerData.Instance.XMAX_LR_progressPlayer_listBoolReceivePrize[indexPrize] = true;
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_LightRoad();
        }
    }

    public UpdateProgressOld(needSaveData: boolean = false) {
        PlayerData.Instance.XMAX_LR_oldProgressPlayer = PlayerData.Instance.XMAX_LR_progressPlayer;
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_LightRoad();
        }
    }

    public GetInfoToShowUI(progress: number): IInfoUIUpdateLR {
        // tìm progress phù hợp
        const indexPrizeRight = this.GetIndexInfoSuitProgress(progress);
        const totalProgress = this.GetProgressMaxUntilIndex(indexPrizeRight - 1);
        const progressRemainNow = progress - totalProgress;
        const infoPrizeIndexReach = this.GetPrizeByIndex(indexPrizeRight);
        const progressRequired = infoPrizeIndexReach.progressRequired;

        const ratioProgress = progressRemainNow / progressRequired;

        const dataInfo = ReadDataJson.Instance.GetDataLightRoad();

        return {
            ratioProgress: ratioProgress > 1 ? 1 : ratioProgress,
            progressNow: progressRemainNow > infoPrizeIndexReach.progressRequired ? infoPrizeIndexReach.progressRequired : progressRemainNow,
            infoPrize: infoPrizeIndexReach,
        }
    }

    public GetIndexLight(progressTarget: number): number {
        // tính theo sô vòng lặp
        const numLoop = Math.floor(progressTarget / CONFIG_LR_CHRIST.MAX_LIGHT);
        const result = numLoop % CONFIG_LR_CHRIST.MAX_IMAGE_LIGHT;
        return result;
    }

    public IsReceivePrizeIndex(index: number): boolean {
        if (index >= 0 && index < PlayerData.Instance.XMAX_LR_progressPlayer_listBoolReceivePrize.length) {
            return PlayerData.Instance.XMAX_LR_progressPlayer_listBoolReceivePrize[index];
        }
        return false;
    }

    public IsPlayedTut() { return PlayerData.Instance.XMAX_LR_isPlayTut; }
    public SavePlayedTut() { PlayerData.Instance.XMAX_LR_isPlayTut = true; PlayerData.Instance.SaveEvent_LightRoad() }

    public IsEventEnd() {
        const isEndTime = this.GetTimeEndEvent() <= 0;
        const isIdInited = PlayerData.Instance.XMAX_LR_id == 0;
        return !isIdInited && isEndTime;
    }

    public GetPrizeTriggerAtHome(): { index: number, listPrize: IPrize[] } {
        // kiểm tra progress sao cho nếu như điểm số người chơi có thể nhận quà của tiến trình trước và quà của tiến trình đấy chưa được nhận thì ta sẽ bắn tự động nhận thưởng ở trong home
        let indexInfo: number = 0;
        const dataInfo = ReadDataJson.Instance.GetDataLightRoad();
        let progressInput = this.GetProgressNow();

        if (progressInput == 0) { return null; }

        for (const dataCheck of dataInfo) {
            progressInput -= dataCheck.progressRequired;
            if (progressInput == 0) {
                break;
            } else if (progressInput < 0) {
                break;
            }
            indexInfo += 1;
        }

        if (progressInput != 0) { return null; }
        const isReceivePrizeAtIndex = this.IsReceivePrizeIndex(indexInfo);
        if (isReceivePrizeAtIndex == null || isReceivePrizeAtIndex) { return null; }
        const infoPrize = this.GetPrizeByIndex(indexInfo);
        if (infoPrize == null) { return null; }
        return {
            index: indexInfo,
            listPrize: infoPrize.listPrize
        }
    }

    public ValidTimeCanInit(): boolean {
        // kiểm tra nếu thời gian phù hợp thì mới trả về true
        // hiện tại chỉ true nếu từ tháng 12, 1, 2, 3
        const monthNow = Utils.getDate().getMonth();
        return CONFIG_LR_CHRIST.MONTH_VALID_INIT.includes(monthNow);
    }

    public ValidTimeCanReInit(): boolean {
        const yearCache = PlayerData.Instance.XMAX_LR_year_init;
        // check year cache để đảm bảo đã từng tạo event rồi nếu không khi user mới chơi sẽ force tạo event liên tục
        if(yearCache > 0 && this.IsEventEnd()){
            if (!this.ValidTimeCanInit()) { return false; }
            if (yearCache == 0) { return true; }
            if (yearCache <= this.GetYearInitEventNow()) { return true; }
        }
        return false;
    }
    //#endregion public

    //=============================================================
    //#region private
    private GetIndexInfoSuitProgress(progressInput: number): number {
        let indexInfo: number = 0;

        const dataInfo = ReadDataJson.Instance.GetDataLightRoad();

        for (const dataCheck of dataInfo) {
            progressInput -= dataCheck.progressRequired;
            if (progressInput == 0) {
                indexInfo += 1;
                break;
            } else if (progressInput < 0) {
                break;
            }
            indexInfo += 1;
        }

        if (indexInfo >= CONFIG_LR_CHRIST.MAX_PRIZE) { indexInfo = CONFIG_LR_CHRIST.MAX_PRIZE - 1 }

        return indexInfo;
    }

    private GetProgressMaxUntilIndex(indexChoice: number): number {
        const dataInfo = ReadDataJson.Instance.GetDataLightRoad();
        let result = 0;
        for (let i = 0; i < CONFIG_LR_CHRIST.MAX_PRIZE && i <= indexChoice; i++) {
            const dataCheck = dataInfo[i];
            result += dataCheck.progressRequired;
        }

        return result;
    }

    public GetYearInitEventNow(): number {
        const dateNow = Utils.getDate();
        const monthNow = dateNow.getMonth();
        let yearNow = dateNow.getFullYear();
        if (monthNow == 11) {
            yearNow = yearNow + 1;
        }

        return yearNow;
    }
    //#endregion private

    //=============================================================
    //#region time
    public GetTimeEndEvent(): number { return PlayerData.Instance.XMAX_LR_timeEnd - Utils.getCurrTime(); }

    private RegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.IncreaseTime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.IncreaseTime, this);
        }
    }

    private UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.IncreaseTime, this);
    }

    private IncreaseTime() {
        // check is end time 
        // => if end => change State to wait to receive prize
        if (this.GetTimeEndEvent() <= 0) {
            this.UnRegisterTime();
        }
    }
    //#endregion time
}