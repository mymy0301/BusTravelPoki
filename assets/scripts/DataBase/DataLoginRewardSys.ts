import { _decorator, Component, Node } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { InfoProgressLoginReward, IPrize, TYPE_EVENT_GAME } from '../Utils/Types';
import { ReadDataJson } from '../ReadDataJson';
import { Utils } from '../Utils/Utils';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
import { CheatingSys } from '../Scene/CheatingSys';
import { MConfigs } from '../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('DataLoginRewardSys')
export class DataLoginRewardSys {
    public static Instance: DataLoginRewardSys = null;

    constructor() {
        if (DataLoginRewardSys.Instance == null) {
            DataLoginRewardSys.Instance = this;
        }
    }

    public CanShowWhenLogin(updateTime: boolean = true): boolean {
        // có thể bỏ sung thêm cheat code ở đây
        if (CheatingSys.Instance.isCheatLoginReward) {
            PlayerData.Instance._infoEventLoginReward.timeGen = Utils.getFirstTimeToday();
            PlayerData.Instance._loginReward_isReceivePrizeToDay = false;
            PlayerData.Instance._loginReward_listPrize30Day = new Array(MConfigs.MAX_PRIZE_PROGRESS_LOGIN_REWARD).fill(false);
            PlayerData.Instance._infoEventLoginReward.progress = 29;
            PlayerData.Instance._loginReward_progress30DayDaily = 29;
            PlayerData.Instance.SaveEvent_LoginReward();
            return true;
        }

        // kiểm tra xem event này đã pass ngày mới hay chưa
        let timeLastDailyBonus: number = PlayerData.Instance._infoEventLoginReward.timeGen;
        const isNextDay = Utils.compareDateIsNextDay(timeLastDailyBonus);
        if (isNextDay) {
            if (updateTime) {
                PlayerData.Instance._infoEventLoginReward.timeGen = Utils.getFirstTimeToday();
                PlayerData.Instance._loginReward_isReceivePrizeToDay = false;
                PlayerData.Instance.SaveEvent_LoginReward();
            }
            return true;
        }

        return false;
    }

    public SaveRewardLogin(day: number) {
        // tăng thông số tiến trình là được vì người chơi mỗi ngày chỉ nhận được một lần
        if (PlayerData.Instance._loginReward_isReceivePrizeToDay) { return; }
        PlayerData.Instance._infoEventLoginReward.progress += 1;
        PlayerData.Instance._loginReward_progress30DayDaily += 1;
        PlayerData.Instance._loginReward_isReceivePrizeToDay = true;
        PlayerData.Instance._infoEventLoginReward.timeGen = Utils.getFirstTimeToday();
        PlayerData.Instance.SaveEvent_LoginReward();

        // emit to turn off notification
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LOGIN_REWARD);
    }

    public SaveRewardLoginProgress(listIndexProgress: number[]) {
        // lưu lại phần quà tiến trình đã nhận thưởng
        listIndexProgress.forEach(index => PlayerData.Instance._loginReward_listPrize30Day[index] = true);
        PlayerData.Instance.SaveEvent_LoginReward();

        // emit to turn off notification
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LOGIN_REWARD);
    }

    public Reset30DayReward() {
        PlayerData.Instance._loginReward_progress30DayDaily -= 30;
        PlayerData.Instance._loginReward_listPrize30Day.fill(false, 0, PlayerData.Instance._loginReward_listPrize30Day.length);
        PlayerData.Instance.SaveEvent_LoginReward();
    }

    /**
     * Trả về danh sách phần quà theo từng ngày
     */
    public GetJsonRewardLogin(): IPrize[][] {
        return ReadDataJson.Instance.getListPrizeLoginReward();
    }

    /**
     * Trả về danh sách phần quà của tiến trình
     */
    public GetJsonRewardLoginProgress(): InfoProgressLoginReward[] {
        return ReadDataJson.Instance.getProgressLoginReward();
    }

    /**
     *  Trả về tiến trình điểm danh theo ngày của người chơi
     */
    public GetProgressRewardLogin(): number {
        return PlayerData.Instance._infoEventLoginReward.progress;
    }

    /**
     * Trả về tiến trình nhận quà đủ 30 ngày của người chơi
     * @returns 
     */
    public GetProgress30DaysReward(): number {
        return PlayerData.Instance._loginReward_progress30DayDaily;
    }

    public GetMaxProgress30DayReward(): number {
        return 30;
    }

    /**
     * Tìm phần thưởng index lớn nhất có thể nhận thưởng
     */
    public GetMaxIndexPrizeProgressReceive(progress: number): number {

        let result = -1;
        const listJsonLoginReward = ReadDataJson.Instance.getProgressLoginReward();

        for (let i = listJsonLoginReward.length - 1; i >= 0; i--) {
            if (progress >= listJsonLoginReward[i].progress) {
                result = i;
                return result;
            }
        }

        return result;

    }

    /**
     * Kiểm tra danh sách prize ở progress trong login
     * Kiểm tra nhận quà hàng ngày hay chưa
     * @returns 
     */
    public IsRewardAllPrize30Day(): boolean {
        const progress30Days = PlayerData.Instance._loginReward_progress30DayDaily;
        const listInfoPrize = ReadDataJson.Instance.getProgressLoginReward()
        let canReceiveAnyPrize = false;

        // check 1 loop
        for (let i = 0; i < PlayerData.Instance._loginReward_listPrize30Day.length; i++) {
            const isReceivePrize = PlayerData.Instance._loginReward_listPrize30Day[i];
            const infoCheck: InfoProgressLoginReward = listInfoPrize[i];
            if (progress30Days >= infoCheck.progress && isReceivePrize == false) {
                canReceiveAnyPrize = true;
                break;
            }
        }

        // check is over the score
        if (progress30Days - listInfoPrize[listInfoPrize.length - 1].progress >= listInfoPrize[0].progress) {
            canReceiveAnyPrize = true;
        }

        // check is receive prize today
        const canReceivePrizeToday = !PlayerData.Instance._loginReward_isReceivePrizeToDay;
        return canReceiveAnyPrize || canReceivePrizeToday;
    }

    /**
     * Kiểm tra xem có phần thưởng login progress đã nhận hay chưa 
     * @returns 
     */
    public WasReward30DayLoginProgressReceived(indexPrizeProgress: number): boolean {
        return PlayerData.Instance._loginReward_listPrize30Day[indexPrizeProgress];
    }

    public isRewardLoginToDay(): boolean {
        return PlayerData.Instance._loginReward_isReceivePrizeToDay
    }

    public GetIndexWeek(progress: number) {
        let indexWeek = (progress - progress % 7) / 7;
        return indexWeek;
    }

    public GetListPrizeThisWeekWithProgress(progress: number): IPrize[][] {
        const listPrize = ReadDataJson.Instance.getListPrizeLoginReward();
        const indexWeek = this.GetIndexWeek(progress);
        // return listPrize.splice(indexWeek * 7, 7);
        return listPrize;
    }

    public StateRewardProgressLogin(indexPrize: number): 'UNLOCK' | 'LOCK' | 'IS_CLAIMED' {
        if (PlayerData.Instance._loginReward_listPrize30Day[indexPrize]) { return 'IS_CLAIMED' }

        const progressNow = PlayerData.Instance._loginReward_progress30DayDaily;
        const maxIndexRewardProgressCanReceive = this.GetMaxIndexPrizeProgressReceive(progressNow);

        if (maxIndexRewardProgressCanReceive >= 0 && indexPrize <= maxIndexRewardProgressCanReceive) { return 'UNLOCK' }
        else { return 'LOCK' }
    }
}


