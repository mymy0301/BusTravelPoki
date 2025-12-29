import { _decorator, CCFloat, Component, Node, Sprite, SpriteFrame, tween, UIOpacity } from 'cc';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('SplashPassenger')
export class SplashPassenger extends Component {
    @property(Sprite) spVisual: Sprite;

    private readonly timeDelay1: number = 0.1;
    private readonly timeDelay2: number = 0.15;
    private readonly timeDelay3: number = 0.15;

    protected start(): void {
        this.HideVisual();
    }

    public HideVisual() {
        if (this.spVisual != null) {
            this.spVisual.node.active = false;
        }
    }

    public async Show() {
        const self = this;
        const opaVisual = this.spVisual.getComponent(UIOpacity);

        // this.spVisual.spriteFrame = MConfigResourceUtils.listSplashPass[0];

        await Utils.delay(0.04 * 1000);

        this.spVisual.node.active = true;

        tween(this.spVisual.node)
            .call(() => {
                // this.spVisual.spriteFrame = MConfigResourceUtils.listSplashPass[0];
                let path = "Flash1"
                MConfigResourceUtils.GetImageFlashUntilLoad(path, (path: string, sf: SpriteFrame) => {
                    try {
                        this.spVisual.spriteFrame = sf;
                    } catch (e) {

                    }
                });
            })
            .delay(this.timeDelay2 + this.timeDelay3)
            .call(() => {
                self.spVisual.node.active = false;
            })
            .start();
    }

}


