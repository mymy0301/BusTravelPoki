import { _decorator, CCFloat, Component, Node, Skeleton, sp, tween, UIOpacity, Vec3 } from 'cc';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('SkeLoseSys')
export class SkeLoseSys extends Component {
    @property(sp.Skeleton) skeCar: sp.Skeleton;

    private readonly nameSkeLose_1: string = 'UI_lose';
    private readonly nameSkeLose_2: string = 'UI_lose_idle';

    public PrepareSke() {
        this.skeCar.node.active = false;
    }

    public async PlaySke_Lose_1() {
        this.skeCar.node.active = true;
        const timeSkeLose_1 = this.GetTimeAnim(this.nameSkeLose_1);

        this.PlayAnim(this.skeCar, this.nameSkeLose_1);
        await Utils.delay(timeSkeLose_1 * 1000 / 2);
        (async () => {
            await Utils.delay(timeSkeLose_1 * 1000 / 2);
            this.PlayAnim(this.skeCar, this.nameSkeLose_2, true)
        })()
    }

    public PlayAnim(skeN: sp.Skeleton, nameSke: string, loop: boolean = false) {
        skeN.node.active = true;
        skeN.setAnimation(0, nameSke, loop);
    }

    public GetTimeAnim(nameAnim: string): number {
        return this.skeCar.findAnimation(nameAnim).duration / this.skeCar.timeScale;
    }
}


