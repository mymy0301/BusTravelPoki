import { _decorator, Component, Node } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { MConst } from '../Const/MConst';
import { clientEvent } from '../framework/clientEvent';
import { convertTYPE_PRIZEtoTYPE_ITEM, IPrize, TYPE_ITEM, TYPE_PRIZE, TYPE_QUEST_DAILY, TYPE_RECEIVE } from '../Utils/Types';
import { Utils } from '../Utils/Utils';
import { ClockGameSys } from '../ClockGameSys';
import { ItemGameInfo } from '../SerilazationData/ItemGameInfo';
import { LogEventManager } from '../LogEvent/LogEventManager';
import { LE_RESOURCE_CHANGE_change_type } from '../LogEvent/TypeLogEvent';
const { ccclass, property } = _decorator;



@ccclass('DataItemSys')
export class DataItemSys {
    public static Instance: DataItemSys = null;

    private _itemGameSort: ItemGameInfo = new ItemGameInfo();
    private _itemGameShuffle: ItemGameInfo = new ItemGameInfo();
    private _itemGameVipSlot: ItemGameInfo = new ItemGameInfo();
    private _itemGameTime: ItemGameInfo = new ItemGameInfo();
    private _itemGameHammer: ItemGameInfo = new ItemGameInfo();
    private _itemGameMagnifyingGlass: ItemGameInfo = new ItemGameInfo();

    private _idIntervalUpdateItemSort: number = -1;
    private _idIntervalUpdateItemShuffle: number = -1;
    private _idIntervalUpdateItemVipSlot: number = -1;
    private _idIntervalUpdateItemTime: number = -1;
    private _idIntervalUpdateItemHammer: number = -1;
    private _idIntervalUpdateItemMagnifyingGlass: number = -1;

    constructor() {
        if (DataItemSys.Instance == null) {
            DataItemSys.Instance = this;
        }
    }

    public ReadItemFromData() {

        function setUpNumItemFromData(data: ItemGameInfo, dataFromPlayerData: ItemGameInfo): boolean {
            data.numItem = dataFromPlayerData.numItem;
            data.timeEnd = dataFromPlayerData.timeEnd;
            if (dataFromPlayerData.numItem == null || data.numItem < 0) {
                data.numItem = 0;
                return true;
            }

            if (dataFromPlayerData.timeEnd == null || (Utils.getCurrTime() - data.timeEnd) < -1) {
                data.timeEnd = -1;
                return true;
            }

            return false;
        }

        let isValidItemSort = setUpNumItemFromData(this._itemGameSort, PlayerData.Instance._infoItemSort);
        let isValidItemShuffle = setUpNumItemFromData(this._itemGameShuffle, PlayerData.Instance._infoItemShuffle);
        let isValidItemVipSlot = setUpNumItemFromData(this._itemGameVipSlot, PlayerData.Instance._infoItemVipSlot);
        let isValidItemTime = setUpNumItemFromData(this._itemGameTime, PlayerData.Instance._infoItemTime);
        let isValidItemHammer = setUpNumItemFromData(this._itemGameHammer, PlayerData.Instance._infoItemHammer);
        let isValidItemMagnifyingGlass = setUpNumItemFromData(this._itemGameMagnifyingGlass, PlayerData.Instance._infoItemMagnifyingGlass);

        if (isValidItemSort || isValidItemShuffle || isValidItemVipSlot || isValidItemTime || isValidItemHammer || isValidItemMagnifyingGlass) {
            this.SaveItems();
        }

        // check time item infinity for each item
        if (this.IsInfinityTime(TYPE_ITEM.SORT)) {
            this.RegisterUpdateTime(TYPE_ITEM.SORT);
        }
        if (this.IsInfinityTime(TYPE_ITEM.SHUFFLE)) {
            this.RegisterUpdateTime(TYPE_ITEM.SHUFFLE);
        }
        if (this.IsInfinityTime(TYPE_ITEM.VIP_SLOT)) {
            this.RegisterUpdateTime(TYPE_ITEM.VIP_SLOT);
        }
        if (this.IsInfinityTime(TYPE_ITEM.TIME)) {
            this.RegisterUpdateTime(TYPE_ITEM.TIME);
        }
        if (this.IsInfinityTime(TYPE_ITEM.HAMMER)) {
            this.RegisterUpdateTime(TYPE_ITEM.HAMMER);
        }
        if (this.IsInfinityTime(TYPE_ITEM.MAGNIFYING_GLASS)) {
            this.RegisterUpdateTime(TYPE_ITEM.MAGNIFYING_GLASS);
        }
    }

    /**
     * 
     * @param typeItems 
     * @param numItemAdds 
     * @param reason 
     * @param needEventUpdate 
     */
    public AddItem(typeItems: TYPE_ITEM[], numItemAdds: number[], reason: string, needEventUpdate: boolean = true) {



        for (let i = 0; i < typeItems.length; i++) {
            const typeItem = typeItems[i];
            const numItemAdd = numItemAdds[i];

            if (numItemAdd < 0) {
                LogEventManager.Instance.logResource_change(TYPE_ITEM[typeItem], LE_RESOURCE_CHANGE_change_type.SUB, "" + Math.abs(numItemAdd), reason);

                // ||**DQ**||
                typeItems.forEach((item, index) => {
                    switch (item) {
                        case TYPE_ITEM.SHUFFLE:
                            clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.USE_ITEM_SHUFFLE, -numItemAdds[index]);
                            break;
                        case TYPE_ITEM.SORT:
                            clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.USE_ITEM_SORT, -numItemAdds[index]);
                            break;
                        case TYPE_ITEM.VIP_SLOT:
                            clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.USE_ITEM_VIP_SLOT, -numItemAdds[index]);
                            break;
                    }
                })
            } else {
                LogEventManager.Instance.logResource_change(TYPE_ITEM[typeItem], LE_RESOURCE_CHANGE_change_type.ADD, "" + numItemAdd, reason);
            }

            switch (typeItem) {
                case TYPE_ITEM.SORT:
                    if (numItemAdd < 0) {
                        PlayerData.Instance._sortConsumed += numItemAdd;
                        LogEventManager.Instance.logSortConsumed(PlayerData.Instance._sortConsumed);
                    }
                    this._itemGameSort.numItem += numItemAdd;
                    LogEventManager.Instance.logSort(this._itemGameSort.numItem);
                    break;
                case TYPE_ITEM.SHUFFLE:
                    if (numItemAdd < 0) {
                        PlayerData.Instance._shuffleConsumed += numItemAdd;
                        LogEventManager.Instance.logShuffleConsumed(PlayerData.Instance._shuffleConsumed);
                    }
                    this._itemGameShuffle.numItem += numItemAdd;
                    LogEventManager.Instance.logShuffle(this._itemGameShuffle.numItem);
                    break;
                case TYPE_ITEM.VIP_SLOT:
                    if (numItemAdd < 0) {
                        PlayerData.Instance._vipConsumed += numItemAdd;
                        LogEventManager.Instance.logVipConsumed(PlayerData.Instance._vipConsumed);
                    }
                    this._itemGameVipSlot.numItem += numItemAdd;
                    LogEventManager.Instance.logVip(this._itemGameVipSlot.numItem);
                    break;
                case TYPE_ITEM.HAMMER:
                    this._itemGameHammer.numItem += numItemAdd;
                    break;
                case TYPE_ITEM.MAGNIFYING_GLASS:
                    this._itemGameMagnifyingGlass.numItem += numItemAdd;
                    break;
                case TYPE_ITEM.TIME:
                    this._itemGameTime.numItem += numItemAdd;
                    break;
            }
        }

        if (needEventUpdate) {
            for (let i = 0; i < typeItems.length; i++) {
                const typeItem = typeItems[i];
                clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.UPDATE_NUM_ITEM, typeItem, this.GetNumItem(typeItem));
            }
        }


        /**
        * ===================================================================
        * ===================================================================
        * Xin hãy lưu ý tuyệt đối không được bỏ hoặc ẩn code dưới 
        * trong bất kỳ trường hợp nào nếu không sẽ ko lưu lại được dữ liệu
        * ===================================================================
        * ===================================================================
        */
        this.SaveItems();
    }

    /**
     * this func will not save the case life and money because some case need update first but some case need update later
     * this code below is example to save data in case life and money
     *  case TYPE_PRIZE.LIFE:
                    LifeSys2.Instance.AddLife(item.typeReceivePrize, item.value, needSave);
                    break;
                case TYPE_PRIZE.MONEY:
                    MoneySys.Instance.AddMoney(item.value, needSave);
                    break;
     * @param listIPrize 
     * @param needSaveData 
     */
    public AddItemPrize(listIPrize: IPrize[], reason?: string, needSaveData: boolean = true, needEventUpdate: boolean = true) {
        const self = this;

        function addPrize(infoItem: ItemGameInfo, iPrize: IPrize) {
            if (iPrize.typeReceivePrize == TYPE_RECEIVE.NUMBER) {
                infoItem.numItem += iPrize.value;
            } else if (iPrize.typeReceivePrize == TYPE_RECEIVE.TIME_MINUTE) {
                self.AddTimeInfi(convertTYPE_PRIZEtoTYPE_ITEM(iPrize.typePrize), iPrize.value * 60);
            } else if (iPrize.typeReceivePrize == TYPE_RECEIVE.TIME_HOUR) {
                self.AddTimeInfi(convertTYPE_PRIZEtoTYPE_ITEM(iPrize.typePrize), iPrize.value * 60 * 24);
            }
        }

        for (let i = 0; i < listIPrize.length; i++) {
            const iPrizeCheck = listIPrize[i];

            LogEventManager.Instance.logResource_change(TYPE_PRIZE[iPrizeCheck.typePrize], LE_RESOURCE_CHANGE_change_type.ADD, "" + iPrizeCheck.value, reason);

            switch (iPrizeCheck.typePrize) {
                case TYPE_PRIZE.SHUFFLE:
                    addPrize(this._itemGameShuffle, iPrizeCheck);
                    PlayerData.Instance._infoItemShuffle = this._itemGameShuffle;
                    LogEventManager.Instance.logShuffle(PlayerData.Instance._infoItemShuffle.numItem);
                    break;
                case TYPE_PRIZE.SORT:
                    addPrize(this._itemGameSort, iPrizeCheck);
                    PlayerData.Instance._infoItemSort = this._itemGameSort;
                    LogEventManager.Instance.logSort(PlayerData.Instance._infoItemSort.numItem);
                    break;
                case TYPE_PRIZE.VIP_SLOT:
                    addPrize(this._itemGameVipSlot, iPrizeCheck);
                    PlayerData.Instance._infoItemVipSlot = this._itemGameVipSlot;
                    LogEventManager.Instance.logVip(PlayerData.Instance._infoItemVipSlot.numItem);
                    break;
                case TYPE_PRIZE.HAMMER:
                    addPrize(this._itemGameHammer, iPrizeCheck);
                    PlayerData.Instance._infoItemHammer = this._itemGameHammer;
                    break;
                case TYPE_PRIZE.MAGNIFYING_GLASS:
                    addPrize(this._itemGameMagnifyingGlass, iPrizeCheck);
                    PlayerData.Instance._infoItemMagnifyingGlass = this._itemGameMagnifyingGlass;
                    break;
                case TYPE_PRIZE.TIME:
                    addPrize(this._itemGameTime, iPrizeCheck);
                    PlayerData.Instance._infoItemTime = this._itemGameTime;
                    break;
            }

            if (needEventUpdate) {
                const typeItem = convertTYPE_PRIZEtoTYPE_ITEM(iPrizeCheck.typePrize)
                clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.UPDATE_NUM_ITEM, typeItem, this.GetNumItem(typeItem));
            }
        }

        if (needSaveData) {
            this.SaveItems();
        }

    }

    public UseItem(typeItem: TYPE_ITEM, needSaveData: boolean = true) {
        switch (typeItem) {
            case TYPE_ITEM.SORT:
                this._itemGameSort.numItem--;
                break;
            case TYPE_ITEM.SHUFFLE:
                this._itemGameShuffle.numItem--;
                break;
            case TYPE_ITEM.VIP_SLOT:
                this._itemGameVipSlot.numItem--;
                break;
            case TYPE_ITEM.HAMMER:
                this._itemGameHammer.numItem--;
                break;
            case TYPE_ITEM.MAGNIFYING_GLASS:
                this._itemGameMagnifyingGlass.numItem--;
                break;
            case TYPE_ITEM.TIME:
                this._itemGameTime.numItem--;
                break;
        }

        if (needSaveData) {
            this.SaveItems();
        }
    }

    //#region common
    public GetNumItem(typeItem: TYPE_ITEM) {
        switch (typeItem) {
            case TYPE_ITEM.SORT: return this._itemGameSort.numItem;
            case TYPE_ITEM.SHUFFLE: return this._itemGameShuffle.numItem;
            case TYPE_ITEM.VIP_SLOT: return this._itemGameVipSlot.numItem;
            case TYPE_ITEM.HAMMER: return this._itemGameHammer.numItem;
            case TYPE_ITEM.MAGNIFYING_GLASS: return this._itemGameMagnifyingGlass.numItem;
            case TYPE_ITEM.TIME: return this._itemGameTime.numItem;
        }
        return -1;
    }
    //#endregion

    //#region func time item

    private UpdateTime(typeItem: TYPE_ITEM) {
        // in this func you will emit event update time with type item and time
        // and check when it done you will auto remove the listener

        let itemUpdate: ItemGameInfo = null;
        switch (typeItem) {
            case TYPE_ITEM.SORT:
                itemUpdate = this._itemGameSort;
                break;
            case TYPE_ITEM.SHUFFLE:
                itemUpdate = this._itemGameShuffle;
                break;
            case TYPE_ITEM.VIP_SLOT:
                itemUpdate = this._itemGameVipSlot;
                break;
            case TYPE_ITEM.HAMMER:
                itemUpdate = this._itemGameHammer;
                break;
            case TYPE_ITEM.MAGNIFYING_GLASS:
                itemUpdate = this._itemGameMagnifyingGlass;
                break;
            case TYPE_ITEM.TIME:
                itemUpdate = this._itemGameTime;
                break;
        }

        let timeRemaining: number = itemUpdate.timeEnd - Utils.getCurrTime();

        if (timeRemaining >= 0) {
            clientEvent.dispatchEvent(MConst.EVENT_ITEM.UPDATE_TIME_INFI, typeItem, timeRemaining);
        } else {
            clientEvent.dispatchEvent(MConst.EVENT_ITEM.END_TIME_INFI, typeItem);
            this.UnRegisterUpdateTime(typeItem);
        }
    }

    private UnRegisterUpdateTime(typeItem: TYPE_ITEM) {
        let idChoice = -1;
        switch (typeItem) {
            case TYPE_ITEM.SORT:
                idChoice = this._idIntervalUpdateItemSort;
                this._idIntervalUpdateItemSort = -1;
                break;
            case TYPE_ITEM.SHUFFLE:
                idChoice = this._idIntervalUpdateItemShuffle;
                this._idIntervalUpdateItemShuffle = -1;
                break;
            case TYPE_ITEM.VIP_SLOT:
                idChoice = this._idIntervalUpdateItemVipSlot;
                this._idIntervalUpdateItemVipSlot = -1;
                break;
            case TYPE_ITEM.TIME:
                idChoice = this._idIntervalUpdateItemTime;
                this._idIntervalUpdateItemTime = -1;
                break;
            case TYPE_ITEM.HAMMER:
                idChoice = this._idIntervalUpdateItemHammer;
                this._idIntervalUpdateItemHammer = -1;
                break;
            case TYPE_ITEM.MAGNIFYING_GLASS:
                idChoice = this._idIntervalUpdateItemMagnifyingGlass;
                this._idIntervalUpdateItemMagnifyingGlass = -1;
                break;
        }

        if (idChoice != -1) {
            ClockGameSys.Instance.unregisterCallBack(idChoice);
        }
    }

    private RegisterUpdateTime(typeItem: TYPE_ITEM) {
        switch (typeItem) {
            case TYPE_ITEM.SORT:
                this._idIntervalUpdateItemSort = ClockGameSys.Instance.registerCallBack(() => {
                    this.UpdateTime(typeItem);
                });
                break;
            case TYPE_ITEM.SHUFFLE:
                this._idIntervalUpdateItemShuffle = ClockGameSys.Instance.registerCallBack(() => {
                    this.UpdateTime(typeItem);
                });
                break;
            case TYPE_ITEM.VIP_SLOT:
                this._idIntervalUpdateItemVipSlot = ClockGameSys.Instance.registerCallBack(() => {
                    this.UpdateTime(typeItem);
                });
                break;
            case TYPE_ITEM.TIME:
                this._idIntervalUpdateItemTime = ClockGameSys.Instance.registerCallBack(() => {
                    this.UpdateTime(typeItem);
                });
                break;
            case TYPE_ITEM.HAMMER:
                this._idIntervalUpdateItemHammer = ClockGameSys.Instance.registerCallBack(() => {
                    this.UpdateTime(typeItem);
                });
                break;
            case TYPE_ITEM.MAGNIFYING_GLASS:
                this._idIntervalUpdateItemMagnifyingGlass = ClockGameSys.Instance.registerCallBack(() => {
                    this.UpdateTime(typeItem);
                });
                break;
        }
    }

    public IsInfinityTime(typeItem: TYPE_ITEM): boolean {
        function IsInTimeInfinity(timeEnd: number): boolean {
            if (timeEnd > 0 && (timeEnd - Utils.getCurrTime()) > 0) return true;
            else return false;
        }

        switch (typeItem) {
            case TYPE_ITEM.SORT: return IsInTimeInfinity(this._itemGameSort.timeEnd);
            case TYPE_ITEM.SHUFFLE: return IsInTimeInfinity(this._itemGameShuffle.timeEnd);
            case TYPE_ITEM.VIP_SLOT: return IsInTimeInfinity(this._itemGameVipSlot.timeEnd);
            case TYPE_ITEM.TIME: return IsInTimeInfinity(this._itemGameTime.timeEnd);
            case TYPE_ITEM.HAMMER: return IsInTimeInfinity(this._itemGameHammer.timeEnd);
            case TYPE_ITEM.MAGNIFYING_GLASS: return IsInTimeInfinity(this._itemGameMagnifyingGlass.timeEnd);
            default:
                return false;
        }
    }

    public AddTimeInfi(typeItem: TYPE_ITEM, timeLength: number) {
        const self = this;
        function UpdateTime(infoItem: ItemGameInfo, timeAdd: number) {
            // there are 2 case
            if (self.IsInfinityTime(typeItem)) {
                infoItem.timeEnd += timeAdd;
            } else {
                infoItem.timeEnd = Utils.getCurrTime() + timeAdd;
            }
        }

        switch (typeItem) {
            case TYPE_ITEM.SORT:
                this.UnRegisterUpdateTime(typeItem);
                UpdateTime(this._itemGameSort, timeLength);
                this.RegisterUpdateTime(typeItem);
                break;
            case TYPE_ITEM.SHUFFLE:
                this.UnRegisterUpdateTime(typeItem);
                UpdateTime(this._itemGameShuffle, timeLength);
                this.RegisterUpdateTime(typeItem);
                break;
            case TYPE_ITEM.VIP_SLOT:
                this.UnRegisterUpdateTime(typeItem);
                UpdateTime(this._itemGameSort, timeLength);
                this.RegisterUpdateTime(typeItem);
                break;
            case TYPE_ITEM.TIME:
                this.UnRegisterUpdateTime(typeItem);
                UpdateTime(this._itemGameTime, timeLength);
                this.RegisterUpdateTime(typeItem);
                break;
            case TYPE_ITEM.HAMMER:
                this.UnRegisterUpdateTime(typeItem);
                UpdateTime(this._itemGameHammer, timeLength);
                this.RegisterUpdateTime(typeItem);
                break;
            case TYPE_ITEM.MAGNIFYING_GLASS:
                this.UnRegisterUpdateTime(typeItem);
                UpdateTime(this._itemGameMagnifyingGlass, timeLength);
                this.RegisterUpdateTime(typeItem);
                break;
        }
    }

    public GetTimeInfi(typeItem: TYPE_ITEM): number {
        if (!this.IsInfinityTime(typeItem)) return -1;
        switch (typeItem) {
            case TYPE_ITEM.SORT: return this._itemGameSort.timeEnd - Utils.getCurrTime();
            case TYPE_ITEM.SHUFFLE: return this._itemGameShuffle.timeEnd - Utils.getCurrTime();
            case TYPE_ITEM.VIP_SLOT: return this._itemGameShuffle.timeEnd - Utils.getCurrTime();
            case TYPE_ITEM.TIME: return this._itemGameTime.timeEnd - Utils.getCurrTime();
            case TYPE_ITEM.HAMMER: return this._itemGameHammer.timeEnd - Utils.getCurrTime();
            case TYPE_ITEM.MAGNIFYING_GLASS: return this._itemGameMagnifyingGlass.timeEnd - Utils.getCurrTime();
        }
    }

    public EmitUpdateItem(typeItem: TYPE_ITEM) {
        clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.UPDATE_NUM_ITEM, typeItem, this.GetNumItem(typeItem));
    }
    //#endregion

    //#region save data
    private SaveItems() {
        PlayerData.Instance._infoItemSort = this._itemGameSort;
        PlayerData.Instance._infoItemShuffle = this._itemGameShuffle;
        PlayerData.Instance._infoItemVipSlot = this._itemGameVipSlot;
        PlayerData.Instance._infoItemTime = this._itemGameTime;
        PlayerData.Instance._infoItemHammer = this._itemGameHammer;
        PlayerData.Instance._infoItemMagnifyingGlass = this._itemGameMagnifyingGlass;
        PlayerData.Instance.SaveResources();
    }
    //#endregion save data
}


