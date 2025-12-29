import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Tween, tween, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('UISignUpNumPassenger')
export class UISignUpNumPassenger extends Component {
    @property(Label) lbNumPassenger: Label;
    @property(Sprite) spBoard: Sprite;
    @property(SpriteFrame) sfNormalBoard: SpriteFrame;
    @property(SpriteFrame) sfChristBoard: SpriteFrame;
    private _numPassShow: number = 0;

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_PASSENGERS.SHOW_NUM_PASSENGER, this.ShowNumPassenger, this);
        clientEvent.on(MConst.EVENT_PASSENGERS.DECREASE_NUM_PASSENGER, this.DecreasePassenger, this);
        clientEvent.on(MConst.EVENT_PASSENGERS.HIDE_NUM_PASSENGER, this.HideNumPassenger, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_PASSENGERS.DECREASE_NUM_PASSENGER, this.DecreasePassenger, this);
        clientEvent.off(MConst.EVENT_PASSENGERS.SHOW_NUM_PASSENGER, this.ShowNumPassenger, this);
        clientEvent.off(MConst.EVENT_PASSENGERS.HIDE_NUM_PASSENGER, this.HideNumPassenger, this);
    }

    public SetNumPassenger(num: number, target: 'normal' | 'christ' = 'normal') {
        this._numPassShow = num;
        this.lbNumPassenger.string = num.toString();
        switch (target) {
            case 'normal':
                this.spBoard.spriteFrame = this.sfNormalBoard;
                break;
            case 'christ':
                this.spBoard.spriteFrame = this.sfChristBoard;
                break;
        }
    }

    //========================
    //#region listen func
    public ShowNumPassenger() {
        this.lbNumPassenger.node.active = true;
    }

    private HideNumPassenger() {
        this.lbNumPassenger.node.active = false;
    }

    private DecreasePassenger() {
        try {
            this._numPassShow -= 1;
            this.lbNumPassenger.string = this._numPassShow.toString();

            Tween.stopAllByTarget(this.lbNumPassenger.node);
            tween(this.lbNumPassenger.node)
                .to(0.1, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: 'linear' })
                .to(0.1, { scale: new Vec3(0.9, 0.9, 0.9) }, { easing: 'linear' })
                .union()
                .repeat(1)
                .start();
        } catch (e) {
            console.error("error decreasePassenger");
        }
    }
    //#endregion listen func
    //========================
}


