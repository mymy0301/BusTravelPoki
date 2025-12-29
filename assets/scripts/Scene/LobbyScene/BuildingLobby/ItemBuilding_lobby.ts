import { _decorator, CCFloat, Component, Node, randomRange, RealCurve, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { Bezier } from '../../../framework/Bezier';
const { ccclass, property } = _decorator;

@ccclass('ItemBuilding_lobby')
export class ItemBuilding_lobby extends Component {
    @property(Node) nVisual: Node;
    @property(Vec3) nScaleStart: Vec3 = new Vec3(0, 0, 0);
    @property(Vec3) nScaleEnd: Vec3 = new Vec3(0, 0, 0);
    @property(Vec3) nScaleMid: Vec3 = new Vec3(0, 0, 0);
    @property(CCFloat) timeDelay: number = 0.2;
    @property(SpriteFrame) listSfBrick: SpriteFrame[] = [];
    @property(RealCurve) curveTime: RealCurve = new RealCurve();

    public AnimMoveToBuilding(wPosStart: Vec3, wPosEnd: Vec3, time: number = 1) {
        this.node.worldPosition = wPosStart;
        this.node.scale = Vec3.ONE;
        this.node.worldPosition = wPosStart.clone();

        return new Promise<void>(resolve => {
            tween(this.node)
                .parallel(
                    tween().to(time, { worldPosition: wPosEnd.clone() }),
                    tween()
                        .to(time / 2, { scale: Vec3.ONE })
                        .to(time / 2, { scale: Vec3.ZERO })
                )
                .call(() => { resolve(); })
                .start();
        })
    }

    public AnimMoveToBuilding_2(wPosStart: Vec3, wPosEnd: Vec3, time: number = 1) {
        // random frame for item building
        this.nVisual.getComponent(Sprite).spriteFrame = this.listSfBrick[Math.floor(Math.random() * this.listSfBrick.length)];

        const scaleStart = this.nScaleStart;
        const scaleMid = this.nScaleMid;
        const scaleEnd = this.nScaleEnd;
        const timeDelay = this.timeDelay;

        this.node.worldPosition = wPosStart;
        this.node.scale = scaleStart;
        this.node.worldPosition = wPosStart.clone();


        return new Promise<void>(resolve => {
            tween(this.node)
                .parallel(
                    tween()
                        .to(time, { worldPosition: wPosEnd.clone() }, { easing: `cubicInOut` }),
                    tween()
                        .to((time - timeDelay) / 2, { scale: scaleMid }, { easing: `quadOut` })
                        .delay(timeDelay)
                        .to((time - timeDelay) / 2, { scale: scaleEnd }, { easing: `quadIn` })
                )
                .call(() => {
                    clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_CONTRUCTOR);
                    resolve();
                })
                .start();
        })
    }

    public AnimMoveToBuilding_3(wPosStart: Vec3, wPosMidIn: Vec3, wPosEnd: Vec3, time: number = 3) {
        // random frame for item building
        this.nVisual.getComponent(Sprite).spriteFrame = this.listSfBrick[Math.floor(Math.random() * this.listSfBrick.length)];

        const wPosMid = wPosStart.clone().add(wPosMidIn);
        let listMove = Bezier.GetListPointsToTween3(10, wPosStart.clone(), wPosMid, wPosEnd.clone());
        let listScale = [];
        let listTween = [];

        let timeIntervals: number[] = [0.15, 0.13889, 0.12778, 0.11667, 0.10556, 0.09444, 0.08333, 0.07222, 0.06111, 0.05];

        for (let i = 0; i < 10; i++) {
            let scaleTo: Vec3 = new Vec3();
            if (i < 7) {
                scaleTo = Vec3.lerp(scaleTo, this.nScaleStart, this.nScaleMid, i / 7);
                listScale.push(scaleTo);
            } else if (i == 7) {
                listScale.push(this.nScaleMid);
            } else {
                scaleTo = Vec3.lerp(scaleTo, this.nScaleMid, this.nScaleEnd, (i - 7) / 3);
                listScale.push();
            }

            // add listTween
            let timeChoice = this.curveTime.evaluate(i / 10) * time * timeIntervals[i];

            let resultTween = tween(this.node).to(timeChoice, { worldPosition: listMove[i], scale: listScale[i] });
            listTween.push(resultTween);
        }
        let resultTween = tween(this.node).to(time * timeIntervals[9], { worldPosition: wPosEnd, scale: this.nScaleEnd });
        listTween.push(resultTween);


        this.node.worldPosition = listMove[0];
        this.node.scale = listScale[0];


        return new Promise<void>(resolve => {
            tween(this.node)
                .sequence(...listTween)
                .call(() => {
                    clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_CONTRUCTOR);
                    resolve();
                })
                .start();
        })
    }

    public AnimMoveToBuilding_4(wPosStart: Vec3, wPosMidIn: Vec3, wPosEnd: Vec3, time: number = 3, cb: CallableFunction) {
        // random frame for item building
        this.nVisual.getComponent(Sprite).spriteFrame = this.listSfBrick[Math.floor(Math.random() * this.listSfBrick.length)];

        const wPosMid = wPosStart.clone().add(wPosMidIn);
        let listMove = Bezier.GetListPointsToTween3(10, wPosStart.clone(), wPosMid, wPosEnd.clone());
        let listScale = [];
        let listTween = [];

        let timeIntervals: number[] = [0.15, 0.13889, 0.12778, 0.11667, 0.10556, 0.09444, 0.08333, 0.07222, 0.06111, 0.05];

        for (let i = 0; i < 10; i++) {
            let scaleTo: Vec3 = new Vec3();
            if (i < 7) {
                scaleTo = Vec3.lerp(scaleTo, this.nScaleStart, this.nScaleMid, i / 7);
                listScale.push(scaleTo);
            } else if (i == 7) {
                listScale.push(this.nScaleMid);
            } else {
                scaleTo = Vec3.lerp(scaleTo, this.nScaleMid, this.nScaleEnd, (i - 7) / 3);
                listScale.push();
            }

            // add listTween
            let timeChoice = this.curveTime.evaluate(i / 10) * time * timeIntervals[i];

            let resultTween = tween(this.node).to(timeChoice, { worldPosition: listMove[i], scale: listScale[i] });
            listTween.push(resultTween);
        }
        let resultTween = tween(this.node).to(time * timeIntervals[9], { worldPosition: wPosEnd, scale: this.nScaleEnd });
        listTween.push(resultTween);


        this.node.worldPosition = listMove[0];
        this.node.scale = listScale[0];


        tween(this.node)
            .sequence(...listTween)
            .call(() => {
                clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_CONTRUCTOR);
                cb();
            })
            .start();
    }
}




