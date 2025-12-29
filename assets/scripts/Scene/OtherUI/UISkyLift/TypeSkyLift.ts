import { IPrize } from "../../../Utils/Types";

/**
 * 
 * dinhquangvinhdev
 * Wed Aug 27 2025 09:31:39 GMT+0700 (Indochina Time)
 * TypeSkyLift
 * db://assets/scripts/Scene/OtherUI/UISkyLift/TypeSkyLift.ts
*
*/
export enum STATE_SL {
    LOCK,
    DELAY,
    WAIT_TO_JOIN,
    JOINING,
    WAIT_TO_RECEIVE
}

export const CONFIG_SL = {
    MAX_PRIZE_HAS: 10,
    TIME_HIDE_NOTI: 2,
    TIME_LONG_EVENT: 60 * 60 * 24 * 3 + 60 * 60 * 10,
    TIME_DELAY_EVENT: 60 * 60 * 24,
    MAX_PROGRESS: 60,
    TIME_ANIM_INCREASE_SCORE: 0.6,
    DIFF_X_CAR_AND_SEPARATE: 400,
    DIFF_Y_CAR_AND_FLOOR: 85,
    TIME_DECREASE_EACH_LEVEL: 0.1,
    KEY_POOL_PRIZE: "KEY_POOL_PRIZE_SKY_LIFT",
    SPEED_DROP: 800
}

export const EVENT_SKY_LIFT = {
    NOTIFICATION: "EVENT_SKY_LIFT_NOTIFICATION",
}

export class InfoFloorSkyLiftJSON {
    idFloor: number = 0;
    progress: number = 0;
    listPrize: IPrize[] = [];
    isSavePoint: boolean = false;
}

export interface IOpenNewEvent {
    openNewEvent: boolean
}
export function instanceOfIOpenNewEvent(object: any): object is IOpenNewEvent {
    return object != null && 'openNewEvent' in object;
}