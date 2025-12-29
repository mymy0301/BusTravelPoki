import { _decorator, AnimationComponent, Component, Label, Node, Size, Sprite, SpriteFrame, Tween, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { EVENT_CLOCK_ON_TICK, MConst } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { ConvertSizeCarFromJson, DIRECT_CAR, GetColorForSpriteFromMColor, GetMColorByNumber, JsonCar, TYPE_LOSE_GAME } from 'db://assets/scripts/Utils/Types';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

/**
 * 
 * anhngoxitin01
 * Wed Jul 09 2025 17:20:50 GMT+0700 (Indochina Time)
 * ItemCoolDownTimeCar
 * db://assets/scripts/Scene/GameScene/OtherUI/UICooldownTimeCar/ItemCoolDownTimeCar.ts
 *
 */

enum STATE_ANIM_ITEM_TIME_COOL_DOWN {
    PREPARE_SHOW,
    ANIM_SHOW,
    IDLE,
    ANIM_HIDE
}

enum NAME_ANIM {
    IDLE = "Idle",
    PREPARE_ITEM = "PrepareShowItem",
    SHOW_ITEM = "ShowItem",
    HIDE_ITEM = "HideItem"
}

@ccclass('ItemCoolDownTimeCar')
export class ItemCoolDownTimeCar extends Component {
    @property(Sprite) spVisualCar: Sprite;
    @property(Label) lbTime: Label;
    @property(Node) nVisual: Node;

    @property(AnimationComponent) animationCom: AnimationComponent;

    private _idCar: number = null; public get IDCar(): number { return this._idCar; }
    private _dataCar: JsonCar = null;

    private _stateAnimItem: STATE_ANIM_ITEM_TIME_COOL_DOWN = STATE_ANIM_ITEM_TIME_COOL_DOWN.IDLE;

    private _cbUpdateLayout: CallableFunction = null;
    private _timeRemaining: number = 0;

    private _cbEndTime: CallableFunction = null;

    //==========================================
    //#region base
    protected onDisable(): void {
        this.UnRegisterTime();
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private async UpdateVisualCar() {
        if (this._dataCar == null) { return; }
        const self = this;
        const pathCar = MConfigResourceUtils.GetPathCar(
            GetMColorByNumber(this._dataCar.carColor),
            ConvertSizeCarFromJson(this._dataCar.carSize),
            DIRECT_CAR.LEFT
        );
        // load imgCar
        await MConfigResourceUtils.GetImageCarUntilLoad(pathCar, (path: string, sf: SpriteFrame) => {
            if (path == pathCar) {
                self.spVisualCar.spriteFrame = sf;
            }
        });

    }
    //#endregion private
    //==========================================

    //==========================================
    //#region state 
    private async UpdateState(newState: STATE_ANIM_ITEM_TIME_COOL_DOWN) {
        this._stateAnimItem = newState;
        this.animationCom.stop();

        switch (this._stateAnimItem) {
            case STATE_ANIM_ITEM_TIME_COOL_DOWN.PREPARE_SHOW:
                // this.animationCom.play(NAME_ANIM.PREPARE_ITEM);
                this.node.getComponent(UITransform).contentSize = new Size(0, 0);
                this.nVisual.getComponent(UIOpacity).opacity = 0;
                break;
            case STATE_ANIM_ITEM_TIME_COOL_DOWN.ANIM_SHOW:
                this.animationCom.play(NAME_ANIM.SHOW_ITEM);
                await Utils.delay(this.GetTimeAnim(NAME_ANIM.SHOW_ITEM) * 1000);
                this.UpdateState(STATE_ANIM_ITEM_TIME_COOL_DOWN.IDLE);
                break;
            case STATE_ANIM_ITEM_TIME_COOL_DOWN.IDLE:
                this.animationCom.play(NAME_ANIM.IDLE);
                this.RegisterTime();
                break;
            case STATE_ANIM_ITEM_TIME_COOL_DOWN.ANIM_HIDE:
                this.animationCom.play(NAME_ANIM.HIDE_ITEM);
                await Utils.delay(this.GetTimeAnim(NAME_ANIM.HIDE_ITEM) * 1000);
                break;
        }
    }

    public ChangeStateAnimShow() {
        this.UpdateState(STATE_ANIM_ITEM_TIME_COOL_DOWN.ANIM_SHOW);
    }

    public async ChangeStateAnimHide() {
        await this.UpdateState(STATE_ANIM_ITEM_TIME_COOL_DOWN.ANIM_HIDE);
    }

    public ChangeStateAnimPrepare() {
        this.UpdateState(STATE_ANIM_ITEM_TIME_COOL_DOWN.PREPARE_SHOW);
    }
    //#endregion state
    //==========================================

    //==========================================
    //#region public
    public SetUpData(idCar: number, jsonCar: JsonCar) {
        this._idCar = idCar;
        this._dataCar = jsonCar;
        this.UpdateState(STATE_ANIM_ITEM_TIME_COOL_DOWN.PREPARE_SHOW);

        // set time remaining
        this._timeRemaining = this._dataCar.timeCarCoolDown;
        this.UpdateLbTime();

        // update sp visual car
        this.UpdateVisualCar();
    }
    public SetUpCb(cbUpdateLayout: CallableFunction) {
        this._cbUpdateLayout = cbUpdateLayout;
    }
    public RegisterCB(cbEndTime: CallableFunction) {
        this._cbEndTime = cbEndTime;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region anim
    private GetTimeAnim(nameAnim: string): number {
        const clip = this.animationCom.clips.find(item => item.name == nameAnim);
        if (clip == null) { return 0; }
        return clip.duration * clip.speed;
    }

    //#endregion anim
    //==========================================

    //==========================================
    //#region time
    public RegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.DecreaseTime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.DecreaseTime, this);
        }
    }

    public UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.DecreaseTime, this);
    }

    private DecreaseTime() {
        this._timeRemaining -= 1;
        if (this._timeRemaining <= 0) {
            this.lbTime.string = "END TIME";
            this.UnRegisterTime();

            // kiểm tra trong trường hợp có cbEndTime thì mới chạy logic cbEndtime
            if (this._cbEndTime) {
                this._cbEndTime(this.node, () => {
                    clientEvent.dispatchEvent(MConst.EVENT.LOSE_GAME, TYPE_LOSE_GAME.CAR_OVER_TIME);
                })
            } else {
                clientEvent.dispatchEvent(MConst.EVENT.LOSE_GAME, TYPE_LOSE_GAME.CAR_OVER_TIME);
            }
            return;
        }
        this.UpdateLbTime();
    }

    private UpdateLbTime() {
        this.lbTime.string = `${this._timeRemaining}s`;
    }
    //#endregion time
    //==========================================
}