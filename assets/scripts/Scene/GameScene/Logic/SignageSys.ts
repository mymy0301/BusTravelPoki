import { _decorator, AnimationComponent, Component, Node } from 'cc';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

enum NAME_ANIM {
    MoveOff = "MoveOff",
    IdleOn = "IdleOn"
}

@ccclass('SignageSys')
export class SignageSys extends Component {
    @property(AnimationComponent) animCom: AnimationComponent;

    public async PlayAnimUnlock() {
        this.animCom.play(NAME_ANIM.MoveOff);
        await Utils.delay(this.animCom.clips[Utils.getIndexOfEnum(NAME_ANIM, NAME_ANIM.MoveOff)].duration * 1000);
    }

    public PlayIdleOn() {
        this.animCom.play(NAME_ANIM.IdleOn);
    }
}


