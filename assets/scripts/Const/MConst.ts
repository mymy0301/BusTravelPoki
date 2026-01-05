import { _decorator, Color, Component, Node, SH, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MConst')
export class MConst {
    //#region Facebook
    public static FB_GAME_ID = "927009789420421";

    public static FB_BANNER_PLACEMENT_ID = "927009789420421_932543738867026";
    public static FB_INTERSTITIAL_PLACEMENT_ID = "927009789420421_932543768867023";
    public static FB_REWARDED_PLACEMENT_ID = "927009789420421_932543875533679";

    public static SHOW_LOADING_AD_POPUP = "SHOW_LOADING_AD_POPUP";
    public static FB_INTERSTITIAL_CALLBACK_SUCCESS = "FB_INTERSTITIAL_CALLBACK_SUCCESS";
    public static HIDE_LOADING_AD_POPUP = "HIDE_LOADING_AD_POPUP";
    public static FB_INTERSTITIAL_CALLBACK_FAIL = "FB_INTERSTITIAL_CALLBACK_FAIL";
    public static FB_CALLBACK_SUCCESS = "FB_CALLBACK_SUCCESS";
    public static FB_CALLBACK_FAIL = "FB_CALLBACK_FAIL";
    public static FB_REWARD_CALLBACK_SUCCESS = "FB_REWARD_CALLBACK_SUCCESS";
    public static FB_REWARD_CALLBACK_FAIL = "FB_REWARD_CALLBACK_FAIL";
    public static FB_SHOW_NOTIFICATION = "FB_SHOW_NOTIFICATION";
    public static FB_CLEAR_ALL_NOTI: "FB_CLEAR_ALL_NOTI";
    public static FB_SHOW_NOTIFICATION_NO_BLOCK = "FB_SHOW_NOTIFICATION_NO_BLOCK";
    public static IAP_INIT_SUCCESS = "IAP_INIT_SUCCESS";
    public static FB_READY_LOAD = "FB_READY_LOAD";
    public static FB_NOT_FOUND_DATA_SAVE = "FB_NOT_FOUND_DATA_SAVE";
    public static FB_UPDATE_DATA_PLAYER = "FB_UPDATE_DATA_PLAYER";
    public static FB_GET_ASID_DONE = "FB_GET_ASID_DONE";

    public static FB_PLAY_WITH_FRIEND = {
        SUCCESS: "FB_PLAY_WITH_FRIEND_SUCCESS",
        SAME_CONTEXT: "FB_PLAY_WITH_FRIEND_SAME_CONTEXT",
        FAILED: "FB_PLAY_WITH_FRIEND_FAILED",
    };

    public static GAME_NAME_TITLE = "Bus Travel"; // NOTE you need to fix this name when public real facebook
    //#endregion

    //#region SERVER
    public static INFO_TEST_PLAYER = {
        signature: "3jr5v6SbTSY0wLKfMznlng3m3JYgbOa5wCOpcnWQyPU.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTcyOTIxNzIwNCwicGxheWVyX2lkIjoiNzc3MDE4NzcxOTc0NTk2OSIsInJlcXVlc3RfcGF5bG9hZCI6Im1ldGFkYXRhIn0",
        playerId: "7770187719745969",
        name: "Bibibla",
        avatar: "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=122147824436251097&gaming_photo_type=unified_picture&ext=1729907548&hash=AbZdpZCUmvlahGzRKZQlGice",
        asid: "122147824436251097"
    }

    public static readonly URL_SERVER = "https://playinstant.playgameo.com/api";
    public static SERVER_GAME_ID = "67b29a45b175796f7e599a83";

    public static readonly TOURNAMENT_GETTOPPLAYERS_UPDATE = "tournament_getTopPlayers_update";

    public static EVENT_SERVER = {
        GET_LEADER_BOARD_DONE: "EVENT_SERVER_GET_LEADER_BOARD_DONE"
    }
    //#endregion SERVER

    //#region Camera Shake
    public static SHAKE_CAMERA = "SHAKE_CAMERA";
    //#endregion

    public static CLICK: string = "click";
    //#region event game
    public static readonly EVENT = {
        CHANGE_PAGE_LOBBY: "CHANGE_PAGE_LOBBY",
        RESET_DATA: "RESET_DATA",
        DONE_VS_PLAY_WITH_FRIENDS: "DONE_VS_PLAY_WITH_FRIENDS",
        TURN_ON_SHADOW_EFFECT: "TURN_ON_SHADOW_EFFECT",
        TURN_OFF_SHADOW_EFFECT: "TURN_OFF_SHADOW_EFFECT",
        LANGUAGE_UPDATE: "LANGUAGE_UPDATE",
        LANGUAGE_SELECT: "LANGUAGE_SELECT",
        CLICK: "CLICK",
        COME_BACK_LOBBY: "COME_BACK_LOBBY",
        LOAD_SCENE_DONE: "LOAD_SCENE_DONE",
        START_PLAY_GAME: "START_PLAY_GAME",
        BLOCK_UI: {
            SHOW_UI_LOADING: "SHOW_UI_LOADING",
            HIDE_UI_LOADING: "HIDE_UI_LOADING",
            SHOW_BLOCK_GAME: "SHOW_BLOCK_GAME",
            HIDE_BLOCK_GAME: "HIDE_BLOCk_GAME",
            SHOW_BLOCK_LOBBY: "SHOW_BLOCK_LOBBY",
            HIDE_BLOCK_LOBBY: "HIDE_BLOCK_LOBBY",
        },
        ANCHOR_ITEM_LEADERBOARD: {
            SHOW_ANCHOR_ITEM: "SHOW_ANCHOR_ITEM",
            HIDE_ANCHOR_ITEM: "HIDE_ANCHOR_ITEM"
        },
        SHOW_UI: "SHOW_UI",
        SHOW_UI_SPECIAL: "SHOW_UI_SPECIAL",
        CLOSE_ALL_UI_SHOWING: "CLOSE_ALL_UI_SHOWING",
        CLOSE_UI: "CLOSE_UI",
        CLOSE_UI_WITHOUT_TURN_OFF_SHADOW: "CLOSE_UI_WITHOUT_TURN_OFF_SHADOW",
        SHOW_UI_DONE: "SHOW_UI_DONE",
        PRE_INIT_UI: "PRE_INIT_UI",
        PRELOAD_UI: "PRELOAD_UI",
        PRELOAD_UI_QUEUE: "PRELOAD_UI_QUEUE",
        WIN_GAME: "WIN_GAME",
        LOSE_GAME: "LOSE_GAME",
        BUYED_ITEM_SUCCESS: "BUYED_ITEM_SUCCESS",
        CLAIMED_ITEM_TOUR: "CLAIMED_ITEM_TOUR", // this event receive to turn off btn from UIRank => UI Completed
        CLAIMING_PRIZE: "CLAIMING_PRIZE",       // this event receive to frozen Scrollview UICompleted
        CLAIM_PRIZE_DONE: "CLAIM_PRIZE_DONE",   // this event receive to unFrozen Scrollview UICompleted
        CHANGE_SCENE_ANIM: {
            TURN_ON: "TURN_ON_TRANSITIONS",
            TURN_OFF: "TURN_OFF_TRANSITIONS",
            DONE_TRANSITIONS_TURN_ON: "DONE_TRANSITIONS_TURN_ON",
            DONE_TRANSITIONS_TURN_OFF: "DONE_TRANSITIONS_TURN_OFF",

            TURN_ON_WITH_OUT_CHANGE_SCENE: "TURN_ON_TRANSITIONS_2",
            TURN_OFF_WITH_OUT_CHANGE_SCENE: "TURN_OFF_TRANSITIONS_2",
            DONE_TURN_ON_WITH_OUT_CHANGE_SCENE: "DONE_TRANSITIONS_TURN_ON_2",
            DONE_TURN_OFF_WITH_OUT_CHANGE_SCENE: "DONE_TRANSITIONS_TURN_OFF_2",
            TURN_ON_NOW: "TURN_ON_TRANSITIONS_NOW",
            TURN_OFF_NOW: "TURN_OFF_TRANSITIONS_NOW",
        },
        SET_INDEX: "SET_INDEX",
        PAUSE_TIME: "PAUSE_TIME",
        RESUME_TIME: "RESUME_TIME",
        PLAYING_OPENING: "PLAYING_OPENING",
        DONE_PLAYING_OPENING: "DONE_PLAYING_OPENING",
        OPACITY_BG_OPENING: "OPACITY_BG_OPENING",
        TOUR_DONE: 'TOUR_DONE',
        SUCCESS: "SUCCESS",
        FAILED: "FAILED",
        ANIM_CLAIM_ITEM: "ANIM_CLAIM_ITEM",
        EVENT_UNCHOICE_SKIN: "EVENT_UNCHOICE_SKIN",
        EVENT_UNCHOICE_BG: "EVENT_UNCHOICE_BG",
        REMOVE_BLOCK_TO_BOTTOM: "REMOVE_BLOCK_TO_BOTTOM",
        CHANGE_STATE_ITEM: {
            UNLOCK_ITEM: "UNLOCK_ITEM",
            LOCK_ITEM: "LOCK_ITEM",
            NO_MORE_ITEM: "NO_MORE_ITEM",
            UPDATE_STATE_ITEM_WHEN_BUY_MORE: "UPDATE_STATE_ITEM_WHEN_BUY_MORE",
        },
        USE_ITEM: {
            BACK: "USE_ITEM_BACK",
            STAR: "USE_ITEM_STAR",
            SWAP: "USE_ITEM_SWAP",
            ROLL_BACK: "USE_ITEM_ROLL_BACK"
        },
        UPDATE_BLOCK_CAN_CLICK: "UPDATE_BLOCK_CAN_CLICK",
        SHOW_SHADOW_GAME: "SHOW_SHADOW_GAME",
        SHOW_SHADOW_GAME_WITH_NO_OPACITY: "SHOW_SHADOW_GAME_WITH_NO_OPACITY",
        HIDE_SHADOW_GAME: "HIDE_SHADOW_GAME",
        SHOW_SHADOW_LOBBY: "SHOW_SHADOW_LOBBY",
        HIDE_SHADOW_LOBBY: "HIDE_SHADOW_LOBBY",
        RECEIVE_STAR_IN_GAME: "RECEIVE_STAR_IN_GAME",
        RESET_GAME: "RESET_GAME",
        RESUME_GAME: "RESUME_GAME",
        PAUSE_GAME: "PAUSE_GAME",
        IS_ANIM_UNLOCK_PARKING: "IS_ANIM_UNLOCK_PARKING",

        ADD_1_STACK_BLOCK: "ADD_1_STACK_BLOCK",
        ADD_TIME: "ADD_TIME",
        DONE_REMOVE_A_STACK: "DONE_REMOVE_A_STACK",
        RECEIVE_PRIZE_POPUP_LOBBY_DONE: "RECEIVE_PRIZE_POPUP_LOBBY_DONE",
        RESET_STATE_BOOSTER: "RESET_STATE_BOOSTER",
        RECEIVE_ITEM_PRIZE_LOBBY_DONE: "RECEIVE_ITEM_PRIZE_LOBBY_DONE",
        PLAY_ANIM_RECEIVE_COIN_LOBBY: "PLAY_ANIM_RECEIVE_COIN_LOBBY",
        PLAY_ANIM_RECEIVE_IPRIZE_LOBBY: "PLAY_ANIM_RECEIVE_IPRIZE_LOBBY",
        CAN_ADD_COMBO_BOTTOM: "CAN_ADD_COMBO_BOTTOM",
        SHOW_UI_WIN_GAME: "SHOW_UI_WIN_GAME",
        PASS_NEW_DAY: "PASS_NEW_DAY",
        CHANGE_TYPE_LEVEL_BTN_PLAY_LOBBY: "CHANGE_TYPE_LEVEL_BTN_PLAY_LOBBY",
        CAN_NOT_USE_ITEM_STAR: "CAN_NOT_USE_ITEM_STAR",
        RESET_TIME_GAME_TOURNAMENT: "RESET_TIME_GAME_TOURNAMENT",
        PAGE_HOME_CONTINUE: "PAGE_HOME_CONTINUE",
        GEN_SPARKS: "GEN_SPARKS",
        PLAY_SPARKS: "PLAY_SPARKS",
        TRY_RECEIVE_PRIZE_WHEN_CLOSE_OTHER_UI: "EVENT_TILE_RACE_TRY_RECEIVE_PRIZE_WHEN_CLOSE_OTHER_UI",
        PAUSE_LOAD_UI_RESOURCE: "PAUSE_LOAD_UI_RESOURCE",
        RESUME_LOAD_UI_RESOURCE: "RESUME_LOAD_UI_RESOURCE",
        START_LOAD_UI_RESOURCE: "START_LOAD_UI_RESOURCE",

        IMPRESS_BTN_PLAY: "IMPRESS_BTN_PLAY",

        USE_ITEM_WHEN_BUY_SUCCESS: "USE_ITEM_WHEN_BUY_SUCCESS",

        GET_WPOS_BOOSTER: "GET_WPOS_BOOSTER",

        PLAY_ANIM_SHUFFLE: "PLAY_ANIM_SHUFFLE",
        PLAY_EF_BLINH_SHUFFLE: "PLAY_EF_BLINH_SHUFFLE",

        PLAY_PARTICLE_SMOKE_CAR_TWO_WAY: "PLAY_PARTICLE_SMOKE_CAR_TWO_WAY",

        // new game
        READY_TO_PICK_UP_PASSENGER_CAR: "READY_TO_PICK_UP_PASSENGER_CAR",
        BUS_MOVE_OUT_TO_THE_GATE: "BUS_MOVE_OUT_TO_THE_GATE",
        BUS_MOVING_TO_PARK: "BUS_MOVING_TO_PARK",
        UPDATE_VISUAL_ALL_VIP_PARKING: "UPDATE_VISUAL_ALL_VIP_PARKING",
        NEXT_LEVEL: "NEXT_LEVEL",
        PREVIOUS_LEVEL: "PREVIOUS_LEVEL",
        CHECK_WIN_GAME: "CHECK_WIN_GAME",
        INIT_HOLD_PLACE_CAR: "INIT_HOLD_PLACE_CAR",
        REMOVE_HOLD_PLACE_CAR: "REMOVE_HOLD_PLACE_CAR",
        UPDATE_DATA_CAR_IN_CONVEYOR_BELT: "UPDATE_DATA_CAR_IN_CONVEYOR_BELT",
        SHOW_EFFECT_AT_POINT: "SHOW_EFFECT_AT_POINT",
        BUY_NO_ADS_SUCCESS: "BUY_NO_ADS_SUCCESS",
        RECEIVE_COIN_WHEN_PASS_MOVE_TO_CAR: "RECEIVE_COIN_WHEN_PASS_MOVE_TO_CAR",       // listen in class UIReceiveCoinPassenger
        RECEIVE_LIST_COIN_AT_LIST_WPOS: "RECEIVE_LIST_COIN_AT_LIST_WPOS",               // listen in class UIReceiveCoinPassenger
        EVENT_UPDATE_DATA_FROM_DataItemSys: "EVENT_UPDATE_DATA_FROM_DataItemSys",
        PASSENGER_BACK_WARD: "PASSENGET_BACK_WARD",

        // time
        START_TIME_GAME: "START_TIME_GAME",

        // EFFECT CAR FULL
        SHOW_EFFECT_CAR_FULL: "SHOW_EFFECT_CAR_FULL",
        SHOW_EFFECT_CAR_COLLIE: "SHOW_EFFECT_CAR_COLLIE",
        ITEMFRIEND_TOUCHPLAY: "ITEMFRIEND_TOUCHPLAY",

        MOVE_ALL_CAR_SAVE_TO_BACKGROUND: "MOVE_ALL_CAR_SAVE_TO_BACKGROUND",

        // PLAY_ANIM_PUMPKIN
        PLAY_ANIM_PUMPKIN_BUS: "PLAY_ANIM_PUMPKIN_BUS"
    };

    public static readonly EVENT_TEXT_COMBO = {
        INCREASE_COMBO: "EVENT_TEXT_COMBO_INCREASE_COMBO",
        STOP_FX_COMBO: "EVENT_TEXT_COMBO_STOP_FX_COMBO",
        PLAY_FX_COMBO: "EVENT_TEXT_COMBO_PLAY_FX_COMBO",
    }

    public static readonly EVENT_GAME_SYS_CB = {
        GET_STATE_GAME: "EVENT_GAME_SYS_CB_GET_STATE_GAME",
        IS_CAR_MOVING: "EVENT_GAME_SYS_CB_IS_CAR_MOVING",
        IS_PASS_MOVING: "EVENT_GAME_SYS_CB_IS_PASS_MOVING",
    }

    public static readonly EVENT_GAME = {
        FORCE_GEN_EVENT: "EVENT_GAME_FORCE_GEN_EVENT",
        GEN_EVENT: "EVENT_GAME_GEN_EVENT",
        END_TIME_EVENT: "EVENT_GAME_END_TIME_EVENT",
        RESUME_EVENT: "EVENT_GAME_RESUME_EVENT",
        CREATE_EVENT: "EVENT_GAME_CREATE_EVENT",
        PAUSE_TIME_EVENT: "EVENT_GAME_PAUSE_TIME_EVENT",
        SHOW_NAME_EVENT: "EVENT_GAME_SHOW_NAME_EVENT",
        HIDE_EVENT: "EVENT_GAME_HIDE_EVENT",
        UPDATE_ADD_ON_SPE_01: "EVENT_GAME_UPDATE_ADD_ON_SPE_01",
        UPDATE_INDEX_NOTIFICATION: "EVENT_GAME_UPDATE_INDEX_NOTIFICATION",
        UPDATE_NOTIFICATION: "EVENT_GAME_UPDATE_NOTIFICATION",
        UPDATE_TIME: "EVENT_GAME_UPDATE_UPDATE_TIME",
        OFF_LISTEN_TIME: "EVENT_GAME_OFF_LISTEN_TIME",
        FORCE_END_TIME_EVENT: "EVENT_GAME_FORCE_END_TIME_EVENT",
        CLOSE_EVENT_BY_GROUP: "EVENT_GAME_CLOSE_EVENT_BY_GROUP",
        OPEN_EVENT_BY_GROUP: "EVENT_GAME_OPEN_EVENT_BY_GROUP"
    }

    public static readonly EVENT_SHOP = {
        CHANGE_PAGE_SHOP: "EVENT_SHOP_CHANGE_PAGE_SHOP",
        SCROLL_SHOP_LOBBY: "EVENT_SHOP_SCROLL_SHOP_LOBBY",
        GET_WPOS_UI_COIN: "EVENT_SHOP_GET_WPOS_UI_COIN",
        GET_WPOS_UI_TICKET: "EVENT_SHOP_GET_WPOS_UI_TICKET",
        GET_UI_ANIM_CUSTOM_COM: "EVENT_SHOP_GET_UI_ANIM_CUSTOM_COM",
        CHANGE_PAGE_START_AT_LOBBY: "EVENT_SHOP_CHANGE_PAGE_START_AT_LOBBY",
        UPDATE_SCROLL_SHOP: "UPDATE_SCROLL_SHOP",
        SHOW_NOTI: "EVENT_SHOP_SHOW_NOTI",
        HIDE_NOTI: "EVENT_SHOP_HIDE_NOTI",
        UPDATE_NOTI_SHOP_COIN_INDICATOR: "EVENT_SHOP_UPDATE_NOTI_SHOP_COIN_INDICATOR",
        UPDATE_NOTI_SHOP_DAILY_INDICATOR: "EVENT_SHOP_UPDATE_NOTI_SHOP_DAILY_INDICATOR",
    }

    public static readonly NOTIFICATION_IN_GAME = {
        DEFAULT_NOTIFICATION: "NOTIFICATION_IN_GAME_DEFAULT_NOTIFICATION",
        ONLY_ONE_PARKING: "NOTIFICATION_IN_GAME_ONLY_ONE_PARKING",
        NO_PLACE_PARKING: "NOTIFICATION_IN_GAME_NO_PLACE_PARKING",
        END_TIME: "NOTIFICATION_IN_GAME_END_TIME"
    }

    public static readonly EVENT_CURRENCY = {
        UPDATE_UI_MONEY: "EVENT_CURRENCY_UPDATE_UI_MONEY",
        UPDATE_UI_TICKET: "EVENT_CURRENCY_UPDATE_UI_TICKET"
    }

    public static readonly EVENT_RESOURCES = {
        LIFE: {
            RESET_LIFE_FORCE: "EVENT_RESOURCES_LIFE_RESET_LIFE_FORCE",
            INCREASE_MAX_LIFE: "EVENT_RESOURCES_LIFE_INCREASE_MAX_LIFE",
        }
    }

    public static readonly EVENT_TUTORIAL_GAME = {
        MAX_STEP: {
            TUTORIAL: 4,
            LEVEL2: 10
        },
        TUTORIAL: {
            NEXT_STEP: "EVENT_TUTORIAL_GAME_TUTORIAL_NEXT_STEP",
            RE_STEP: "EVENT_TUTORIAL_GAME_TUTORIAL_RE_STEP",
        }
    }

    public static readonly EVENT_INVITE_FRIEND = {
        RECEIVE: "EVENT_INVITE_FRIEND_RECEIVE"
    }

    public static readonly EVENT_CAR = {
        UPDATE_CAR_MYSTERY: "EVENT_CAR_UPDATE_CAR_MYSTERY",
        PLAY_EF_BLOCK_CAR_MOVE: "EVENT_CAR_PLAY_EF_BLOCK_CAR_MOVE",
        PLAY_EF_RECEIVE_PASSENGER: "EVENT_CAR_PLAY_EF_RECEIVE_PASSENGER",
        CAR_MOVING_TO_PARK: "EVENT_CAR_CAR_MOVING_TO_PARK",                 // this emit will be listen in gameSys used for can click booster or not
        CAR_MOVING_DONE: "EVENT_CAR_CAR_MOVING_DONE",                       // this emit will be listen in gameSys used for can click booster or not
        CAR_START_COOLDOWN: "EVENT_CAR_CAR_START_COOLDOWN",
        CAR_END_COOLDOWN: "EVENT_CAR_CAR_END_COOLDOWN",
        CAR_PAUSE_COOLDOWN: "EVENT_CAR_CAR_PAUSE_COOLDOWN",
        CAR_RESUME_COOLDOWN: "EVENT_CAR_CAR_RESUME_COOLDOWN",

        TRIGGER_CAR_AUTO_MOVE_FORWARD: "EVENT_CAR_TRIGGER_CAR_AUTO_MOVE_FORWARD"
    }

    public static readonly EVENT_COLLIDER = {
        CAR_CAR: "EVENT_COLLIDER_CAR_CAR"
    }

    public static readonly CONVEYOR_BELT_EVENT = {
        RESUME_CONVEYOR_BELT: "CONVEYOR_BELT_EVENT_RESUME_CONVEYOR_BELT",
        CAR_MOVE_OUT: "CONVEYOR_BELT_EVENT_CAR_MOVE_OUT",
        REMOVE_CAR_FROM_QUEUE: "CONVEYOR_BELT_EVENT_REMOVE_CAR_FROM_QUEUE"
    }

    public static readonly EVENT_GARAGE = {
        TRY_GEN_CAR_AFTER_A_CAR_MOVE_DONE: "EVENT_GARAGE_TRY_GEN_CAR_AFTER_A_CAR_MOVE_DONE"
    }

    public static readonly EVENT_PARKING = {
        UNLOCK_1_NORMAL_PARKING: "UNLOCK_1_NORMAL_PARKING",
        ADD_CAR_TO_LIST_PARKING: "ADD_CAR_TO_LIST_PARKING",
        REMOVE_CAR_OUT_LIST_PARKING: "REMOVE_CAR_OUT_LIST_PARKING",
        UNLOCK_PARK: "EVENT_PARKING_EVENT_PARKING"
    }

    public static readonly EVENT_SHADOW_IN_GAME = {
        SHOW: "EVENT_SHADOW_IN_GAME_SHOW",
        SHOW_POP_UP_VIP_SPACE: "EVENT_SHADOW_IN_GAME_SHOW_POP_UP_VIP_SPACE",
        SHOW_UI_GAME: "EVENT_SHADOW_IN_GAME_SHOW_UI_GAME",
        HIDE: "EVENT_SHADOW_IN_GAME_HIDE",
        HIDE_POP_UP_VIP_SPACE: "EVENT_SHADOW_IN_GAME_HIDE_POP_UP_VIP_SPACE",
        HIDE_UI_GAME: "EVENT_SHADOW_IN_GAME_HIDE_UI_GAME",
        TIME_SHADOW: 2
    }

    public static readonly EVENT_ITEM_IN_GAME = {
        USE_VIP_SLOT: "EVENT_ITEM_IN_GAME_USE_VIP_SLOT",
        USE_VIP_SLOT_SUCCESS: "EVENT_ITEM_IN_GAME_USE_VIP_SLOT_SUCCESS",
        READY_USE_NEXT_VIP_SLOT: "EVENT_ITEM_IN_GAME_READY_USE_NEXT_VIP_SLOT",
        USE_DONE_ITEM: "EVENT_ITEM_IN_GAME_USE_DONE_ITEM",
        UPDATE_NUM_ITEM: "EVENT_ITEM_IN_GAME_UPDATE_NUM_ITEM",
        CHECK_CAN_USE_BTN_SHUFFLE: "EVENT_ITEM_IN_GAME_CHECK_CAN_USE_BTN_SHUFFLE",
        CHECK_CAN_USE_BTN_VIP: "EVENT_ITEM_IN_GAME_CHECK_CAN_USE_BTN_VIP"
    }

    public static readonly EVENT_PASSENGERS = {
        DECREASE_NUM_PASSENGER: "EVENT_DECREASE_NUM_PASSENGER",
        SHOW_NUM_PASSENGER: "EVENT_PASSENGERS_SHOW_NUM_PASSENGER",
        HIDE_NUM_PASSENGER: "EVENT_PASSENGERS_HIDE_NUM_PASSENGER",
    }

    public static readonly EVENT_FEATURE_COMBO = {
        ADD_COMBO: "EVENT_FEATURE_COMBO_ADD_COMBO",
        PAUSE_COMBO: "EVENT_FEATURE_COMBO_PAUSE_COMBO",
        RESUME_COMBO: "EVENT_FEATURE_COMBO_RESUME_COMBO"
    }

    public static readonly TOURNAMENT = {
        LOAD_NEXT_MAP: "TOURNAMENT_LOAD_NEXT_MAP",
        BASIC: {
            INCREASE_PROGRESS: "EVENT_TOURNAMENT_BASIC_INCREASE_PROGRESS",
            NEW_MAP: "EVENT_TOURNAMENT_BASIC_NEW_MAP",
            REACH_TOP_1: "EVENT_TOURNAMENT_BASIC_REACH_TOP_1"
        },
        UI_RANK_TOURNAMENT: {
            SHOW_NOTIFICATION_IN_CONTENT: "TOURNAMENT_UI_RANK_TOURNAMENT_SHOW_NOTIFICATION_IN_CONTENT",
            SHOW_NOTIFICATION_IN_VIEW: "TOURNAMENT_UI_RANK_TOURNAMENT_SHOW_NOTIFICATION_IN_VIEW",
            FORCE_CLOSE_NOTI: "TOURNAMENT_UI_RANK_TOURNAMENT_FORCE_CLOSE_NOTI",
            TURN_OFF_NOTI_ANCHOR: "TOURNAMENT_UI_RANK_TOURNAMENT_TURN_OFF_NOTI_ANCHOR"
        }
    }

    public static readonly LIFE = {
        EVENT_UPDATE_UI_LIFE: "LIFE_EVENT_UPDATE_UI_LIFE"
    }

    public static readonly EVENT_SPIN = {
        EVENT_CHECK_NEW_DAY: "EVENT_SPIN_EVENT_CHECK_NEW_DAY_SPIN",
        CHECK_RESET_30_DAYS_SPIN: "EVENT_SPIN_CHECK_RESET_30_DAYS_SPIN",
        HIDE_SPIN: "EVENT_SPIN_HIDE_SPIN",
        SHOW_SPIN: "EVENT_SPIN_SHOW_SPIN",
        UPDATE_UI_SPIN: "EVENT_SPIN_UPDATE_UI_SPIN_LOBBY",
        UPDATE_LABEL_TIME_REDUCE_NEW_SPIN: "EVENT_SPIN_UPDATE_LABEL_TIME_REDUCE_NEW_SPIN",
        HIDE_LABEL_REDUCE_SPIN_LOBBY: "EVENT_SPIN_HIDE_LABEL_REDUCE_SPIN_LOBBY",
        NOTIFICATION: {
            SHOW_NOTIFICATION: "EVENT_SPIN_SHOW_NOTIFICATION",
            FORCE_CLOSE: "EVENT_SPIN_FORCE_CLOSE_NOTIFICATION"
        },
        ITEM: {
            EVENT_UPDATE_UI: "EVENT_SPIN_ITEM_EVENT_UPDATE_UI",
        }
    }

    public static readonly EVENT_LEADERBOARD = {
        UPDATE_DATA_LEADERBOARD_FRIEND: "EVENT_LEADERBOARD_UPDATE_DATA_LEADERBOARD_FRIEND"
    }

    // public static readonly EVENT_SEASON_PASS = {
    //     ACTIVE_SUCCESS_PASS: "EVENT_SEASON_PASS_ACTIVE_SUCCESS_PASS",
    //     RECEIVE_CHEST: "EVENT_SEASON_PASS_RECEIVE_CHEST",
    //     RECEIVE_LIST_ITEM_PRIZE: "EVENT_SEASON_PASS_RECEIVE_LIST_ITEM_PRIZE",
    //     LOAD_IMAGE_FORCE: "EVENT_SEASON_PASS_LOAD_IMAGE_FORCE",
    //     UPDATE_UI_SEASON_PASS: "EVENT_SEASON_PASS_UPDATE_UI_SEASON_PASS"
    // }

    public static readonly EVENT_LOGIN_REWARD = {
        HIDE_EVENT: "EVENT_LOGIN_REWARD_HIDE_EVENT",
        SHOW_EVENT: "EVENT_LOGIN_REWARD_SHOW_EVENT",
        INCREASE_PROGRESS: "EVENT_LOGIN_REWARD_INCREASE_PROGRESS",
        CHECK_RESET_30_DAYS_REWARD: "EVENT_LOGIN_REWARD_CHECK_RESET_30_DAYS_REWARD",
        ITEM: {
            EVENT_UPDATE_UI: "EVENT_LOGIN_REWARD_ITEM_EVENT_UPDATE_UI"
        },
        NOTIFICATION: {
            SHOW_NOTIFICATION: "EVENT_LOGIN_REWARD_SHOW_NOTIFICATION",
            FORCE_CLOSE: "EVENT_LOGIN_REWARD_FORCE_CLOSE_NOTIFICATION"
        },
        NO_SPINE: "EVENT_LOGIN_REWARD_NO_SPINE"
    }

    public static readonly EVENT_DAILY_QUEST = {
        UPDATE_QUEST_DAILY_QUEST: "EVENT_DAILY_QUEST_UPDATE_QUEST_DAILY_QUEST",
        CLAIMED_QUEST_DAILY_QUEST: "EVENT_DAILY_QUEST_CLAIMED_QUEST_DAILY_QUEST",
        UPDATE_QUEST_SPECIAL_DAILY_QUEST: "EVENT_DAILY_QUEST_UPDATE_QUEST_SPECIAL_DAILY_CHALLENGE",
        UPDATE_UI_QUEST_DAILY_FORCE: "EVENT_DAILY_QUEST_UPDATE_UI_QUEST_DAILY_FORCE",
    }

    public static readonly EVENT_HAND = {
        POINT_HAND_TO: "POINT_HAND_TO",
        HIDE_HAND: "HIDE_HAND"
    };

    public static readonly EVENT_PACK = {
        REMOVE_PACK: "EVENT_PACK_REMOVE_PACK",
        SHOW_PACK_CUSTOM: "EVENT_PACK_SHOW_PACK_CUSTOM"
    }

    public static readonly EVENT_ITEM = {
        UPDATE_TIME_INFI: "EVENT_ITEM_UPDATE_TIME_INFI",
        END_TIME_INFI: "EVENT_ITEM_END_TIME_INFI"
    }

    public static readonly EVENT_RECEIVE_PRIZE = {
        EVENT_CLAIM_PRIZE: "EVENT_UI_RECEIVE_PRIZE_CLAIM_PRIZE"
    }

    public static readonly EVENT_DOUBLE_KEY = {
        UPDATE_TIME_INFI: "EVENT_DOUBLE_KEY_UPDATE_TIME_INFI",
        END_TIME_INFI_WHEN_RUNNING: "EVENT_DOUBLE_KEY_END_TIME_INFI_WHEN_RUNNING",
        END_TIME_INFI_WHEN_INIT: "EVENT_DOUBLE_KEY_END_TIME_INFI_WHEN_INIT",
        FORCE_STOP_TIME: "EVENT_DOUBLE_KEY_FORCE_STOP_TIME",
        ADD_TIME: "EVENT_DOUBLE_KEY_ADD_TIME"
    }

    public static readonly EVENT_BUILDING = {
        SHOW_UI_BUILDING: "EVENT_BUILDING_SHOW_UI_BUILDING",
        CLOSE_UI_BUILDING: "EVENT_BUILDING_CLOSE_UI_BUILDING",
        INCREASE_PROGRESS_BUILDING: "EVENT_BUILDING_INCREASE_PROGRESS_BUILDING",
        SHOW_NEXT_CONSTRUCTOR: "EVENT_BUILDING_SHOW_NEXT_CONSTRUCTOR",
        FINISH_BUILDING_CONSTRUCTOR_NOW: "EVENT_BUILDING_FINISH_BUILDING_CONSTRUCTOR_NOW",
        ANIM_BUILDING_MAP_DONE: "EVENT_BUILDING_ANIM_BUILDING_MAP_DONE",
        PLAY_TUT_BUILDING: "EVENT_BUILDING_PLAY_TUT_BUILDING",
        TUT_BUILDING_DONE: "EVENT_BUIDLING_TUT_BUILDING_DONE",
        SHOW_NOTI_REMAIN_CONS_NOW: "EVENT_BUILDING_SHOW_NOTI_REMAIN_CONS_NOW",
        HIDE_NOTI_REMAIN_CONS_NOW: "EVENT_BUILDING_HIDE_NOTI_REMAIN_CONS_NOW",

        /**
         * event này được lắng nghe trong class BtnBuildingLobby
         * - những vị trí emit là :
         *      + trong start của PageHome
         *      + Khi update data numConstructorUnlock
         *      + Khi update data map
         */
        UPDATE_UI_BTN_BUILD: "EVENT_BUILDING_UPDATE_UI_BTN_BUILD"
    }

    public static readonly EVENT_PAGE_HOME = {
        GET_WPOS_UI_COIN: "EVENT_PAGE_HOME_GET_WPOS_UI_COIN",
        GET_WPOS_UI_TICKET: "EVENT_PAGE_HOME_GET_WPOS_UI_TICKET",
        GET_WPOS_UI_BTN_PLAY: "EVENT_PAGE_HOME_GET_WPOS_UI_BTN_PLAY",
        GET_showAndHideUIPageHome: "EVENT_PAGE_HOME_GET_showAndHideUIPageHome",
        GET_WPOS_NODE_EVENT: "EVENT_PAGE_HOME_GET_WPOS_NODE_EVENT"
    }

    public static readonly EVENT_LOBBY = {
        GET_WPOS_TAB_HOME: "EVENT_LOBBY_GET_WPOS_TAB_HOME"
    }

    public static readonly EVENT_GROUP_LOOP_EVENT = {
        FORCE_CHANGE_TIME: "EVENT_GROUP_LOOP_EVENT"
    }

    public static readonly EVENT_CHEAT = {
        SHOW_UI_CHEAT_EVENTS: "EVENT_CHEAT_SHOW_UI_CHEAT_EVENTS",
        SHOW_UI_CHEAT_BUILDING: "EVENT_CHEAT_SHOW_UI_CHEAT_BUILDING",
        SHOW_UI_CHEAT_INFO: "EVENT_CHEAT_SHOW_UI_CHEAT_INFO"
    }

    public static readonly EVENT_VIP_PARKING = {
        INIT: "EVENT_VIP_PARKING_INIT",
        OPEN: "EVENT_VIP_PARKING_OPEN",
        CLOSE: "EVENT_VIP_PARKING_CLOSE",
        CHANGE_STATE: "EVENT_VIP_PARKING_CHANGE_STATE"
    }

    public static readonly LIMIT_NUM_BLOCK_COL_ROW = 7.5;
    public static readonly SIZE_BLOCKS: Vec3 = new Vec3(97.8, 92, 0); // 85 85
    // public static readonly SIZE_BLOCKS_IN_BOTTOM = new Vec3(77, 71, 0);
    public static readonly SCALE_TO_SUIT_WITH_BOTTOM = new Vec3(0.787, 0.787, 0.787);
    public static readonly TIME_RE_LIFE: number = 60 * 30; // 30m
    public static readonly MAX_LIFE = 5;
    public static readonly MAX_STACK_IN_GAME = 8;
    public static readonly DEFAULT_TIME_PLAY_NORMAL = 60 * 3; // 180s
    public static readonly DEFAULT_TIME_PLAY_NORMAL_TUTORIAL_ITEM = 60 * 5; // 300s
    public static readonly DEFAULT_TIME_PLAY_DAILY_CHALLENGE = 60 * 5; // 300s
    public static readonly REDUCE_TIME_SUPPER_HARD = -30;
    public static readonly REDUCE_TIME_HARD = -15;
    public static readonly MAX_STAR_TO_RECEIVE = 1000;
    public static readonly MAX_LEVEL_TO_RECEIVE = 10;
    public static readonly MAX_TITLE_RUSH = 5;
    public static readonly MAX_NUM_PRIZE_TILE_CHALLENGE = 30;
    public static readonly TIME_REVIVE = 60;
    public static readonly TIME_TO_NEW_COMBO: number = 3;
    public static readonly INDEX_ITEM_SHOP_BUY_LIFE: number = 4;
    public static readonly DEFAULT_NUM_PARKING_CAR: number = 8;
    public static readonly DEFAULT_RATIO_CONVERT_POS_TO_WPOS: number = 54;

    public static readonly DEFAULT_MOBILE_WIDTH: number = 720;
    public static readonly DEFAULT_MOBILE_HEIGHT: number = 1280;
    public static readonly DEFAULT_DESKTOP_WIDTH: number = 960;
    public static readonly DEFAULT_DESKTOP_HEIGHT: number = 1280;

    public static readonly PRICE_BUY_NO_ADS: number = 9.99;

    public static readonly NODE_WITH_OPACITY = {
        PREPARE_OPACITY: 'NODE_WITH_OPACITY_PREPARE_OPACITY',
        SHOW: 'NODE_WITH_OPACITY_SHOW',
    }
    //#endregion

    //#region name shader
    public static readonly NAME_SHADER = {
        NORMAL_NOISE: {
            PROGRESS: 'progressNoise'
        }
    }
    //#endregion

    //#region key save
    public static readonly KEY_SAVE = {
        TUTORIAL: "TUTORIAL",
        SETTING_STATUS: "M_SETTING_STATUS",
        DATA_GAME: 'DATA_GAME',
        RESOURCES: 'RESOURCES',
        CURRENCY: 'CURRENCY',
        PACKS: "PACKS",
        DATA_LOBBY_JSON: 'DATA_LOBBY_JSON',
        LOG_EVENT: 'LOG_EVENT2',
        // LOG_EVENT: {
        //     CAMP_ID: 'log_campID',
        //     AD_SET_ID: 'log_adsetID',
        //     ADS_ID: 'log_adsID',
        //     TOUR_ID: 'log_tourID'
        // },
        DATA_TOURNAMENTS_CLAIMED: 'DATA_TOURNAMENTS_CLAIMED',
        EVENT_IN_GAME: {
            LOGIN_REWARD: 'EIG_LR',
            SPIN: 'EIG_S',
            LEVEL_PASS: 'EIG_LP',
            SEASON_PASS: 'EIG_SP',
            FRIEND_JOINED: 'EIG_FJ',
            DAILY_QUEST: 'EIG_DQ',
            PIGGY_BANK: 'EIG_PB',
            DASH_RUSH: 'EIG_DR',
            SPEED_RACE: 'EIG_SR',
            ENDLESS_TREASURE: 'EIG_ET',
            LEVEL_PROGRESS: 'EIG_LPr',
            TREASURE_TRAIL: 'EIG_TT',
            SKY_LIFT: 'EIG_SL'
        },
        DATA_INFO_BUIDING: "DATA_INFO_BUIDING",
        DATA_CUSTOMS: "DATA_CUSTOMS",
        DATA_WEEKLY: "DATA_WEEKLY_2",
        DATA_EVENT_GROUP: "EG",
        HLW: "HLW_2025",
        XMAX: "XMAX_2025",
        XMAX_EVENT_LR: "XMAX_EVENT_LR",
        XMAX_EVENT_HR: "XMAX_EVENT_HR",
        PACK_BF: "PACK_BF"
    };
    //#endregion

    //#region Path
    public static PATH = {
        ROOT_PATH_UI: "Prefabs/UI/",
        DIRECT_UI: [
            "UIEnsureResetGame", "UIPause", "UILose", "UIWin", "UIUnlockParking", "UIContinue", "UIPopUpBuyItem", "UIPopUpRemoveAds",
            "UIInfoPlayer", "UIShop", "UIPreparePlayNormalGame", "UISpin", "UISetting", "UIPackStarter", "UIPackGreateDeals_1", "UIPackGreateDeals_2",
            "UIInviteFriends", "UISeasonPass", "UILoginReward", "UIPopupBuyLevelPass", "UIPopupBuySeasonPass", "UILevelPass", "UIRank", "UITournament", "UIRankTournament",
            "UIWinTournament", "UICustomInvite", "UITutorialInGame", "UITutorialInLobby", "UIWinWithFriend", "UIFriends", "UIPiggyBank", "UIDashRush", "UIDashRushPrepare",
            "UIDashRushDelay", "UISpeedRacePrepare", "UISpeedRace", "UISpeedRaceProgress", "UIEndlessTreasure", "UILevelProgression", "UILevelProgressionPrepare", "UIQuit",
            "UITreasureTrailPrepare", "UITreasureTrail", "UITreasureTrailDelay", "UISkyLift", "UISkyLiftDelay", "UISkyLiftPrepare", "UIPackHalloween", "UIShopShort", "UIPackBlackFriday",
            "UIPackChristmas", "UIChristmasEvent", "UITutorialLevelChrist", "UIWinChristmas", "UIQuitChristmas", "UIPackChristmasAFO"
        ],
        NON_AVATAR: "images/non_avatar",
        PF_SUB_SPEED_RACE: "/Prefabs/UIWin/nSubSpeedRace",
        PF_SUB_DASH_RUSH: "/Prefabs/UIWin/nSubDashRush",
        PF_SUP_SKY_LIFT: "/Prefabs/UIWin/nSupSkyLift",
        PF_SUP_HAT_RACE: "/Prefabs/UIWin/nSupHatRace",
    };
    //#endregion

    //#region Bundle
    public static SHARE = {
        "PATH_ROOT": "/Prefabs/Others/ShareMyScorePopup",
        "PATH_PREFAB_SHARE_NORMAL": "/Prefabs/Others/ShareNormal",
        "PATH_PREFAB_SHARE_FRIEND": "/Prefabs/Others/ShareFriend",
        "PATH_PREFAB_SHARE_TOURNAMENT": "/Prefabs/Others/ShareTournament",
        "PATH_PREFAB_SHARE_WITH_FRIEND": "/Prefabs/Others/ShareWithFriends",
    }

    public static BUNDLE_SOUND = "MBundleSound";
    public static DIR_SOUND_BACKGROUND = "background"

    public static BUNDLE_EFFECT = "MBundleEffect";
    public static DIR_AUDIO = "audio/";
    public static DIR_AUDIO_COMBO_LOAD = {
        // TUT: "audioComboTut/"
    }
    public static BUNDLE_RESOURCES = "resources";
    public static BUNDLE = "MBundle";
    public static BUNDLE_HALLOWEEN = "MBundleHalloween";
    public static DIR_HALOWEEN_SKE = "packing/UI_Event_Halloween";
    public static BUNDLE_CHIRSTMAS = "MBundleChristmas";
    public static DIR_CHRISTMAS_SKE = "packing/UI_Pack_Christmas";
    public static DIR_JSON_MAP = "JsonMap/";
    public static DIR_JSON_MAP_NEW = "level/";
    public static DIR_JSON_MAP_CHRIST = "levelChrist/";
    public static DIR_JSON_MAP_NEW_CHRIST = "levelChrist/";
    public static BUNDLE_GAME = "MBundleGame";
    public static BUNDLE_SCENES = "MBundleScenes";
    public static DIR_PACK_TUT = "PackTutorial/"
    public static DIR_PASSENGERS = "Cars/Passengers/";
    public static DIR_FLASH = "Cars/Passengers/Flash/";
    public static DIR_CARS = "Cars/";
    public static DIR_LIGHT_CARS = "Cars/Lights";
    public static DIR_SUP_VI_CAR = "PfSupportCar/"
    public static DIR_ARROWS = "Cars/Arrows/";
    public static DIR_QUESTIONS = "Cars/Questions/";
    public static DIR_FLAG = "flag/";
    public static DIR_ITEM = "Items/";
    public static DIR_ITEM_BIG = "Items/ItemsBig/";
    public static DIR_SEASON_PASS = "SeasonPass/";
    public static PATH_VFX = {
        BLINH: "VFX/Blinh/particleBlinh",
    }
    public static PATH_PF_ANIM_ITEM_BOOSTER = "Prefabs/pf_anim_item_booster";
    public static PATH_PF_PARTICLE_SHUFFLE_BLINH = "Prefabs/ShuffleBlinh/pf_particle_shuffle_blinh";
    public static DIR_LEVEL_PROGRESION = "LevelProgression/";

    public static BUNDLE_MAP_LOBBY = "MBundleMapLobby";

    public static DIR_SOUND_COMBO_USE = {
        MERGE: 'audioComboMerge/merge',
        PASS_MOVE_ON_CAR: 'audioComboPass_move_on_car/PassengerGetInCar'
    }

    public static NAME_ASSET_EMOTION = "Emotions";
    //#endregion

    //#region nameScene
    public static readonly NAME_SCENE = {
        GAME: "gameScene",
        LOBBY: "lobbyScene",
        LOAD: "loadScene"
    };
    //#endregion

    //#region id leaderboard
    public static readonly ID_LEADER_BOARD = {
        FRIEND: -2,
        WORLD: -1,
        WEEKLY: -3,
    };

    public static readonly CONTEXT_ID_LEADERBOARD_SERVER = {
        WORLD: `${MConst.SERVER_GAME_ID}_World`,
        FRIEND: 'friend',
        TEST: `${MConst.SERVER_GAME_ID}_LeaderboardForTest`
    }

    public static readonly LEADERBOARD_ID_WORLD_SERVER = "67bd98ff05d7fbb8b6f1a040";
    //#endregion id leaderboard
}

export const enum AVATAR_TYPE {
    TYPE_WEB,
    TYPE_LOCAL
}

export enum TYPE_UI {
    UI_ENSURE_RESET_GAME,                   // 0
    UI_PAUSE,                               // 1
    UI_LOSE,                                // 2
    UI_WIN,                                 // 3
    UI_UNLOCK_PARKING,                      // 4    
    UI_CONTINUE,                            // 5
    UI_POPUP_BUY_ITEM,                      // 6
    UI_POPUP_REMOVE_ADS,                    // 7         
    UI_INFO_PLAYER,                         // 8
    UI_SHOP,                                // 9
    UI_PREPARE_PLAY_NORMAL_GAME,
    UI_SPIN,
    UI_SETTING,
    UI_PACK_STARTER,
    UI_PACK_GREATE_DEALS_1,
    UI_PACK_GREATE_DEALS_2,
    UI_INVITE_FRIEND,
    UI_SEASON_PASS,
    UI_LOGIN_REWARD,
    UI_POPUP_BUY_LEVEL_PASS,
    UI_POPUP_BUY_SEASON_PASS,
    UI_LEVEL_PASS,
    UI_RANK,
    UI_TOURNAMENT,
    UI_RANK_TOURNAMENT,
    UI_WIN_TOURNAMENT,
    UI_CUSTOM_INVITE,
    UI_TUTORIAL_IN_GAME,
    UI_TUTOIRAL_IN_LOBBY,
    UI_WIN_WITHFRIEND,
    UI_FRIENDS,
    UI_PIGGY_BANK,
    UI_DASH_RUSH,
    UI_DASH_RUSH_PREPARE,
    UI_DASH_RUSH_DELAY,
    UI_SPEED_RACE_PREPARE,
    UI_SPEED_RACE,
    UI_SPEED_RACE_PROGRESS,
    UI_ENLESSTREASURE,
    UI_LEVEL_PROGRESSION,
    UI_LEVEL_PROGRESSION_PREPARE,
    UI_QUIT,
    UI_TREASURE_TRAIL_PREPARE,
    UI_TREASURE_TRAIL,
    UI_TREASURE_TRAIL_DELAY,
    UI_SKY_LIFT,
    UI_SKY_LIFT_DELAY,
    UI_SKY_LIFT_PREPARE,
    UI_PACK_HALLOWEEN,
    UI_SHOP_SHORT,
    UI_PACK_BLACK_FRIDAY,
    UI_PACK_CHRISTMAS,
    UI_CHRISTMAS_EVENT,
    UI_TUTORIAL_LEVEL_CHRIST,
    UI_WIN_CHIRSTMAS,
    UI_QUIT_CHRISTMAS,
    UI_PACK_CHRISTMAS_AFO
}

export type LoadProgressCallback = (completedCount: number, totalCount: number, item: any) => void;
export type LoadCompleteCallback<T> = (error: Error | null, path: string, asset: T) => void;
export type LoadCompleteCallbackDir<T> = (error: Error | null, path: string, asset: T[]) => void;
export type LoadDirCompleteCallback<T> = (error: Error | null, asset: T[], urls: string[]) => void;

export const EVENT_CLOCK_ON_TICK = 'ON_TICK';

export type CallBackShowSpecialUI = (nUI: Node) => void
