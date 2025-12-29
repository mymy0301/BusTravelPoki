import { _decorator, Component, Node, Vec3 } from 'cc';
import { DIRECT_CAR, JsonCar, JsonConveyorBelt, JsonGarage, JsonGroup, JsonMapGame, TYPE_CAR_SIZE } from '../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('MConstBuildGame')
export class MConstBuildGame {
    public static readonly EVENT_BUILDING = {
        SHOW_UI_CHANGE_INFO_CARS: "EVENT_BUILDING_SHOW_UI_CHANGE_INFO_CARS",
        SHOW_NOTIFICATION_CAR: "EVENT_BUILDING_SHOW_NOTIFICATION_CAR",
        NOTIFICATION_CAR_SAME_GROUP: "EVENT_BUILDING_NOTIFICATION_CAR_SAME_GROUP",
        SHOW_NOTIFICATION_CAR_BLOCK: "EVENT_BUILDING_SHOW_NOTIFICATION_CAR_BLOCK",
        UPDATE_DIRECT_CAR_UI_INFO: "EVENT_BUILDING_UPDATE_DIRECT_CAR_UI_INFO",
        SWAP_ID_CAR: "EVENT_BUILDING_SWAP_ID_CAR",
        UPDATE_ID_CAR_LOCK: "EVENT_BUILDING_UPDATE_ID_CAR_LOCK",
        REMOVE_ID_CAR_LOCK: "EVENT_BUILDING_REMOVE_ID_CAR_LOCK",
        REMOVE_ID_CAR_KEY: "EVENT_BUILDING_REMOVE_ID_CAR_KEY",
        NOTIFICATION_ARROW_CAR_HAS_KEY: "EVENT_BUILDING_NOTIFICATION_ARROW_CAR_HAS_KEY",
        NOTIFICATION_ARROW_CAR_HAS_LOCK: "EVENT_BUILDING_NOTIFICATION_ARROW_CAR_HAS_LOCK",

        //group
        UDPATE_GROUP: "EVENT_BUILDING_UDPATE_GROUP_CONFIG"
    }

    public static readonly DEFAULT_POSITION_CONVEYOR_BELT: Vec3 = new Vec3(0, -416.745, 0);

    public static dataMapToPlayTest: IMapBusFrenzy = null;
    public static groupChoice: number = 0;

    public static readonly NAME_SCENE = {
        BUILD_GAME: "buildGameScene",
        TEST_GAME_SCENE: "testGameScene"
    };
}


export enum STATE_BUILD_GAME {
    NONE,
    CHANGE_INFO_CARS,
    CHANGE_INFO_CONVEYOR_BELT,
    CHANGE_INFO_GARAGE
}

export interface IExportData {
    dataWriteCarInfo: JsonCar[],
    dataWriteGuestColor: number[],
    dataWriteGuestColorGroundCar: number[],
    dataWriteHamXeInfo: JsonGarage[],
    dataWriteGuestColorGara: number[],
    dataWriteTransmissionInfo: JsonConveyorBelt[],
    dataWriteGuestColorConveyorBelt: number[],
    dataForUIPreviewGroupCar: Map<number, IInfoUIPreviewGroupCar>
}

export interface IInfoUIPreviewGroupCar {
    listJsonCarGroup: JsonCar[],
    listIdCar: number[],
    listColorPassenger: number[]
}

//================================================
//#region BusFrenzy
export interface IMapBusFrenzy {
    Time: number,
    LevelScaleFactor: number,
    ParkingSpaceInit: number,
    GuestColor: number[],
    CarInfo: JsonCarBusFrenzy[],
    GarageInfo: any[]
    ConveyorBeltInfo: JsonConveyorBeltInfoBusFrenzy[],
    Group: JsonGroup[]
}

export interface JsonCarBusFrenzy {
    carColor: number,
    carSize: number
    carPosition: Vec3,
    carDirection: DIRECT_CAR,
    isMysteryCar: boolean
}

export interface JsonConveyorBeltInfoBusFrenzy {
    conveyorBeltPosition: Vec3,
    cars: JsonCarBusFrenzy[]
}
//#endregion busFrenzy
//================================================