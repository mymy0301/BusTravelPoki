import { _decorator, Component, Tween, Node, tween, Vec3, UIOpacity, Vec2, Pool, instantiate, UITransform, Sprite, SpriteFrame, CCFloat } from 'cc';
import { STATE_ITEM_PRIZE_SEASON_PASS } from '../../scripts/Scene/OtherUI/UISeasonPass/ItemPrizeSeasonPass';
const { ccclass, property } = _decorator;

@ccclass
export default class CirCleClaimFx extends Component {
    @property(SpriteFrame) sfCircleClaim: SpriteFrame = null;
    @property(CCFloat) scaleStart = 0.5;
    @property(CCFloat) scaleEnd = 2;
    public readonly timeShow = 0.25

    show() {
        const nFx = this.node;

        const opaCom = nFx.getComponent(UIOpacity);
        Tween.stopAllByTarget(nFx);
        nFx.scale = Vec3.ONE.clone().multiplyScalar(this.scaleStart);
        opaCom.opacity = 255;
        nFx.active = true;
        tween(nFx).to(this.timeShow, { scale: Vec3.ONE.clone().multiplyScalar(this.scaleEnd) }).start();
        tween(opaCom).to(this.timeShow, { opacity: 0 })
            .call(() => { nFx.active = false })
            .start();
    }
}
