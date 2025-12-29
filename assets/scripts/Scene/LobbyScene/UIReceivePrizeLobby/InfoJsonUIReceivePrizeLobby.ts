import { _decorator, Component, Node, Vec3 } from 'cc';
import { TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

export interface InfoJsonUIReceivePrizeLobby_Weekly {
    typePrize: TYPE_RECEIVE_PRIZE_LOBBY;
    posTitle: Vec3;
    posTabToContinue: Vec3;
    posChest: Vec3;
    posListPrize: Vec3;
}


