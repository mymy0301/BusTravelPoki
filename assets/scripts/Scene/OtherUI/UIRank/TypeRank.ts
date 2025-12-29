import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum PAGE_VIEW_RANK {
    WEEKLY,
    GLOBAL,
    FRIEND
}
Enum(PAGE_VIEW_RANK);

export const EVENT_RANK_CHANGE_PAGE = 'EVENT_RANK_CHANGE_PAGE';
export const EVENT_RANK_TURN_ON_BLOCK_UI = 'EVENT_RANK_TURN_ON_BLOCK_UI';
export const EVENT_RANK_TURN_OFF_BLOCK_UI = 'EVENT_RANK_TURN_ON_BLOCK_UI';
export const EVENT_RANK_NOTI_OPEN = 'EVENT_RANK_NOTI_OPEN';
export const EVENT_RANK_NOTI_FORCE_CLOSE = 'EVENT_RANK_NOTI_FORCE_CLOSE';



