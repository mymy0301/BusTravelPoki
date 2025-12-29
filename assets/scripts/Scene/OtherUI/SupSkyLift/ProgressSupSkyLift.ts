/**
 * 
 * anhngoxitin01
 * Mon Sep 01 2025 19:06:23 GMT+0700 (Indochina Time)
 * ProgressSupSkyLift
 * db://assets/scripts/Scene/OtherUI/SupSkyLift/ProgressSupSkyLift.ts
*
*/
import { _decorator, Component, Enum, Label, Node, Size, Sprite, SpriteFrame, tween, UITransform, Vec3 } from 'cc';
import { PrizeFloor } from '../UISkyLift/PrizeFloor';
import { CONFIG_SL, InfoFloorSkyLiftJSON } from '../UISkyLift/TypeSkyLift';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { AnimPrizeInFloorBase } from '../UISkyLift/AnimPrizeInFloorBase';
const { ccclass, property } = _decorator;

export enum TYPE_PROGRESS_SUB_SL {
    Loop,
    End
}
Enum(TYPE_PROGRESS_SUB_SL);

@ccclass('ProgressSupSkyLift')
export class ProgressSupSkyLift extends Component {
    @property(Sprite) spProgress: Sprite;
    @property(Sprite) spBgLevel: Sprite;
    @property(Label) lbLevel: Label;
    @property(PrizeFloor) prizeFloor: PrizeFloor;
    @property(SpriteFrame) sfSeparate: SpriteFrame;
    @property(Node) nListSeparate: Node;
    @property({ type: TYPE_PROGRESS_SUB_SL }) typeProgressSubSl: TYPE_PROGRESS_SUB_SL;
    @property(AnimPrizeInFloorBase) animPrize: AnimPrizeInFloorBase;


    private readonly SCALE_DEFAULT_SEPRATE = 0.65;
    private readonly MAX_HEIGHT = 213;

    private _infoFloorSkyLift: InfoFloorSkyLiftJSON = null; public get InfoFloorSkyLift() { return this._infoFloorSkyLift; }
    private _listNSeparate: Node[] = [];
    private _level: number = 0; public get level() { return this._level; }

    //==========================================
    //#region base
    public SetUp(data: InfoFloorSkyLiftJSON, level: number, cbGetListSfPrize: CallableFunction) {
        this._infoFloorSkyLift = data;

        this._level = level;
        this.lbLevel.string = level.toString();
        if (this.prizeFloor != null && cbGetListSfPrize != null) {
            // set UIPrize
            let listSFPrize: SpriteFrame[] = [];
            switch (true) {
                case data.idFloor == CONFIG_SL.MAX_PRIZE_HAS: listSFPrize = cbGetListSfPrize('Purple'); break;
                case data.idFloor % 2 == 0: listSFPrize = cbGetListSfPrize('Red'); break;
                default: listSFPrize = cbGetListSfPrize('Blue'); break;
            }
            this.prizeFloor.SetPrize(data.listPrize);
            this.prizeFloor.SetUI(listSFPrize);
        }
        if (this._infoFloorSkyLift != null && this._listNSeparate != null && this.sfSeparate != null) {
            const numSeparate: number = this._infoFloorSkyLift.progress - this._level - 1;
            this.InitSeparate(numSeparate);
        }
    }

    /**
     * func này để set progress cho anim cũng như tiến trình
     * @param sfBgLevel 
     * @param progress 
     */
    public SetUpProgress(progressPlayer: number, sfBgLevelReached: SpriteFrame, sfBgLevelNoReach: SpriteFrame) {

        // for type end
        if (this.typeProgressSubSl == TYPE_PROGRESS_SUB_SL.End && progressPlayer == CONFIG_SL.MAX_PROGRESS) {
            this.spBgLevel.spriteFrame = sfBgLevelReached;
            return;
        } else if (this.typeProgressSubSl == TYPE_PROGRESS_SUB_SL.End && progressPlayer < CONFIG_SL.MAX_PROGRESS) {
            this.spBgLevel.spriteFrame = sfBgLevelNoReach;
            return;
        }

        let progressSet = 0;

        switch (true) {
            case progressPlayer >= this._infoFloorSkyLift.progress:
                progressSet = 1;
                break;
            case progressPlayer < this._infoFloorSkyLift.progress:
                progressSet = (progressPlayer - this._level) / (this._infoFloorSkyLift.progress - this._level);
                break;
        }

        switch (true) {
            // case pass || full
            case this._infoFloorSkyLift.idFloor == 1:
            case this.typeProgressSubSl == TYPE_PROGRESS_SUB_SL.Loop && progressPlayer >= this._level:
                this.spBgLevel.spriteFrame = sfBgLevelReached;
                break;
            default:
                this.spBgLevel.spriteFrame = sfBgLevelNoReach;
                break;
        }

        // ngoài trừ top ra còn lại đều có progress để set
        if (this.typeProgressSubSl == TYPE_PROGRESS_SUB_SL.Loop) {
            const transSpProgress = this.spProgress.node.getComponent(UITransform)
            const oldSize: Size = transSpProgress.contentSize.clone();
            transSpProgress.contentSize = new Size(oldSize.x, progressSet * this.MAX_HEIGHT);
        }

        // set update prize
        if (this._infoFloorSkyLift.listPrize.length > 0) {
            const nameAnimChoice = DataSkyLiftSys.Instance.IsReceivePrizeClone(this._infoFloorSkyLift.idFloor) ? this.animPrize.NAME_ANIM.IDLE_OPEN : this.animPrize.NAME_ANIM.IDLE_CLOSE;
            // console.log(this._infoFloorSkyLift.idFloor, nameAnimChoice);
            this.animPrize.SetUpAnim(nameAnimChoice);
        }
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private InitSeparate(numSeparate: number) {
        if (this.typeProgressSubSl != TYPE_PROGRESS_SUB_SL.End) {
            if (this._listNSeparate.length == numSeparate) { return; }
            else { this._listNSeparate.forEach(item => item.destroy()); this._listNSeparate = []; }

            const totalHeight = this.MAX_HEIGHT;

            for (let i = 0; i < numSeparate; i++) {
                const posS = new Vec3(totalHeight / (numSeparate + 1) * (i + 1), 0)

                // init node
                let nSeparate: Node = new Node();
                nSeparate.addComponent(Sprite).spriteFrame = this.sfSeparate;
                nSeparate.setParent(this.nListSeparate);
                nSeparate.position = posS;
                nSeparate.angle = 90;
                nSeparate.scale = Vec3.ONE.clone().multiplyScalar(this.SCALE_DEFAULT_SEPRATE);

                this._listNSeparate.push(nSeparate);
            }
        }
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public

    private readonly SCALE_BG_REACH = Vec3.ONE.clone().multiplyScalar(1);
    public async ReachLevel(sfBgReach: SpriteFrame) {
        const rootScale: Vec3 = this.spBgLevel.node.scale.clone();

        //anim scale bglevel và thay vào spriteFrame đã unlock
        return new Promise<void>(resolve => {
            tween(this.spBgLevel.node)
                .to(0.2, { scale: this.SCALE_BG_REACH }, { easing: "quintOut" })
                .call(() => { this.spBgLevel.spriteFrame = sfBgReach; })
                .to(0.2, { scale: rootScale }, { easing: "quintIn" })
                .call(() => { resolve(); })
                .start();
        })
    }

    public async PlayAnimReceivePrize() {
        this.animPrize.PlayAnim(this.animPrize.NAME_ANIM.OPEN);

        if (!DataSkyLiftSys.Instance.IsReceivePrizeClone(this.InfoFloorSkyLift.idFloor)) {
            this.animPrize.PlayAnimReceive(this._infoFloorSkyLift.listPrize);
        }
    }

    public IncreaseProgress(newProgress: number) {
        let progressSet = 0;

        switch (true) {
            case newProgress >= this._infoFloorSkyLift.progress:
                progressSet = 1;
                break;
            case newProgress < this._infoFloorSkyLift.progress:
                progressSet = (newProgress - this._level) / (this._infoFloorSkyLift.progress - this._level);
                break;
        }


        const transSpProgress = this.spProgress.node.getComponent(UITransform)
        const oldSize: Size = transSpProgress.contentSize.clone();
        const newSize: Size = new Size(oldSize.x, progressSet * this.MAX_HEIGHT);
        const TIME_PROGRESS: number = 1;
        return new Promise<void>(resolve => {
            tween(transSpProgress)
                .to(TIME_PROGRESS, { contentSize: newSize })
                .call(() => { resolve(); })
                .start()
        })
    }

    public GetPosCar(progress: number) {
        // trong trường hợp end
        if (this.typeProgressSubSl == TYPE_PROGRESS_SUB_SL.End) {
            return this.node.position.clone().add(this.spBgLevel.node.position.clone());
        }

        let progressSet = 0;

        switch (true) {
            case progress >= this._infoFloorSkyLift.progress:
                progressSet = 1;
                break;
            case progress < this._infoFloorSkyLift.progress:
                progressSet = (progress - this._level) / (this._infoFloorSkyLift.progress - this._level);
                break;
        }

        const transSpProgress = this.spProgress.node.getComponent(UITransform)
        const oldSize: Size = transSpProgress.contentSize.clone();
        const newSize: Size = new Size(oldSize.x, progressSet * this.MAX_HEIGHT);
        const result: Vec3 = new Vec3(this.node.position.clone().add(this.spProgress.node.position.clone()).add3f(newSize.y, 0, 0));
        return result;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}