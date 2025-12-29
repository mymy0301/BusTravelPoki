import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { CONFIG_LPr, EVENT_LEVEL_PROGRESS, InfoPrizeLevelProgressionJSON, STATE_EVENT_LEVEL_PROGRESS, STATE_ITEM_LPr } from '../Scene/OtherUI/UILevelProgression/TypeLevelProgress';
import { ReadDataJson } from '../ReadDataJson';
import { Utils } from '../Utils/Utils';
import { MConfigResourceUtils } from '../Utils/MConfigResourceUtils';
import { clientEvent } from '../framework/clientEvent';
import { FlatListListIPrize, GetMColorByNumber, IPrize, M_COLOR, TYPE_EVENT_GAME, TYPE_PRIZE } from '../Utils/Types';
import { ReadMapJson } from '../MJson/ReadMapJson';
import { MConfigs } from '../Configs/MConfigs';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
import { DataLobbyJsonSys } from '../Scene/DataLobbyJsonSys';
const { ccclass, property } = _decorator;

@ccclass('DataLevelProgressionSys')
export class DataLevelProgressionSys {
    public static Instance: DataLevelProgressionSys = null;

    constructor() {
        if (DataLevelProgressionSys.Instance == null) {
            DataLevelProgressionSys.Instance = this;
        }
    }

    /*═══════════════════════════════════════════════════
    ║                          BASE                     ║
    ═══════════════════════════════════════════════════*/
    //#region base
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    private GetIndexPrizeSuitProgress(progress: number, indexPrizeLimitCheck: number = 999): { totalProgressPass: number, tempProgressCheck: number, indexCheck: number } {
        const allDataPrize = this.GetAllDataPrizeJson();

        let totalProgressPass = 0;
        let tempProgressCheck = progress;
        let indexCheck = 0;

        // loop to check progress
        for (let i = 0; i < allDataPrize.length && i <= indexPrizeLimitCheck; i++) {
            const prizeCheck = allDataPrize[i];
            const maxProgressNeed = prizeCheck.require_progress;
            indexCheck = i;
            if (i != indexPrizeLimitCheck && (tempProgressCheck - maxProgressNeed) >= 0) {
                totalProgressPass += maxProgressNeed;
                tempProgressCheck -= maxProgressNeed;
            } else {
                break;
            }
        }

        return { totalProgressPass: totalProgressPass, tempProgressCheck: tempProgressCheck, indexCheck: indexCheck }
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region state
    private stateEventLevelProgression: STATE_EVENT_LEVEL_PROGRESS = STATE_EVENT_LEVEL_PROGRESS.LOCK; public get STATE() { return this.stateEventLevelProgression; }

    /**
     * This func will be call 
     * in the loading scene
     * in the pageHome after receive all prizes done
     * @param isPlayTutEvent 
     */
    public UpdateStateEvent(isPlayTutEvent: boolean) {
        const isEndEvent = this.IsEndEvent();

        switch (true) {
            case !isPlayTutEvent:
                this.ChangeStateEvent(STATE_EVENT_LEVEL_PROGRESS.LOCK);
                // console.log("Change state to lock");
                break;
            case (isEndEvent && this.IsReceivedPrizeAuto()) || (isEndEvent && !this.IsReceivedPrizeAuto() && !this.HadPrizeNotReceive()):
                this.ChangeStateEvent(STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_JOIN);
                // console.log("Change state to wait to join");
                break;
            case isEndEvent && !this.IsReceivedPrizeAuto() && this.HadPrizeNotReceive():
                this.ChangeStateEvent(STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_RECEIVE_END_EVENT);
                // console.log("Change state to receive end event");
                break;
            default:
                this.ChangeStateEvent(STATE_EVENT_LEVEL_PROGRESS.JOINING);
                // console.log("Change state to joining");
                this.RegisterTime();
                break;
        }
    }

    public ChangeStateEvent(newState: STATE_EVENT_LEVEL_PROGRESS) {
        if (this.stateEventLevelProgression == newState) return;
        this.stateEventLevelProgression = newState;

        switch (newState) {
            case STATE_EVENT_LEVEL_PROGRESS.JOINING: case STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_JOIN:
                // emit update UI
                clientEvent.dispatchEvent(EVENT_LEVEL_PROGRESS.UPDATE_UI_LEVEL_PROGRESSION);
                break;
        }
    }
    //#endregion state
    //==========================================

    //==========================================
    //#region time
    /**
     * This func call in 
     * update state event
     * init new event
     */
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
        if (this.IsEndEvent()) {
            this.UnRegisterTime();
            this.ChangeStateEvent(STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_RECEIVE_END_EVENT);
        }
    }
    //#endregion time
    //==========================================

    //==========================================
    //#region public
    public GetIdEventNow(): number { return PlayerData.Instance.LPr_id % CONFIG_LPr.MAX_KEY; }
    public GetProgressNow(): number { return PlayerData.Instance.LPr_progress; }

    public IsReceivePrize(data: InfoPrizeLevelProgressionJSON): boolean { return PlayerData.Instance.LPr_prizeClaimed[data.index - 1]; }

    public IsReceiveAllPrize(){
        return PlayerData.Instance.LPr_prizeClaimed.every(item => item);
    }

    public GetAllDataPrizeJson(): InfoPrizeLevelProgressionJSON[] {
        return ReadDataJson.Instance.GetDataLevelProgression();
    }

    public GetProgressPrizeFromData(dataJson: InfoPrizeLevelProgressionJSON): number {
        const progressNow = this.GetProgressNow();
        const idPrizeValid = dataJson.index - 1;
        let totalProgressPass = 0;
        let tempProgressCheck = progressNow;
        let indexCheck = 0;

        // loop to check progress
        const dataCheck = this.GetIndexPrizeSuitProgress(progressNow, idPrizeValid);
        totalProgressPass = dataCheck.totalProgressPass;
        tempProgressCheck = dataCheck.tempProgressCheck;
        indexCheck = dataCheck.indexCheck;

        switch (true) {
            case indexCheck == idPrizeValid && tempProgressCheck < dataJson.require_progress:
                return tempProgressCheck;
            case indexCheck < idPrizeValid:
                return 0;
            default:
                return dataJson.require_progress;
        }
    }

    public GetInfoToShowUI(progress: number): { progressRemaining: number, progressTotal: number, levelReach: number } {
        const allDataPrize = this.GetAllDataPrizeJson();

        let totalProgressPass = 0;
        let tempProgressCheck = progress;
        let indexCheck = 0;

        const dataCheck = this.GetIndexPrizeSuitProgress(progress);
        totalProgressPass = dataCheck.totalProgressPass;
        tempProgressCheck = dataCheck.tempProgressCheck;
        indexCheck = dataCheck.indexCheck;

        const prizeReach = allDataPrize[indexCheck];

        switch (true) {
            // case full progress
            case indexCheck == allDataPrize.length - 1:
                return { progressRemaining: prizeReach.require_progress, progressTotal: prizeReach.require_progress, levelReach: allDataPrize.length }
            // case progress
            default:
                return { progressRemaining: tempProgressCheck, progressTotal: prizeReach.require_progress, levelReach: allDataPrize[indexCheck].index }
        }
    }

    public GetStatePrize(dataJson: InfoPrizeLevelProgressionJSON): STATE_ITEM_LPr {
        const progressReach = this.GetProgressPrizeFromData(dataJson);
        switch (true) {
            case progressReach == dataJson.require_progress && !this.IsReceivePrize(dataJson): return STATE_ITEM_LPr.WAIT_TO_CLAIM;
            case this.IsReceivePrize(dataJson): return STATE_ITEM_LPr.CLAIMED;
            default: return STATE_ITEM_LPr.CAN_NOT_CLAIM;
        }
    }

    public ReceivePrize(dataJson: InfoPrizeLevelProgressionJSON, needSaveData: boolean = true) {
        PlayerData.Instance.LPr_prizeClaimed[dataJson.index - 1] = true;
        PlayerData.Instance.SaveEvent_LevelProgression(needSaveData);
    }

    public GetTimeDisplay(): number {
        if (this.IsEndEvent()) return -1;
        const result = PlayerData.Instance.LPr_timeEnd - Utils.getCurrTime();
        return result;
    }

    public IsEndEvent(): boolean {
        return Utils.getCurrTime() >= PlayerData.Instance.LPr_timeEnd;
    }

    public InitNewEvent(needSaveData: boolean = true) {
        PlayerData.Instance.LPr_id += 1;
        PlayerData.Instance.LPr_timeEnd = Utils.getCurrTime() + CONFIG_LPr.TIME_LONG_EVENT;
        PlayerData.Instance.LPr_prizeClaimed = new Array(CONFIG_LPr.MAX_PRIZE_LEVEL_PROGRESSION).fill(false);
        PlayerData.Instance.LPr_progress = 0;
        PlayerData.Instance.LPr_isReceivedPrizeWhenEndEvent = false;
        PlayerData.Instance.LPr_timeDistanceCustom = 0;
        DataLobbyJsonSys.Instance.SaveLevelProgression(0, false);

        PlayerData.Instance.SaveEvent_LevelProgression(needSaveData);


        this.ChangeStateEvent(STATE_EVENT_LEVEL_PROGRESS.JOINING);
        this.RegisterTime();

        clientEvent.dispatchEvent(EVENT_LEVEL_PROGRESS.INIT_NEW_EVENT);
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.LEVEL_PROGRESSION);
    }

    public GetSfKeyEvent(keyCustom: number = -1): Promise<SpriteFrame> {
        const keyIdNow = keyCustom == -1 ? this.GetIdEventNow() : keyCustom % CONFIG_LPr.MAX_KEY;
        return MConfigResourceUtils.GetImageKeyLPr(keyIdNow);
    }

    public GetContentEventNow(idEvent: number): string {
        const keyChoice = idEvent % CONFIG_LPr.MAX_KEY;
        switch (keyChoice) {
            case 0: return "BLACK'S ADVENTURE";
            case 1: return "RED'S ADVENTURE";
            case 2: return "YELLOW'S ADVENTURE";
            case 3: return "GREEN'S ADVENTURE";
            case 4: return "PURPLE'S ADVENTURE";
            case 5: return "CYAN'S ADVENTURE";
            case 6: return "PINK'S ADVENTURE";
            case 7: return "BLUE'S ADVENTURE";
            case 8: return "ORANGE'S ADVENTURE";
            case 9: return "MINT'S ADVENTURE";
            default: return "RED'S ADVENTURE";
        }
    }

    public GetColorCarSuitForKey(idEvent: number): M_COLOR {
        // cần phải trừ 1 idEvent ở đây vì idEvent bắt đầu sau khi unlock là từ 1
        const keyChoice = (idEvent - 1) % 10;
        switch (keyChoice) {
            case 0: return M_COLOR.RED;
            case 1: return M_COLOR.YELLOW;
            case 2: return M_COLOR.GREEN;
            case 3: return M_COLOR.PURPLE;
            case 4: return M_COLOR.CYAN;
            case 5: return M_COLOR.PINK;
            case 6: return M_COLOR.BLUE;
            case 7: return M_COLOR.ORANGE;
            case 8: return M_COLOR.GRAY;
            case 9: return M_COLOR.BLACK;
            default: return M_COLOR.RED;
        }
    }

    public HadPrizeNotReceive(): boolean {
        const indexPrizeNotReceiveYet = this.GetIndexPrizeNotReceiveYet();
        return indexPrizeNotReceiveYet != -1;
    }

    public async GetCarSameKeyColorWithLevel(levelIncrease: number): Promise<number> {
        // get info map 
        const levelRead = MConfigs.GetLevelGame(levelIncrease);
        const infoMapAtLevel = await ReadMapJson.Instance.ReadDataFromJson(levelRead);
        // bạn buộc phải trừ 1 ở đây vì id của level bắt đầu đưuọc tính từ 1 sau khi unlock event
        const colorKeyNow = this.GetColorCarSuitForKey(this.GetIdEventNow());
        const numCarInField = infoMapAtLevel.CarInfo.filter(infoCar => {
            const isSame = GetMColorByNumber(infoCar.carColor) === colorKeyNow
            return isSame;
        }).length;
        const numCarInGara = infoMapAtLevel.GarageInfo.reduce((count, infoGara) => {
            return count + infoGara.cars.filter(car => GetMColorByNumber(car.carColor) === colorKeyNow).length;
        }, 0);
        const numCarInBelt = infoMapAtLevel.ConveyorBeltInfo.reduce((count, infoBelt) => {
            return count + infoBelt.cars.filter(car => GetMColorByNumber(car.carColor) === colorKeyNow).length;
        }, 0);
        const totalCarHasSameColor = numCarInField + numCarInGara + numCarInBelt;

        // console.log(infoMapAtLevel);
        // console.log(totalCarHasSameColor, numCarInField, numCarInGara);

        return totalCarHasSameColor;
    }

    public async IncreaseCar(levelIncrease: number, needSaveData: boolean) {
        // get info map 
        const totalCarSameKey = await this.GetCarSameKeyColorWithLevel(levelIncrease);
        PlayerData.Instance.LPr_progress += totalCarSameKey;
        PlayerData.Instance.SaveEvent_LevelProgression(needSaveData);
    }

    public GetAllPrizeCanReceive(): IPrize[] {
        const progressNow = this.GetProgressNow();
        const infoShowUI = this.GetInfoToShowUI(progressNow);
        const listIndexPrizeNotReceiveYet: number[] =
            PlayerData.Instance.LPr_prizeClaimed
                .slice(0, infoShowUI.levelReach - 1)
                .map((isReceived: boolean, index: number) => {
                    if (!isReceived) return index;
                });

        const allPrize = this.GetAllDataPrizeJson();
        const resultListPrize: IPrize[][] = allPrize
            .filter((value, index) => {
                return listIndexPrizeNotReceiveYet.includes(index);
            })
            .map(value => value.listPrize);

        // flat the prize and sum all prize to a list IPrize[]
        const result: IPrize[] = FlatListListIPrize(resultListPrize);
        return result;
    }

    public IsReceivedPrizeAuto(): boolean {
        return PlayerData.Instance.LPr_isReceivedPrizeWhenEndEvent;
    }

    public SetIsReceivedPrizeAuto(isReceived: boolean, needSaveData: boolean = true) {
        PlayerData.Instance.LPr_isReceivedPrizeWhenEndEvent = isReceived;
        PlayerData.Instance.SaveEvent_LevelProgression(needSaveData);
    }

    public GetIndexPrizeNotReceiveYet(): number {
        const progressNow = this.GetProgressNow();
        const infoShowUI = this.GetInfoToShowUI(progressNow);
        const listPrizeCheck = PlayerData.Instance.LPr_prizeClaimed.slice(0, infoShowUI.levelReach - 1);
        if (listPrizeCheck.length == 0) { return -1; }
        const indexPrizeNotReceiveYet: number = listPrizeCheck.findIndex(item => item == false);
        return indexPrizeNotReceiveYet;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================
}


