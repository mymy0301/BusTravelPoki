import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

export interface IDataCustomTutorialInLobby {
    cbCloseUI: CallableFunction;
}

export enum TYPE_RUN_TUT_EVENT {
    HAND_CLICK,
    POP_UP_TUT,
    SCALE_IMPRESS
}
Enum(TYPE_RUN_TUT_EVENT);

export const EVENT_TUT_LOBBY = {
    LOGIC_CHECK_SHOW_TUT_LOBBY_DONE: "LogicCheckTutInLobby_LOGIC_CHECK_SHOW_TUT_LOBBY_DONE",
    // RUN_LOGIC_CHECK_TUT: "LogicCheckTutInLobby_RUN_LOGIC_CHECK_TUT",
    IS_ANY_TUT_CAN_PLAY: "LogicCheckTutInLobby_IS_ANY_TUT_CAN_PLAY",
    ANIM_UNLOCK_EVENT: "LogicCheckTutInLobby_ANIM_UNLOCK_EVENT",
    GET_TIME_ANIM_UNLOCK_EVENT: "LogicCheckTutInLobby_GET_TIME_ANIM_UNLOCK_EVENT",
    TRY_SHOW_POP_UP_UI: "LogicCheckTutInLobby_TRY_SHOW_POP_UP_UI",
    CHANGE_ENABLE_CHECK_LOGIC_TUT: "LogicCheckTutInLobby_CHANGE_ENABLE_CHECK_LOGIC_TUT"
}