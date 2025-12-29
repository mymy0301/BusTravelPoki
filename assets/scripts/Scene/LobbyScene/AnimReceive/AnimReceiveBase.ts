import { _decorator, CCBoolean, CCInteger, Component, Enum, Node, Sprite, SpriteFrame, tween, UITransform, Vec3 } from 'cc';
import { Utils } from '../../../Utils/Utils';
import { SoundSys } from '../../../Common/SoundSys';
import { GameSoundEffect } from '../../../Utils/Types';
const { ccclass, property } = _decorator;


enum DIRECT_ANIM_STARS {
    RIGHT,
    LEFT
}

Enum(DIRECT_ANIM_STARS)
@ccclass('AnimReceiveBase')
export class AnimReceiveBase extends Component {
    @property(Node) nTemp: Node;
    @property(SpriteFrame) sfStar: SpriteFrame;
    @property(Node) visual: Node;
    @property(CCInteger) distanceReceiveStars: number = 150;
    @property({ type: DIRECT_ANIM_STARS }) isRightOrLeft: DIRECT_ANIM_STARS = DIRECT_ANIM_STARS.RIGHT;
    @property(CCBoolean) isUseScaleVisualAfterReceive: boolean = true;

    private GetWPosForSpawnStar(): Vec3 {
        return this.visual.worldPosition.clone().add3f(this.isRightOrLeft == DIRECT_ANIM_STARS.RIGHT ? this.distanceReceiveStars : -this.distanceReceiveStars, 0, 0);
    }

    /**
     * this func not use timeAnim => if you need it right you need modify the code below
     * @param numberStar 
     * @param timeAnim 
     */
    public async ReceivedStar(numberStar: number, timeAnim: number = 1) {
        const wPosSpawnStar = this.GetWPosForSpawnStar();
        const indexStarMoveTo: Vec3[] = [wPosSpawnStar.clone().add3f(-50, 0, 0), wPosSpawnStar.clone().add3f(0, 20, 0), wPosSpawnStar.clone().add3f(50, 0, 0)];

        function animScaleStar(nStar: Node, index: number, wPosEnd: Vec3): Promise<void> {
            const timeScale = 0.7;
            const timeMoveToRoot = 0.3;
            return new Promise<void>(resolve => {
                tween(nStar)
                    .to(timeScale, { worldPosition: indexStarMoveTo[index % indexStarMoveTo.length], scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                    .call(() => { SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.STAR_GEN_COLLECT_LOBBY); })
                    .delay(0.2)
                    .to(timeMoveToRoot, { worldPosition: wPosEnd, scale: new Vec3(0.2, 0.2, 0.2) })
                    .call(() => {
                        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.STAR_COLLECT_LOBBY);
                        nStar.destroy();
                        resolve();
                    })
                    .start();
            });
        }

        // generate stars to the node temp gen play anim move to this chest 
        const posEnd = this.node.worldPosition.clone();
        const NumStarRepresent = numberStar > 3 ? 3 : numberStar;
        const timeDelayNextStar = 0.02 * 1000;
        const timeScaleVisualWhenReceiveAllStars = 0.2;
        for (let i = 0; i < NumStarRepresent; i++) {
            let nStar = new Node();
            nStar.addComponent(UITransform);
            nStar.addComponent(Sprite);
            nStar.getComponent(Sprite).spriteFrame = this.sfStar;
            nStar.setParent(this.nTemp);
            nStar.scale = Vec3.ZERO;
            nStar.worldPosition = wPosSpawnStar.clone();
            if (i != NumStarRepresent - 1) {
                animScaleStar(nStar, i, posEnd);
                await Utils.delay(timeDelayNextStar);
            } else {
                await animScaleStar(nStar, i, posEnd);
                // check if no visual not scale it 
                if (this.isUseScaleVisualAfterReceive) {
                    tween(this.visual)
                        .to(timeScaleVisualWhenReceiveAllStars, { scale: new Vec3(1.5, 1.5, 1.5) }, { easing: 'bounceOut' })
                        .to(timeScaleVisualWhenReceiveAllStars, { scale: Vec3.ONE })
                        .start();
                }
            }
        }
    }
}


