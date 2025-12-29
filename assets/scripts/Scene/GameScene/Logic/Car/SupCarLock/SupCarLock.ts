import { _decorator, Component, Node, RealCurve, Sprite, SpriteFrame, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { ISupCar } from '../TypeSupCar';
import { COLOR_KEY_LOCK, DIRECT_CAR, GetNameCarSize, TYPE_CAR_SIZE } from 'db://assets/scripts/Utils/Types';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('SupCarLock')
export class SupCarLock extends Component implements ISupCar {
    @property(Node) nKey: Node;
    @property(Node) nLock: Node;
    @property(Node) nCar: Node;

    @property(RealCurve) rcX: RealCurve = new RealCurve();
    @property(RealCurve) rcY: RealCurve = new RealCurve();
    @property(RealCurve) rcScale: RealCurve = new RealCurve();

    private _isAnimUnlock: boolean = false;
    private readonly TIME_ANIM_LOCK: number = 0.6;
    private readonly SPEED_KEY_MOVE: number = 500;
    private readonly TIME_HIDE_LOCK: number = 0.2;

    private _directionCar: DIRECT_CAR = null;

    //====================================================
    //#region ISupCar
    SetUp(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE, color: COLOR_KEY_LOCK): void {
        this._directionCar = directionCar;

        // get img car
        const pathCarLock = MConfigResourceUtils.GetPathCarLock(directionCar, sizeCar);
        MConfigResourceUtils.GetImageCarLockUntilLoad(pathCarLock, (path: string, sfCarLock: SpriteFrame) => {
            try {
                if (path == pathCarLock) {
                    this.nCar.getComponent(Sprite).spriteFrame = sfCarLock;
                }
            } catch (e) {

            }
        });

        // get img lock
        const pathLock = MConfigResourceUtils.GetPathLock(directionCar, color);
        MConfigResourceUtils.GetImageLockUntilLoad(pathLock, (path: string, sfLock: SpriteFrame) => {
            try {
                if (path == pathLock) {
                    this.nLock.getComponent(Sprite).spriteFrame = sfLock;
                }
            } catch (e) {

            }
        })

        // set scale
        switch (this._directionCar) {
            case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.TOP_RIGHT: case DIRECT_CAR.RIGHT:
                this.nCar.scale = this.nLock.scale = new Vec3(-1, 1, 1);
                break;
            default:
                this.nCar.scale = this.nLock.scale = Vec3.ONE;
                break;
        }

        // set position for lock
        const posLock = LIST_POS_LOCK[GetNameCarSize(sizeCar)][directionCar];
        this.nLock.position = posLock;

        // set up position , active node
        this.node.position = Vec3.ZERO;
        this.node.getComponent(UIOpacity).opacity = 255;
        this.node.active = true;
        this.nKey.active = false;
    }

    async PlayAnimUnlock(wPosKey: Vec3, colorKeyLock: COLOR_KEY_LOCK): Promise<void> {
        const self = this;

        const rootWPosKey = wPosKey.clone();
        this._isAnimUnlock = true;
        //========= prepare anim =============
        // update UIKey , wpos
        const pathKey = MConfigResourceUtils.GetPathKeyForPlay(DIRECT_CAR.TOP, colorKeyLock);
        MConfigResourceUtils.GetImageCarKeyUntilLoad(pathKey, (path: string, sfKey: SpriteFrame) => {
            if (path == pathKey) {
                this.nKey.getComponent(Sprite).spriteFrame = sfKey;
            }
        });
        this.nKey.worldPosition = rootWPosKey.clone();
        this.nKey.active = true;

        //========== anim ====================
        // move the key to the lock
        const diffX = this.nLock.worldPosition.x - rootWPosKey.x;
        const diffY = this.nLock.worldPosition.y - rootWPosKey.y;
        const TIME_ANIM_UNLOCK = Vec3.distance(this.nLock.worldPosition, rootWPosKey.clone()) / this.SPEED_KEY_MOVE;
        tween(this.nKey)
            .to(TIME_ANIM_UNLOCK, {}, {
                onUpdate(target, ratio) {
                    const trueX = wPosKey.x + diffX * self.rcX.evaluate(ratio);
                    const trueY = wPosKey.y + diffY * self.rcY.evaluate(ratio);
                    const trueScale = Vec3.ONE.clone().multiplyScalar(self.rcScale.evaluate(ratio));
                    self.nKey.worldPosition = new Vec3(trueX, trueY);
                    self.nKey.scale = trueScale;
                },
            })
            .call(() => {
                this.nKey.active = false;
            })
            .start();
        await Utils.delay(TIME_ANIM_UNLOCK * 1000);

        // unlock the lock
        tween(this.node.getComponent(UIOpacity))
            .to(this.TIME_HIDE_LOCK, { opacity: 0 })
            .start();

        //==========  done anim ========== 
        await Utils.delay(this.TIME_HIDE_LOCK * 1000);
        this._isAnimUnlock = false;
    }

    public AnimLock() {
        // trong trường hợp đang chạy anim unlock thì sẽ ko chạy anim lock để có thể chạy anim
        if (this._isAnimUnlock) { return; }
        this.StopAnimLock();
        tween(this.nLock)
            .to(this.TIME_ANIM_LOCK / 24, { angle: 20 }, { easing: 'smooth' })
            .to(this.TIME_ANIM_LOCK / 12, { angle: -20 }, { easing: 'smooth' })
            .to(this.TIME_ANIM_LOCK / 12, { angle: 20 }, { easing: 'smooth' })
            .to(this.TIME_ANIM_LOCK / 12, { angle: -20 }, { easing: 'smooth' })
            .to(this.TIME_ANIM_LOCK / 12, { angle: 20 }, { easing: 'smooth' })
            .to(this.TIME_ANIM_LOCK / 24, { angle: 0 }, { easing: 'smooth' })
            .start();
    }

    Show(): void {
        this.node.active = true;
    }
    Hide(): void {
        this.node.active = false;
    }
    //#endregion ISupCar
    //====================================================

    //====================================================
    //#region self
    private StopAnimLock() {
        Tween.stopAllByTarget(this.nLock);
        this.nLock.angle = 0;
    }
    //#endregion self
    //====================================================
}


const LIST_POS_LOCK = {
    "4_CHO": {
        0: new Vec3(0, 10, 0),
        1: new Vec3(4.5, 14, 0),
        2: new Vec3(0, 14, 0),
        3: new Vec3(-2, 18, 0),
        4: new Vec3(0, 11, 0),
        5: new Vec3(2.5, 20, 0),
        6: new Vec3(4.5, 14, 0),
        7: new Vec3(-3, 13, 0)
    },
    "6_CHO": {
        0: new Vec3(-1, 17, 0),
        1: new Vec3(3, 18.5, 0),
        2: new Vec3(0, 17, 0),
        3: new Vec3(-1, 19, 0),
        4: new Vec3(-1.5, 16, 0),
        5: new Vec3(0, 18.5, 0),
        6: new Vec3(3, 17, 0),
        7: new Vec3(-3, 19, 0)
    },
    "10_CHO": {
        0: new Vec3(0, 19, 0),
        1: new Vec3(3, 20, 0),
        2: new Vec3(0, 19, 0),
        3: new Vec3(0, 20, 0),
        4: new Vec3(0, 19, 0),
        5: new Vec3(0, 20, 0),
        6: new Vec3(0, 19, 0),
        7: new Vec3(-3, 20, 0)
    }
}