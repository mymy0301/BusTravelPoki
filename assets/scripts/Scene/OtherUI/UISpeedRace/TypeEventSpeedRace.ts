import { _decorator, Component, Node } from 'cc';
import { IPrize, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';

export enum STATE_SPEED_RACE {
    JOINING,
    WAIT_RECEIVE,
    END_EVENT
}

export const CONFIG_SR = {
    UPDATE_UI_WHEN_END_TIME: "EVENT_SPEED_RACE_UPDATE_UI_WHEN_END_TIME",
    TRY_CHANGE_TITLE: "EVENT_SPEED_RACE_TRY_CHANGE_TITLE",
    NOTIFICATION: {
        TEXT: "EVENT_SPEED_RACE_NOTIFICATION_TEXT",
        ITEMS: "EVENT_SPEED_RACE_NOTIFICATION_ITEMS",
        FORCE_CLOSE: "EVENT_SPEED_RACE_NOTIFICATION_FORCE_CLOSE"
    },
    UPDATE_NOTI_PRIZE: "EVENT_SPEED_RACE_UPDATE_NOTI_PRIZE",
    UPDATE_TEXT_BTN_SR: "EVENT_SPEED_RACE_UPDATE_TEXT_BTN_SR",
    DATA_PRIZE_RANK: [
        [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 5000)],
        [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 2500)],
        [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 1500)],
        [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 1000)],
        [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 500)],
        [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 400)],
        [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 350)],
        [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 300)],
        [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 250)],
        [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 200)]
    ],
    DATA_PRIZE_PROGRESS: [
        { index: 0, progress: 1, prizes: [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 25)] },
        { index: 1, progress: 20, prizes: [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 25)] },
        { index: 2, progress: 40, prizes: [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 25)] },
        { index: 3, progress: 80, prizes: [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 25)] },
        { index: 4, progress: 150, prizes: [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 50)] },
        { index: 5, progress: 300, prizes: [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 50)] },
        { index: 6, progress: 500, prizes: [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 50)] },
        { index: 7, progress: 800, prizes: [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 75)] },
        { index: 8, progress: 1200, prizes: [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 75)] },
        { index: 9, progress: 1800, prizes: [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 100)] },
    ],
    SR_MAX_PLAYER_JOIN: 50,
    SR_MAX_TIME_EVENT: 60 * 60 * 24,        // 60 * 60 * 24
    SR_TIME_SHOW_RESULT: 60 * 10,           // 60 * 10
    SR_TIME_AUTO_INCREASE_SCORE: 60 * 10,   // 60 * 10
    SR_NUM_PLAYER_TYPE_A: 50 * 0.1,         // SR_MAX_PLAYER_JOIN * 0.1
    SR_NUM_PLAYER_TYPE_B: 50 * 0.3,         // SR_MAX_PLAYER_JOIN * 0.3
    SR_NUM_PLAYER_TYPE_C: 50 * 0.6,         // SR_MAX_PLAYER_JOIN * 0.6
    SR_MULTIPLIER: [1, 5, 10, 20, 100],
}