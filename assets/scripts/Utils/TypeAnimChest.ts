import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * anim mở hộp quà
 */
export enum NameAnimChest_open {
    Box_red = 'box1',
    Box_green = 'box2',
    Box_pink = 'box3',
    Box_violet = 'box4',
    Box_blue = 'box5',
    Chest_free = 'chest1',
    Chest_prenium = 'chest2'
}

/**
 * anim rung lắc để thông báo rằng đã có thể nhận thưởng
 */
export enum NameAnimChest_wait_to_open {
    Box_red = 'box1_idle',
    Box_green = 'box2_idle',
    Box_pink = 'box3_idle',
    Box_violet = 'box4_idle',
    Box_blue = 'box5_idle'
}

/**
 * anim này chỉ có ảnh lúc box đã mở đứng im
 */
export enum NameAnimChest_idle_after_open {
    Box_red = 'box1_2',
    Box_green = 'box2_2',
    Box_pink = 'box3_2',
    Box_violet = 'box4_2',
    Box_blue = 'box5_2',
    Chest_free = 'chest1_idle',
    Chest_prenium = 'chest2_idle'
}

/**
 * anim này chỉ có ảnh lúc box đang đóng đứng im
 */
export enum NameAnimChest_idle_close {
    Box_red = 'box1_3',
    Box_green = 'box2_3',
    Box_pink = 'box3_3',
    Box_violet = 'box4_3',
    Box_blue = 'box5_3'
}
export enum Enum_NameAnimChest {
    Box_red,
    Box_green,
    Box_pink,
    Box_violet,
    Box_blue
}
Enum(Enum_NameAnimChest)
export function ConvertEnum_NameAnimChest_idle_close(enumIn: Enum_NameAnimChest) {
    switch (enumIn) {
        case Enum_NameAnimChest.Box_red:
            return NameAnimChest_idle_close.Box_red;
        case Enum_NameAnimChest.Box_green:
            return NameAnimChest_idle_close.Box_green;
        case Enum_NameAnimChest.Box_pink:
            return NameAnimChest_idle_close.Box_pink;
        case Enum_NameAnimChest.Box_violet:
            return NameAnimChest_idle_close.Box_violet;
        case Enum_NameAnimChest.Box_blue:
            return NameAnimChest_idle_close.Box_blue;
    }
}
export function ConvertEnum_NameAnimChest_wait_to_open(enumIn: Enum_NameAnimChest) {
    switch (enumIn) {
        case Enum_NameAnimChest.Box_red:
            return NameAnimChest_wait_to_open.Box_red;
        case Enum_NameAnimChest.Box_green:
            return NameAnimChest_wait_to_open.Box_green;
        case Enum_NameAnimChest.Box_pink:
            return NameAnimChest_wait_to_open.Box_pink;
        case Enum_NameAnimChest.Box_violet:
            return NameAnimChest_wait_to_open.Box_violet;
        case Enum_NameAnimChest.Box_blue:
            return NameAnimChest_wait_to_open.Box_blue;
    }
}

export function ConvertEnum_NameAnimChest_idle_after_open(enumIn: Enum_NameAnimChest) {
    switch (enumIn) {
        case Enum_NameAnimChest.Box_red:
            return NameAnimChest_idle_after_open.Box_red;
        case Enum_NameAnimChest.Box_green:
            return NameAnimChest_idle_after_open.Box_green;
        case Enum_NameAnimChest.Box_pink:
            return NameAnimChest_idle_after_open.Box_pink;
        case Enum_NameAnimChest.Box_violet:
            return NameAnimChest_idle_after_open.Box_violet;
        case Enum_NameAnimChest.Box_blue:
            return NameAnimChest_idle_after_open.Box_blue;
    }
}

export enum NameAnimChest_Streak_open {
    "Streak_1" = "chest8",
    "Streak_2" = "chest9",
    "Streak_3" = "chest10",
    "Streak_4" = "chest11",
    "Streak_5" = "chest12"
}

export enum NameAnimChest_Streak_idle_after_open {
    "Streak_1" = "idle_chest8_2",
    "Streak_2" = "idle_chest9_2",
    "Streak_3" = "idle_chest10_2",
    "Streak_4" = "idle_chest11_2",
    "Streak_5" = "idle_chest12_2"
}

export enum NameAnimChest_Streak_idle_close {
    "Streak_1" = "idle_chest8_1",
    "Streak_2" = "idle_chest9_1",
    "Streak_3" = "idle_chest10_1",
    "Streak_4" = "idle_chest11_1",
    "Streak_5" = "idle_chest12_1"
}

export enum NameAnimIconHome_Idle {
    spin = "spin2",
    invite = "invite_idle",
    levelPass = "level_pass_idle",
    seasonPass = "season_pass_idle",
    seasonPass_2 = "level_seasion_pass_idle",
    greatDeals = 'r_sale2',
    daily = 'daily_idle',
    starterPack = 'sale_idle',
    PVP = 'PVP_idle',
    piggyBank = 'piggy_idle',
    dashRush = 'start_idle',
    speed_race = 'speed_idle',
    endless_treasure = 'treasure_idle',
    levelProgress = 'season_pass_idle',
    treasureTraill = 'event_competitive_idle',
    skyLift = 'event_streak_idle',
    halloween = 'pack_halloween_idle',
    chirstmas = 'christmas_event_idle',
    pack_christmas = 'xmas_pack_idle'
}

export enum NameAnimIconHome_Active {
    spin = "spin",
    invite = "invite",
    levelPass = "level_pass",
    seasonPass = "season_pass_idle",
    seasonPass_2 = "level_seasion_pass",
    greatDeals = 'r_sale',
    daily = 'daily',
    starterPack = 'sale',
    PVP = 'PVP',
    piggyBank = 'piggy',
    dashRush = 'start',
    speedRace = 'speed',
    endless_treasure = 'treasure',
    levelProgress = 'season_pass_idle',
    treasureTraill = 'event_competitive',
    skyLift = 'event_streak',
    halloween = 'pack_halloween',
    chirstmas = 'christmas_event',
    pack_christmas = 'xmas_pack'
}

export enum NameAnimIconHome_Receive {
    seasonPass = "season_pass_eat",
    seasonPass_2 = "level_seasion_pass_eat",
    levelPass = "level_pass_eat",
    piggyBank = "piggy_eat",
    dashRush = "start_eat",
    speedRace = "speed_eat",
    levelProgress = "season_pass_eat",
    skyLift = "event_streak_eat"
}

export enum NameAnimLock {
    unlock = "unlock",
    lock = "unlock_idle"
}

export const NAME_ANIM_STAR = "icon_star";

