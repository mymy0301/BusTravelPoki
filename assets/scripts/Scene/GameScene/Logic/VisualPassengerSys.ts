import { _decorator, CCFloat, CCInteger, Component, Node, Sprite, SpriteFrame, Tween, tween, Vec3 } from 'cc';
import { M_COLOR, STATE_VISUAL_PASSENGER, TYPE_PASSENGER_POSE } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { MConfigs } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('VisualPassengerSys')
export class VisualPassengerSys {
    @property(Sprite) spVisualPassenger: Sprite;
    @property(Sprite) spEmotions: Sprite;
    @property(CCFloat) numberTimeSwitchSFMove: number = 0.5;
    private _state: STATE_VISUAL_PASSENGER = STATE_VISUAL_PASSENGER.IDLE_DOWN;
    private _pathPassNow: string = null;

    private readonly POS_DEFAULT = new Vec3(0, 37, 0);
    private readonly POS_NOEL = new Vec3(0, 40, 0);

    public Init(color: M_COLOR) {
        this.ChangeStateVisualPassenger(STATE_VISUAL_PASSENGER.IDLE_DOWN, color);
        this.spEmotions.node.active = false;
    }

    public ChangeStateVisualPassenger(state: STATE_VISUAL_PASSENGER, color: M_COLOR, timeMove: number = 0) {
        // stop all tween and reset scale
        const nSpVisual: Node = this.spVisualPassenger.node;
        Tween.stopAllByTarget(nSpVisual);
        nSpVisual.scale = Vec3.ONE;

        // change state to have anim for passenger
        this._state = state;
        switch (state) {
            case STATE_VISUAL_PASSENGER.IDLE_DOWN: this.UpdateVisualStateIdle(color); break;
            case STATE_VISUAL_PASSENGER.IDLE_TURN_LEFT: this.UpdateVisualStateIdleTurn(color); break;
            case STATE_VISUAL_PASSENGER.IDLE_TURN_RIGHT: nSpVisual.scale = new Vec3(-1, 1, 1); this.UpdateVisualStateIdleTurn(color); break;
            case STATE_VISUAL_PASSENGER.MOVE_DOWN: this.UpdateVisualStateMoveDown(color, timeMove); break;
            case STATE_VISUAL_PASSENGER.MOVE_LEFT: this.UpdateVisualStateMoveLeft(color, timeMove); break;
            case STATE_VISUAL_PASSENGER.MOVE_RIGHT: nSpVisual.scale = new Vec3(-1, 1, 1); this.UpdateVisualStateMoveLeft(color, timeMove); break;
            case STATE_VISUAL_PASSENGER.MOVE_UP: this.UpdateVisualStateIdle(color); break;
        }
    }

    private UpdateVisual(path: string) {
        this._pathPassNow = path;

        // update posVisual
        switch (path) {
            case MConfigResourceUtils.GetPathPassengers(M_COLOR.REINDEER_CART, TYPE_PASSENGER_POSE.IDLE):
            case MConfigResourceUtils.GetPathPassengers(M_COLOR.REINDEER_CART, TYPE_PASSENGER_POSE.IDLE_TURN):
            case MConfigResourceUtils.GetPathPassengers(M_COLOR.REINDEER_CART, TYPE_PASSENGER_POSE.RUN_DOWN_1):
            case MConfigResourceUtils.GetPathPassengers(M_COLOR.REINDEER_CART, TYPE_PASSENGER_POSE.RUN_DOWN_2):
            case MConfigResourceUtils.GetPathPassengers(M_COLOR.REINDEER_CART, TYPE_PASSENGER_POSE.RUN_TURN_1):
            case MConfigResourceUtils.GetPathPassengers(M_COLOR.REINDEER_CART, TYPE_PASSENGER_POSE.RUN_TURN_2):
            case MConfigResourceUtils.GetPathPassengers(M_COLOR.REINDEER_CART, TYPE_PASSENGER_POSE.SITTING):
            case MConfigResourceUtils.GetPathPassengers(M_COLOR.REINDEER_CART, TYPE_PASSENGER_POSE.SITTING_2):
                this.spVisualPassenger.node.position = this.POS_NOEL;
                break;
            default:
                this.spVisualPassenger.node.position = this.POS_DEFAULT;
                break;
        }

        // load image
        MConfigResourceUtils.GetImagePassengersUntilLoad(path, (path: string, sf: SpriteFrame) => {
            try {
                if (this._pathPassNow == path) {
                    this.spVisualPassenger.spriteFrame = sf;
                }
            } catch (e) {

            }
        })
    }

    /** 
     *=================================================================
     *=================================================================
     *=================================================================
    */
    //#region func visual state passenger
    private UpdateVisualStateIdle(color: M_COLOR) {
        const pathSfPassenger: string = MConfigResourceUtils.GetPathPassengers(color, TYPE_PASSENGER_POSE.IDLE);
        this.UpdateVisual(pathSfPassenger);
    }

    private UpdateVisualStateIdleTurn(color: M_COLOR) {
        const pathSfPassenger: string = MConfigResourceUtils.GetPathPassengers(color, TYPE_PASSENGER_POSE.IDLE_TURN);
        this.UpdateVisual(pathSfPassenger);
    }

    private UpdateVisualStateMoveDown(color: M_COLOR, timeMove: number) {
        // call all sf to play anim
        const pathSfAnim1: string = MConfigResourceUtils.GetPathPassengers(color, TYPE_PASSENGER_POSE.RUN_DOWN_1);
        const pathSfAnim2: string = MConfigResourceUtils.GetPathPassengers(color, TYPE_PASSENGER_POSE.RUN_DOWN_2);
        const nSf: Node = this.spVisualPassenger.node;

        // tween
        tween(nSf)
            .call(() => { this.UpdateVisual(pathSfAnim1); })
            // .delay(this.numberTimeSwitchSFMove)
            .delay(timeMove / 2)
            .call(() => { this.UpdateVisual(pathSfAnim2); })
            // .delay(this.numberTimeSwitchSFMove)
            .delay(timeMove / 2)
            .union()
            .repeatForever()
            .start();
    }

    private UpdateVisualStateMoveLeft(color: M_COLOR, timeMove: number) {
        const pathSfAnim1: string = MConfigResourceUtils.GetPathPassengers(color, TYPE_PASSENGER_POSE.RUN_TURN_1);
        const pathSfAnim2: string = MConfigResourceUtils.GetPathPassengers(color, TYPE_PASSENGER_POSE.RUN_TURN_2);
        const nSf: Node = this.spVisualPassenger.node;

        // tween
        tween(nSf)
            .call(() => { this.UpdateVisual(pathSfAnim1); })
            .delay(timeMove / 2)
            .call(() => { this.UpdateVisual(pathSfAnim2); })
            .delay(timeMove / 2)
            .union()
            .repeatForever()
            .start();
    }
    //#endregion func visual state passenger
    /** 
     *=================================================================
     *=================================================================
     *=================================================================
    */

    public GetStateVisualPassenger(): STATE_VISUAL_PASSENGER {
        return this._state;
    }

    //#region Emotions
    private _isShowVisualEmotion: boolean = false; public get IsShowVisualEmotion(): boolean { return this._isShowVisualEmotion; }
    public ShowVisualEmotion(sfEmotion: SpriteFrame) {
        if (sfEmotion == null) return;

        this._isShowVisualEmotion = true;

        this.spEmotions.spriteFrame = sfEmotion;
        this.spEmotions.node.scale = Vec3.ZERO;
        this.spEmotions.node.position = Vec3.ZERO;
        this.spEmotions.node.active = true;

        // action for emotions
        tween(this.spEmotions.node)
            // anim show emotions
            .to(MConfigs.TIME_APPEAR_EMOTIONS, { scale: Vec3.ONE, position: new Vec3(0, MConfigs.DISTANCE_EMOTION_Y, 0) }, { easing: 'elasticOut' })
            // // anim angle emotions
            // .sequence(...listTween)
            // anime angle emotions
            .to(MConfigs.TIME_EACH_ANGER_EMOTION, { scale: new Vec3(1.2, 1.2, 1.2), angle: -30 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION * 2, { scale: Vec3.ONE, angle: 30 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION * 2, { scale: new Vec3(1.1, 1.1, 1.1), angle: -20 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION * 2, { scale: Vec3.ONE, angle: 20 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION * 2, { scale: new Vec3(1.1, 1.1, 1.1), angle: -10 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION * 2, { scale: Vec3.ONE, angle: 10 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION, { scale: Vec3.ZERO, angle: 0 })

            .call(() => {
                this._isShowVisualEmotion = false;
                this.spEmotions.spriteFrame = null;
            })
            .start();
    }

    public StopVisualEmotion() {
        Tween.stopAllByTarget(this.spEmotions.node);
    }
    //#endregion Emotions
}


