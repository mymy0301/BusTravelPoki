import { _decorator, Component, Node, sp, Widget } from 'cc';
import { AnimPrefabsBase } from '../../../AnimsPrefab/AnimPrefabBase';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

enum NAME_ANIM {
    ANIM_IN_FLAG = "UI_win_co",
    ANIM_IN_TEXT = "UI_win_text",
    ANIM_IN_TRUMPET = "UI_win_ken",
    ANIM_OUT_FLAG = "UI_out_co",
    ANIM_OUT_TEXT = "UI_out_text",
    ANIM_OUT_TRUMPET = "UI_out_ken"
}

@ccclass('SkeWinSys2')
export class SkeWinSys2 extends Component {
    // @property(Widget) wgTop: Widget;
    // @property(Widget) wgBottom: Widget;
    @property(AnimPrefabsBase) animCo: AnimPrefabsBase;
    @property(AnimPrefabsBase) animText: AnimPrefabsBase;
    @property(AnimPrefabsBase) animKen: AnimPrefabsBase;

    private readonly PATH_FLAG = "root/MAIN/MAIN_CO"
    private readonly PATH_TRUMPET = "root/MAIN/MAIN_KEN"

    private readonly timeScaleOpen = 1.1;
    private readonly timeScaleClose = 1.1;

    public PrepareAnimWin() {
        this.animCo.node.active = false;
        this.animText.node.active = false;
        this.animKen.node.active = false;
    }

    public PlayAnimWin() {
        // console.log(this.animText.MEffect.socketNodes);

        this.animCo.node.active = true;
        this.animText.node.active = true;
        this.animKen.node.active = true;

        this.animCo.MEffect.timeScale = this.timeScaleOpen;
        this.animText.MEffect.timeScale = this.timeScaleOpen;
        this.animKen.MEffect.timeScale = this.timeScaleOpen;

        // this.animCo.PlayAnim(NAME_ANIM.ANIM_IN_FLAG);
        // this.animText.PlayAnim(NAME_ANIM.ANIM_IN_TEXT);
        // this.animKen.PlayAnim(NAME_ANIM.ANIM_IN_TRUMPET);

        // anim ken
        (async () => {
            try {
                this.animKen.PlayAnim(NAME_ANIM.ANIM_IN_TRUMPET);
                await Utils.delay((this.animKen.GetTimeAnim(NAME_ANIM.ANIM_IN_TRUMPET, this.timeScaleOpen) - 0.2) * 1000);
                this.animKen.MEffect.timeScale = this.timeScaleClose;
                this.animKen.PlayAnim(NAME_ANIM.ANIM_OUT_TRUMPET);
            } catch (e) {

            }
        })();

        // anim flag
        (async () => {
            try {
                this.animCo.PlayAnim(NAME_ANIM.ANIM_IN_FLAG);
                await Utils.delay((this.GetTimeTotalAnimIn() - 0.05) * 1000);
                this.animCo.MEffect.timeScale = this.timeScaleClose;
                this.animCo.PlayAnim(NAME_ANIM.ANIM_OUT_FLAG);
            } catch (e) {

            }
        })();

        // anim text
        (async () => {
            try {
                this.animText.PlayAnim(NAME_ANIM.ANIM_IN_TEXT);
                await Utils.delay(this.GetTimeTotalAnimIn() * 1000);
                this.animText.MEffect.timeScale = this.timeScaleClose;
                this.animText.PlayAnim(NAME_ANIM.ANIM_OUT_TEXT);
                await Utils.delay(this.GetTimeTotalAnimOut() * 1000);
                this.PrepareAnimWin();
            } catch (e) {

            }
        })();
    }

    public GetTimeTotalAnimIn(): number {
        const timeAnimIn = this.animText.GetTimeAnim(NAME_ANIM.ANIM_IN_TEXT, this.timeScaleOpen) - 0.3;
        return timeAnimIn;
    }

    public GetTimeTotalAnimOut(): number {
        const timeAnimOut = this.animKen.GetTimeAnim(NAME_ANIM.ANIM_OUT_TEXT, this.timeScaleClose);
        return timeAnimOut;
    }
}


