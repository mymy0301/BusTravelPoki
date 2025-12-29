import { _decorator, Component, Node, log } from 'cc';
import { ENV_TYPE, MConfigFacebook } from '../Configs/MConfigFacebook';
import { LE_ID_MODE, LE_RESOURCE_CHANGE_change_type, LE_RESULT_END_LEVEL } from './TypeLogEvent';
import { MConsolLog } from '../Common/MConsolLog';
import { getNameTypeEventGame, TYPE_EVENT_GAME } from '../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('LogEventManager')
export class LogEventManager {
    public static _instance: LogEventManager = null;
    public static get Instance(): LogEventManager {
        if (LogEventManager._instance == null) {
            LogEventManager._instance = new LogEventManager();
        }
        return LogEventManager._instance;
    }

    public EVENT = {
        BUY_PACK: "IAP_",

        TOUCH_INVITE: "TOUCH_INVITE",

        BANNER_ADS: "BANNER",
        INTER_ADS: "INTER",
        REWARD_ADS: "REWARD",
        REWARD_ADS_COMPLETED: "REWARD_COMPLETED",

        TOURNAMENT_JOIN: "TOURNAMENT_JOIN",
        TOURNAMENT_WIN: "TOURNAMENT_WIN",
        TOURNAMENT_END: "TOURNAMENT_END",

        TOUCH_PLAY: "TOUCH_PLAY",
        TOUCH_TOURNAMENT: "TOUCH_TOURNAMENT",
        TOUCH_SOLO: "TOUCH_SOLO",
        TOUCH_SHOP: "TOUCH_SHOP",
        TOUCH_REPLAY: "TOUCH_REPLAY",
        TOUCH_HOME: "TOUCH_HOME",

        ITEM_: "ITEM_",

        LEVEL_: "LEVEL_",

        TUTORIAL_START: "TUTORIAL_START",
        TUTORIAL_FINISHED: "TUTORIAL_FINISHED",
        TUTORIAL_SKIPPED: "TUTORIAL_SKIPPED",

        TOUR_PLAY: "TOUR_PLAY",
        TOUR_FIRST_OPEN: "TOUR_FIRST_OPEN",

        BANNER_ADS_PAID: "BANNER_PAID",
        INTER_ADS_PAID: "INTER_PAID",
        REWARD_ADS_PAID: "REWARD_PAID",
        REWARD_ADS_COMPLETED_PAID: "REWARD_COMPLETED_PAID",

        BANNER_ADS_ORGANIC: "BANNER_ORGANIC",
        INTER_ADS_ORGANIC: "INTER_ORGANIC",
        REWARD_ADS_ORGANIC: "REWARD_ORGANIC",
        REWARD_ADS_COMPLETED_ORGANIC: "REWARD_COMPLETED_ORGANIC",
    }

    //#region IAP
    // ================== IAP ============================
    public buyPack(packName: string) {
        LogEventManager.logEvent(LogEventManager.Instance.EVENT.BUY_PACK + '_' + packName);
    }

    public buyPackSuccess(packName: string) {
        LogEventManager.logEvent(`${LogEventManager.Instance.EVENT.BUY_PACK}_${packName}_SUCCESS`);
    }
    // ================== IAP ============================
    //#endregion IAP

    //#region Quest
    // ================== Quest ============================
    public logEventQuestDone(idQuest: string) {
        LogEventManager.logEvent(`QUEST_${idQuest}`);
    }

    public logEventQuestReward(indexBoxReward: number) {
        LogEventManager.logEvent(`QUEST_REWARD_${indexBoxReward}`);
    }
    // ================== Quest ============================
    //#endregion Quest

    //#region TOURNAMENT
    //============================= TOURNAMENT =====================
    public joinTournament() {
        LogEventManager.logEvent(`${LogEventManager.Instance.EVENT.TOURNAMENT_JOIN}`);
    }

    public winTournament() {
        LogEventManager.logEvent(`${LogEventManager.Instance.EVENT.TOURNAMENT_WIN}`);
    }

    public endTournamentLevelPass(levelPass: number) {
        LogEventManager.logEvent(`${LogEventManager.Instance.EVENT.TOURNAMENT_END}_${levelPass}`);
    }
    //============================= TOURNAMENT =====================
    //#endregion TOURNAMENT

    //#region Daily Challenge
    //============================= Daily Challenge =====================
    public logDailyChallengeStart() {
        LogEventManager.logEvent(`DAILY_START`);
    }
    public logDailyChallengeWin() {
        LogEventManager.logEvent(`DAILY_WIN`);
    }
    public logDailyChallengeLose() {
        LogEventManager.logEvent(`DAILY_LOSE`);
    }
    public logDailyChallengeReward(indexBox: number) {
        LogEventManager.logEvent(`DAILY_REWARD_${indexBox}`);
    }
    //============================= Daily Challenge =====================
    //#endregion Daily Challenge

    //#region Tile Rush
    // ============================ Tile Rush =====================
    public logTileRushJoin() {
        LogEventManager.logEvent(`RUSH_JOIN`);
    }

    public logTileRushEnd() {
        LogEventManager.logEvent(`RUSH_END`);
    }
    //============================= Tile Rush =====================
    //#endregion Tile Rush

    //#region TileRace
    //============================= Tile Race =====================
    public logTileRaceJoin() {
        LogEventManager.logEvent(`RACE_JOIN`);
    }

    public logTileRaceEnd() {
        LogEventManager.logEvent(`RACE_END`);
    }

    public logTileRaceEndLevelComplete(levelPass: number) {
        LogEventManager.logEvent(`RACE_END_${levelPass}`);
    }

    public logTileRaceEndAtRank(rank: number) {
        LogEventManager.logEvent(`RACE_END_${rank}`);
    }
    //============================= Tile Race =====================
    //#endregion TileRace

    //#region Spin
    //============================= Spin =====================
    public logSpinFree() {
        LogEventManager.logEvent(`SPIN`);
    }
    public logSpinAD() {
        LogEventManager.logEvent(`SPIN_AD`);
    }
    //============================= Spin =====================
    //#endregion Spin

    //#region Use Booster
    //============================= Use Booster =====================
    public UseBooster(type: string) {
        LogEventManager.logEvent(`USE_${type}`);
    }

    public UseBoosterInfinity(type: string) {
        LogEventManager.logEvent(`USE_INFINITY_${type}`);
    }

    public BuyItem(type: string) {
        LogEventManager.logEvent(`BUY_${type}`);
    }
    //============================= Use Booster =====================
    //#endregion UseBooster

    //#region TimeUp and BloomCar
    //============================= TimeUp and BloomCar =====================
    public logEndGameInCaseTimeUp() {
        LogEventManager.logEvent(`TIME_UP`);
    }

    public logUseTimeUpContinue() {
        LogEventManager.logEvent(`TIME_UP_CONTINUE`);
    }

    public logEndGameInCaseNoMoreSpace() {
        LogEventManager.logEvent(`NO_MORE_SPACE`);
    }

    public logUseNoMoreSpaceContinue() {
        LogEventManager.logEvent(`NO_MORE_SPACE_CONTINUE`);
    }
    //============================= TimeUp and BloomCar =====================
    //#endregion TimeUp and BloomCar

    //#region Info Game Normal
    public logLevelFirstWin(level: number) {
        LogEventManager.logEvent(`LEVEL_${level}_FIRST_WIN`);
    }

    public logLevelReplay(level: number) {
        LogEventManager.logEvent(`LEVEL_${level}_REPLAY`);
    }
    //#endregion Info Game normal

    public static logEvent(str: string) {
        // console.log("LOG EVENT:"+str);
        // turn off this code for testing
        if (MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL) { return; }
        FB.AppEvents.logEvent(str.toUpperCase());
        FBInstant.logEvent(str.toUpperCase());
        if (typeof gtag !== 'undefined') {
            gtag('event', str.toUpperCase());
        }
    }

    //=================== tour ==================
    public logTOUR_PLAY() {
        LogEventManager.logEvent(LogEventManager.Instance.EVENT.TOUR_PLAY);
    }

    public logTOUR_ID_PLAY(tourID_session: string) {
        LogEventManager.logEvent(`TOUR_${tourID_session}_PLAY`);
    }

    public logTOUR_FIRST_OPEN() {
        LogEventManager.logEvent(LogEventManager.Instance.EVENT.TOUR_FIRST_OPEN);
    }
    public logTOUR_ID_FIRST_OPEN(tourID_session: string) {
        if (tourID_session && tourID_session.length > 0) {
            let str: string = "TOUR_" + tourID_session + "_FIRST_OPEN";
            LogEventManager.logEvent(str);
        }
    }
    //=================== tour ==================

    //#region log event id ads
    public logCAMP_ID(campID: string) {
        let str: string = "CAMP_" + campID;
        LogEventManager.logEvent(str);
    }

    public logADSET_ID(adsetID: string) {
        let str: string = "ADSET_" + adsetID;
        LogEventManager.logEvent(str);
    }

    public logADS_ID(adsID: string) {
        let str: string = "ADS_" + adsID;
        LogEventManager.logEvent(str);
    }


    public logCAMPID_BANNER(campID: string) {
        if (campID && campID.length > 0) {
            let str: string = "CAMP_" + campID + "_BANNER";
            LogEventManager.logEvent(str);
        }
    }

    public logCAMPID_INTER(campID: string) {
        if (campID && campID.length > 0) {
            let str: string = "CAMP_" + campID + "_INTER";
            LogEventManager.logEvent(str);
        }
    }

    public logCAMPID_REWARDED(campID: string) {
        if (campID && campID.length > 0) {
            let str: string = "CAMP_" + campID + "_REWARDED";
            LogEventManager.logEvent(str);
        }
    }

    public logEventCampIAP(_transaction_id: string, _item_id: string, _value: number, campId: string) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL) {
            console.error("LOG EVENT CAMP IAP", _transaction_id, _item_id, _value);
            return;
        }
        if (typeof gtag !== 'undefined') {
            if (campId && campId.length > 0) {
                gtag('event', `CAMP_${campId}_IAP`, {
                    transaction_id: _transaction_id,
                    value: _value,
                    currency: 'USD',
                    "idPack": _item_id,
                    "price": _value,
                    items: [
                        {
                            item_name: _item_id,
                            item_id: _item_id,
                            quantity: 1
                        }
                    ]
                });
            }
        }
    }

    public logADSETID_BANNER(adsetID: string) {
        if (adsetID && adsetID.length > 0) {
            let str: string = "ADSET_" + adsetID + "_BANNER";
            LogEventManager.logEvent(str);
        }
    }

    public logADSETID_INTER(adsetID: string) {
        if (adsetID && adsetID.length > 0) {
            let str: string = "ADSET_" + adsetID + "_INTER";
            LogEventManager.logEvent(str);
        }
    }

    public logADSETID_REWARDED(adsetID: string) {
        if (adsetID && adsetID.length > 0) {
            let str: string = "ADSET_" + adsetID + "_REWARDED";
            LogEventManager.logEvent(str);
        }
    }

    public logADSID_BANNER(adsID: string) {
        if (adsID && adsID.length > 0) {
            let str: string = "ADS_" + adsID + "_BANNER";
            LogEventManager.logEvent(str);
        }
    }

    public logADSID_INTER(adsID: string) {
        if (adsID && adsID.length > 0) {
            let str: string = "ADS_" + adsID + "_INTER";
            LogEventManager.logEvent(str);
        }
    }

    public logADSID_REWARDED(adsID: string) {
        if (adsID && adsID.length > 0) {
            let str: string = "ADS_" + adsID + "_REWARDED";
            LogEventManager.logEvent(str);
        }
    }


    public logTour_ID(tourID_session: string) {
        if (tourID_session && tourID_session.length > 0) {
            let str: string = "TOUR_" + tourID_session;
            LogEventManager.logEvent(str);
        }
    }


    public logTOURID_BANNER(tourID_session: string) {
        if (tourID_session && tourID_session.length > 0) {
            let str: string = "TOUR_" + tourID_session + "_BANNER";
            LogEventManager.logEvent(str);
            // if (GameManager.Instance.IsNewPlayer) {
            //     LogEventManager.logEvent(`${str}_NEWUSER`);
            // }
        }
    }

    public logTOURID_INTER(tourID_session: string) {
        if (tourID_session && tourID_session.length > 0) {
            let str: string = "TOUR_" + tourID_session + "_INTER";
            LogEventManager.logEvent(str);
            // if (GameManager.Instance.IsNewPlayer) {
            //     LogEventManager.logEvent(`${str}_NEWUSER`);
            // }
        }
    }

    public logTOURID_REWARDED(tourID_session: string) {
        if (tourID_session && tourID_session.length > 0) {
            let str: string = "TOUR_" + tourID_session + "_REWARDED";
            LogEventManager.logEvent(str);
            // if (GameManager.Instance.IsNewPlayer) {
            //     LogEventManager.logEvent(`${str}_NEWUSER`);
            // }
        }
    }

    public logTour_ID_NEWUSER(tourID_session: string) {
        if (tourID_session && tourID_session.length > 0) {
            let str: string = "TOUR_" + tourID_session + "_NEWUSER";
            LogEventManager.logEvent(str);
        }
    }
    //#endregion

    public static logEventParameters(eventName: string, parameters?: any) {
        // console.warn("LOG EVENT",eventName,parameters);
        MConsolLog.Log2("LOG EVENT", eventName, parameters);

        if (MConfigFacebook.Instance == null || MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL) { return; }
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
    }

    public logSplashToHome(time: number) {
        let str: string = "splash_to_home";
        let parameters = { "loading_time": "" + time };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logButtonClick(ui_name: string, location: string) {
        let str: string = "button_click";
        let parameters = {
            "ui_name": ui_name,
            "location": location
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logPopupShow(ui_name: string, location: string) {
        let str: string = "popup_show";
        let parameters = {
            "ui_name": ui_name,
            "location": location
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logPopupClose(ui_name: string, location: string) {
        let str: string = "popup_close";
        let parameters = {
            "ui_name": ui_name,
            "location": location
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logLevelStart(level: number, mode_id: LE_ID_MODE, level_retry: number) {
        let str: string = "level_start";
        let parameters = {
            "level_id": "" + level,
            "mode_id": mode_id,
            "level_retry": "" + level_retry
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logLevelEnd(level: number, mode_id: LE_ID_MODE, level_retry: number, result: LE_RESULT_END_LEVEL, ingame_duration: number) {
        let str: string = "level_end";
        let parameters = {
            "level_id": "" + level,
            "mode_id": mode_id,
            "level_retry": "" + level_retry,
            "result": result,
            "ingame_duration": "" + ingame_duration
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logLevelWin(level: number, mode_id: LE_ID_MODE, level_retry: number) {
        let str: string = "level_win";
        let parameters = {
            "level_id": "" + level,
            "mode_id": mode_id,
            "level_retry": "" + level_retry
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logLevelLose(level: number, mode_id: LE_ID_MODE, level_retry: number) {
        let str: string = "level_lose";
        let parameters = {
            "level_id": "" + level,
            "mode_id": mode_id,
            "level_retry": "" + level_retry
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);

    }

    public logAd_Reward_Click(location: string, button_name: string) {
        let str: string = "ad_rv_click";
        let parameters = {
            "location": location,
            "button_name": button_name
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Reward_Scuccess(location: string, button_name: string) {
        let str: string = "ad_rv_success";
        let parameters = {
            "location": location,
            "button_name": button_name
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Reward_Fail(location: string, button_name: string, _reseaon: string) {
        let str: string = "ad_rv_fail";
        let parameters = {
            "location": location,
            "button_name": button_name,
            "reseaon": _reseaon
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Reward_PreloadFail(_reseaon: string) {
        let str: string = "ad_rv_preload_fail";
        let parameters = {
            "reseaon": _reseaon
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Reward_InitFail(location: string, button_name: string) {
        let str: string = "ad_rv_initfail";
        let parameters = {
            "location": location,
            "button_name": button_name
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Reward_Show_Fail(location: string, button_name: string, _reseaon: string) {
        let str: string = "ad_rv_show_fail";
        let parameters = {
            "location": location,
            "button_name": button_name,
            "reseaon": _reseaon
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Reward_Skip(location: string, button_name: string) {
        let str: string = "ad_rv_skip";
        let parameters = {
            "location": location,
            "button_name": button_name
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Interstitial_Show(location: string, button_name: string) {
        let str: string = "ad_interstitial_show";
        let parameters = {
            "location": location,
            "button_name": button_name
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Interstitial_Success(location: string, button_name: string) {
        let str: string = "ad_interstitial_success";
        let parameters = {
            "location": location,
            "button_name": button_name
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Interstitial_Fail(location: string, button_name: string) {
        let str: string = "ad_interstitial_fail";
        let parameters = {
            "location": location,
            "button_name": button_name
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Banner_Show(nameScene: string) {
        let str: string = "ad_banner_show";
        let parameters = {
            "location": nameScene,
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Banner_Success(nameScene: string) {
        let str: string = "ad_banner_success";
        let parameters = {
            "location": nameScene,
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logAd_Banner_Fail(nameScene) {
        let str: string = "ad_banner_fail";
        let parameters = {
            "location": nameScene,
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logIAP_PurchaseItem(item_id: string, price: number) {
        let str: string = "purchase_item";
        let parameters = {
            "item_id": item_id,
            "price": price,
            value: price,
            currency: 'USD',
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logEventIAP(_transaction_id: string, _item_id: string, _value: number) {

        if (MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL) {
            console.error("LOG EVENT IAP", _transaction_id, _item_id, _value);
            return;
        }
        if (typeof gtag !== 'undefined') {
            gtag('event', 'purchase', {
                transaction_id: _transaction_id,
                value: _value,
                currency: 'USD',
                items: [
                    {
                        item_name: _item_id,
                        item_id: _item_id,
                        quantity: 1
                    }
                ]
            });
        }
    }

    public logResource_change(currency_type: string, change_type: LE_RESOURCE_CHANGE_change_type, change_value: string, change_reason: string) {
        let str: string = "resource_change";
        let parameters = {
            "currency_type": currency_type,
            "change_type": change_type,
            "change_value": change_value,
            "change_reason": change_reason
        };
        // gtag('event', eventName, parameters);
        LogEventManager.logEventParameters(str, parameters);
    }

    public logStepGame(level: number, reason: "W" | "L" | "R", _stepGame: string) {
        let str: string = "step_game";
        let parameters = {
            "level": level,
            "reason": reason,
            "step": _stepGame
        };
        LogEventManager.logEventParameters(str, parameters);
    }

    /**
     * 
     * @param level level ở đây là level win
     * @param time 
     */
    public logTimeFromEndGameToClickNextLevel(level: number, time: number) {
        let str: string = "time_end_nextlevel";
        let parameters = {
            "level": level,
            "time": time
        };
        LogEventManager.logEventParameters(str, parameters);
    }

    /**
     * 
     * @param level level ở đây là level mới
     * @param time 
     */
    public logTimeFromNextLevelToStartNewLevel(level: number, time: number) {
        let str: string = "time_next_starlevel";
        let parameters = {
            "level": level,
            "time": time
        };
        LogEventManager.logEventParameters(str, parameters);
    }

    public logTimeLoadJsonMap(level: number, time: number) {
        let str: string = 'time_load_json_map';
        let parameters = {
            "level": level,
            "time": time
        };
        LogEventManager.logEventParameters(str, parameters);
    }

    public logTimeLoadImageCar(level: number, time: number) {
        let str: string = "time_load_all_img_car";
        let parameters = {
            "level": level,
            "time": time
        };
        LogEventManager.logEventParameters(str, parameters);
    }

    public logTimeChangeScene(nameSceneFrom: string, nameSceneTo: string, time: number) {
        let str: string = 'time_load_scene';
        let parameters = {
            "sceneF": nameSceneFrom,
            "sceneT": nameSceneTo,
            "time": time
        };
        LogEventManager.logEventParameters(str, parameters);
    }

    public logTimeLoadSceneBundle(nameScene: string, time: number) {
        let str: string = "time_load_bundle";
        let parameters = {
            "scene": nameScene,
            "time": time
        };
        LogEventManager.logEventParameters(str, parameters);
    }

    /**
     * @param pack_id 
     * @param reason 1: case close tab buy fb || 2: case something wrong with fb
     */
    public buyPackFail(pack_id: string, reason: 1 | 2) {
        let str: string = "buy_pack_fail";
        let parameters = {
            "reason": reason,
            "pack_id": pack_id
        };
        LogEventManager.logEventParameters(str, parameters);
    }

    public logUserProperty(property_name: string, property_value: string) {
        MConsolLog.Log2("LOG EVENT", property_name, property_value);

        if (MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL) { return; }
        if (typeof gtag !== 'undefined') {
            let parameters = { [property_name]: property_value };
            gtag("set", "user_properties", parameters)
        }
    }

    public logAdRwWatched(_adInterWatched: number) {
        let property_name: string = "ad_rw_watched";
        this.logUserProperty(property_name, _adInterWatched.toString());
    }

    public logAdInterWatched(_adInterWatched: number) {
        let property_name: string = "ad_interstitial_watched";
        this.logUserProperty(property_name, _adInterWatched.toString());
    }

    public logBestLevel(_level: number) {
        let property_name: string = "best_level";
        this.logUserProperty(property_name, _level.toString());
    }

    // số coin ở thời điểm hiện tại
    public logCoin(_coin: number) {
        let property_name: string = "coin";
        this.logUserProperty(property_name, _coin.toString());
    }

    // tổng số coin đã tiêu thụ
    public logCoinConsumed(_coin: number) {
        let property_name: string = "coin_consumed";
        this.logUserProperty(property_name, _coin.toString());
    }

    // số Sort ở thời điểm hiện tại
    public logSort(_sort: number) {
        let property_name: string = "Sort";
        this.logUserProperty(property_name, _sort.toString());
    }

    // tổng số Sort đã tiêu thụ
    public logSortConsumed(_sort: number) {
        let property_name: string = "Sort_consumed";
        this.logUserProperty(property_name, _sort.toString());
    }

    // số Shuffle ở thời điểm hiện tại
    public logShuffle(_shuffle: number) {
        let property_name: string = "Shuffle";
        this.logUserProperty(property_name, _shuffle.toString());
    }

    // tổng số Shuffle đã tiêu thụ
    public logShuffleConsumed(_shuffle: number) {
        let property_name: string = "Shuffle_consumed";
        this.logUserProperty(property_name, _shuffle.toString());
    }

    // số Vip ở thời điểm hiện tại
    public logVip(_vip: number) {
        let property_name: string = "Vip";
        this.logUserProperty(property_name, _vip.toString());
    }

    // tổng số Vip đã tiêu thụ
    public logVipConsumed(_vip: number) {
        let property_name: string = "Vip_consumed";
        this.logUserProperty(property_name, _vip.toString());
    }

    // số SkipAds ở thời điểm hiện tại
    public logSkipAds(_skipAds: number) {
        let property_name: string = "SkipAds";
        this.logUserProperty(property_name, _skipAds.toString());
    }

    // tổng số SkipAds đã tiêu thụ
    public logSkipAdsConsumed(_skipAds: number) {
        let property_name: string = "SkipAds_consumed";
        this.logUserProperty(property_name, _skipAds.toString());
    }

    //#region event in game
    public logEventStart(typeEvent: TYPE_EVENT_GAME, progress: number, numLoopEvent: number) {
        // Data filter
        const nameEvent = getNameTypeEventGame(typeEvent);

        // create log
        const event_name: string = "event_start";
        const param = {
            "streak_id": progress.toString(),
            "typeEvent": nameEvent,
            "event_start_id": numLoopEvent.toString()
        }

        LogEventManager.logEventParameters(event_name, param);
    }

    public logEventEnd(typeEvent: TYPE_EVENT_GAME, progress: number, numLoopEvent: number) {
        // Data filter
        const nameEvent = getNameTypeEventGame(typeEvent);

        // create log
        const event_name: string = "event_end";
        const param = {
            "streak_id": progress.toString(),
            "typeEvent": nameEvent,
            "event_start_id": numLoopEvent.toString()
        }

        LogEventManager.logEventParameters(event_name, param);
    }

    public lose2PackNameEvent(streakSL: number, streakTT: number, typeEventGoingOn: TYPE_EVENT_GAME, numLoop: number, packName: string, price: number, idPack: string) {
        // Data filter
        const streak_id = typeEventGoingOn == TYPE_EVENT_GAME.SKY_LIFT ? streakSL : streakTT;

        // create log
        const event_name: string = `lose2_${packName}_${streakSL}_${streakTT}`;
        const param = {
            "streak_id": streak_id.toString(),
            "event_start_id": numLoop.toString(),
            "price": price,
            "item_id": idPack,
            "value": price,
            "currency": 'USD',
        }

        LogEventManager.logEventParameters(event_name, param);
    }

    public lose2RWPosition(streakSL: number, streakTT: number, typeEventGoingOn: TYPE_EVENT_GAME, numLoop: number, location: string, price: number, idPack: string) {
        // Data filter
        const streak_id = typeEventGoingOn == TYPE_EVENT_GAME.SKY_LIFT ? streakSL : streakTT;

        // create log
        const event_name: string = `lose2_rw_${location}_${streakSL}_${streakTT}`;
        const param = {
            "streak_id": streak_id.toString(),
            "event_start_id": numLoop.toString(),
            "price": price,
            "item_id": idPack.toString(),
            "location": location,
            "value": price,
            "currency": 'USD',
        }

        LogEventManager.logEventParameters(event_name, param);
    }

    public lose2TotalPurchase(price: number, idPack: string) {
        const event_name: string = `lose2_totalpurchase`;

        const param = {
            "price": price,
            "idPack": idPack.toString(),
            "value": price,
            "currency": 'USD',
        }

        LogEventManager.logEventParameters(event_name, param);
    }

    public lose2TotalRw(location: string) {
        const event_name: string = `lose2_totalrw`;

        const param = {
            "location": location
        }

        LogEventManager.logEventParameters(event_name, param);
    }

    public loseTotalPurchase(price: number, idPack: string) {
        const event_name: string = `lose_totalpurchase`;

        const param = {
            "price": price,
            "idPack": idPack.toString(),
            "value": price,
            "currency": 'USD',
        }

        LogEventManager.logEventParameters(event_name, param);
    }

    public loseTotalRw(location: string) {
        const event_name: string = `lose_totalrw`;

        const param = {
            "location": location
        }

        LogEventManager.logEventParameters(event_name, param);
    }
    //#endregion event in game

    //#region event fb
    public logTriggerStartGameFBErr(code: string, mess: string) {
        const event_name: string = `start_game_fb_err`;

        const param = {
            "code": code,
            "reason": mess
        }

        LogEventManager.logEventParameters(event_name, param);
    }

    public logTriggerBug(idPlayer: string, code: string, mess: string, locate: string) {
        const listValidUserCheckBug = ["24350757404554944", "24867997196206318", "10058147454310411", "9801445323250557", "10067381429939103", "29125949020386477", "32876094668642425"
            , "24407184892281020", "9575604655807922", "9952457584821296", "9838025672952983", "9933677083375374", "23979109621743685", "32796886039958494", "9852902361465910"
            , "25033901516305455", "25148741054793800", "29754027987574656", "10007812242609588", "32425342700446596", "24077577605230915", "9972435699487496"
        ]
        if (!listValidUserCheckBug.includes(idPlayer)) { return; }

        const event_name: string = `bug`;
        const param = {
            "code": code?.substring(0, 100),
            "reason": `${idPlayer}_${mess}`?.substring(0, 100),
            "locate": locate?.substring(0, 100)
        }
        LogEventManager.logEventParameters(event_name, param);
    }
    //#endregion event fb
}


