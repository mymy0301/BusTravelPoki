import { _decorator, AnimationComponent, Animation, Component, Node, AnimationState } from 'cc';
import { SoundSys } from 'db://assets/scripts/Common/SoundSys';
import { GameSoundEffect } from 'db://assets/scripts/Utils/Types';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

enum NAME_ANIM {
    ANIM = "Open_warning_hard_level",
    IDLE = "Idle_warning_hard_level"
}

@ccclass('UIWarningHardLevel')
export class UIWarningHardLevel extends Component {
    @property(Node) nBg: Node;
    @property(Node) nVisual: Node;
    private _animCom: AnimationComponent = null;
    public get animCom() {
        if (this._animCom == null) {
            this._animCom = this.node.getComponent(AnimationComponent);
        }
        return this._animCom;
    }

    protected onEnable(): void {
        this.nBg.active = this.nVisual.active = false;
        // this.animCom.on(Animation.EventType.FINISHED, this.animFinished, this);
    }

    protected onDisable(): void {
        // this.animCom.off(Animation.EventType.FINISHED, this.animFinished, this);
    }


    //==========================================
    //#region anim
    private animFinished(type: Animation.EventType, state: AnimationState) {
        // on anim finished
    }
    //#endregion anim
    //===========================================

    //===========================================
    //#region self
    public async Anim() {
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_HARD_LEVEL_OPEN);
        try {
            this.animCom.play(NAME_ANIM.ANIM);
            await Utils.delay(this.animCom.clips[Utils.getIndexOfEnum(NAME_ANIM, NAME_ANIM.ANIM)].duration * 1000);
            this.animCom.play(NAME_ANIM.IDLE);
        } catch (e) {
            console.log(e);
        }
    }
    public Idle() {
        this.animCom.play(NAME_ANIM.IDLE);
    }
    //#endregion self
    //===========================================
}


