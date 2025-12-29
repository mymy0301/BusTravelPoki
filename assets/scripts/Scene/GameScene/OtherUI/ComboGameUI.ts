import { _decorator, Component, Label, Node, ProgressBar, Tween, tween, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ComboGameUI')
export class ComboGameUI extends Component {
    @property(ProgressBar) progressBar: ProgressBar;
    @property(Label) lbCombo;
    private _combo: number = 0;

    protected onLoad(): void {
        this.ResetGame();
        clientEvent.on(MConst.EVENT_FEATURE_COMBO.ADD_COMBO, this.AddCombo, this);
        clientEvent.on(MConst.EVENT_FEATURE_COMBO.PAUSE_COMBO, this.PauseCombo, this);
        clientEvent.on(MConst.EVENT_FEATURE_COMBO.RESUME_COMBO, this.ResumeCombo, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_FEATURE_COMBO.ADD_COMBO, this.AddCombo, this);
        clientEvent.off(MConst.EVENT_FEATURE_COMBO.PAUSE_COMBO, this.PauseCombo, this);
        clientEvent.off(MConst.EVENT_FEATURE_COMBO.RESUME_COMBO, this.ResumeCombo, this);
    }

    private Show() {
        this.node.active = true;
        const timeScale = 0.3;
        tween(this.node)
            .to(timeScale / 2, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: 'smooth' })
            .to(timeScale / 2, { scale: Vec3.ONE }, { easing: 'cubicIn' })
            .start();
    }

    private ScaleText() {
        const timeScale = 0.3;
        tween(this.lbCombo.node)
            .to(timeScale / 2, { scale: new Vec3(1.4, 1.4, 1.4) }, { easing: 'smooth' })
            .to(timeScale / 2, { scale: Vec3.ONE }, { easing: 'cubicIn' })
            .start();
    }

    public ResetGame() {
        this.node.active = false;
        this.progressBar.progress = 0;
        this._combo = 0;
    }

    private AddCombo(numberCombo: number = 1) {
        if (this._combo == 0) {
            this.Show();
        } else if (this._combo > 0) {
            this.ScaleText();
        }

        // console.log("CHECK NUMBER COMBO WHEN NO SENT PARAM: " + numberCombo);

        this._combo += numberCombo;
        this.lbCombo.string = `X${this._combo}`;
        this.RunAnimNewCombo();
    }

    private RunAnimNewCombo() {
        const timeToNewCombo = MConst.TIME_TO_NEW_COMBO;
        const self = this;
        Tween.stopAllByTarget(this.progressBar);
        this.progressBar.progress = 1;
        tween(this.progressBar)
            .to(timeToNewCombo, {}, {
                onUpdate(target, ratio) {
                    self.progressBar.progress = 1 - ratio;
                },
            })
            .call(() => {
                self._combo = 0;
                self.node.active = false;
            })
            .start();
    }

    private PauseCombo() {
        Tween.stopAllByTarget(this.progressBar);
    }

    private ResumeCombo() {
        const progressNow = this.progressBar.progress;
        if (progressNow == 0) return;
        const timeToResumeCombo = progressNow * MConst.TIME_TO_NEW_COMBO;
        const self = this;
        Tween.stopAllByTarget(this.progressBar);
        tween(this.progressBar)
            .to(timeToResumeCombo, {}, {
                onUpdate(target, ratio) {
                    self.progressBar.progress = 1 - ratio;
                },
            })
            .call(() => {
                self._combo = 0;
                self.node.active = false;
            })
            .start();
    }

    public GetCombo() { return this._combo; }
}


