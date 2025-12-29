import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export const CONFIG_LP = {
    MAX_PROGRESS: 55,
    MAX_PRIZE: 10,
    MAX_TIME_EVENT: 60 * 60 * 24 * 14,        // 60 * 60 * 24 * 14
    DELAY_TIME: 60 * 60 ,                     // 60 * 60
    PRICE_ACTIVE_PRENIUM: 2.99
}

export const EVENT_LEVEL_PASS = {
    ACTIVE_SUCCESS_PASS: "EVENT_LEVEL_PASS_ACTIVE_SUCCESS_PASS",
    RECEIVE_CHEST: "EVENT_LEVEL_PASS_RECEIVE_CHEST",
    RECEIVE_LIST_ITEM_PRIZE: "EVENT_LEVEL_PASS_RECEIVE_LIST_ITEM_PRIZE",
    HIDE_EVENT: "EVENT_LEVEL_PASS_HIDE_EVENT",
    HIDE_ICON_EVENT: "EVENT_LEVEL_PASS_HIDE_ICON_EVENT",
    NOTIFICATION: {
        TEXT: "EVENT_LEVEL_PASS_NOTIFICATION_TEXT",
        ITEMS: "EVENT_LEVEL_PASS_NOTIFICATION_ITEMS",
        FORCE_CLOSE: "EVENT_LEVEL_PASS_NOTIFICATION_FORCE_CLOSE"
    }
}

export const LEVEL_PASS_DESCRIBE_NOTI = {
    NOTIFI_HAS_COLLECTED: "This reward has \nalready been collected",
    NOTIFI_CAN_NOT_COLLECTED_PREMIUM: "Unlock this stage and activate the\nLevel Pass to get this reward!",
    NOTIFI_CAN_NOT_COLLECTED_FREE: "Beat more levels \nto unlock this stage!",
    NOTIFI_CAN_NOT_COLLECTED_LAST_PRIZE: "Complete all stages and activate the\nLevel Pass to get the Bonus Prize!"
}


