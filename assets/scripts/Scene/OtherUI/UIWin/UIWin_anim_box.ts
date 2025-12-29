import { _decorator, CCFloat, CCInteger, Component, Label, Node, Tween, tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('UIWin_anim_box')
@requireComponent(UIOpacity)
export class UIWin_anim_box extends Component {
    @property(Vec3) scaleApear_start: Vec3 = new Vec3(0.7, 0.7, 0.7);
    @property(Vec3) scaleApear_max: Vec3 = new Vec3(1.1, 1.1, 1.1);
    @property(Vec3) scaleApear_end: Vec3 = new Vec3(1, 1, 1);
    @property(CCFloat) numTimeApear_Max: number = 0.3;
    @property(CCFloat) numTimeApear_End: number = 0.2;
    @property(CCFloat) numTimeApear_Delay: number = 0;

    @property({ group: "anim2" }) useAnim2 = false;
    @property({ group: "anim2", type: Node, visible(this: UIWin_anim_box) { return this.useAnim2; } }) nIcon: Node;
    @property({ group: "anim2", type: Label, visible(this: UIWin_anim_box) { return this.useAnim2; } }) lb: Label;
    @property({ group: "anim2", visible(this: UIWin_anim_box) { return this.useAnim2; } }) scaleApear_2_start: Vec3 = new Vec3(0.7, 0.7, 0.7);
    @property({ group: "anim2", visible(this: UIWin_anim_box) { return this.useAnim2; } }) scaleApear_2_max: Vec3 = new Vec3(1.1, 1.1, 1.1);
    @property({ group: "anim2", visible(this: UIWin_anim_box) { return this.useAnim2; } }) scaleApear_2_end: Vec3 = new Vec3(1, 1, 1);
    @property({ group: "anim2", type: CCFloat, visible(this: UIWin_anim_box) { return this.useAnim2; } }) numTimeApear_2_Max: number = 0.2;
    @property({ group: "anim2", type: CCFloat, visible(this: UIWin_anim_box) { return this.useAnim2; } }) numTimeApear_2_End: number = 0.1;
    @property({ group: "anim2", visible(this: UIWin_anim_box) { return this.useAnim2; } }) scaleApear_2_Label_start: Vec3 = new Vec3(1.1, 1.1, 1.1);
    @property({ group: "anim2", visible(this: UIWin_anim_box) { return this.useAnim2; } }) scaleApear_2_Label_end: Vec3 = new Vec3(1, 1, 1);
    @property({ group: "anim2", type: CCFloat, visible(this: UIWin_anim_box) { return this.useAnim2; } }) numTimeApear_2_Label_End: number = 0.2;

    //#region anim 1
    public prepareApear() {
        this.node.scale = this.scaleApear_start;
        this.node.getComponent(UIOpacity).opacity = 0;
    }

    public animApear() {
        const self = this;
        if (this.node == null) return;
        const opaCom = this.node.getComponent(UIOpacity);

        opaCom.opacity = 50;
        const diffOpacity = 255 - 50;

        return new Promise<void>((resolve) => {
            tween(this.node)
                .to(this.numTimeApear_Max, { scale: self.scaleApear_max }, {
                    onUpdate(target, ratio) {
                        opaCom.opacity = 100 + ratio * diffOpacity;
                    },
                })
                .delay(this.numTimeApear_Delay)
                .to(this.numTimeApear_End, { scale: self.scaleApear_end })
                .call(() => resolve())
                .start();
        })
    }

    public ForceSkipAnimApear() {
        Tween.stopAllByTarget(this.node);
        this.node.scale = this.scaleApear_end;
        this.node.getComponent(UIOpacity).opacity = 255;
    }
    //#endregion anim 1

    //#region anim_2
    public prepareApear_2_WithNotConfig_1(text: string) {
        if (!this.useAnim2) {
            this.nIcon.scale = this.scaleApear_2_start;
            this.nIcon.getComponent(UIOpacity).opacity = 0;
        }
        this.lb.node.scale = this.scaleApear_2_Label_start;
        this.lb.node.active = false;
        this.lb.string = text;
    }

    public animApear_2(cbIncreaseLabel: CB_Anim2_LabelIncrease) {
        const self = this;
        const opaCom = this.nIcon.getComponent(UIOpacity);

        // opaCom.opacity = 100;
        // const diffOpacity = 255 - 100;

        return new Promise<void>((resolve) => {
            tween(this.nIcon)
                .call(() => { this.nIcon.active = true; })
                // .to(self.numTimeApear_2_Max, { scale: self.scaleApear_2_max }, {
                //     onUpdate(target, ratio) {
                //         opaCom.opacity = 100 + ratio * diffOpacity;
                //     },
                // })
                // .to(self.numTimeApear_2_End, { scale: self.scaleApear_2_end })
                // show label
                .call(() => { self.lb.node.active = true; cbIncreaseLabel(self.lb.node, self.numTimeApear_2_Label_End) })
                .to(self.numTimeApear_2_Label_End, { scale: self.scaleApear_2_end })
                //end anim
                .call(() => resolve())
                .start();
        });
    }

    public ForceSkipAnimApear_2() {
        Tween.stopAllByTarget(this.nIcon);
        Tween.stopAllByTarget(this.lb.node);
        this.nIcon.scale = this.scaleApear_2_end;
        this.lb.node.scale = this.scaleApear_2_Label_end;
        this.nIcon.active = this.lb.node.active = true;
        this.nIcon.getComponent(UIOpacity).opacity = 255;
    }
    //#endregion anim_2
}

export type CB_Anim2_LabelIncrease = (nLb: Node, timeLabelApearEnd: number) => void;


