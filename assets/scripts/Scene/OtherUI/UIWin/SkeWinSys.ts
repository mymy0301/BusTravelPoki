import { _decorator, CCFloat, Component, Node, Skeleton, sp, tween, Vec3 } from 'cc';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('SkeWinSys')
export class SkeWinSys extends Component {
    @property(sp.Skeleton) skeCar: sp.Skeleton;
    @property(sp.Skeleton) skeText: sp.Skeleton;
    @property(CCFloat) timeToPlayTextNext = 1.0;
    @property(Vec3) posUI_base: Vec3 = new Vec3(0, 0, 0);
    @property(Vec3) posUI_end: Vec3 = new Vec3(0, 0, 0);
    @property(Vec3) scaleUI_base: Vec3 = new Vec3(1, 1, 1);
    @property(Vec3) scaleUI_end: Vec3 = new Vec3(0.6, 0.6, 0.6);
    @property(Vec3) posText_base: Vec3 = new Vec3(0, 0, 0);
    @property(Vec3) posText_end: Vec3 = new Vec3(0, 0, 0);
    @property(Vec3) scaleText_base: Vec3 = new Vec3(0.6, 0.6, 0.6);
    @property(Vec3) scaleText_end: Vec3 = new Vec3(0.3, 0.3, 0.3);

    @property(CCFloat) timeTweenMove: number = 1;

    private readonly nameSkeText: string = 'text';
    private readonly nameSkeCar_1: string = 'UI_win';
    private readonly nameSkeCar_2: string = 'UI_win_idle';

    public PrepareSke() {
        this.skeCar.node.active = false;
        this.skeText.node.active = false;

        this.skeCar.node.setPosition(this.posUI_base);
        this.skeText.node.setPosition(this.posText_base);

        this.skeCar.node.setScale(this.scaleUI_base);
        this.skeText.node.setScale(this.scaleText_base);
    }

    public async PlaySke_1() {
        const timeAnimCar_1 = this.GetTimeAnim(this.nameSkeCar_1);
        const timeAnimText = this.GetTimeAnim(this.nameSkeText);

        this.PlayAnim(this.skeCar, this.nameSkeCar_1);
        (async () => {
            await Utils.delay(0.3 * 1000);
            this.PlayAnim(this.skeText, this.nameSkeText);
        })();
        await Utils.delay((timeAnimCar_1 - this.timeToPlayTextNext) * 1000);
        this.PlayAnim(this.skeCar, this.nameSkeCar_2, true);
        await Utils.delay(0.5 * 1000);                             // test
    }

    public async ChangeTweenBetween2Phase() {
        return new Promise<void>((resolve, reject) => {
            tween(this.skeCar.node)
                .to(this.timeToPlayTextNext, {
                    position: this.posUI_end,
                    scale: this.scaleUI_end,
                })
                .start();
            tween(this.skeText.node)
                .to(this.timeToPlayTextNext, {
                    position: this.posText_end,
                    scale: this.scaleText_end,
                })
                .call(() => resolve())
                .start();
        })
    }

    public async PlaySke_2() {
        const timeAnimCar_2 = this.GetTimeAnim(this.nameSkeCar_2);
        this.PlayAnim(this.skeCar, this.nameSkeCar_2, true);
        await Utils.delay(timeAnimCar_2 * 1000);
    }

    public PlayAnim(skeN: sp.Skeleton, nameSke: string, loop: boolean = false) {
        skeN.node.active = true;
        skeN.setAnimation(0, nameSke, loop);
    }

    public GetTimeAnim(nameAnim: string): number {
        return this.skeCar.findAnimation(nameAnim).duration / this.skeCar.timeScale;
    }

    public GetTimeTotalAnim(): number {
        return 1;
    }
}


