import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MIndicatorShop_FrameChoice')
export class MIndicatorShop_FrameChoice extends Component {
    @property(SpriteFrame) sfTabMid: SpriteFrame;
    @property(SpriteFrame) sfTabEnd: SpriteFrame;

    public ChangeVisualTab(type: 'MID' | 'LEFT' | 'RIGHT') {
        this.node.getComponent(Sprite).spriteFrame = type == 'MID' ? this.sfTabMid : this.sfTabEnd;
        this.node.scale = (type == 'MID' || type == 'LEFT') ? Vec3.ONE : new Vec3(-1, 1, 1);
    }
}


