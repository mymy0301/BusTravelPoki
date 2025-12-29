import { _decorator, Component, Node } from 'cc';
import { Convert } from '../ReadDataJson';
import { TYPE_ITEM } from '../Utils/Types';
const { ccclass, property } = _decorator;

export enum LE_ID_MODE {
    NORMAL = 'normal',
    CHRIST = 'christ'
}

export enum LE_RESULT_END_LEVEL {
    WIN = 'win',
    LOSE = 'lose',
    QUIT = 'quit'
}

export enum LE_RESOURCE_CHANGE_change_type {
    ADD = 'ADD',
    SUB = 'SUB'
}