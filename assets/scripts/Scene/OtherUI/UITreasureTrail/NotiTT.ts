/**
 * 
 * anhngoxitin01
 * Wed Aug 20 2025 06:14:04 GMT+0700 (Indochina Time)
 * NotiTT
 * db://assets/scripts/Scene/OtherUI/UITreasureTrail/NotiTT.ts
*
*/
import { _decorator, Component, Label, Node, Size, Sprite, SpriteFrame, Tween, tween, UITransform, Vec2, Vec3 } from 'cc';
import { InfoTut } from './TypeTreasureTrail';
const { ccclass, property } = _decorator;

@ccclass('NotiTT')
export class NotiTT extends Component {
    @property(Sprite) spNoti: Sprite;
    @property(Label) lbText: Label;
    @property(Node) nListenClickHideNoti: Node;
    //==========================================
    //#region base
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private RegisterBubble() {
        if (this.nListenClickHideNoti != null) {
            this.nListenClickHideNoti.on(Node.EventType.TOUCH_START, this.HideAnim, this, true);
        }
    }

    private UnRegisterBubble() {
        // Need try catch in here because the node is not depend on this node class. So you need try catch if it wrong
        try {
            if (this.nListenClickHideNoti != null) {
                this.nListenClickHideNoti.off(Node.EventType.TOUCH_START, this.HideAnim, this, true);
            }
        } catch (e) {

        }
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public SetUp(sfNoti: SpriteFrame, text: string, infoTut: InfoTut) {
        this.node.position = infoTut.pos;
        this.node.getComponent(UITransform).anchorPoint = new Vec2(infoTut.anchor.x, infoTut.anchor.y);
        this.spNoti.spriteFrame = sfNoti;
        this.spNoti.node.scale = infoTut.scaleTut;
        const spNotiTransform = this.spNoti.getComponent(UITransform);
        spNotiTransform.contentSize = new Size(infoTut.transformTut.x, infoTut.transformTut.y);
        spNotiTransform.anchorPoint = new Vec2(infoTut.anchorTut.x, infoTut.anchorTut.y);
        this.lbText.string = text;
        this.lbText.node.position = infoTut.posText;
    }

    public Show() {
        this.node.active = true;
    }

    public Hide() {
        this.node.active = false;
    }

    public ShowAnim() {
        const timeShow: number = 0.3;
        this.node.scale = Vec3.ZERO;
        this.node.active = true;
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .to(timeShow, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();
    }

    public HideAnim() {
        const timeHide: number = 0.3;
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .to(timeHide, { scale: Vec3.ZERO }, { easing: 'backIn' })
            .start();
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}