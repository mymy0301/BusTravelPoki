/**
 * 
 * anhngoxitin01
 * Sat Aug 30 2025 10:26:27 GMT+0700 (Indochina Time)
 * AnimPrizeInFloorBase
 * db://assets/scripts/Scene/OtherUI/UISkyLift/AnimPrizeInFloorBase.ts
*
*/
import { _decorator, AnimationComponent, CCFloat, Component, Node, ParticleSystem, Prefab, tween, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
import { MMathUtil, Utils } from '../../../Utils/Utils';
import { IPrize } from '../../../Utils/Types';
import { ItemPrizeNotiSkyLift } from './ItemPrizeNotiSkyLift';
import { LightSkyLift } from './LightSkyLift';
const { ccclass, property } = _decorator;

@ccclass('AnimPrizeInFloorBase')
export class AnimPrizeInFloorBase extends Component {
    @property(AnimationComponent) animCom: AnimationComponent;
    @property(LightSkyLift) lightSkyLift: LightSkyLift;
    @property(Node) nParentePrize: Node;
    @property(CCFloat) r: number = 100;
    @property(CCFloat) maxArc: number = 90;
    @property(CCFloat) startAngle: number = 45;
    public readonly NAME_ANIM = {
        IDLE_CLOSE: "box_close_idle",
        OPEN: "box_open",
        IDLE_OPEN: "box_open_idle"
    }
    private _animNow: string = ''; public get AnimNow(): string { return this._animNow; }
    private _cbInitPrize: CallableFunction = null;
    private _cbReUsedPrize: CallableFunction = null;
    private _listNPrize: Node[] = [];
    //==========================================
    //#region base
    public RegisterCb(cbInitPrize: CallableFunction, cbReUsedPrize: CallableFunction) {
        this._cbInitPrize = cbInitPrize;
        this._cbReUsedPrize = cbReUsedPrize;
    }

    protected onEnable(): void {
        if (this._animNow != '') {
            this.animCom.play(this._animNow);
        }
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private PrepareListPrize(listPrize: IPrize[]) {
        if (this._cbInitPrize == null) return;

        // const startWPos = this.nParentePrize.worldPosition.clone();

        listPrize.forEach(iPrizeCheck => {
            let nPrize: Node = this._cbInitPrize();
            nPrize.setParent(this.nParentePrize);
            // nPrize.worldPosition = startWPos;
            nPrize.position = Vec3.ZERO;
            const comPrize = nPrize.getComponent(ItemPrizeNotiSkyLift);
            comPrize.SetUp(iPrizeCheck);
            comPrize.getComponent(UIOpacity).opacity = 0;
            nPrize.scale = Vec3.ZERO;
            this._listNPrize.push(nPrize);
        })
    }

    private async ShowReceivePrize() {
        const lengthPrize = this._listNPrize.length;
        if (lengthPrize == 0) { return; }

        // const startWPos = this.nParentePrize.worldPosition.clone();
        const startPos = Vec3.ZERO;

        const listPoints: Vec3[] = MMathUtil.getPointsOnArc(
            startPos,
            this.r,
            this.maxArc,
            lengthPrize,
            this.startAngle
        )

        // move prize đến vị trí cần
        try {
            const timeDelayEachItem = 0.1;
            const timeLongAnimEachItem = 0.8;
            for (let i = 0; i < this._listNPrize.length; i++) {
                const nPrize = this._listNPrize[i];
                const opaPrize = nPrize.getComponent(UIOpacity);
                const posEnd = listPoints[i];
                tween(nPrize)
                    .to(timeLongAnimEachItem, { position: posEnd, scale: Vec3.ONE }, {
                        easing: "cubicOut",
                        onUpdate(target, ratio) {
                            opaPrize.opacity = ratio * 255;
                        },
                    })
                    .start();

                if (i == this._listNPrize.length - 1) {
                    await Utils.delay(timeLongAnimEachItem * 1000);
                } else {
                    await Utils.delay(timeDelayEachItem * 1000);
                }
            }
        } catch (e) {
            console.error(e);
            return;
        }

        await Utils.delay(0.5 * 1000);

        try {
            // tween move item out
            const DIFF_Y_END = 50;
            const timeDisapear: number = 0.5;
            for (let i = 0; i < this._listNPrize.length; i++) {
                const nPrize = this._listNPrize[i];
                const opaPrize = nPrize.getComponent(UIOpacity);
                const posEnd = listPoints[i].clone().add3f(0, DIFF_Y_END, 0);

                tween(nPrize)
                    .to(timeDisapear, { position: posEnd }, {
                        onUpdate(target, ratio) {
                            opaPrize.opacity = (1 - ratio) * 255;
                        },
                    })
                    .call(() => { nPrize.active = false; })
                    .start();
            }
            await Utils.delay(timeDisapear * 1000);

            // reUsedAllItem
            this._cbReUsedPrize && this._cbReUsedPrize(this._listNPrize);
        } catch (e) {
            console.error(e);
            return;
        }
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public SetUpAnim(nameAnim: string) {
        if (this.animCom == null) { return; }
        this._animNow = nameAnim;
        this.animCom.play(nameAnim);
        if (this.lightSkyLift == null) { return; }
        switch (this._animNow) {
            case this.NAME_ANIM.IDLE_CLOSE:
                this.lightSkyLift.HideLight();
                break;
            case this.NAME_ANIM.IDLE_OPEN:
                this.lightSkyLift.ShowLight_2();
                break;
        }
    }

    public async PlayAnim(nameAnim: string) {
        if (this.animCom == null) { return; }
        this._animNow = nameAnim;
        switch (nameAnim) {
            case this.NAME_ANIM.OPEN:
                this.animCom.play(nameAnim);
                await Utils.delay(this.animCom.clips.find(t => t.name == this.NAME_ANIM.OPEN).duration * 1000);
                if (this == null || this.NAME_ANIM == null) { return; }
                this._animNow = this.NAME_ANIM.IDLE_OPEN;
                this.animCom.play(this._animNow);
                break;
        }
    }

    public async PlayAnimReceive(listPrize: IPrize[]) {
        this._isAnim = true;

        //prepare listPrize
        this.PrepareListPrize(listPrize);

        // play anim
        this._animNow = this.NAME_ANIM.OPEN;
        this.animCom.play(this.NAME_ANIM.OPEN);
        const animOpen = this.animCom.clips.find(t => t.name == this.NAME_ANIM.OPEN)
        await Utils.delay(animOpen.duration * 1000);
        await Utils.WaitReceivingDone(() => !this._isAnim);
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region anim 
    private _isAnim: boolean = false;
    public async AnimPrize() {
        if (this.lightSkyLift == null) return;

        this.lightSkyLift.ShowLight_1();
        await this.ShowReceivePrize();
        this._isAnim = false;
    }
    //#endregion anim
    //==========================================
}