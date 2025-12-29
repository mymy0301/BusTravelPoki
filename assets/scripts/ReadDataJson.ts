import { _decorator, Component, Node, Vec3 } from 'cc';
import { ConfigPosPassJsonCar, IInfoJsonDailyQuest, IInfoPrizeProgressSpin, IInfoPrizeSpin, InfoItemBundleStore, InfoPack, InfoPackChristmasAFO, InfoPackEndlessTreasure, InfoPackFromRootJson, InfoPrizeFriendJoined, InfoPrizePass, InfoPrizeSeasonPass, InfoProgressLoginReward, IPrize, TYPE_CAR_SIZE, TYPE_PRIZE, TYPE_RECEIVE } from './Utils/Types';
import { InfoPrizeLevelProgressionJSON } from './Scene/OtherUI/UILevelProgression/TypeLevelProgress';
import { InfoTreasureTrailJSON } from './Scene/OtherUI/UITreasureTrail/TypeTreasureTrail';
import * as dataJsonStore from './MJson/JsonStore.json';
import * as dataJsonPrizeSpin from './MJson/JsonSpin.json';
import * as dataJsonPacks from './MJson/JsonPack.json';
import * as dataJsonPacksHalloween from './MJson/JsonPack_Halloween.json';
import * as dataJsonPacksChristmas from './MJson/JsonPack_Christmas.json';
import * as dataJsonPacksBlackFriday from './MJson/JsonPack_BlackFriday.json';
import * as dataJsonPrizeSeasonPass from './MJson/JsonPrizeSeasonPass.json';
import * as dataJsonPrizeLevelPass from './MJson/JsonPrizeLevelPass.json';
import * as dataJsonPrizeLogReward from './MJson/JsonLoginReward.json';
import * as dataJsonDailyQuest from './MJson/JsonDailyQuest.json'
import * as dataJsonPrizeFriendJoined from './MJson/JsonPrizeFriendJoined.json';
import * as dataJsonPrizeEndlessTreasure from './MJson/JsonEndlessTreasure.json';
import * as dataJsonPrizeLevelProgression from './MJson/JsonPrizeLevelProgression.json';
import * as dataJsonTreasureTrail from './MJson/JsonTreasureTrail.json';
import * as dataJsonSkyLift from './MJson/JsonSkyLift.json';
import * as dataJsonLightRoad from './MJson/JsonLightRoad.json';
import * as dataJsonHatRace from './MJson/JsonHatRace.json';
import * as ConfigCarJson from './MJson/ConfigCar.json';
import { Utils } from './Utils/Utils';
import { InfoFloorSkyLiftJSON } from './Scene/OtherUI/UISkyLift/TypeSkyLift';
import { IInfoChestLightRoad } from './Scene/OtherUI/UIChristmasEvent/LightRoad/TypeLightRoad';
const { ccclass, property } = _decorator;

@ccclass('ReadDataJson')
export class ReadDataJson {
    public static Instance: ReadDataJson = null;

    // spin
    private _dataJsonPrizeSpin: IInfoPrizeSpin[] = [];
    private _dataJsonPrizeSpinSpecialSlot: IInfoPrizeSpin[] = [];
    private _dataJsonProgressSpin: IInfoPrizeProgressSpin[] = [];
    // pack
    private _dataJsonPacksFromRoot: InfoPackFromRootJson[] = [];
    private _dataJsonPacksHalloween: InfoPackFromRootJson[] = [];
    private _dataJsonPacksChristmas: InfoPackFromRootJson[] = [];
    private _dataJsonPacksAllForOneChristmas: InfoPackChristmasAFO[] = [];
    // friend
    private _dataJsonPrizeFriendJoined: InfoPrizeFriendJoined[] = [];
    // season pass
    private _dataJsonPrizeSeasonPass: InfoPrizePass[] = [];
    private _dataJsonLastPrizeSeasonPass: IPrize[] = [];
    // level pass
    private _dataJsonPrizeLevelPass: InfoPrizePass[] = [];
    private _dataJsonLastPrizeLevelPass: IPrize[] = [];
    // log reward
    private _dataJsonLogReward: IPrize[][] = [];
    private _dataJsonProgressLogReward: InfoProgressLoginReward[] = [];
    // daily challenge
    private _dataJsonDailyQuest: IInfoJsonDailyQuest[] = [];
    // shop
    private _dataJsonShop_Coins: InfoItemBundleStore[] = null;
    private _dataJsonShop_Tickets: InfoItemBundleStore[] = null;
    // endlessTreasure
    private _dataJsonEndlessTreasure: InfoPackEndlessTreasure[] = null;
    // level progression
    private _dataJsonLevelProgression: InfoPrizeLevelProgressionJSON[] = null;
    // treasure trail
    private _dataJsonTreasureTrail: InfoTreasureTrailJSON = null;
    // Sky lift
    private _dataJsonSkyLift: InfoFloorSkyLiftJSON[] = null;
    // Light road
    private _dataJsonLightRoad: IInfoChestLightRoad[] = null;
    // Hat race
    private _dataJsonPrizeHatRace: IPrize[][] = [];
    // black friday
    private _dataJsonBlackFriday: InfoPackFromRootJson[] = [];


    // config car
    private _dataConfigPosPassCar: ConfigPosPassJsonCar[] = [];

    constructor() {
        if (ReadDataJson.Instance == null) {
            ReadDataJson.Instance = this;
            //Read data in here
            this.ReadSpin();
            this.ReadStore();
            this.ReadPacks();
            this.ReadSeasonPass();
            this.ReadLevelPass();
            this.ReadLoginReward();
            this.ReadDailyQuest();
            this.ReadPrizeFriendJoin();
            this.ReadEndlessTreasure();
            this.ReadPrizeLevelProgress();
            this.ReadTreasureTrail();
            this.ReadSkyLift();
            this.ReadPackBlackFriday();

            // event game
            this.ReadPacksHalloween();
            this.ReadPackChristmas();
            this.ReadLightRoad();
            this.ReadHatRace();

            // read config here
            this.ReadConfigCar();
        }
    }

    //#region READ DATA
    private ReadStore() {
        // read data
        let dataStore = dataJsonStore["default"];

        // ===============================================================================================
        // ==================================================== read coin ================================
        // ===============================================================================================
        let dataReadCoin: InfoItemBundleStore[] = <InfoItemBundleStore[]>dataStore["SHOP_COIN"];
        let resultCoins: InfoItemBundleStore[] = [];
        for (let i = 0; i < dataReadCoin.length; i++) {
            let nInfoItemBundleStore: InfoItemBundleStore = new InfoItemBundleStore();
            // read data
            const data = dataReadCoin[i];

            nInfoItemBundleStore.idBundle = data.idBundle;
            nInfoItemBundleStore.typeUI = data.typeUI;
            nInfoItemBundleStore.nameBundle = data.nameBundle;
            nInfoItemBundleStore.price = `${data.price}$`;
            nInfoItemBundleStore.listItems = ReadJsonOptimized(data);

            // push data
            resultCoins.push(nInfoItemBundleStore);
        }

        // save data
        this._dataJsonShop_Coins = resultCoins;

        // ===============================================================================================
        // ==================================================== read ticket ==============================
        // ===============================================================================================
        let dataReadTicket: InfoItemBundleStore[] = <InfoItemBundleStore[]>dataStore["SHOP_TICKET"];
        let resultTickets: InfoItemBundleStore[] = [];
        for (let i = 0; i < dataReadTicket.length; i++) {
            let nInfoItemBundleStore: InfoItemBundleStore = new InfoItemBundleStore();
            // read data
            const data = dataReadTicket[i];

            nInfoItemBundleStore.idBundle = data.idBundle;
            nInfoItemBundleStore.typeUI = data.typeUI;
            nInfoItemBundleStore.nameBundle = data.nameBundle;
            nInfoItemBundleStore.price = `${data.price}$`;
            nInfoItemBundleStore.listItems = ReadJsonOptimized(data);

            // push data
            resultTickets.push(nInfoItemBundleStore);
        }

        // save data
        this._dataJsonShop_Tickets = resultTickets;
    }

    private ReadSpin() {
        let dataSpin = dataJsonPrizeSpin["default"];
        const dataSpinNormal = dataSpin["SPIN"];
        let resultSpinNormal: IInfoPrizeSpin[] = [];

        //============================= read prize spin normal =====================
        for (let i = 0; i < dataSpinNormal.length; i++) {
            let newIInfoPrizeSpin: IInfoPrizeSpin = {
                rate: 0,
                listItem: []
            };

            // read data
            newIInfoPrizeSpin.rate = Number.parseFloat(dataSpinNormal[i].RATE);
            newIInfoPrizeSpin.listItem = ReadJsonOptimized(dataSpinNormal[i]);
            // push data
            resultSpinNormal.push(newIInfoPrizeSpin);
        }
        //save data
        this._dataJsonPrizeSpin = resultSpinNormal;

        //============================= read prize spin special =====================
        const dataSpinSpecial = dataSpin["SPECIAL_SLOT"];
        let resultSpinSpecial: IInfoPrizeSpin[] = [];
        for (let i = 0; i < dataSpinSpecial.length; i++) {
            let newIInfoPrizeSpin: IInfoPrizeSpin = {
                rate: 0,
                listItem: []
            };
            // read data
            newIInfoPrizeSpin.rate = Number.parseFloat(dataSpinSpecial[i].RATE);
            newIInfoPrizeSpin.listItem = ReadJsonOptimized(dataSpinSpecial[i]);

            // push data
            resultSpinSpecial.push(newIInfoPrizeSpin);
        }
        //save data
        this._dataJsonPrizeSpinSpecialSlot = resultSpinSpecial;

        // ================ read prgogress spin ===================
        const dataReadProgress = dataSpin['PROGRESS_SPIN'];
        let resultSpinProgress: IInfoPrizeProgressSpin[] = [];
        for (let i = 0; i < dataReadProgress.length; i++) {
            let infoProgressSpin: IInfoPrizeProgressSpin = {
                progress: 0,
                listItem: []
            };

            // read data
            infoProgressSpin.progress = Number.parseInt(dataReadProgress[i].progress);
            infoProgressSpin.listItem = ReadJsonOptimized(dataReadProgress[i]);
            // push data + save data
            resultSpinProgress.push(infoProgressSpin);
        }
        this._dataJsonProgressSpin = resultSpinProgress
    }

    private ReadPacks() {
        let dataPacks = dataJsonPacks["default"];
        let dataRead = dataPacks["JsonPack"];

        let result: InfoPackFromRootJson[] = [];
        for (let i = 0; i < dataRead.length; i++) {
            let nInfoPackFromRootJson: InfoPackFromRootJson = new InfoPackFromRootJson();
            // read data
            let data = dataRead[i];
            nInfoPackFromRootJson.namePack = data.namePack;
            nInfoPackFromRootJson.nameUI = data.nameUI;
            nInfoPackFromRootJson.Prizes = ReadJsonOptimized(data.Prizes);
            nInfoPackFromRootJson.Sale = data.Sale;
            nInfoPackFromRootJson.numAvaliable = data.numAvaliable;
            nInfoPackFromRootJson.timeLimit = data.timeLimit;
            nInfoPackFromRootJson.timeAutoReset = data.timeAutoReset;
            nInfoPackFromRootJson.price = `${data.price}`;
            nInfoPackFromRootJson.type = data.type;
            nInfoPackFromRootJson.isBestSellerRibbon = data.isBestSellerRibbon != null ? true : false

            // push data
            result.push(nInfoPackFromRootJson);
        }
        // save data
        this._dataJsonPacksFromRoot = result;
    }

    private ReadPackBlackFriday() {
        let dataPacks = dataJsonPacksBlackFriday["default"];
        let dataRead = dataPacks["JsonPackBlackFriday"];

        let result: InfoPackFromRootJson[] = [];
        for (let i = 0; i < dataRead.length; i++) {
            let nInfoPackFromRootJson: InfoPackFromRootJson = new InfoPackFromRootJson();
            // read data
            let data = dataRead[i];
            nInfoPackFromRootJson.namePack = data.namePack;
            nInfoPackFromRootJson.nameUI = data.nameUI;
            nInfoPackFromRootJson.Prizes = ReadJsonOptimized(data.Prizes);
            nInfoPackFromRootJson.Sale = data.Sale;
            nInfoPackFromRootJson.numAvaliable = data.numAvaliable;
            nInfoPackFromRootJson.timeLimit = data.timeLimit;
            nInfoPackFromRootJson.timeAutoReset = data.timeAutoReset;
            nInfoPackFromRootJson.price = `${data.price}`;
            nInfoPackFromRootJson.type = data.type;
            nInfoPackFromRootJson.isBestSellerRibbon = data.isBestSellerRibbon != null ? true : false

            // push data
            result.push(nInfoPackFromRootJson);
        }
        // save data
        this._dataJsonBlackFriday = result;

    }

    private ReadPacksHalloween() {
        let dataPacks = dataJsonPacksHalloween["default"];
        let dataRead = dataPacks["JsonPackHalloween"];

        let result: InfoPackFromRootJson[] = [];
        for (let i = 0; i < dataRead.length; i++) {
            let nInfoPackFromRootJson: InfoPackFromRootJson = new InfoPackFromRootJson();
            // read data
            let data = dataRead[i];
            nInfoPackFromRootJson.namePack = data.namePack;
            nInfoPackFromRootJson.nameUI = data.nameUI;
            nInfoPackFromRootJson.Prizes = ReadJsonOptimized(data.Prizes);
            nInfoPackFromRootJson.Sale = data.Sale;
            nInfoPackFromRootJson.numAvaliable = data.numAvaliable;
            nInfoPackFromRootJson.timeLimit = data.timeLimit;
            nInfoPackFromRootJson.timeAutoReset = data.timeAutoReset;
            nInfoPackFromRootJson.price = `${data.price}`;
            nInfoPackFromRootJson.type = data.type;
            nInfoPackFromRootJson.isBestSellerRibbon = data.isBestSellerRibbon != null ? true : false

            // push data
            result.push(nInfoPackFromRootJson);
        }
        // save data
        this._dataJsonPacksHalloween = result;
    }

    private ReadPackChristmas() {
        let dataPacks = dataJsonPacksChristmas["default"];
        let dataRead = dataPacks["JsonPackChristmas"];

        let result: InfoPackFromRootJson[] = [];
        for (let i = 0; i < dataRead.length; i++) {
            let nInfoPackFromRootJson: InfoPackFromRootJson = new InfoPackFromRootJson();
            // read data
            let data = dataRead[i];
            nInfoPackFromRootJson.namePack = data.namePack;
            nInfoPackFromRootJson.nameUI = data.nameUI;
            nInfoPackFromRootJson.Prizes = ReadJsonOptimized(data.Prizes);
            nInfoPackFromRootJson.Sale = data.Sale;
            nInfoPackFromRootJson.numAvaliable = data.numAvaliable;
            nInfoPackFromRootJson.timeLimit = data.timeLimit;
            nInfoPackFromRootJson.timeAutoReset = data.timeAutoReset;
            nInfoPackFromRootJson.price = `${data.price}`;
            nInfoPackFromRootJson.type = data.type;
            nInfoPackFromRootJson.isBestSellerRibbon = data.isBestSellerRibbon != null ? true : false

            // push data
            result.push(nInfoPackFromRootJson);
        }

        let dataReadAFO = dataPacks["JsonPackChooseOne"];
        let resultAFO: InfoPackChristmasAFO[] = [];
        try {
            for (let i = 0; i < dataReadAFO.length; i++) {
                let nInfoPackFromRoot = new InfoPackChristmasAFO();
                // read data
                let data = dataReadAFO[i];
                nInfoPackFromRoot.namePack = data.namePack;
                nInfoPackFromRoot.nameUI = data.nameUI;
                nInfoPackFromRoot.allPack = [];
                for (const info of data.allPack as any[]) {
                    nInfoPackFromRoot.allPack.push({
                        namePack: info.namePack,
                        price: info.price,
                        Prizes: ReadJsonOptimized(info.Prizes)
                    })
                }
                nInfoPackFromRoot.numAvaliable = data.numAvaliable;
                nInfoPackFromRoot.timeLimit = data.timeLimit;
                nInfoPackFromRoot.timeAutoReset = data.timeAutoReset;
                nInfoPackFromRoot.PriceTotal = `${data.PriceTotal}`;
                nInfoPackFromRoot.type = data.type;

                //push data
                resultAFO.push(nInfoPackFromRoot);
            }
        } catch (e) {
            console.error(e);
        }


        // save data
        this._dataJsonPacksChristmas = result;
        this._dataJsonPacksAllForOneChristmas = resultAFO;
    }

    private ReadSeasonPass() {

        let dataPrizeSeasonPassFree = dataJsonPrizeSeasonPass["default"].SEASON_PASS_FREE;
        let dataPrizeSeasonPassPremium = dataJsonPrizeSeasonPass["default"].SEASON_PASS_PREMIUM;
        let dataPrizeLastSeasonPass = dataJsonPrizeSeasonPass["default"].LAST_SEASON_PASS;

        for (let i = 0; i < dataPrizeSeasonPassFree.length; i++) {
            const dataJsonPrizeFree = dataPrizeSeasonPassFree[i];
            const dataJsonPrizePremium = dataPrizeSeasonPassPremium[i];
            let result = new InfoPrizePass();
            result.index = dataJsonPrizeFree.INDEX == undefined ? 0 : dataJsonPrizeFree.INDEX;
            result.maxStars = dataJsonPrizeFree.MAX_STAR == undefined ? 0 : dataJsonPrizeFree.MAX_STAR;
            result.listItemsPassFree = ReadJsonOptimized(dataJsonPrizeFree);
            result.listItemsPassPremium = ReadJsonOptimized(dataJsonPrizePremium);
            this._dataJsonPrizeSeasonPass.push(result);
        }

        // read json last level pass
        this._dataJsonLastPrizeSeasonPass = ReadJsonOptimized(dataPrizeLastSeasonPass);
    }

    private ReadLevelPass() {
        // read json prize free first
        let dataPrizeLevelPassFree = dataJsonPrizeLevelPass["default"].LEVEL_PASS_FREE;
        let dataPrizeLevelPassPremium = dataJsonPrizeLevelPass["default"].LEVEL_PASS_PREMIUM;
        let dataPrizeLastLevelPass = dataJsonPrizeLevelPass["default"].LAST_LEVEL_PASS;
        for (let i = 0; i < dataPrizeLevelPassFree.length; i++) {
            const dataJsonPrizeFree = dataPrizeLevelPassFree[i];
            const dataJsonPrizePremium = dataPrizeLevelPassPremium[i];
            let result = new InfoPrizePass();
            result.index = dataJsonPrizeFree.INDEX == undefined ? 0 : dataJsonPrizeFree.INDEX;
            result.maxStars = dataJsonPrizeFree.MAX_STAR == undefined ? 0 : dataJsonPrizeFree.MAX_STAR;
            result.listItemsPassFree = ReadJsonOptimized(dataJsonPrizeFree);
            result.listItemsPassPremium = ReadJsonOptimized(dataJsonPrizePremium);
            this._dataJsonPrizeLevelPass.push(result);
        }

        // read json last level pass
        this._dataJsonLastPrizeLevelPass = ReadJsonOptimized(dataPrizeLastLevelPass);
    }

    private ReadLoginReward() {
        // console.log("---------------- Read Login Reward ----------------");

        let dataLoginReward = dataJsonPrizeLogReward["default"];
        let dataRead = dataLoginReward["LOGIN_REWARD"];
        let result: IPrize[][] = [];
        for (let i = 0; i < dataRead.length; i++) {
            // read data
            let nInfoPrizeSpin: IPrize[] = ReadJsonOptimized(dataRead[i]);
            // push data
            result.push(nInfoPrizeSpin);
        }
        this._dataJsonLogReward = result;

        // ================ read prgogress spin ===================
        let dataReadProgress = dataLoginReward['PROGRESS_LOGIN_REWARD'];
        this._dataJsonProgressLogReward = [];
        for (let i = 0; i < dataReadProgress.length; i++) {
            const infoProgressSpin = new InfoProgressLoginReward();

            // read data
            infoProgressSpin.progress = Number.parseInt(dataReadProgress[i].progress);
            infoProgressSpin.listPrize = ReadJsonOptimized(dataReadProgress[i]);
            // push data + save data
            this._dataJsonProgressLogReward.push(infoProgressSpin);
        }
    }

    private ReadDailyQuest() {
        let dataDailyQuest = dataJsonDailyQuest["default"];
        let dataRead = dataDailyQuest["QUEST"];
        let result: IInfoJsonDailyQuest[] = [];

        for (let i = 0; i < dataRead.length; i++) {
            const dataDailyQuestRead = dataRead[i];
            //read data
            let nInfoDailyQuest: IInfoJsonDailyQuest = new IInfoJsonDailyQuest();
            const listPrize: IPrize[] = ReadJsonOptimized(dataRead[i]);
            nInfoDailyQuest.SetDataFromJson(dataDailyQuestRead, listPrize);

            result.push(nInfoDailyQuest);
        }

        this._dataJsonDailyQuest = result;
    }

    private ReadPrizeFriendJoin() {
        let dataPrizeFriendJoined = dataJsonPrizeFriendJoined["default"].FRIEND_JOINED;
        let listPrizeTemp: InfoPrizeFriendJoined[] = [];

        for (let i = 0; i < dataPrizeFriendJoined.length; i++) {
            const dataRead = dataPrizeFriendJoined[i];
            let result = new InfoPrizeFriendJoined();
            result.values = ReadJsonOptimized(dataRead);
            result.NumFriend = dataRead.NumFriend;
            listPrizeTemp.push(result);
        }

        this._dataJsonPrizeFriendJoined = listPrizeTemp;
    }

    private ReadEndlessTreasure() {
        const dataEndlessTreasure = dataJsonPrizeEndlessTreasure["default"].EndlessTreasure;
        this._dataJsonEndlessTreasure = [];

        for (let i = 0; i < dataEndlessTreasure.length; i++) {
            const dataRead = dataEndlessTreasure[i];
            let result = new InfoPackEndlessTreasure();
            result.rewards = ReadJsonOptimized(dataRead);
            result.idBundle = dataRead.idBundle;
            result.price = Number.parseFloat(dataRead.price);
            this._dataJsonEndlessTreasure.push(result);
        }

    }

    private ReadPrizeLevelProgress() {
        let dataPrizeLevelProgress = dataJsonPrizeLevelProgression["default"].PRIZES;
        let listPrizeTemp: InfoPrizeLevelProgressionJSON[] = [];

        for (let i = 0; i < dataPrizeLevelProgress.length; i++) {
            const dataRead = dataPrizeLevelProgress[i];
            let result = new InfoPrizeLevelProgressionJSON();
            result.index = dataRead.INDEX;
            result.require_progress = dataRead.MAX_STAR;
            result.listPrize = ReadJsonOptimized(dataRead);
            listPrizeTemp.push(result);
        }

        this._dataJsonLevelProgression = listPrizeTemp;
    }

    private ReadTreasureTrail() {
        const rootData = dataJsonTreasureTrail["default"]
        const reward: string = rootData.Rewards;
        const configRemainBot: string[] = rootData.RemainingPlayer;
        const rateRemainBot: string = rootData.RatePlayer;
        let result: InfoTreasureTrailJSON = new InfoTreasureTrailJSON();

        // save the reward
        result.rewards = ReadJsonOptimized(reward);

        // remaining bot 
        for (let i = 0; i < configRemainBot.length; i++) {
            const configCheck = configRemainBot[i];
            const numBotRemain: number[] = configCheck.split(',').map(Number);
            result.numRemainBotState.push(numBotRemain);
        }

        //rate player
        const listRatePlayer: string[] = rateRemainBot.split(',');
        listRatePlayer.forEach(rateCheck => {
            const minMaxRate: number[] = rateCheck.split('-').map(Number);
            result.rateRemainBotState.push({ min: minMaxRate[0], max: minMaxRate[1] });
        })

        // save data
        this._dataJsonTreasureTrail = result;
    }

    private ReadSkyLift() {
        const rootData = dataJsonSkyLift["default"];
        const dataInfoFloor = rootData.SkyLift;
        let result: InfoFloorSkyLiftJSON[] = [];

        // list floor
        for (let i = 0; i < dataInfoFloor.length; i++) {
            const dataFloorCheck = dataInfoFloor[i];
            let infoFloor: InfoFloorSkyLiftJSON = new InfoFloorSkyLiftJSON();
            infoFloor.idFloor = dataFloorCheck.idFloor;
            infoFloor.isSavePoint = dataFloorCheck.isSavePoint != null;
            infoFloor.progress = dataFloorCheck.progress;
            infoFloor.listPrize = ReadJsonOptimized(dataFloorCheck);
            result.push(infoFloor);
        }

        this._dataJsonSkyLift = result;
    }

    private ReadLightRoad() {
        const rootData = dataJsonLightRoad["default"];
        const dataInfoChest = rootData.LightRoad;
        let result: IInfoChestLightRoad[] = [];

        // list prize chest
        for (let i = 0; i < dataInfoChest.length; i++) {
            const dataInfoCheck = dataInfoChest[i];
            const listPrize: IPrize[] = ReadJsonOptimized(dataInfoCheck);
            let infoChest: IInfoChestLightRoad = {
                id: dataInfoCheck["id"],
                visual: dataInfoCheck["visual"],
                progressRequired: dataInfoCheck["progress"],
                listPrize: listPrize,
            }

            result.push(infoChest);
        }

        this._dataJsonLightRoad = result;
    }

    private ReadHatRace() {
        const rootData = dataJsonHatRace["default"];
        const dataPrizes = rootData.HAT_RACE_REWARD
        let result: IPrize[][] = [];

        // list prize chest rank
        for (let i = 0; i < dataPrizes.length; i++) {
            const dataPrizeCheck = dataPrizes[i];
            const listPrize: IPrize[] = ReadJsonOptimized(dataPrizeCheck);
            result.push(listPrize);
        }

        this._dataJsonPrizeHatRace = result;
    }
    //#endregion READ DATA

    //#region Spin
    public GetListPrizeSpin(): IInfoPrizeSpin[] {
        return this._dataJsonPrizeSpin;
    }

    public GetListPrizeSpinSpecialSlot(): IInfoPrizeSpin[] {
        return Array.from(this._dataJsonPrizeSpinSpecialSlot);
    }

    public GetListPrizeProgressSpin(): IInfoPrizeProgressSpin[] {
        return this._dataJsonProgressSpin;
    }
    //#endregion Spin

    //#region Packs
    public GetDataPacksFromRoot(): InfoPackFromRootJson[] {
        return this._dataJsonPacksFromRoot;
    }

    public GetDataPacksHalloween(): InfoPackFromRootJson[] {
        return this._dataJsonPacksHalloween;
    }

    public GetDataPacksChristmas(): InfoPackFromRootJson[] {
        return this._dataJsonPacksChristmas;
    }

    public GetDataPacksChristmasAFO(): InfoPackChristmasAFO[] {
        return Utils.CloneListDeep(this._dataJsonPacksAllForOneChristmas);
    }

    public GetDataPacksBlackFriday(): InfoPackFromRootJson[] {
        return Utils.CloneListDeep(this._dataJsonBlackFriday);
    }
    //#endregion Packs

    //#region SeasonPass
    public GetListPrizeSeasonPass(): InfoPrizePass[] {
        return this._dataJsonPrizeSeasonPass;
    }

    public GetLastPrizeSeasonPass(): IPrize[] {
        return this._dataJsonLastPrizeSeasonPass;
    }
    //#endregion

    //#region levelPass
    public GetListPrizeLevelPass(): InfoPrizePass[] {
        return Utils.CloneListDeep(this._dataJsonPrizeLevelPass);
    }

    public GetLastPrizeLevelPass(): IPrize[] {
        return this._dataJsonLastPrizeLevelPass;
    }
    //#endregion levelPass

    //#region friend
    public GetPrizeFriendJoined(): InfoPrizeFriendJoined[] {
        return this._dataJsonPrizeFriendJoined;
    }
    //#endregion friend

    //#region login reward
    public getListPrizeLoginReward(): IPrize[][] {
        return Array.from(this._dataJsonLogReward);
    }
    public getProgressLoginReward(): InfoProgressLoginReward[] {
        return Array.from(this._dataJsonProgressLogReward);
    }
    //#endregion login reward

    //#region dailyQuest
    public GetDataDailyQuest(): IInfoJsonDailyQuest[] {
        return this._dataJsonDailyQuest;
    }
    //#endregion dailyQuest

    //#region Shop
    public GetDataShop_Coins(): InfoItemBundleStore[] {
        return this._dataJsonShop_Coins;
    }

    public GetDataShop_Ticket(): InfoItemBundleStore[] {
        return this._dataJsonShop_Tickets;
    }
    //#endregion Shop

    //#region EndlessTreasure
    public GetDataEndlessTreasure(): InfoPackEndlessTreasure[] {
        return Utils.CloneListDeep(this._dataJsonEndlessTreasure);
    }
    //#endregion EndlessTreasure

    //#region LevelProgression
    public GetDataLevelProgression(): InfoPrizeLevelProgressionJSON[] {
        return Utils.CloneListDeep(this._dataJsonLevelProgression);
    }
    //#endregion LevelProgression

    //#region Treasure trail
    public GetRewardTreasureTrail(): IPrize[] {
        return this._dataJsonTreasureTrail.rewards;
    }

    public GetConfigRemainBotTreasureTrail(): number[][] {
        return this._dataJsonTreasureTrail.numRemainBotState;
    }

    public GetRateRemainBotTreasureTrail(): { min: number, max: number }[] {
        return this._dataJsonTreasureTrail.rateRemainBotState;
    }
    //#endregion Treasure trail

    //#region SkyLift
    public GetDataSkyLift(): InfoFloorSkyLiftJSON[] {
        return Utils.CloneListDeep(this._dataJsonSkyLift);
    }
    //#endregion SkyLift

    //#region LightRoad
    public GetDataLightRoad(): IInfoChestLightRoad[] {
        return Utils.CloneListDeep(this._dataJsonLightRoad);
    }
    //#endregion LightRoad

    //#region HatRace
    public GetDataPrizeRankHatRace(): IPrize[][] {
        return Utils.CloneListDeep(this._dataJsonPrizeHatRace);
    }
    //#endregion HatRace

    //==================================================================
    //#region read config car
    public ReadConfigCar() {
        function ConvertArrayToVec3(numPass: number, input: number[][]): Vec3[] {
            if (input == null || input.length == 0) {
                console.error("Input array must have exactly 3 elements.");
                return new Array(numPass).fill(Vec3.ONE.clone()); // Default value in case of error
            }

            let result: Vec3[] = [];
            for (let i = 0; i < input.length; i++) {
                if (input[i].length !== 3) {
                    console.error(`Input array at index ${i} must have exactly 3 elements.`);
                    return new Array(numPass).fill(Vec3.ONE.clone()); // Default value in case of error
                }
                let posRead = new Vec3(input[i][0], input[i][1], input[i][2]);
                result.push(posRead);
            }
            return result;
        }

        let dataConfigPosPassCar = ConfigCarJson["default"].CARS.POS_PASS;
        let listConfigPosCar: ConfigPosPassJsonCar[] = [];
        for (let i = 0; i < dataConfigPosPassCar.length; i++) {
            const dataRead = dataConfigPosPassCar[i];
            const sizeCar = dataRead[1] as TYPE_CAR_SIZE;
            const configPosCar: ConfigPosPassJsonCar = {
                SizeCar: sizeCar,
                ListPosPassenger: ConvertArrayToVec3(sizeCar, dataRead[2]),
                ListPosPassengerLeft: ConvertArrayToVec3(sizeCar, dataRead[3]),
                IsReindeerCart: !(dataRead as any[]).includes("IsReindeerCart") ? false : true,
            }
            listConfigPosCar.push(configPosCar);
        }

        this._dataConfigPosPassCar = listConfigPosCar;
    }

    public GetConfigPosPassCar(): ConfigPosPassJsonCar[] {
        return Utils.CloneListDeep(this._dataConfigPosPassCar);
    }
    //#endreigon read config car
    //==================================================================
}


export interface IPrizeSeasonPasss {
    INDEX: number;
    MAX_KEY: number;
    MONEY: string;
    TICKET: string;
    DOUBLE_KEY: string;
    SORT: string;
    SHUFFLE: string;
    VIP_SLOT: string;
    TIME: string;
    HAMMER: string;
    MAGNIFYING_GLASS: string;
}

export function Convert(data: string, typePrize: TYPE_PRIZE): IPrize {
    let typePrizeResult = typePrize;
    let typeReceivePrizeResult = TYPE_RECEIVE.NUMBER;
    let valueResult = 0;
    if (data.endsWith('m')) {
        typeReceivePrizeResult = TYPE_RECEIVE.TIME_MINUTE;
        valueResult = parseInt(data.replace('m', ''));
    } else if (data.endsWith('h')) {
        typeReceivePrizeResult = TYPE_RECEIVE.TIME_HOUR;
        valueResult = parseInt(data.replace('h', ''));
    } else {
        typeReceivePrizeResult = TYPE_RECEIVE.NUMBER;
        valueResult = parseInt(data);
    }
    // create result
    let result: IPrize = new IPrize(typePrizeResult, typeReceivePrizeResult, valueResult);
    return result;
}

export function ReadJsonOptimized(dataRead: any): IPrize[] {
    let result: IPrize[] = [];

    function pushDataToResult(nameParam: string, type: TYPE_PRIZE) {
        if (dataRead == null || dataRead == undefined) return;
        if (dataRead[nameParam] != undefined && dataRead[nameParam].toString() != '0') {
            let iPrize = Convert(dataRead[nameParam].toString(), type);
            result.push(iPrize);
        }
    }

    // ========================== read data =======================
    pushDataToResult('VIP_SLOT', TYPE_PRIZE.VIP_SLOT);
    pushDataToResult('SHUFFLE', TYPE_PRIZE.SHUFFLE);
    pushDataToResult('SORT', TYPE_PRIZE.SORT);
    pushDataToResult('MONEY', TYPE_PRIZE.MONEY);
    pushDataToResult('TICKET', TYPE_PRIZE.TICKET);
    pushDataToResult('TIME', TYPE_PRIZE.TIME);
    pushDataToResult('HAMMER', TYPE_PRIZE.HAMMER);
    pushDataToResult('MAGNIFYING_GLASS', TYPE_PRIZE.MAGNIFYING_GLASS);
    pushDataToResult('DOUBLE_KEY_SEASON_PASS', TYPE_PRIZE.DOUBLE_KEY_SEASON_PASS);

    return result;
}

