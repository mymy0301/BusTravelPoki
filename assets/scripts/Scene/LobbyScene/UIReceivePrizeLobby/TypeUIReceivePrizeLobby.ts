import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { IPrize, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';

export class ActionReceivePrizeClass {
    type: TYPE_RECEIVE_PRIZE_LOBBY;
    data: IPrize[];
    reasonReceivePrize: string;
    indexUIPrize: number;
    nameTitle: string;
    customAnimReceive?: (listNPrizes: Node[], cbPool: CallableFunction, cbEmitDoneAfterDoneAnim: CallableFunction) => Promise<void>
    customAnimChest?: { cbSetPrepareChest?: (nChest: Node) => void, cbMoveChest?: (nChest: Node) => void, cbOpenChest?: (nChest: Node, cbDone: CallableFunction) => void }
    dataCustom: any;

    constructor(type: TYPE_RECEIVE_PRIZE_LOBBY, data: IPrize[], reasonReceivePrize: string, indexUIPrize: number = 0, dataCustom: any = null, nameTitle: any = null) {
        this.type = type;
        this.reasonReceivePrize = reasonReceivePrize;
        this.data = data;
        this.indexUIPrize = indexUIPrize;
        this.dataCustom = dataCustom;
        this.nameTitle = nameTitle;
    }
}

export interface IReceiveChestFromWPos {
    fromWPos: Vec3,
    scaleStart: Vec3
}

export function instanceOfIReceiveChestFromWPos(object: any): object is IReceiveChestFromWPos {
    return object != null && 'fromWPos' in object && 'scaleStart' in object;
}


