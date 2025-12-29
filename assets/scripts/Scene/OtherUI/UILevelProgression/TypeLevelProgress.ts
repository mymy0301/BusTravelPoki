import { IPrize } from "../../../Utils/Types";

export enum STATE_ITEM_LPr {
    CAN_NOT_CLAIM,
    WAIT_TO_CLAIM,
    CLAIMED,
}

export enum STATE_EVENT_LEVEL_PROGRESS {
    LOCK,
    WAIT_TO_JOIN,
    JOINING,
    WAIT_TO_RECEIVE_END_EVENT
}

export class InfoPrizeLevelProgressionJSON {
    index: number = 0;
    require_progress = 0;
    listPrize: IPrize[] = [];
}

export const EVENT_LEVEL_PROGRESS = {
    NOTIFICATION: {
        TEXT: "EVENT_LEVEL_PROGRESS_NOTIFICATION_TEXT",
        ITEMS: "EVENT_LEVEL_PROGRESS_NOTIFICATION_ITEMS",
        FORCE_CLOSE: "EVENT_LEVEL_PROGRESS_NOTIFICATION_FORCE_CLOSE"
    },
    UPDATE_UI_LEVEL_PROGRESSION: "EVENT_LEVEL_PROGRESS_UPDATE_UI_LEVEL_PROGRESSION",
    INIT_NEW_EVENT: "EVENT_LEVEL_PROGRESS_INIT_NEW_EVENT",
}

export const LEVEL_PROGRESS_DESCRIBE_NOTI = "Beat more levels \nto unlock this stage!";

export const CONFIG_LPr = {
    TIME_LONG_EVENT: 60 * 60 * 24 * 7,   // 1 week
    MAX_KEY: 10,
    MAX_PRIZE_LEVEL_PROGRESSION: 30,
    IS_NOTI_START: true
}