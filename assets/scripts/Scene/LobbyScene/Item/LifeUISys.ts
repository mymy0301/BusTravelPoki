import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { LifeSys2 } from '../../LifeSys2';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('LifeUISys')
export class LifeUISys extends Component {
    @property(Sprite) icLife: Sprite;
    @property(Label) lbLife: Label;
    @property(Label) countDownTime: Label;
    @property(SpriteFrame) sfNormalHeart: SpriteFrame;
    @property(SpriteFrame) sfInfiHeart: SpriteFrame;


    protected onLoad(): void {
        clientEvent.on(MConst.LIFE.EVENT_UPDATE_UI_LIFE, this.UpdateUI, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.LIFE.EVENT_UPDATE_UI_LIFE, this.UpdateUI, this);
    }

    protected start(): void {
        this.UpdateUI();
    }

    private UpdateUI() {
        // get the numlife
        const numLife = LifeSys2.Instance.GetStringNumLife()
        this.lbLife.string = numLife;
        if (numLife != "∞" && this.icLife != null) {
            this.lbLife.node.active = true;
            this.icLife.spriteFrame = this.sfNormalHeart;
        } else if (this.icLife != null) {
            this.lbLife.node.active = false;
            this.icLife.spriteFrame = this.sfInfiHeart;
        }
        // get the string time 
        this.countDownTime.string = LifeSys2.Instance.GetTimeRecover();
    }
}


