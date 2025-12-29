import { _decorator, CCFloat, CCInteger, Vec3 } from "cc";
import { IPrize } from "../../../Utils/Types";
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Mon Aug 11 2025 11:26:10 GMT+0700 (Indochina Time)
 * TypeTreasureTrail
 * db://assets/scripts/Scene/OtherUI/UITreasureTrail/TypeTreasureTrail.ts
 *
 */
export const CONFIG_TT = {
    LEVEL_PLAY: 7,
    MAX_PLAYER_JOIN: 100,
    PRIZE_WIN: 10000,
    NUM_BOT_LIMIT_SHOW_UI: 18,
    TIME_EVENT: 60 * 60 * 24,           // 60 * 60 * 24
    TIME_REPEAT_EVENT: 60 * 30,          // 60 * 30
    ID_PLAYER: '0',
    NUM_CONFIG_BOT_REMAIN: 5,
    DIFF_POS_N_LIST_AND_PLATFORM: new Vec3(0, 65, 0),
    TUT: [
        "There are 100 players\nin the challenge",
        "Beat levels on your first try\nto advance to the next step",
        "The grand prize will be shared\neuqally between winners"
    ]
}

export const EVENT_TT = {
    FORCE_END: "FORCE_END",
    FORCE_WAIT_TO_JOIN: "FORCE_WAIT_TO_JOIN"
}

export enum STATE_TT {
    LOCK,
    WAIT_TO_JOIN,
    JOINING,
    WIN,
    LOSE,
    DELAY_WIN,
    DELAY_LOSE
}

export class InfoTreasureTrailJSON {
    rewards: IPrize[] = [];
    numRemainBotState: number[][] = [];
    rateRemainBotState: { min: number, max: number }[] = [];
}

@ccclass('InfoTut')
export class InfoTut {
    @property(Vec3) pos: Vec3 = new Vec3();
    @property(Vec3) anchor: Vec3 = new Vec3();
    @property(Vec3) transformTut: Vec3 = new Vec3();
    @property(Vec3) scaleTut: Vec3 = new Vec3();
    @property(Vec3) anchorTut: Vec3 = new Vec3();
    @property(Vec3) posText: Vec3 = new Vec3();
    @property(CCFloat) scaleText: number = 0;
    @property(CCInteger) typeImg: number = 0;
}
