import { _decorator, Animation, Button, Component, Label, Node, Tween, tween, UIOpacity, Vec3 } from 'cc';
import { Utils } from '../../../Utils/Utils';
import { SkeWinSys2 } from './SkeWinSys2';
import { AnimTextWin2 } from '../../../AnimsPrefab/AnimTextWin2';
import { SoundSys } from '../../../Common/SoundSys';
import { GameSoundEffect } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

enum NAME_ANIM {
    IDLE = "WinPhase_Idle",
    ANIM = "WinPhase"
}
@ccclass('UIWin_anim_2')
export class UIWin_anim_2 extends Component {
    @property(Node) nLayer1: Node;
    @property(Node) nLayer2: Node;
    @property(Node) nLayer3: Node;
    @property(Node) nListBtn: Node;
    @property(Node) nShare: Node;
    @property(Button) listBtn: Button[] = [];
    @property(SkeWinSys2) skeWinSys: SkeWinSys2;
    @property(AnimTextWin2) animTextWin2: AnimTextWin2;

    private opa1: UIOpacity = null;
    private opa2: UIOpacity = null;
    private opa3: UIOpacity = null;

    private _cbShowFlash: CallableFunction = null;
    private _cbAnimItem: CallableFunction = null;
    private _cbTryShowInter: CallableFunction = null;

    //=========================================
    //#region baseUI
    protected onLoad(): void {
        this.opa1 = this.nLayer1.getComponent(UIOpacity);
        this.opa2 = this.nLayer2.getComponent(UIOpacity);
        this.opa3 = this.nLayer3.getComponent(UIOpacity);
    }

    protected onEnable(): void {
        this.opa1 && Tween.stopAllByTarget(this.opa1);
        this.opa2 && Tween.stopAllByTarget(this.opa1);
        this.opa3 && Tween.stopAllByTarget(this.opa3);
    }

    public InitCb(cbShowFlash: CallableFunction, cbAnimItem: CallableFunction, cbTryShowInter: CallableFunction) {
        this._cbShowFlash = cbShowFlash;
        this._cbAnimItem = cbAnimItem;
        this._cbTryShowInter = cbTryShowInter;
    }
    //#region baseUI
    //=========================================

    //==========================================
    //#region anim
    public PrepareAnim() {
        SoundSys.Instance.pauseMusic();
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_GOAL_COMPLETE);
        this.skeWinSys.PrepareAnimWin();
        this.opa1.opacity = 0;
        this.opa2.opacity = 0;
        this.nListBtn.scale = Vec3.ZERO;
        if (this.nShare != null) this.nShare.scale = Vec3.ZERO;
        // this.animPhase2.play(NAME_ANIM.IDLE);

        this.animTextWin2.PrepareAnimTextWin();

        this.listBtn.forEach(item => item.enabled = false);
    }

    public async PlayAnim(cbDone1: CallableFunction = null, cbDone2: CallableFunction = null) {
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_LEVEL_COMPLETED);
        //play anim
        this.opa1.opacity = 255;
        this.skeWinSys.PlayAnimWin();
        const timeSkeIn = this.skeWinSys.GetTimeTotalAnimIn();
        await Utils.delay(timeSkeIn * 1000);

        const timeSkeOut = this.skeWinSys.GetTimeTotalAnimOut();
        const timeHideAndShow: number = 0.5;
        await Utils.delay((timeSkeOut - 0.35) * 1000);

        // đợi show Inter
        this._cbTryShowInter != null && await this._cbTryShowInter();

        // hide UIPhase 1 and show UIPhase2
        tween(this.opa1)
            .to(timeHideAndShow, { opacity: 0 })
            .start();

        // anim text , lb Level + button
        const timePlayAnimText: number = this.animTextWin2.GetTimeAnimText();
        tween(this.opa2)
            .to(timePlayAnimText / 4, { opacity: 255 })
            .start()
        this.animTextWin2.PlayAnimTextWin(0.1);

        // list item
        const timeScale: number = 0.3;
        const timeDelayEachItem: number = 0.1;
        this._cbAnimItem && this._cbAnimItem(timeScale, timeDelayEachItem);

        cbDone1 && cbDone1();

        // scale btn share
        if (this.nShare != null) {
            tween(this.nShare)
                .to(timeScale, { scale: Vec3.ONE })
                .start()
        }

        // scale list Btn
        tween(this.nListBtn)
            .to(timeScale, { scale: Vec3.ONE })
            .call(() => {
                this.listBtn.forEach(item => item.enabled = true);
            })
            .call(() => {
                cbDone2 && cbDone2();
            })
            .start()

        //NOTE you must wait to the text spine run or if you not , the spine text can not add to the node
        await Utils.delay(0.2 * 1000);
    }

    public Anim_ScaleBtn(btnScale: Node, btnMoveToMid: Node, scaleTo: Vec3) {
        const self = this;
        const timeScaleBtn: number = 0.15;
        const basePosBtnMoveToMid: Vec3 = btnMoveToMid.position.clone();
        return new Promise<void>(resolve => {
            tween(btnScale)
                .to(timeScaleBtn, { scale: scaleTo }, {
                    onUpdate(target, ratio) {
                        let result: Vec3 = new Vec3(0, 0, 0);
                        result = Vec3.lerp(result, basePosBtnMoveToMid, Vec3.ZERO, ratio);
                        btnMoveToMid.position = result;
                    },
                })
                .call(() => { resolve() })
                .start();
        })
    }
    //#endregion anim
    //==========================================


}