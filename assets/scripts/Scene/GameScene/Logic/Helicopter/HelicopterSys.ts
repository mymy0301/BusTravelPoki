import { _decorator, CCFloat, CCInteger, Component, Node, Tween, tween, UIOpacity, Vec3 } from 'cc';
import { SoundSys } from 'db://assets/scripts/Common/SoundSys';
import { GameSoundEffect } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('HelicopterSys')
export class HelicopterSys extends Component {
    @property(Node) nVisualHelicopter: Node;
    @property(Vec3) baseScaleHel: Vec3 = new Vec3(1, 1, 1);
    @property(Vec3) scaleWhen_MoveDown: Vec3 = new Vec3(0.8, 0.8, 0.8);
    @property(Vec3) scaleCarWhen_MoveUp: Vec3 = new Vec3(1.1, 1.1, 1.1);
    @property(CCFloat) speedHelicopter: number = 500;
    @property(CCFloat) distanceMoveY: number = 200;
    @property(CCFloat) timeApearHelicopter: number = 0.3;
    @property(CCFloat) timeHe_MoveDown_GetCar: number = 0.4;
    @property(CCFloat) timeHe_MoveUp_GetCar: number = 0.6;
    @property(CCFloat) timeHe_MoveDown_PlaceCar: number = 0.6;
    @property(CCFloat) timeHe_MoveUp_PlaceCar: number = 0.4;

    private readonly distanceVec3HelAndCar: Vec3 = new Vec3(0, 0, 0);

    private _cbHelicopterPlaceCarDone: CallableFunction = null;
    private _cbHelicopterStartMoveCar: CallableFunction = null;

    public registerCb(cbHelicopterStartMoveCar: CallableFunction, cbHelicopterPlaceCarDone: CallableFunction) {
        this._cbHelicopterPlaceCarDone = cbHelicopterPlaceCarDone;
        this._cbHelicopterStartMoveCar = cbHelicopterStartMoveCar;
    }

    public StopHelicopter() {
        Tween.stopAllByTarget(this.node);
        SoundSys.Instance.stopSoundEffectWithNameSound(GameSoundEffect.SOUND_HELI);
        this.nVisualHelicopter.getComponent(UIOpacity).opacity = 0;
    }

    public async MoveCarToVipSlot(wPosStart: Vec3, nCar: Node, infoPlaceCarVip: { wPos: Vec3, angle: number }) {
        console.log("MoveCarToVipSlot");
        // tạm thời hiệu ứng sẽ là di chuyển từ góc dưới bên phải => chỗ xe => anim nhặt xe => di chuyển ra chỗ place => anim thả xe

        const opaHel = this.nVisualHelicopter.getComponent(UIOpacity);
        const baseScaleCar: Vec3 = nCar.scale.clone();
        const wPosCar: Vec3 = nCar.worldPosition.clone();
        const wPosPlaceCar: Vec3 = infoPlaceCarVip.wPos.clone();
        const self = this;

        //===================== PREPARE ANIM =====================
        Tween.stopAllByTarget(this.node);
        opaHel.opacity = 0;
        this.node.worldPosition = wPosStart.clone();
        this.node.scale = this.baseScaleHel.clone();
        this.node.active = true;

        // ===================== MOVE to the car =================
        // play sound
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_HELI);
        const timeMoveToCar = Vec3.distance(wPosStart.clone(), wPosCar) / this.speedHelicopter;
        await new Promise<void>(resolve => {
            tween(this.node)
                .parallel(
                    tween(self.node).to(this.timeApearHelicopter, {}, {
                        onUpdate(target, ratio) {
                            opaHel.opacity = 255 * ratio;
                        },
                    }),
                    tween(self.node).to(timeMoveToCar, { worldPosition: wPosCar.clone().add(this.distanceVec3HelAndCar) }, {})
                )
                .call(() => {
                    
                    resolve();
                })
                .start();
        })
        console.log("AAAAAAAAA");
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_BOOSTER_HELLICOPTER_PICK);
        // ===================== Anim pick car Up =================
        await new Promise<void>(resolve => {
            tween(this.node)
                .to(this.timeHe_MoveDown_GetCar, { scale: this.scaleWhen_MoveDown.clone() })
                .call(() => resolve())
                .start();

        })

        this._cbHelicopterStartMoveCar();

        await new Promise<void>(resolve => {
            tween(nCar)
                .to(this.timeHe_MoveUp_GetCar, { scale: this.scaleCarWhen_MoveUp.clone() }, {})
                .start();
            tween(this.node)
                .to(this.timeHe_MoveUp_GetCar, { scale: this.baseScaleHel.clone() })
                .call(() => resolve())
                .start();
        })

        // ==================== MOVE to the place =================
        const timeMoveToPlaceCar: number = Vec3.distance(wPosCar.clone(), wPosPlaceCar) / this.speedHelicopter;
        await new Promise<void>(resolve => {
            tween(nCar)
                .to(timeMoveToPlaceCar, { worldPosition: wPosPlaceCar }, {})
                .start();

            tween(this.node)
                .to(timeMoveToPlaceCar, { worldPosition: wPosPlaceCar.clone().add(this.distanceVec3HelAndCar) }, {})
                .call(() => resolve())
                .start();
        })

        // ==================== Place Car to place =================
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_BOOSTER_HELLICOPTER_DROP);
        const distanceScale: number = this.scaleCarWhen_MoveUp.x - baseScaleCar.x;
        await new Promise<void>(resolve => {
            tween(this.node)
                .to(this.timeHe_MoveDown_PlaceCar, { scale: this.scaleWhen_MoveDown.clone() }, {
                    easing: 'cubicOut',
                    onUpdate(target, ratio) {
                        const distanceScaleNow = (1 - ratio) * distanceScale;
                        nCar.scale = baseScaleCar.clone().add3f(distanceScaleNow, distanceScaleNow, distanceScaleNow);
                    }
                })
                .call(() => { self._cbHelicopterPlaceCarDone(); nCar.scale = baseScaleCar; })
                .to(this.timeHe_MoveUp_PlaceCar, { scale: this.baseScaleHel.clone() }, { easing: 'cubicOut' })
                .call(() => {
                    resolve();
                })
                .start();
        })

        // =================== Move Helicopter out ================
        const wPosMoveOut = this.node.worldPosition.clone().add3f(0, this.distanceMoveY, 0);
        let timeMoveOut = Vec3.distance(this.node.worldPosition.clone(), wPosMoveOut) / this.speedHelicopter;
        tween(this.node)
            .to(timeMoveOut, { worldPosition: wPosMoveOut }, {
                onUpdate(target, ratio) {
                    opaHel.opacity = 255 * (1 - ratio);
                },
            })
            .start();
    }

    public async MoveCarToVipSlot_2(wPosStart: Vec3, nCar: Node, infoPlaceCarVip: { wPos: Vec3, angle: number }, cbMoveDone: CallableFunction) {
        // tạm thời hiệu ứng sẽ là di chuyển từ góc dưới bên phải => chỗ xe => anim nhặt xe => di chuyển ra chỗ place => anim thả xe
        const opaHel = this.nVisualHelicopter.getComponent(UIOpacity);
        const baseScaleCar: Vec3 = nCar.scale.clone();
        const wPosCar: Vec3 = nCar.worldPosition.clone();
        const wPosPlaceCar: Vec3 = infoPlaceCarVip.wPos.clone();
        const self = this;

        //===================== PREPARE ANIM =====================
        Tween.stopAllByTarget(this.node);
        opaHel.opacity = 0;
        this.node.worldPosition = wPosStart.clone();
        this.node.scale = this.baseScaleHel.clone();
        this.node.active = true;

        // ===================== MOVE to the car =================
        // play sound
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_HELI);
        const timeMoveToCar = Vec3.distance(wPosStart.clone(), wPosCar) / this.speedHelicopter;
        let tweenNodeMove1 = tween(this.node)
            .parallel(
                tween(self.node).to(this.timeApearHelicopter, {}, {
                    onUpdate(target, ratio) {
                        opaHel.opacity = 255 * ratio;
                    },
                }),
                tween(self.node).to(timeMoveToCar, { worldPosition: wPosCar.clone().add(this.distanceVec3HelAndCar) }, {})
            )

        
        // ===================== Anim pick car Up =================
        let tweenNodeMove2 = tween(this.node)
            .to(this.timeHe_MoveDown_GetCar, { scale: this.scaleWhen_MoveDown.clone() })
            .call(() => {
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_BOOSTER_HELLICOPTER_PICK);
                this._cbHelicopterStartMoveCar();
            })

        let tweenNCarMove1 = tween(nCar)
            .to(this.timeHe_MoveUp_GetCar, { scale: this.scaleCarWhen_MoveUp.clone() }, {})
        let tweenNodeMove3 = tween(this.node)
            .parallel(
                tween().call(() => { tweenNCarMove1.start() }),
                tween().to(this.timeHe_MoveUp_GetCar, { scale: this.baseScaleHel.clone() })
            )

        // ==================== MOVE to the place =================
        const timeMoveToPlaceCar: number = Vec3.distance(wPosCar.clone(), wPosPlaceCar) / this.speedHelicopter;
        let tweenNCarMove2 = tween(nCar)
            .to(timeMoveToPlaceCar, { worldPosition: wPosPlaceCar }, {})

        let tweenNodeMove4 = tween(this.node)
            .parallel(
                tween().call(() => { tweenNCarMove2.start() }),
                tween().to(timeMoveToPlaceCar, { worldPosition: wPosPlaceCar.clone().add(this.distanceVec3HelAndCar) }, {})
            )

        // ==================== Place Car to place =================
        
        const distanceScale: number = this.scaleCarWhen_MoveUp.x - baseScaleCar.x;
        let tweenNodeMove5 = tween(this.node)
            .to(this.timeHe_MoveDown_PlaceCar, { scale: this.scaleWhen_MoveDown.clone() }, {
                easing: 'cubicOut',
                onUpdate(target, ratio) {
                    const distanceScaleNow = (1 - ratio) * distanceScale;
                    nCar.scale = baseScaleCar.clone().add3f(distanceScaleNow, distanceScaleNow, distanceScaleNow);
                }
            })
            .call(() => { 
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_BOOSTER_HELLICOPTER_DROP);
                self._cbHelicopterPlaceCarDone(); 
                nCar.scale = baseScaleCar; 
            })
            .to(this.timeHe_MoveUp_PlaceCar, { scale: this.baseScaleHel.clone() }, { easing: 'cubicOut' })


        // =================== Move Helicopter out ================
        const wPosMoveOut = this.node.worldPosition.clone().add3f(0, this.distanceMoveY, 0);
        let timeMoveOut = Vec3.distance(this.node.worldPosition.clone(), wPosMoveOut) / this.speedHelicopter;
        let tweenNodeMove6 = tween(this.node)
            .to(timeMoveOut, { worldPosition: wPosMoveOut }, {
                onUpdate(target, ratio) {
                    opaHel.opacity = 255 * (1 - ratio);
                },
            })

        //logic di chuyển đó là chạy move 1->5 => cb => 6
        // phần tween di chuyển car sẽ dual vs di chuyển máy bay như trong code trên
        tween(this.node)
            .sequence(
                tweenNodeMove1,
                tweenNodeMove2,
                tweenNodeMove3,
                tweenNodeMove4,
                tweenNodeMove5,
                tween().call(() => { cbMoveDone() }),
                tweenNodeMove6
            )
            .start()
    }
}


