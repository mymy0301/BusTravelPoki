import { _decorator, Component, macro, sp } from 'cc';
import { M_ERROR } from '../Configs/MConfigError';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('AnimPrefabsBase')
export class AnimPrefabsBase extends Component {
    @property(sp.Skeleton) MEffect: sp.Skeleton;
    private nameOldAnimSchedule: string = null;
    private _isScheduling: boolean = false;

    protected onDestroy(): void {
        this.StopSchedulingLoopAnim();
    }

    //#region public func
    public SetData(data: sp.SkeletonData) {
        this.MEffect.skeletonData = data;
    }

    public PlayAnim(nameAnim: string, isLoop: boolean = false, timeDtStart: number = 0) {
        this.StopSchedulingLoopAnim();

        this.ShowAnim();
        try {
            this.MEffect.setAnimation(0, nameAnim, isLoop);
            this.MEffect.updateAnimation(timeDtStart);
        } catch (e) {
            console.error('error #%d', M_ERROR.CAN_NOT_LOAD_SKELETON);
        }
    }

    public PlayAnimAndStopAtFrame(nameAnim: string, timeDtStart: number = 0) {
        this.StopSchedulingLoopAnim();
        this.ShowAnim();
        try {
            this.MEffect.setAnimation(0, nameAnim, false);
            this.MEffect.updateAnimation(timeDtStart);
        } catch (e) {
            console.error('error #%d', M_ERROR.CAN_NOT_LOAD_SKELETON);
        }
    }

    public AddAnim(nameAnim: string, isLoop: boolean = false, delay: number = 0) {
        this.MEffect.addAnimation(0, nameAnim, isLoop, delay);
    }

    public PlayAnimLoopWithDelay(nameAnim: string, delay: number, callFirstINterval: boolean = false) {
        this.StopSchedulingLoopAnim();

        this.ShowAnim();
        if (this.MEffect == null) return;
        try {
            const timeAnim = this.GetTimeAnim(nameAnim);
            this.nameOldAnimSchedule = nameAnim;

            // hiện tại không rõ lý do tại sao nhưng đối vs icon home ở lần gọi interval đầu tiên không hoạt động
            if (callFirstINterval) {
                this.PlayLoop();
            }

            this._isScheduling = true;
            this.schedule(this.PlayLoop, timeAnim + delay, macro.REPEAT_FOREVER, 0);
        } catch (error) {
            console.error('error #%d', M_ERROR.CAN_NOT_LOAD_SKELETON);
        }
    }

    public StopLoopDefault() {
        this.MEffect.loop = false;
    }

    public PlayAnimLoop(nameAnim: string) {
        this.StopSchedulingLoopAnim();
        this.ShowAnim();
        if (this.MEffect == null) return;
        try {
            if (this.MEffect == null || this.MEffect.skeletonData == null || this.node.activeInHierarchy == false) return;
            this.MEffect.setAnimation(0, nameAnim, true);
        } catch (error) {
            console.error('error #%d', M_ERROR.CAN_NOT_LOAD_SKELETON);
        }
    }

    public async AwaitTimeAnim(nameAnimChest: string) {
        return new Promise(resolve => {
            let timeWait = this.GetTimeAnim(nameAnimChest);
            this.scheduleOnce(resolve, timeWait);
        });
    }

    public GetTimeAnim(nameAnimChest: string, timeScaleCustom: number = -1): number {
        try {
            const anim = this.MEffect.findAnimation(nameAnimChest)
            if (anim == null) { return 5; }
            return anim.duration / (timeScaleCustom != -1 ? timeScaleCustom : this.MEffect.timeScale);
        } catch (e) {
            console.warn("error #%d", M_ERROR.CAN_NOT_LOAD_SKELETON, nameAnimChest);
            return 5;
        }
    }

    public GetTimeScale(): number {
        return this.MEffect.timeScale;
    }

    public async AwaitPlayAnim(nameAnim: string, isLoop: boolean = false) {
        this.StopSchedulingLoopAnim();

        this.ShowAnim();
        this.MEffect.setAnimation(0, nameAnim, isLoop);
        await this.AwaitTimeAnim(nameAnim);
    }

    public HideAnim() {
        this.MEffect.node.active = false;
    }
    public ShowAnim() {
        this.MEffect.node.active = true;
    }
    //#endregion

    private async PlayLoop() {
        try {
            if (this.MEffect == null || this.MEffect.skeletonData == null || this.node.activeInHierarchy == false) return;
            this.MEffect.setAnimation(0, this.nameOldAnimSchedule, false);
        } catch (e) {
            console.error(M_ERROR.CAN_NOT_LOAD_SKELETON);
            // console.log(this.MEffect, this.nameOldAnimSchedule);
        }
    }

    private StopSchedulingLoopAnim() {
        if (!this._isScheduling) return;
        else {
            this.unschedule(this.PlayLoop);
            this._isScheduling = false;
        }
    }

    public StopAnim() {
        try {
            this.StopSchedulingLoopAnim();
            this.HideAnim();
            this.MEffect.clearTracks();
        } catch (e) {

        }
    }
}


