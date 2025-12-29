import { IPrize } from "../Types";

export enum TYPE_TRAILS {
    NONE
}

export interface IInfoTrailJson {
    Id: string,
    Name: string,
    RequireEachProgress: IPrize[][]
}

export const EVENT_CUSTOMS = {
    TRAIL: {
        UPDATE_PROGRESS: "EVENT_CUSTOMS_TRAIL_UPDATE_PROGRESS",
        CHOICE_TRAIL: "EVENT_CUSTOMS_TRAIL_CHOICE_TRAIL"
    }
}

export enum STATE_ITEM_TRAIL {
    LOCK,
    IN_PROGRESS_OPEN,
    CHOICING,
    UNCHOICING
}

