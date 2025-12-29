import { _decorator, CCInteger, Component, Node, randomRange, Sprite, SpriteFrame, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('AutoGenIncreaseRank')
export class AutoGenIncreaseRank extends Component {
    @property(SpriteFrame) sfGame: SpriteFrame;
    @property(Node) nPoolArrow: Node;
    @property([Vec3]) posArrow: Vec3[] = [];
    @property(CCInteger) numArrowSpawn: number = 10;
    private poolSpArrow: Node[] = [];

    public InitArrow(): Node {
        const lengthArrow = this.nPoolArrow.children.length;
        if (lengthArrow > 0) {
            let result = this.nPoolArrow.children[lengthArrow - 1];
            result.active = false;
            result.setParent(this.node);
            result.position = Vec3.ZERO;
            return result;
        } else {
            let result: Node = new Node();
            result.addComponent(UITransform);
            result.addComponent(UIOpacity).opacity = 0;
            result.addComponent(Sprite).spriteFrame = this.sfGame;
            result.setParent(this.node);
            result.position = Vec3.ZERO;

            result.active = false;

            return result;
        }
    }

    private ReUseArrow(node: Node) {
        node.active = false;
        node.setParent(this.nPoolArrow);
    }

    public async PlayAnimIncreaseArrow() {
        const self = this;

        // gen random pos of arrow in screen
        // tween move it up + flash
        // then hide it
        const sizeRangePlay = this.node.getComponent(UITransform).contentSize.clone();

        let listBasePosRandom: Vec3[] = [];
        for (let i = 0; i < this.numArrowSpawn; i++) {
            const posX: number = randomRange(-sizeRangePlay.width / 2, sizeRangePlay.width / 2);
            const posY: number = randomRange(-sizeRangePlay.height / 2, sizeRangePlay.height / 2);
            listBasePosRandom.push(new Vec3(posX, posY, 0));
        }


        const timeArrowAppear: number = 0.2;
        const timeArrowHide: number = 0.3;

        // ========================== anim for arrow ===========================
        for (let i = 0; i < this.numArrowSpawn; i++) {
            let tArrow = this.InitArrow();
            const basePos = listBasePosRandom[i];
            const endPos = basePos.clone().add3f(0, 100, 0);
            const opaCom = tArrow.getComponent(UIOpacity);

            const speedMove = randomRange(0.3, 0.6);

            tArrow.position = basePos;
            tArrow.scale = Vec3.ONE.clone().multiplyScalar(randomRange(0.7, 0.9));
            tArrow.active = true;

            tween(tArrow)
                .to(timeArrowAppear, {},
                    {
                        easing: 'smooth', onUpdate(target, ratio) {
                            opaCom.opacity = 255 * ratio;
                        }
                    }
                )
                .to(speedMove, { position: endPos }, { easing: 'cubicOut' })
                .to(timeArrowHide, {}, {
                    easing: 'smooth', onUpdate(target, ratio) {
                        opaCom.opacity = 255 * (1 - ratio);
                    }
                })
                .call(() => {
                    tArrow.active = false;
                    this.ReUseArrow(tArrow);
                })
                .start();

            let timeRandomDelay = randomRange(0.05, 0.08);
            await Utils.delay(timeRandomDelay * 1000);
        }
        // ===================================================================
    }

}


