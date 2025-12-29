import { _decorator, AnimationComponent, CCInteger, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimSpin')
export class AnimSpin extends Component {
    @property(AnimationComponent) animLightSpin: AnimationComponent;
    @property(AnimationComponent) animLightAfterSpinDone_1: AnimationComponent;
    @property(AnimationComponent) animLightAfterSpinDone_2: AnimationComponent;
    @property(Node) nBgSpin: Node;
    @property(Node) nListPhaseSpin: Node;

    @property(CCInteger) numberLoop = 5;

    public readonly NAME_ANIM_LIGHT = {
        WAITING: 0,
        IDLE: 1,
        SPINNING: 2,
        DONE: 3
    }

    public readonly NAME_ANIM_LIGHT_AFTER_SPIN_DONE = {
        IDLE: 0,
        DONE: 1
    }

    public _oldIndex = -1;
    public _angleStart = 0;
    public _angleEnd = 0;

    private GetNameAnimLight(animGet: AnimationComponent, index: number): string {
        let result = "";
        let listClips = animGet.clips;
        if (index < listClips.length) {
            result = listClips[index].name;
        }
        return result;
    }

    public SetDataPrepareSpin(distanceIndex: number, indexRandomPrize: number) {
        this._angleEnd = this._angleStart + 45 * distanceIndex + 360 * this.numberLoop;
        this._oldIndex = indexRandomPrize;
    }

    public ResetDataDefault() {
        this._angleStart = this.nListPhaseSpin.angle % 360;
        this.nListPhaseSpin.angle = this._angleStart;
        this.nBgSpin.angle = this._angleStart;
        this._angleEnd = 0;
    }

    public SetIdle() {
        // this.lightPieSpin.SetDefaultState();
        // this.lightPassSpin.DisAppear();

        this.animLightSpin.pause();
        const nameAnimSpin = this.GetNameAnimLight(this.animLightSpin, this.NAME_ANIM_LIGHT.WAITING);
        this.animLightSpin.play(nameAnimSpin);

        this.animLightAfterSpinDone_1.pause();
        const nameAnimSpinAfterSpinDone = this.GetNameAnimLight(this.animLightAfterSpinDone_1, this.NAME_ANIM_LIGHT_AFTER_SPIN_DONE.IDLE);
        this.animLightAfterSpinDone_1.play(nameAnimSpinAfterSpinDone);

        this.animLightAfterSpinDone_2.pause();
        this.animLightAfterSpinDone_2.play(nameAnimSpinAfterSpinDone);
    }

    public Spin() {
        this.animLightSpin.pause();
        const nameAnimSpin = this.GetNameAnimLight(this.animLightSpin, this.NAME_ANIM_LIGHT.SPINNING);
        this.animLightSpin.play(nameAnimSpin);
    }

    public DoneSpin() {
        // this.lightPieSpin.FlickerLight();
        // this.lightPassSpin.Appear();

        this.animLightSpin.pause();
        const nameAnimSpin = this.GetNameAnimLight(this.animLightSpin, this.NAME_ANIM_LIGHT.DONE);
        this.animLightSpin.play(nameAnimSpin);

        this.animLightAfterSpinDone_1.pause();
        const nameAnimSpinAfterSpinDone = this.GetNameAnimLight(this.animLightAfterSpinDone_1, this.NAME_ANIM_LIGHT_AFTER_SPIN_DONE.DONE);
        this.animLightAfterSpinDone_1.play(nameAnimSpinAfterSpinDone);

        this.animLightAfterSpinDone_2.pause();
        this.animLightAfterSpinDone_2.play(nameAnimSpinAfterSpinDone);
    }
}


