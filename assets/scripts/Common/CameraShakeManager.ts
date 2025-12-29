
import { _decorator, Component, Node, Vec3 } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { lodash } from '../framework/lodash';
import { MConst } from '../Const/MConst';
import { MConfigFacebook } from '../Configs/MConfigFacebook';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = CameraShakeManager
 * DateTime = Thu Feb 24 2022 23:57:58 GMT+0700 (Indochina Time)
 * Author = tuzkekizer
 * FileBasename = CameraShakeManager.ts
 * FileBasenameNoExtension = CameraShakeManager
 * URL = db://assets/scripts/common/CameraShakeManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

@ccclass('CameraShakeManager')
export class CameraShakeManager extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    // Shake Parameters
    shakeDuration: number = 0.2;
    shakeAmount: number = 20;

    canShake: boolean = false;
    _shakeTimer: number = 0;

    onEnable() {
        clientEvent.on(MConst.SHAKE_CAMERA, this.shakeCamera, this);
    }

    onDisable() {
        clientEvent.off(MConst.SHAKE_CAMERA, this.shakeCamera, this);
    }

    start() {
        // [3]
    }

    update(deltaTime: number) {
        // [4]
        if (this.canShake) {
            this.StartCameraShakeEffect(deltaTime);
        }
    }

    shakeCamera() {
        // MConsolLog.Log("shakeCamerashakeCamerashakeCamera");
        // MConsolLog.Log(localConfig.instance.isVibration);
        if (MConfigFacebook.Instance.isVibration) {
            this.canShake = true;
            this._shakeTimer = this.shakeDuration;
        }
    }

    StartCameraShakeEffect(deltaTime: number) {
        if (this._shakeTimer > 0) {
            let rdRadius = lodash.randomFloat(0, 1);
            let rdAngle = lodash.random(0, 360);
            let newPos: Vec3 = new Vec3(0, 0, 1000);
            newPos.x = rdRadius * Math.sin(rdAngle) * this.shakeAmount;
            newPos.y = rdRadius * Math.cos(rdAngle) * this.shakeAmount;
            this.node.setPosition(newPos);

            this._shakeTimer -= deltaTime;
        } else {
            this._shakeTimer = 0;
            this.canShake = false;
            this.node.setPosition(new Vec3(0, 0, 1000));
        }
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/en/scripting/life-cycle-callbacks.html
 */
