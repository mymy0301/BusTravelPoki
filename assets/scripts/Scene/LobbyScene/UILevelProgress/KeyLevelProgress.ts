import { _decorator, AnimationComponent, Component, Node, RealCurve, Sprite, tween, Vec3 } from 'cc';
import { DataLevelProgressionSys } from '../../../DataBase/DataLevelProgressionSys';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

enum NAME_ANIM {
    IDLE = "idle",
    ANIM = "receive"
}

@ccclass('KeyLevelProgress')
export class KeyLevelProgress extends Component {
    @property(AnimationComponent) animCom: AnimationComponent;
    @property(Sprite) spKey: Sprite;
    @property(RealCurve) rvX: RealCurve = new RealCurve();
    @property(RealCurve) rvY: RealCurve = new RealCurve();
    public async PlayAnimReceive() {
        this.animCom.play(NAME_ANIM.ANIM);
        await Utils.delay((this.GetTimeAnimReceive() + this.timeMoveEnd) * 1000);
    }

    public PlayAnimIdle() {
        this.animCom.play(NAME_ANIM.IDLE);
    }

    public GetTimeAnimReceive(): number {
        const clipReceive = this.animCom.clips.find(clip => clip.name == NAME_ANIM.ANIM);
        return clipReceive.duration / clipReceive.speed;
    }

    public async UpdateSfKey() {
        try {
            const sfKey = await DataLevelProgressionSys.Instance.GetSfKeyEvent();
            this.spKey.spriteFrame = sfKey;
        } catch (e) {

        }
    }


    private readonly timeMoveEnd = 0.5;
    private AnimMoveToEndPoint() {
        const posNow = this.node.position.clone();
        const posEnd = Vec3.ZERO.clone();
        const diffX = posEnd.x - posNow.x;
        const diffY = posEnd.y - posNow.y;
        const self = this;

        tween(this.node)
            .to(this.timeMoveEnd, {}, {
                onUpdate(target, ratio) {
                    const newX = posNow.x + diffX * self.rvX.evaluate(ratio);
                    const newY = posNow.y + diffY * self.rvY.evaluate(ratio);
                    self.node.position = new Vec3(newX, newY);
                },
            })
            .start();
    }
}


