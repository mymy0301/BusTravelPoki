import { _decorator, Component, Node } from 'cc';
import { AnimReceiveBase } from './AnimReceiveBase';
const { ccclass, property } = _decorator;

@ccclass('AnimReceiveLevelPass')
export class AnimReceiveLevelPass extends AnimReceiveBase {
    public async PlayAnim(timeAnim: number = 1) {
       await this.ReceivedStar(1, timeAnim);
    }
}


