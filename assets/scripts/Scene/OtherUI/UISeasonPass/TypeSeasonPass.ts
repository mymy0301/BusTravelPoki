import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export const CONFIG_SP = {
    MAX_TIME_EVENT: 60 * 60 * 24 * 30,         // 60 * 60 * 24 * 14
    DELAY_TIME: 60 * 60,                  // 60 * 60
    MAX_PROGRESS: 506,
    PRICE_ACTIVE_PRENIUM: 9.99
}

export const EVENT_SEASON_PASS = {
    ACTIVE_SUCCESS_PASS: "EVENT_SEASON_PASS_ACTIVE_SUCCESS_PASS",
    RECEIVE_CHEST: "EVENT_SEASON_PASS_RECEIVE_CHEST",
    RECEIVE_LIST_ITEM_PRIZE: "EVENT_SEASON_PASS_RECEIVE_LIST_ITEM_PRIZE",
    LOAD_IMAGE_FORCE: "EVENT_SEASON_PASS_LOAD_IMAGE_FORCE",
    UPDATE_UI_SEASON_PASS: "EVENT_SEASON_PASS_UPDATE_UI_SEASON_PASS",
    NOTIFICATION: {
        TEXT: "EVENT_SEASON_PASS_NOTIFICATION_TEXT",
        ITEMS: "EVENT_SEASON_PASS_NOTIFICATION_ITEMS",
        FORCE_CLOSE: "EVENT_SEASON_PASS_NOTIFICATION_FORCE_CLOSE"
    }
}

export const SEASON_PASS_DESCRIBE_NOTI = {
    NOTIFI_HAS_COLLECTED: "This reward has \nalready been collected",
    NOTIFI_CAN_NOT_COLLECTED_PREMIUM: "Unlock this stage and activate the\nSeason Pass to get this reward!",
    NOTIFI_CAN_NOT_COLLECTED_FREE: "Beat more levels \nto unlock this stage!",
    NOTIFI_CAN_NOT_COLLECTED_LAST_PRIZE: "Complete all stages and activate the\nSeason Pass to get the Bonus Prize!"
}

