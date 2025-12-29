/**
 * 
 * dinhquangvinhdev
 * Mon Aug 18 2025 12:00:37 GMT+0700 (Indochina Time)
 * AnimJumpObj
 * db://assets/scripts/AnimsPrefab/AnimJumpObj.ts
*
*/
import { _decorator, AnimationComponent, CCFloat, Component, Node, RealCurve, tween, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimJumpObj')
export class AnimJumpObj extends Component {
    @property(RealCurve) rc_x: RealCurve = new RealCurve();
    @property(RealCurve) rc_y: RealCurve = new RealCurve();
    @property(AnimationComponent) animCom: AnimationComponent;

    public TweenAnimCurveWPos(wPos: Vec3) {
        const self = this;
        const rootWPos = this.node.worldPosition.clone();
        const diffWPosX = wPos.x - this.node.worldPosition.x;
        const diffWPosY = wPos.y - this.node.worldPosition.y;

        this.animCom.play("Jump1");
        const clipJump1 = this.animCom.clips.find(clip => clip.name == "Jump1");
        const timeAnim = clipJump1.duration;

        tween(this.node)
            .to(timeAnim, {}, {
                onUpdate(target, ratio) {
                    const rightX = rootWPos.x + self.rc_x.evaluate(ratio) * diffWPosX;
                    const rightY = rootWPos.y + self.rc_y.evaluate(ratio) * diffWPosY;
                    self.node.worldPosition = new Vec3(rightX, rightY);
                },
            })
            .call(() => { this.animCom.play("Jump2") })
            .start();
    }

    public TweenAnimCurvePos(wPos: Vec3) {
        const self = this;
        const rootWPos = this.node.position.clone();
        const diffWPosX = wPos.x - this.node.position.x;
        const diffWPosY = wPos.y - this.node.position.y;

        this.animCom.play("Jump1");
        const clipJump1 = this.animCom.clips.find(clip => clip.name == "Jump1");
        const timeAnim = clipJump1.duration;

        tween(this.node)
            .to(timeAnim, {}, {
                onUpdate(target, ratio) {
                    const rightX = rootWPos.x + self.rc_x.evaluate(ratio) * diffWPosX;
                    const rightY = rootWPos.y + self.rc_y.evaluate(ratio) * diffWPosY;
                    self.node.position = new Vec3(rightX, rightY);
                },
            })
            .call(() => { this.animCom.play("Jump2") })
            .start();
    }


    @property(Node) nStart: Node;
    @property(Node) nEnd: Node;
    public Test() {
        this.node.worldPosition = this.nStart.worldPosition;
        this.TweenAnimCurveWPos(this.nEnd.worldPosition);
    }
}