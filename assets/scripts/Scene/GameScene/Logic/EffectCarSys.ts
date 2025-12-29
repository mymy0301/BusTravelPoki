import { _decorator, Component, IPhysics2DWorldManifold, Node, Tween, tween, Vec2, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { Utils } from '../../../Utils/Utils';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { STATE_CAR } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('EffectCarSys')
export class EffectCarSys {
    @property(Node) nEFCar: Node;
    @property(Node) nVisualPickUpPassenger: Node;

    private _cbGetIdCar: CallableFunction = null;
    private _cbIsCarMystery: CallableFunction = null;
    private _cbGetStateCar: CallableFunction = null;

    public Init(cbGetIdCar: CallableFunction, cbIsCarMystery: CallableFunction, cbGetStateCar: CallableFunction) {
        this._cbGetIdCar = cbGetIdCar;
        this._cbIsCarMystery = cbIsCarMystery;
        this._cbGetStateCar = cbGetStateCar;
    }

    private isPlayEf: boolean = false;
    private readonly strengthBlock: number = 15;
    public PlayEfBlockCarMove(idCar, vecOtherMove: Vec2) {
        if (idCar == this._cbGetIdCar() && !this.isPlayEf && this._cbGetStateCar() == STATE_CAR.READY_TO_MOVE) {
            this.isPlayEf = true;

            // anim sway car
            const timeAnim: number = 0.1;
            const posBase: Vec3 = this.nEFCar.getPosition();
            const posMoveTo: Vec3 = posBase.clone().add(Utils.ConvertVec2ToVec3(vecOtherMove.clone().multiplyScalar(this.strengthBlock)));

            Tween.stopAllByTarget(this.nEFCar);
            tween(this.nEFCar)
                .to(timeAnim / 2, { position: posMoveTo }, { easing: 'smooth' })
                .to(timeAnim / 2, { position: posBase }, { easing: 'smooth' })
                .call(() => { this.isPlayEf = false; })
                .start();
        }
    }

    public async PlayEfPassengerMoveOn(idCar: number, cbWhenScaleMaxCar: CallableFunction) {
        if (idCar != this._cbGetIdCar()) {
            // console.log("not this car");
            return;
        }

        let visualChoice: Node = this.nVisualPickUpPassenger;

        // scale the car when passenger move on
        const timeScaleUp: number = 0.05;
        const timeScaleDown: number = 0.05;

        const scale1: Vec3 = new Vec3(1.05, 1.05, 1.05);
        const scale2: Vec3 = Vec3.ONE;
        // AniTweenSys.StopTween(visualChoice);
        visualChoice.scale = scale2;
        await AniTweenSys.scaleBubble(visualChoice, timeScaleUp, timeScaleDown, scale1, scale2, false, false, cbWhenScaleMaxCar);
    }

    public ScaleCarWhenClick() {
        let visualChoice: Node = this.nEFCar;

        let scaleNow = this.nEFCar.scale.clone();
        let scaleEnd = new Vec3(1.15, 1.15, 1.15);

        // check if scale x == -1 
        if (scaleNow.x < 0) {
            scaleEnd.multiply3f(-1, 1, 1);
        }
        this.nEFCar.scale = scaleEnd;

        tween(visualChoice)
            .to(0.05, { scale: scaleNow })
            .start();
    }
}


