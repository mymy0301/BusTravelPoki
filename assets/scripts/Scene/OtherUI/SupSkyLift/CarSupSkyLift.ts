/**
 * 
 * dinhquangvinhdev
 * Mon Sep 08 2025 14:41:11 GMT+0700 (Indochina Time)
 * CarSupSkyLift
 * db://assets/scripts/Scene/OtherUI/SupSkyLift/CarSupSkyLift.ts
*
*/
import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { AnimCarSL } from '../../../AnimsPrefab/AnimCarSL';
const { ccclass, property } = _decorator;

@ccclass('CarSupSkyLift')
export class CarSupSkyLift extends Component {
    @property(AnimCarSL) animCarSL: AnimCarSL;

    public MoveTo(posSet: Vec3) {
        const rootPos = this.node.position.clone();
        const posRight = new Vec3(posSet.x, rootPos.y, 0);

        return new Promise<void>(resolve => {
            this.animCarSL.PlayAnimUpLv();
            const timeAnimMove = this.animCarSL.GetTimeAnimUpLv();
            tween(this.node)
                .to(timeAnimMove, { position: posRight }, { easing: 'sineOut' })
                .call(() => {
                    this.animCarSL.PlayAnimIdleRight();
                    resolve();
                })
                .start();
        })
    }

    public SetUpPos(posSet: Vec3) {
        const rootPos = this.node.position.clone();
        const posRight = new Vec3(posSet.x, rootPos.y, 0);
        this.node.position = posRight;
        this.animCarSL.PlayAnimIdleRight();
    }
}