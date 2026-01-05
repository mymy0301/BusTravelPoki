import { Vec3 } from "cc";
import { IPrize } from "db://assets/scripts/Utils/Types";

const CONFIG_LR_CHRIST = {
    MAX_PRIZE: 25,
    MAX_PROGRESS: 230,
    TIME_ACTIVE: 60 * 60 * 24 * 30,
    MAX_LIGHT: 10,
    MAX_IMAGE_LIGHT: 7,
    AUTO_SHOW_AT_HOME: false,
    DATE_VALID_END_EVENT_MONTH: 1,
    MONTH_VALID_INIT: [11,0,1,2,3,4,5,6,7,8,9,10]
}

const EVENT_LR_CHRIST = {
    NOTI_PRIZE: "EVENT_LR_CHRIST_NOTI_PRIZE"
}

export {
    CONFIG_LR_CHRIST,
    EVENT_LR_CHRIST
}

export interface IInfoChestLightRoad {
    id: number;
    visual: number;
    progressRequired: number;
    listPrize: IPrize[];
    wPosChest?: Vec3;
}

export interface IInfoUIUpdateLR {
    ratioProgress: number,
    progressNow: number,
    infoPrize: IInfoChestLightRoad
}