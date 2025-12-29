import { _decorator, Animation, AnimationComponent, AnimationState, Component, Label, Node, sp, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { Utils } from 'db://assets/scripts/Utils/Utils';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { SoundSys } from 'db://assets/scripts/Common/SoundSys';
import { GameSoundEffect } from 'db://assets/scripts/Utils/Types';
import CirCleClaimFx from 'db://assets/Effects/fx_circle_claim/circle-claim-fx';
const { ccclass, property } = _decorator;

enum NAME_ANIM {
    ANIM_1 = "Open_anim_2_1",
    ANIM_2 = "Open_anim_2_2",
    IDLE = "Open_idle",
}

@ccclass('UITargetFirstGame')
export class UITargetFirstGame extends Component {
    @property(Label) lbNumPass: Label;
    @property(CirCleClaimFx) fxCircleClaim: CirCleClaimFx;
    @property(Sprite) spCountBoard: Sprite;
    @property(SpriteFrame) sfTargetNormal: SpriteFrame;
    @property(SpriteFrame) sfTargetChrist: SpriteFrame;
    private _animCom: AnimationComponent = null

    public get animCom() {
        if (this._animCom == null) {
            this._animCom = this.node.getComponent(AnimationComponent);
        }
        return this._animCom;
    }

    protected onEnable(): void {
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

    private IncreaseNumPass() {
        const timeAnim = this.TimeIncreasePass();

        const self = this;
        tween(this.lbNumPass.node)
            .to(timeAnim, {}, {
                onUpdate(target, ratio) {
                    self.lbNumPass.string = Math.floor(self._numPass * ratio).toFixed(0);
                },
            })
            .call(async () => {
                try {
                    // play next anim
                    this._animCom.play(NAME_ANIM.ANIM_2);
                    // //ensure show num passenger
                    await Utils.delay(this.GetTimeAnimByName(NAME_ANIM.ANIM_2) * 1000);
                    this.EmitShowNumPass();
                } catch (e) {

                }
            })
            .start()
    }

    private EmitShowNumPass() {
        clientEvent.dispatchEvent(MConst.EVENT_PASSENGERS.SHOW_NUM_PASSENGER);
    }

    private PlaySoundEffectWind() {
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_OPEN_UI_TARGET);
    }

    private PlaySoundEffectOpen() {
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_OPEN_UI_TARGET);
    }

    private PlaySoundEffectClose() {
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_CLOSE_UI_TARGET);
    }

    private EmitFxSign() {
        this.fxCircleClaim.show();
    }
    //#endregion anim
    //===========================================

    //===========================================
    //#region self
    private _numPass: number = 0;
    private readonly LimitTimeIncreasePass: number = 1;
    private TimeIncreasePass(): number {
        const speedIncrease = 50;
        const timeAnim = this._numPass / speedIncrease;
        return timeAnim > this.LimitTimeIncreasePass ? this.LimitTimeIncreasePass : timeAnim;
    }

    public PrepareAnim(numPass: number, targetSF: 'normal' | 'christ' = 'normal') {
        this._numPass = numPass;
        this.lbNumPass.string = "0";
        switch (targetSF) {
            case 'normal': this.spCountBoard.spriteFrame = this.sfTargetNormal; break;
            case 'christ': this.spCountBoard.spriteFrame = this.sfTargetChrist; break;
        }
    }
    public async Anim() {
        try {
            this.animCom.play(NAME_ANIM.ANIM_1);
            const timeAnim = this.GetTimeAnim();
            await Utils.delay(timeAnim * 1000);
            this.animCom.play(NAME_ANIM.IDLE);
            // ensure not show 
        } catch (e) {
        }
    }

    public GetTimeAnim() {
        const clipAnim_1 = this.animCom.clips.find(anim => anim.name == NAME_ANIM.ANIM_1);
        const clipAnim_2 = this.animCom.clips.find(anim => anim.name == NAME_ANIM.ANIM_2);
        const timeIncreasePass = this.TimeIncreasePass();
        const timeAnim1 = clipAnim_1 ? clipAnim_1.duration / clipAnim_1.speed : 0;
        const timeAnim2 = clipAnim_2 ? clipAnim_2.duration / clipAnim_2.speed : 0;

        if (clipAnim_1 != null && clipAnim_2 != null) {
            return timeAnim1 + timeIncreasePass + timeAnim2;
        }
        return 0;
    }

    public GetTimeAnimByName(nameAnim: NAME_ANIM) {
        switch (nameAnim) {
            case NAME_ANIM.ANIM_2:
                const clipAnim_2 = this.animCom.clips.find(anim => anim.name == NAME_ANIM.ANIM_2);
                const timeAnim2 = clipAnim_2 ? clipAnim_2.duration / clipAnim_2.speed : 0;
                return timeAnim2;
            default:
                return 0;
        }
    }
    public Idle() { this.animCom.play(NAME_ANIM.IDLE); }
    //#endregion self
    //===========================================
}


