/**
 * 
 * anhngoxitin01
 * Mon Aug 11 2025 15:25:42 GMT+0700 (Indochina Time)
 * AvatarTT
 * db://assets/scripts/Scene/OtherUI/UITreasureTrailPrepare/AvatarTT.ts
*
*/
import { _decorator, Component, Node, randomRange, randomRangeInt, Sprite, SpriteFrame, Tween, tween, UIOpacity, Vec3 } from 'cc';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { AnimJumpObj } from '../../../AnimsPrefab/AnimJumpObj';
const { ccclass, property } = _decorator;

@ccclass('AvatarTT')
export class AvatarTT extends Component {
    @property(Sprite) bgAvatar: Sprite;
    @property(Sprite) spAvatar: Sprite;
    @property(AnimJumpObj) animJump: AnimJumpObj;
    private _pathAvatar: string = "";
    //==========================================
    //#region base
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public SetUp(sfBg: SpriteFrame, pathAvatar: string) {
        // stop anim
        Tween.stopAllByTarget(this.node);

        // set bg
        this.bgAvatar.spriteFrame = sfBg;

        // load avatar
        this._pathAvatar = pathAvatar;
        const self = this;

        ResourceUtils.TryLoadImage(pathAvatar, (pathAvatar: string, spriteFrame: SpriteFrame) => {
            if (self._pathAvatar == pathAvatar && self.node != null && self.node.isValid) {
                self.spAvatar.spriteFrame = spriteFrame;
            }
        });
    }

    public AnimShow(scaleMax: Vec3): Promise<void> {
        this.node.active = true;
        const timeAnim: number = 0.6;
        const self = this;
        return new Promise<void>(resolve => {
            tween(this.node)
                .to(timeAnim, { scale: scaleMax }, {
                    onUpdate(target, ratio) {
                        self.node.getComponent(UIOpacity).opacity = ratio * 255;
                    },
                })
                .call(() => { resolve() })
                .start();
        })
    }

    public Jump(wPos: Vec3) {
        this.animJump.TweenAnimCurveWPos(wPos);
    }

    private readonly TIME_TRY_JUMP = 1;
    private readonly TIME_FALL = 0.5;
    public Drop(index: number, posMid: Vec3) {
        const posNow = this.node.position.clone();
        const posEnd = new Vec3(2 * posMid.x - posNow.x, posNow.y, 0);
        const opaCom = this.node.getComponent(UIOpacity);
        switch (true) {
            // đối với index == 0 || index == 1
            // => sẽ try jump và down
            case index == 0 || index == 1:
                this.animJump.animCom.play("Jump2")
                tween(this.node)
                    .to(this.TIME_TRY_JUMP / 7 * 3, { position: posMid }, { easing: 'cubicOut' })
                    .delay(this.TIME_TRY_JUMP / 7)
                    .to(this.TIME_TRY_JUMP / 7 * 3, { position: posEnd }, {
                        easing: 'quadIn', onUpdate(target, ratio) {
                            opaCom.opacity = (1 - ratio) * 255;
                        },
                    })
                    .start();
                break;
            // đối với những index còn lại sẽ lại văng về hướng đấy
            default:
                tween(this.node)
                    .to(this.TIME_FALL + randomRange(0, 0.5), { position: posMid, angle: randomRangeInt(2, 5) * 180 }, {
                        onUpdate(target, ratio) {
                            opaCom.opacity = 255 * (1 - ratio);
                        },
                    })
                    .start();
                break;
        }
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