/**
 * 
 * anhngoxitin01
 * Thu Aug 28 2025 08:35:47 GMT+0700 (Indochina Time)
 * CarSkyLift
 * db://assets/scripts/Scene/OtherUI/UISkyLift/CarSkyLift.ts
*
*/
import { _decorator, Component, Node, tween, Vec2, Vec3 } from 'cc';
import { AnimCarSL } from '../../../AnimsPrefab/AnimCarSL';
const { ccclass, property } = _decorator;

@ccclass('CarSkyLift')
export class CarSkyLift extends Component {
    @property(Node) nCar: Node;
    @property(AnimCarSL) animCarSL: AnimCarSL;
    //==========================================
    //#region base
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public FlyUpToWPos(wPos: Vec3, timeMove: number = 1) {
        return new Promise<void>(resolve => {
            tween(this.nCar)
                .to(timeMove, { worldPosition: wPos }, { easing: 'sineOut' })
                .call(() => { resolve(); })
                .start();
        })
    }

    public DropToWPos(wPos: Vec3, timeMove: number = 1) {
        return new Promise<void>(async resolve => {
            await this.animCarSL.PlayAnimExploreBallong();
            tween(this.nCar)
                .to(timeMove, { worldPosition: wPos }, { easing: 'sineIn' })
                .call(() => {
                    this.animCarSL.PlayAnimOto();
                    resolve();
                })
                .start();
        })
    }

    public SetWPos(wPos: Vec3) {
        this.nCar.worldPosition = wPos;
        this.animCarSL.PlayAnimIdle();
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}