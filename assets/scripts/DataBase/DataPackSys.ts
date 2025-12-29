import { _decorator, Component, game, Node } from 'cc';
import { ENamePACK_UNLIMITED, EnumNamePack, EnumReasonEndPack, InfoPack, InfoPackFromRootJson, TYPE_LEVEL_NORMAL, TypePack } from '../Utils/Types';
import { PlayerData } from '../Utils/PlayerData';
import { ReadDataJson } from '../ReadDataJson';
import { clientEvent } from '../framework/clientEvent';
import { MConst, EVENT_CLOCK_ON_TICK, TYPE_UI } from '../Const/MConst';
import { Utils } from '../Utils/Utils';
import { GameManager } from '../Scene/GameManager';
import { MConfigs } from '../Configs/MConfigs';
import { FBInstantManager } from '../Utils/facebooks/FbInstanceManager';
const { ccclass, property } = _decorator;

/**
 * LƯU Ý KHI SỬ DỤNG CLASS NÀY
 * 1. XIN HÃY KHỞI TẠO Ở ĐÂU ĐÓ TRƯỚC KHI GỌI INSTANCE
 * 2. XIN HÃY LIỆT KÊ NHỮNG PACK NÀO MÀ BẠN MUỐN LƯU TRONG DỮ LIỆU CỦA NGƯỜI CHƠI :
 *        - Pack có sử dụng thời gian tồn tại
 *    CÒN TRONG NHỮNG TRƯỜNG HỢP KHÁC XIN HÃY CHỈ LẤY DỮ LIỆU TỪ TRONG class ReadDataJson để đọc pack từ root json
 * 3. HÃY gọi hàm registerClockGame sau khi đọc được dữ liệu người chơi
 */
@ccclass('DataPackSys')
export class DataPackSys {
    public static Instance: DataPackSys = null;
    constructor() {
        if (DataPackSys.Instance == null) {
            DataPackSys.Instance = this;
        }
    }

    /**
    * Hãy chỉ gọi hàm này sau khi dữ liệu người chơi đã được đọc thành công
    */
    public GetInfoPackFirstGame() {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTimeForPackHas, this);

        // convert the data player to right 
        // bởi vì hàm này sẽ dc gọi sau khi đã đọc dữ liệu người chơi

        const listPackfromRoot = ReadDataJson.Instance.GetDataPacksFromRoot();
        PlayerData.Instance._listTempPack.forEach((item: InfoPack) => {
            const idInfoPack = item.namePack;
            const infoPackFromRoot = listPackfromRoot.find(item => item.namePack == idInfoPack);
            if (infoPackFromRoot != null) {
                let newPack = new InfoPack();
                newPack.readDataFromJson_WhenInit(infoPackFromRoot);
                newPack.numAvaliable = item.numAvaliable;
                newPack.timeLimit = item.timeLimit;
                PlayerData.Instance._listPacksWorking.push(newPack);
            }
        })

        // check đối với user cũ
        if (PlayerData.Instance._version != MConfigs.VERSION_GAME_NOW) {
            switch (true) {
                case MConfigs.VERSION_GAME_NOW == '1.5.1':
                    // trong trường hợp user cũ đã trên level 30 khi chưa mua StarterPack thì hiển thị 2 gói starterPack và gói deal1
                    // gói starterPack sẽ luôn hiển thị theo logic cũ nên ko lo lắng
                    // gói greateDeal1 sẽ có thể rơi vào 2 trường hợp đó là chưa unlock <chưa có trong file save> và đã unlock <có trong file save>
                    // trong case pack chưa có trong fileSave thì ta sẽ force update để có trong file save và coi như đã unlock
                    // còn trong case pack đã có trong file save thì sẽ tuân thủ theo logic cũ đợi reInit lại thôi
                    if (PlayerData.Instance._levelPlayer >= 30 && this.getInfoPackSave(EnumNamePack.GreateDealsPack_1) == null) {
                        // tạo pack greatDeal
                        const packDataRoot = listPackfromRoot.find(packCheck => packCheck.namePack == EnumNamePack.GreateDealsPack_1);
                        if (packDataRoot != null) {
                            let newPack = new InfoPack();
                            newPack.readDataFromJson_WhenInit(packDataRoot);
                            newPack.numAvaliable = packDataRoot.numAvaliable;
                            newPack.timeLimit = packDataRoot.timeLimit;
                            PlayerData.Instance._listPacksWorking.push(newPack);
                        }
                    }
                    break;
            }
        }
    }

    public getInfoPackFromRoot(namePack: EnumNamePack): InfoPackFromRootJson {
        const listDataPack: InfoPackFromRootJson[] = ReadDataJson.Instance.GetDataPacksFromRoot();
        const dataPackFromRoot: InfoPackFromRootJson = listDataPack.find(item => item.namePack == namePack);
        return dataPackFromRoot;
    }

    public getInfoPackUnLimited(namePack: ENamePACK_UNLIMITED): InfoPackFromRootJson {
        const listDataPack: InfoPackFromRootJson[] = ReadDataJson.Instance.GetDataPacksFromRoot();
        const dataPackFromRoot: InfoPackFromRootJson = listDataPack.find(item => item.namePack == namePack);
        return dataPackFromRoot;
    }

    public getInfoPackSave(namePack: EnumNamePack): InfoPack {
        // hiện tại hàm này đang được gọi quá nhiều lần , về mặt logic thì đúng nhưng xin hãy tối ưu hơn
        const listDataPack: InfoPack[] = PlayerData.Instance._listPacksWorking;
        const dataPack: InfoPack = listDataPack.find(item => item.namePack == namePack);
        return dataPack;
    }

    public getListDataPack(): InfoPack[] {
        return PlayerData.Instance._listPacksWorking.filter(item => item.numAvaliable > 0);
    }

    public getListDataPackTemp(): InfoPack[] {
        // get hack packs from root json
        const packStarted: InfoPackFromRootJson = this.getInfoPackFromRoot(EnumNamePack.StartedPack);
        let newPackStarted: InfoPack = new InfoPack();
        newPackStarted.readDataFromJson_WhenInit(packStarted);
        const pack1: InfoPackFromRootJson = this.getInfoPackFromRoot(EnumNamePack.GreateDealsPack_1);
        let newPack1: InfoPack = new InfoPack();
        newPack1.readDataFromJson_WhenInit(pack1);
        const pack2: InfoPackFromRootJson = this.getInfoPackFromRoot(EnumNamePack.GreateDealsPack_2);
        let newPack2: InfoPack = new InfoPack();
        newPack2.readDataFromJson_WhenInit(pack2);

        return [newPackStarted, newPack1, newPack2];
    }

    public AddNewPack(namePack: EnumNamePack) {
        const listDataPack: InfoPackFromRootJson[] = ReadDataJson.Instance.GetDataPacksFromRoot();
        const dataPackFromRoot: InfoPackFromRootJson = listDataPack.find(item => item.namePack == namePack);
        if (dataPackFromRoot != null) {
            let newPack: InfoPack = new InfoPack();
            newPack.readDataFromJson_WhenInit(dataPackFromRoot);
            // check if no pack in save file => not overwrite
            const indexPackFromSave: number = PlayerData.Instance._listPacksWorking.findIndex(item => item.namePack == namePack && item.timeAutoReset > 0);
            if (indexPackFromSave != -1) {
                PlayerData.Instance._listPacksWorking[indexPackFromSave] = newPack;
            } else {
                PlayerData.Instance._listPacksWorking.push(newPack);
                PlayerData.Instance.SaveDataPack();
            }
        }
    }

    InitAllNewPackType(type: TypePack): InfoPack[] {
        const listDataPack: InfoPackFromRootJson[] = ReadDataJson.Instance.GetDataPacksFromRoot();
        let result = []
        listDataPack.forEach(item => {
            if (item.type == type) {
                let newPack: InfoPack = new InfoPack();
                newPack.readDataFromJson_WhenInit(item);
                result.push(newPack)
            }
        })

        return result;
    }

    public InitPack(namePack: EnumNamePack): InfoPack {
        const listDataPack: InfoPackFromRootJson[] = ReadDataJson.Instance.GetDataPacksFromRoot();
        const dataPackFromRoot: InfoPackFromRootJson = listDataPack.find(item => item.namePack == namePack);
        if (dataPackFromRoot != null) {
            let newPack: InfoPack = new InfoPack();
            newPack.readDataFromJson_WhenInit(dataPackFromRoot);
            return newPack;
        }
        return null;
    }

    public RemoveForcePack(namePack: EnumNamePack) {
        const indexPack: number = PlayerData.Instance._listPacksWorking.findIndex(item => item.namePack == namePack);
        if (indexPack > 0) {
            const pack: InfoPack = PlayerData.Instance._listPacksWorking[indexPack];
            if (pack.namePack != EnumNamePack.StartedPack) {
                // PlayerData.Instance._listPacksWorking.splice(indexPack, 1);
                PlayerData.Instance.SaveDataPack();
            }
            // auto emit force remove
            clientEvent.dispatchEvent(MConst.EVENT_PACK.REMOVE_PACK, EnumReasonEndPack.Force, pack.namePack);
        }
    }

    /**
     * You can send amount > 0 or < 0 suit for you want increase or decrease
     * ```
     * ```
     * but if it decrease than the amount < 0 => it will auto call remove pack 
     * => then it call emit remove pack for UI
     * so be carefull when use this func
     * @param namePack 
     * @param amount 
     */
    public AddNumAvailablePack(namePack: EnumNamePack, amount: number) {
        const indexPack: number = PlayerData.Instance._listPacksWorking.findIndex(item => item.namePack == namePack);
        if (indexPack >= 0) {
            let pack: InfoPack = PlayerData.Instance._listPacksWorking[indexPack];
            pack.numAvaliable += amount;

            //remove pack if not valid amount
            if (PlayerData.Instance._listPacksWorking[indexPack].numAvaliable <= 0) {
                // nếu time auto reset = 0 tức là pack được tạo một cách độc lập không liên quan đến pack đã tồn tại
                if (pack.timeAutoReset > 0) {
                    if (pack.namePack != EnumNamePack.StartedPack) {
                        // PlayerData.Instance._listPacksWorking.splice(indexPack, 1);
                    }
                }
                clientEvent.dispatchEvent(MConst.EVENT_PACK.REMOVE_PACK, EnumReasonEndPack.Force, pack.namePack);
            }
            PlayerData.Instance.SaveDataPack();
        }
    }

    private UpdateTimeForPackHas() {
        const timeCurrent = Utils.getCurrTime();
        for (let i = 0; i < PlayerData.Instance._listPacksWorking.length; i++) {
            const infoPack: InfoPack = PlayerData.Instance._listPacksWorking[i];

            // check in case something wrong when run logic
            if (infoPack == null) {
                return;
            }

            // check if pack is end => remove it out of list save player
            if (infoPack.timeLimit <= timeCurrent && infoPack.type == 'IAP') {
                // nếu time auto reset = 0 tức là pack được tạo một cách độc lập không liên quan đến pack đã tồn tại
                if (infoPack.timeAutoReset > 0 && PlayerData.Instance._listPacksWorking[i] != null) {
                    PlayerData.Instance._listPacksWorking[i].timeAutoReset = 0;
                    PlayerData.Instance.SaveDataPack();
                }
                if (infoPack.namePack != EnumNamePack.StartedPack) {
                    clientEvent.dispatchEvent(MConst.EVENT_PACK.REMOVE_PACK, EnumReasonEndPack.EndTime, infoPack.namePack)
                }
            }
        }
    }

    public CheckLogicCanInitPack(namePack: EnumNamePack): boolean {
        const infoPackSave: InfoPack = this.getInfoPackSave(namePack);

        const levelPlayerNow = GameManager.Instance.levelPlayerNow;
        const timeNow: number = Utils.getCurrTime();

        // check IAP
        if (!FBInstantManager.Instance.checkHaveIAPPack_byProductID(namePack)) { return false; }

        // check other logic init pack
        switch (namePack) {
            case EnumNamePack.StartedPack:
                switch (true) {
                    case levelPlayerNow < MConfigs.UNLOCK_PACK_STARTER:
                        return false;
                    case levelPlayerNow == MConfigs.UNLOCK_PACK_STARTER && infoPackSave == null:
                        return true;
                }
                break;
            case EnumNamePack.GreateDealsPack_1:
                switch (true) {
                    case levelPlayerNow < MConfigs.UNLOCK_PACK_GREATE_DEALS_1:
                        return false;
                    case levelPlayerNow == MConfigs.UNLOCK_PACK_GREATE_DEALS_1 && !this.IsPackWasBought(EnumNamePack.StartedPack) && infoPackSave == null:
                        return true;
                }
                break;
            case EnumNamePack.GreateDealsPack_2:
                // Logic ở đây
                // 1 là nếu user vượt qua mốc level 30 và đã mua gói starterPack => sẽ ưu tiên hiển thị pack2
                // 2 là nếu user vượt qua mốc level 30 và mua gói staterPack sau khi qua level 30 => vẫn sẽ tiếp tục hiển thị GreatDeal
                // 3 là nếu user vượt qua mốc level 30 và mua gói starterPack sau khi qua level 30 => mua gói GreatDeal trước level 50 => ko hiển thi gói GreatDeal2
                // 4 là nếu user vượt qua mốc level 50 và chưa mua gói greateDeal => tiếp tục hiển thị GreatDeal
                // 5 là nếu user vượt qua mốc level 50 và đã mua gói greateDeal trước level 50 => hiển thị greatDeal2
                // 6 là nếu user vượt qua mốc level 50 và mua gói greateDeal sau level 50 thì khi về main sẽ hiển thị greatDeal2
                // 7 là nếu user đang ở level nằm trong khoảng level 30 và 50 và họ đã mua starter pack và greateDeal1 đã hết thời gian thì greatDeal2 có thể hiển thị

                const infoPackDeal_1: InfoPack = this.getInfoPackSave(EnumNamePack.GreateDealsPack_1);
                const infoPackStarter: InfoPack = this.getInfoPackSave(EnumNamePack.StartedPack);

                if (levelPlayerNow < MConfigs.UNLOCK_PACK_GREATE_DEALS_1) {
                    return false;
                }

                switch (true) {
                    // check case user ở level 50 đã mua pack staterPack
                    case levelPlayerNow < MConfigs.UNLOCK_PACK_GREATE_DEALS_1:
                        return false;
                    case levelPlayerNow == MConfigs.UNLOCK_PACK_GREATE_DEALS_1
                        && infoPackDeal_1 == null
                        && this.IsPackWasBought(EnumNamePack.StartedPack)
                        && infoPackSave == null:
                        return true;
                    case levelPlayerNow > MConfigs.UNLOCK_PACK_GREATE_DEALS_1
                        && levelPlayerNow < MConfigs.UNLOCK_PACK_GREATE_DEALS_2
                        && infoPackDeal_1 != null
                        && infoPackDeal_1.timeAutoReset < timeNow
                        && infoPackStarter != null
                        && infoPackStarter.numAvaliable == 0
                        && infoPackSave == null:
                        return true;
                    case levelPlayerNow >= MConfigs.UNLOCK_PACK_GREATE_DEALS_2 && infoPackDeal_1 != null && infoPackDeal_1.numAvaliable == 0 && infoPackSave == null:
                        return true;
                }
                break;
        }

        return false;
    }

    public CheckLogicCanReInitPack(namePack: EnumNamePack): boolean {
        const infoPackSave: InfoPack = this.getInfoPackSave(namePack);
        const infoPackRoot: InfoPackFromRootJson = this.getInfoPackFromRoot(namePack);
        const levelPlayerNow = GameManager.Instance.levelPlayerNow;
        const currentTime = Utils.getCurrTime();

        // check IAP
        if (!FBInstantManager.Instance.checkHaveIAPPack_byProductID(namePack)) { return false; }

        // check other logic init pack
        switch (namePack) {
            case EnumNamePack.GreateDealsPack_1:
                const infoPackStater_save = this.getInfoPackSave(EnumNamePack.StartedPack);
                const infoPackGD2_save = this.getInfoPackSave(EnumNamePack.GreateDealsPack_2);

                switch (true) {
                    case levelPlayerNow < MConfigs.UNLOCK_PACK_GREATE_DEALS_1:
                        return false;
                    // kiểm tra xem pack starter đã mua chưa? nếu đã mua thì pack starter thì sẽ không được reset nữa
                    case levelPlayerNow >= MConfigs.UNLOCK_PACK_GREATE_DEALS_1
                        && levelPlayerNow <= MConfigs.UNLOCK_PACK_GREATE_DEALS_2
                        && infoPackStater_save != null
                        && infoPackStater_save.numAvaliable > 0
                        && infoPackSave != null
                        && infoPackSave.numAvaliable > 0
                        && infoPackSave.timeLimit + infoPackRoot.timeAutoReset < currentTime:
                        return true;
                    // trong case này chúng ta ko kiểm tra xem pack start đã được mua hay chưa
                    // thay vào đó chúng ta sẽ kiểm tra pack 2 đã được tạo hay chưa
                    // bởi vì nếu pack2 đã được tạo rùi thì pack1 sẽ không được phép tạo nữa
                    // theo luồng logic trong GD ở đây pack 2 
                    case levelPlayerNow >= MConfigs.UNLOCK_PACK_GREATE_DEALS_1
                        && infoPackGD2_save == null
                        && infoPackSave != null
                        && infoPackSave.numAvaliable > 0
                        && infoPackSave.timeLimit + infoPackRoot.timeAutoReset < currentTime:
                        return true;
                }
                break;
            case EnumNamePack.GreateDealsPack_2:
                switch (true) {
                    case levelPlayerNow < MConfigs.UNLOCK_PACK_GREATE_DEALS_1:
                        return false;
                    case levelPlayerNow >= MConfigs.UNLOCK_PACK_GREATE_DEALS_1
                        && levelPlayerNow < MConfigs.UNLOCK_PACK_GREATE_DEALS_2
                        && this.IsPackWasBought(EnumNamePack.StartedPack)
                        && infoPackSave != null
                        && infoPackSave.numAvaliable > 0
                        && infoPackSave.timeLimit + infoPackRoot.timeAutoReset < currentTime:
                        return true;
                    case levelPlayerNow >= MConfigs.UNLOCK_PACK_GREATE_DEALS_2
                        && this.IsPackWasBought(EnumNamePack.GreateDealsPack_1)
                        && infoPackSave != null
                        && infoPackSave.numAvaliable > 0
                        && infoPackSave.timeLimit + infoPackRoot.timeAutoReset < currentTime:
                        return true;

                }
                break;
        }

        return false;
    }

    /**
     * Check xem pack còn số lượng có thể mua hay không
     * Check xem pack còn thời hạn mua hay không
     * @param namePack 
     * @returns 
     */
    public CheckLogicIsRemaingPack(namePack: EnumNamePack): boolean {
        const packCheckInData: InfoPack = this.getInfoPackSave(namePack);
        const timeCurrence = Utils.getCurrTime();

        if (packCheckInData == null) return false;

        switch (namePack) {
            case EnumNamePack.GreateDealsPack_1: case EnumNamePack.GreateDealsPack_2:
                if (packCheckInData.numAvaliable > 0 && timeCurrence < packCheckInData.timeLimit) {
                    return true;
                }
                break;
            case EnumNamePack.StartedPack:
                if (packCheckInData.numAvaliable > 0) {
                    return true;
                }
                break;
        }

        return false;
    }

    /**
     * Check xem pack còn đủ số lượng mua hay không
     * @param namePack 
     * @returns 
     */
    public CheckLogicIsRemaingPack2(namePack: EnumNamePack): boolean {
        const packCheckInData: InfoPack = this.getInfoPackSave(namePack);
        if (packCheckInData == null) return false;
        switch (namePack) {
            case EnumNamePack.StartedPack: case EnumNamePack.GreateDealsPack_1: case EnumNamePack.GreateDealsPack_1:
                if (packCheckInData.numAvaliable > 0) {
                    return true;
                }
                break;
        }
    }


    //#region Packs Lose
    /**
     * Được gọi ngay sau TryResetAllPackLose trong LoadingSceneSys
     */
    public UpdateLocalDataPack() {
        if (PlayerData.Instance._listPackLose.length == 0) { return; }

        let listPackLoseFromJson = this.InitAllNewPackType('LOSE');

        let result = [];

        // filter all pack save in player data
        listPackLoseFromJson.forEach(packJson => {
            const existingPack = PlayerData.Instance._listPackLose.find(packSave => packSave.namePack === packJson.namePack);
            if (existingPack) {
                packJson.copyDataFromPackSave(existingPack);
                result.push(packJson);
            }
        });

        PlayerData.Instance._listPackLose = result;
    }

    /**
     * Được gọi trong UIContinue
     * @returns danh sách các pack
     */
    public GetAllPackLose(typeLevel: TYPE_LEVEL_NORMAL): InfoPack[] {

        function GetAllPackSuitTypeLevel(listPackFilter: InfoPack[], typeLevel: TYPE_LEVEL_NORMAL): InfoPack[] {
            switch (true) {
                case typeLevel == TYPE_LEVEL_NORMAL.NORMAL:
                    listPackFilter = listPackFilter.filter(item => item.namePack == EnumNamePack.TravelDeal);
                    break;
                case typeLevel == TYPE_LEVEL_NORMAL.HARD:
                    listPackFilter = listPackFilter.filter(item => item.namePack == EnumNamePack.TravelDeal || item.namePack == EnumNamePack.HardLevelOffer);
                    break;
                case typeLevel == TYPE_LEVEL_NORMAL.SUPER_HARD:
                    listPackFilter = listPackFilter.filter(item => item.namePack == EnumNamePack.TravelDeal || item.namePack == EnumNamePack.HardLevelOffer || item.namePack == EnumNamePack.SuperHardLevelOffer);
                    break;
                default:
                    break;
            }
            return listPackFilter;
        }


        let listPackLoseJson: InfoPack[] = this.InitAllNewPackType('LOSE');
        // filter all pack lose can purchase
        listPackLoseJson.filter(item => FBInstantManager.Instance.checkHaveIAPPack_byProductID(item.namePack));

        // filter all pack can have suit with typeLevel
        listPackLoseJson = GetAllPackSuitTypeLevel(listPackLoseJson, typeLevel);

        // get from player data
        let result = PlayerData.Instance._listPackLose;
        // if empty => init new pack and save dataPlayer
        if (result == null || result.length == 0) {
            // save to player data
            PlayerData.Instance._listPackLose = listPackLoseJson;
            PlayerData.Instance.SaveDataPack();
            result = listPackLoseJson;
            return result;
        } else {
            // if not => check all the pack in player data 
            // and check if it has all the pack suit level or not? if not yet => add it to list pack lose
            let listPackNew: InfoPack[] = listPackLoseJson.filter(item => {
                return result.findIndex(item2 => item2.namePack == item.namePack) == -1;
            });

            if (listPackNew.length > 0) {
                PlayerData.Instance._listPackLose.push(...listPackNew);
                PlayerData.Instance.SaveDataPack();
                result = PlayerData.Instance._listPackLose;
            }
            return result;
        }
    }

    /**
     * được gọi ở LoadingSceneSys và trong PageHomeSys
     * @param needSaveData 
     */
    public TryResetAllPackLose(needSaveData: boolean) {
        // tính theo local time
        if (Utils.compareDateIsNextDayLocal(PlayerData.Instance._lastTimeSavePackLose)) {
            // console.log("reset all pack lose", PlayerData.Instance._lastTimeSavePackLose);
            // nếu đã qua ngày mới thì lưu lại thời gian và set danh sách pack về []
            PlayerData.Instance._lastTimeSavePackLose = Utils.getTimeToDayLocal();
            PlayerData.Instance._listPackLose = [];
            PlayerData.Instance.SaveDataPack(needSaveData);
        }
    }

    public ReInitPack(packCheck: EnumNamePack, needSaveData: boolean = true) {
        const infoPack = this.getInfoPackSave(packCheck);
        if (infoPack == null) { return; }
        const infoPackRoot = this.getInfoPackFromRoot(packCheck);
        infoPack.timeLimit = Utils.getCurrTime() + infoPackRoot.timeLimit;
        PlayerData.Instance.SaveDataPack(needSaveData);
    }

    public IsPackOngoing(packCheck: EnumNamePack): boolean {
        const infoPackSave = this.getInfoPackSave(packCheck);
        if (infoPackSave == null) { return false; }
        const infoPackRoot = this.getInfoPackFromRoot(packCheck);
        // check if is pack starter pack => it can not reset any thing
        switch (true) {
            case packCheck == EnumNamePack.StartedPack:
                return infoPackSave.numAvaliable > 0;
            default:
                const isPackOngoing = infoPackSave.timeLimit + infoPackRoot.timeAutoReset > Utils.getCurrTime();
                const isPackHasRemaing = infoPackSave.numAvaliable > 0;
                return isPackOngoing && isPackHasRemaing;
        }
    }

    public IsPackWasBought(packCheck: EnumNamePack): boolean {
        const infoPackSave = this.getInfoPackSave(packCheck);
        if (infoPackSave == null) { return false; }
        const infoPackRoot = this.getInfoPackFromRoot(packCheck);
        return infoPackSave.numAvaliable < infoPackRoot.numAvaliable;
    }

    public CheckTimePack(dataPack: InfoPack): boolean {
        if (dataPack == null) return false;
        return Utils.getCurrTime() > dataPack.timeLimit;
    }

    public GetInfoPackLoseSave(enumNamePack: EnumNamePack): InfoPack {
        let itemFound = PlayerData.Instance._listPackLose.find(item => {
            if (item.namePack == enumNamePack) {
                return item;
            }
        });

        return itemFound;
    }

    /**
     * You can send amount > 0 or < 0 suit for you want increase or decrease
     * ```
     * ```
     * if(amount < 0)=> then it call emit remove pack for UI
     * so be carefull when use this func
     * @param namePack 
     * @param amount 
     */
    public AddNumAvailablePackLose(namePack: EnumNamePack, amount: number) {
        const indexPack: number = PlayerData.Instance._listPackLose.findIndex(item => item.namePack == namePack);
        if (indexPack >= 0) {
            let pack: InfoPack = PlayerData.Instance._listPackLose[indexPack];
            pack.numAvaliable += amount;

            if (pack.numAvaliable <= 0) {
                // console.log(namePack, "pack lose remove force", pack.numAvaliable, pack.namePack);
                clientEvent.dispatchEvent(MConst.EVENT_PACK.REMOVE_PACK, EnumReasonEndPack.Force, pack.namePack);
            }
            PlayerData.Instance.SaveDataPack();
        }
    }
    //#endregion Packs Lose

    public TotalSpendingMoneyOfUser(): number {
        let totalSpending: number = 0;
        const listDataPack: InfoPackFromRootJson[] = ReadDataJson.Instance.GetDataPacksFromRoot();
        PlayerData.Instance._listPacksWorking.forEach(pack => {
            // kiểm tra số lần pack đã được sử dựng đối chiếu với thông tin pack root để tính tổng chi tiêu
            const packFromRoot = listDataPack.find(packRoot => packRoot.namePack == pack.namePack);
            if (packFromRoot != null) {
                const numUse = packFromRoot.numAvaliable - pack.numAvaliable;
                if (numUse > 0) {
                    totalSpending += numUse * Number.parseFloat(packFromRoot.price);
                }
            }
        })

        return totalSpending;
    }
}

export function ConvertNameUIPackToTypeUI(namePack: EnumNamePack): TYPE_UI {
    switch (namePack) {
        case EnumNamePack.StartedPack:
            return TYPE_UI.UI_PACK_STARTER;
        case EnumNamePack.GreateDealsPack_1:
            return TYPE_UI.UI_PACK_GREATE_DEALS_1;
        case EnumNamePack.GreateDealsPack_2:
            return TYPE_UI.UI_PACK_GREATE_DEALS_2;
    }
}


