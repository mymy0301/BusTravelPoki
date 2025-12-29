import { _decorator, Component, Node } from 'cc';
import { IInfoJsonDailyQuest, STATUS_ITEM_QUEST, TYPE_EVENT_GAME, TYPE_PRIZE, TYPE_QUEST_DAILY } from '../Utils/Types';
import { Utils } from '../Utils/Utils';
import { PlayerData } from '../Utils/PlayerData';
import { CheatingSys } from '../Scene/CheatingSys';
import { MConfigs } from '../Configs/MConfigs';
import { DecodeArray, EncodeArray } from '../framework/DecodeAndEncode';
import { ReadDataJson } from '../ReadDataJson';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
import { DataEventsSys } from '../Scene/DataEventsSys';
import { LogEventManager } from '../LogEvent/LogEventManager';
import * as I18n from 'db://i18n/LanguageData';
import { languages } from '../../resources/i18n/en';
import { shuffleArrayWithSeed } from '../framework/randomSeed';
import { MConsolLog } from '../Common/MConsolLog';
import { LEVEL_TUT_IN_GAME } from '../Scene/OtherUI/UITutorialInGame/TypeTutorialInGame';
const { ccclass, property } = _decorator;


/**
 * Ở những chỗ cập nhật lại tiến độ quest chúng ta sẽ có chú thích là ||**DQ**||
 */

@ccclass('DataDailyQuestSys')
export class DataDailyQuestSys {
    public static Instance: DataDailyQuestSys = null;

    private _listInfoItemJsonDailyQuestToday: IInfoJsonDailyQuest[] = [];
    private _listIsReceivedPrize: boolean[] = new Array(MConfigs.MAX_DAILY_QUEST_PER_DAY).fill(false);

    constructor() {
        if (DataDailyQuestSys.Instance == null) {
            DataDailyQuestSys.Instance = this;
            clientEvent.on(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, this.UpdateQuest, this);
            clientEvent.on(MConst.EVENT_DAILY_QUEST.CLAIMED_QUEST_DAILY_QUEST, this.ClaimedQuest, this);
            clientEvent.on(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_SPECIAL_DAILY_QUEST, this.UpdateLogicSpecialQuest, this);
        }
    }

    public GetListInfoItemDailyQuest(): IInfoJsonDailyQuest[] {
        // check of this is new day 
        let checkIsNextDay = Utils.compareDateIsNextDay(PlayerData.Instance._infoEventDailyQuest.timeGen);

        if (PlayerData.Instance._infoEventDailyQuest.timeGen == 0) {
            checkIsNextDay = true;
        }

        // check cheat
        if (CheatingSys.Instance.IsAutoResetDailyQuest) {
            checkIsNextDay = true;
        }

        // check is next day or not
        if (checkIsNextDay) {
            // gen next day
            const seed = Utils.getTimeToDayUTC().toString();
            this._listInfoItemJsonDailyQuestToday = this.GenQuestBySeed(seed, PlayerData.Instance._levelPlayer);
            this._listIsReceivedPrize = new Array(MConfigs.MAX_DAILY_QUEST_PER_DAY).fill(false);
            this.SaveDataDailyQuest();
        } else {
            // match progress to quest || in case player join the game but not is the next day
            const seed = Utils.getTimeToDayUTC().toString();
            this._listInfoItemJsonDailyQuestToday = this.GenQuestBySeed(seed, PlayerData.Instance._levelPlayer);
            const listProgressQuestDaily: IDataSaveQuest[] = this.getProgressFromData();
            let resultListInforItemQuestToday = this.matchProgressToQuest(listProgressQuestDaily, Array.from(this._listInfoItemJsonDailyQuestToday));
            if (resultListInforItemQuestToday != null) {
                this._listInfoItemJsonDailyQuestToday = Array.from(resultListInforItemQuestToday);
            }
            this._listIsReceivedPrize = this.GetListPrizeSaved();
        }

        /* this code below will make all the quest done to the last list */
        let listQuestDone = this._listInfoItemJsonDailyQuestToday.filter(quest => quest.status == STATUS_ITEM_QUEST.DONE);
        let listQuestWaitToClaim = this._listInfoItemJsonDailyQuestToday.filter(quest => quest.status == STATUS_ITEM_QUEST.WAIT_TO_CLAIM);
        let listQuestNotDone = this._listInfoItemJsonDailyQuestToday.filter(quest => quest.status == STATUS_ITEM_QUEST.NOT_DONE);
        this._listInfoItemJsonDailyQuestToday = [];
        this._listInfoItemJsonDailyQuestToday.push(...listQuestWaitToClaim, ...listQuestNotDone, ...listQuestDone);
        /*================================================================*/
        return this._listInfoItemJsonDailyQuestToday;
    }

    public HasAnyQuestCanClaim(): boolean {
        const dataQuestNow = this.GetListInfoItemDailyQuest();
        let result = dataQuestNow.findIndex(quest => quest.status == STATUS_ITEM_QUEST.WAIT_TO_CLAIM);
        return result >= 0;
    }

    //#region self func
    private GenQuestBySeed(seed: string, levelNow: number): IInfoJsonDailyQuest[] {
        let result = []

        //========================= maybe you just need to random some quest not all =====================
        // you need to create another list temp quest for can random 
        // than you can add quest to the result
        const rootListQuest: IInfoJsonDailyQuest[] = ReadDataJson.Instance.GetDataDailyQuest();
        // ======================
        // check valid quest
        // case < tut item => can not show quest have prize has that tut
        let listValidTypeQuest: TYPE_QUEST_DAILY[] = this.getListValidQuest(levelNow);
        let listValidTypePrize: TYPE_PRIZE[] = [];
        switch (true) {
            case levelNow < LEVEL_TUT_IN_GAME.SORT:
                listValidTypePrize = [TYPE_PRIZE.SORT, TYPE_PRIZE.SHUFFLE, TYPE_PRIZE.VIP_SLOT];
                break;
            case levelNow < LEVEL_TUT_IN_GAME.SHUFFLE:
                listValidTypePrize = [TYPE_PRIZE.SHUFFLE, TYPE_PRIZE.VIP_SLOT];
                break;
            case levelNow < LEVEL_TUT_IN_GAME.VIP_SLOT:
                listValidTypePrize = [TYPE_PRIZE.VIP_SLOT];
                break;
        }
        const listQuestInList = rootListQuest.filter(item => {
            const case1 = item.listPrize.findIndex(prize => listValidTypePrize.includes(prize.typePrize)) == -1;
            const case2 = listValidTypeQuest.includes(item.typeQuest)
            return case1 && !case2;
        });
        // const listQuestInList: IInfoJsonDailyQuest[] = ReadDataJson.Instance.GetDataDailyQuest();
        // create index from 0 => max quest daily
        let listTempIndexQuest = Array.from({ length: listQuestInList.length }, (_, i) => i);
        // shuffle the list
        listTempIndexQuest = shuffleArrayWithSeed(seed, listTempIndexQuest);

        // get random 4 quest rank 1, 1 quest rank 2
        let numQuestRank1 = 0;
        let numQuestRank2 = 0;
        let resultIndexQuest = [];

        for (let i = 0; i < listTempIndexQuest.length; i++) {
            const quest = listQuestInList[listTempIndexQuest[i]];

            // check condition quest
            if (quest.rank == 1 && numQuestRank1 < 4) {
                numQuestRank1++;
                resultIndexQuest.push(listTempIndexQuest[i]);
            } else if (quest.rank == 2 && numQuestRank2 < 1) {
                numQuestRank2++;
                resultIndexQuest.push(listTempIndexQuest[i]);
            }

            // if get limit quest => braek
            if (numQuestRank1 == 4 && numQuestRank2 == 1) break;
        }

        //================================================================================================
        //========================= quest must have ======================================================
        for (let i = 0; i < resultIndexQuest.length; i++) {
            const indexQuest = resultIndexQuest[i];
            const quest = listQuestInList[indexQuest];
            // check in case maxProgress quest is 0 
            // auto wait to claim
            // ||**DQ**||
            if (quest.id == ID_QUEST_DAILY.LOGIN.toString()) {
                quest.progressNow = 1;
                quest.status = STATUS_ITEM_QUEST.WAIT_TO_CLAIM;
            }
            result.push(quest);
        }
        //================================================================================================
        return result;
    }

    /**
     * 
     * @param levelCheck 
     * @returns 
     */
    private getListValidQuest(levelCheck: number): TYPE_QUEST_DAILY[] {
        let listValidTypeQuest: TYPE_QUEST_DAILY[] = [];

        if (levelCheck < MConfigs.LEVEL_TUTORIAL_EVENT.LoginReward) {
            !listValidTypeQuest.includes(TYPE_QUEST_DAILY.LOGIN) && listValidTypeQuest.push(TYPE_QUEST_DAILY.LOGIN);
        }

        if (levelCheck < MConfigs.LEVEL_TUTORIAL_EVENT.Spin) {
            !listValidTypeQuest.includes(TYPE_QUEST_DAILY.SPIN) && listValidTypeQuest.push(TYPE_QUEST_DAILY.SPIN);
        }

        return listValidTypeQuest;
    }

    /**
     * this func will decode the data from player data
     * @returns 
     */
    private getProgressFromData(): IDataSaveQuest[] {
        let result: IDataSaveQuest[] = [];
        let data: string[] = DecodeArray(PlayerData.Instance._dailyQuest_progressQuest) as string[];
        if (data.length > 0) {
            // we need decode string again => idQuest_progress
            for (let i = 0; i < data.length; i++) {
                const arrData = data[i].split("_");
                try {
                    let idQuest = arrData[0];
                    let progressQuest = parseInt(arrData[1]);
                    let status = parseInt(arrData[2]);
                    if (Number.isNaN(idQuest) || Number.isNaN(progressQuest) || Number.isNaN(status)) return null;
                    result.push({
                        idQuest: idQuest,
                        progressQuest: progressQuest,
                        status: status
                    });
                } catch (error) {
                    console.error(error);
                    return null;
                }
            }
            return result;
        }
        return null;
    }
    //#endregion self func

    //#region save func

    private matchProgressToQuest(numProgress: IDataSaveQuest[], listQuest: IInfoJsonDailyQuest[]): IInfoJsonDailyQuest[] {
        // may be you in case new quest is change the number not suit with the progress file save 
        // => in this sys we not save map with idQuest so we can not know exactly the quest's progress
        // => therefor just do not update the
        if (numProgress == null || numProgress.length == 0 || CheatingSys.Instance.IsAutoResetDailyQuest) { return listQuest; }

        numProgress.forEach((value, index) => {
            for (let i = 0; i < listQuest.length; i++) {
                const questCheck = listQuest[i];
                if (questCheck.id == value.idQuest) {
                    questCheck.progressNow = value.progressQuest < 0 ? 0 : value.progressQuest;
                    questCheck.status = value.status;
                    break;
                }
            }
        })

        return listQuest;
    }

    private GetListProgressToSave(): string {
        let data = [];
        for (let i = 0; i < this._listInfoItemJsonDailyQuestToday.length; i++) {
            let quest = this._listInfoItemJsonDailyQuestToday[i];
            // console.log("data", quest, quest.id, quest.progressNow, quest.status);
            data.push(`${quest.id}_${quest.progressNow}_${quest.status}`);
        }

        // encode data
        let result = EncodeArray(data);
        return result;
    }

    private GetListPrizeSaved(): boolean[] {
        return Array.from(PlayerData.Instance._dailyQuest_listIsReceive);
    }

    private SaveDataDailyQuest() {
        PlayerData.Instance._infoEventDailyQuest.timeGen = Utils.getTimeToDayUTC();
        PlayerData.Instance._dailyQuest_progressQuest = this.GetListProgressToSave();
        PlayerData.Instance._dailyQuest_listIsReceive = Array.from(this._listIsReceivedPrize);

        // MConsolLog.Log("save data daily quest", PlayerData.Instance._dailyQuest_progressQuest);

        PlayerData.Instance.SaveEvent_DailyQuest();
    }
    //#endregion save func

    //#region listen event
    private UpdateQuest(type: TYPE_QUEST_DAILY, addProgress: number) {
        // chỉ được update nếu như event đã mở khóa
        // if (DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.DAILY_CHALLENGE) || !DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.DAILY_CHALLENGE)) return;

        /**
         * some quest need to check logic before update progress
         * check list quest daily if in not done and progress => change status quest daily challenge
         */
        let hasChange = false;

        /* logic update progress quest
        * 1. check type quest you update
        * 2. if quest is not done => increase progress
        * */
        for (let i = 0; i < this._listInfoItemJsonDailyQuestToday.length; i++) {
            let quest = this._listInfoItemJsonDailyQuestToday[i];
            if (quest.status == STATUS_ITEM_QUEST.NOT_DONE && quest.typeQuest == type) {
                quest.progressNow += addProgress;
                if (quest.progressNow >= quest.maxProgress) {
                    quest.progressNow = quest.maxProgress;
                    quest.status = STATUS_ITEM_QUEST.WAIT_TO_CLAIM;
                    // log Event
                    LogEventManager.Instance.logEventQuestDone(quest.id);
                }
                hasChange = true;
            }
        }

        // check if change => save data
        if (hasChange) {
            this.timeSave = -1;

            // remember when you save you save all the file so it will be config with the other save of the game 
            // => you must be carefull this case
            this.SaveDataDailyQuest();

            /**
            * ================================= THERE IS A SPECIAL CASE HERE ===========================================
            * ================================= ABOUT SHARE => must update UI after change status done =================
            */
            clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_UI_QUEST_DAILY_FORCE);
            /**
             * ===========================================================================================================
             */
        }
    }

    private ClaimedQuest(idQuest: string) {
        let hasChange = false;

        for (let i = 0; i < this._listInfoItemJsonDailyQuestToday.length; i++) {
            const quest = this._listInfoItemJsonDailyQuestToday[i];
            if (quest.id == idQuest && (quest.status == STATUS_ITEM_QUEST.WAIT_TO_CLAIM || CheatingSys.Instance.IsAutoResetDailyQuest)) {
                quest.status = STATUS_ITEM_QUEST.DONE;
                hasChange = true;
                break;
            }
        }

        if (hasChange) {
            // console.log("ClaimedQuest", idQuest);
            this.SaveDataDailyQuest();
        }
    }

    private UpdateLogicSpecialQuest(typeQuest: TYPE_QUEST_DAILY, dataCustom: any = null) {
        // just can update when the event is unlock
        // if (DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.DAILY_CHALLENGE) || !DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.DAILY_CHALLENGE)) return;

        // find all the quest had same type
        // check list quest daily if it not done add progress => change status quest daily
        let hasChange = false;

        /* logic update progress quest
        * 1. check type quest you update
        * 2. if quest is not done => reset progress to 0
        * */

        for (let i = 0; i < this._listInfoItemJsonDailyQuestToday.length; i++) {
            let quest = this._listInfoItemJsonDailyQuestToday[i];
            if (quest.status == STATUS_ITEM_QUEST.NOT_DONE && quest.typeQuest == typeQuest) {
                switch (typeQuest) {
                    case TYPE_QUEST_DAILY.WIN_STEAK_NORMAL_GAME:
                        // for this type quest we just use this func to reset all the streak quest
                        quest.progressNow = 0;
                        hasChange = true;
                        break;
                }
            }
        }

        // check if change => save data
        if (hasChange) {
            if (typeQuest == TYPE_QUEST_DAILY.WIN_STEAK_NORMAL_GAME) {
                // remember when you save you save all the file so it will be config with the other save of the game 
                // => you must be carefull this case
                this.SaveDataDailyQuest();
            }
        }
    }
    //#endregion listen event

    //#region time
    /**
     *  thuộc tính này được dùng để lưu lại thời gian đã từng lấy để hiển thị
     *  thuộc tính này được reset lại là -1 mỗi khi dữ liệu được cập nhật
     *  dữ liệu chỉ được cập nhật một lần duy nhất khi giao diện được khởi tạo
     *  nếu như thời gian lấy ra nhiều hơn thời gian đã lưu trữ tức là đã qua ngày mới , để giảm thiểu công việc code nên khi qua ngày mới nhiệm vụ sẽ không được cập nhật
     *     tự động mà sẽ chỉ cập nhật giao diện khi người chơi khởi tạo giao diện
     */
    public timeSave: number = -1;

    public GetTextTimeShow(): string {
        // trong game này logic là nhiệm vụ được reset tự động theo ngày
        // do đó chỉ cần trả về thời gian còn lại trong ngày là được rùi


        const timeRemaining: number = Utils.getTimeRemainingFromNowToEndDay();
        let result: string = Utils.convertTimeToStringFormat(timeRemaining);

        if (this.timeSave == -1 || timeRemaining <= this.timeSave) {
            this.timeSave = timeRemaining;
        } else {
            result = I18n.t(languages["END_TIME"]);
        }

        return result;
    }
    //#endregion time
}


type IDataSaveQuest = {
    idQuest: string;
    progressQuest: number;
    status: STATUS_ITEM_QUEST;
}

export enum ID_QUEST_DAILY {
    LOGIN
}