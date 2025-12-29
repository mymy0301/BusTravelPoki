import { _decorator, Component, Node, sp, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemEffectTouchGameSys')
export class ItemEffectTouchGameSys extends Component {
    @property(sp.Skeleton) MEffect: sp.Skeleton;

    public async PlayTouch(wPos: Vec3) {
        this.node.worldPosition = wPos;
        this.node.active = true;
        const timeScale: number = this.MEffect.timeScale;

        const nameAnimation = this.randomAnim();

        this.MEffect.setAnimation(0, nameAnimation, false);
        return new Promise<void>(resolve => {
            let timeWait = this.MEffect.findAnimation(nameAnimation).duration / timeScale;
            this.scheduleOnce(() => {
                this.node.active = false;
                resolve();
            }, timeWait);
        });

    }

    private randomAnim(): string {
        const listAnim = this.MEffect._skeleton.data.animations;
        let index = Math.floor(Math.random() * listAnim.length);
        return listAnim[index].name;
    }
}


