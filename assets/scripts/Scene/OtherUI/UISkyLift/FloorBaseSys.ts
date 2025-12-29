/**
 * 
 * anhngoxitin01
 * Wed Aug 27 2025 09:24:16 GMT+0700 (Indochina Time)
 * FloorBaseSys
 * db://assets/scripts/Scene/OtherUI/UISkyLift/FloorBaseSys.ts
*
*/
import { _decorator, Component, Enum, Label, Node, Size, Sprite, SpriteFrame, tween, UITransform, Vec3 } from 'cc';
import { CONFIG_SL, InfoFloorSkyLiftJSON } from './TypeSkyLift';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { PrizeFloor } from './PrizeFloor';
import { Utils } from '../../../Utils/Utils';
import { AnimPrizeInFloorBase } from './AnimPrizeInFloorBase';
const { ccclass, property } = _decorator;

export enum TYPE_FLOOR_BASE {
    Base,
    Mid,
    Top
}
Enum(TYPE_FLOOR_BASE);

@ccclass('FloorBaseSys')
export class FloorBaseSys extends Component {
    @property({ type: TYPE_FLOOR_BASE }) typeFloorBase: TYPE_FLOOR_BASE = TYPE_FLOOR_BASE.Mid;
    @property(Sprite) spBgLevel: Sprite;
    @property(Label) lbLevel: Label;
    @property(Sprite) spProgress: Sprite;
    @property(Sprite) spRailing: Sprite;
    @property(PrizeFloor) prizeFloor: PrizeFloor;
    @property(SpriteFrame) sfSeparate: SpriteFrame;
    @property(Node) nListSeparate: Node;
    @property(AnimPrizeInFloorBase) animPrize: AnimPrizeInFloorBase;
    private _infoFloorSkyLift: InfoFloorSkyLiftJSON = null; public get InfoFloorSkyLift() { return this._infoFloorSkyLift; }
    private readonly MAX_HEIGHT = [357, 300];
    private readonly MAX_WIDTH_RAILING = [176, 485];

    private _listNSeparate: Node[] = [];
    private _progressNow: number = 0;
    //==========================================
    //#region base
    /**
     * func này chỉ để set UI chứ chưa set progress
     * @param data 
     */
    public SetUpData(data: InfoFloorSkyLiftJSON, sfRailSave: SpriteFrame, sfRailNotSave: SpriteFrame, cbGetListSfPrize: CallableFunction) {
        this._infoFloorSkyLift = data;
        this.lbLevel.string = data.progress.toString();
        if (this.typeFloorBase != TYPE_FLOOR_BASE.Base) {
            this.spRailing.spriteFrame = data.isSavePoint ? sfRailSave : sfRailNotSave;
        }
        if (this.prizeFloor != null) {
            // set UIPrize
            let listSFPrize: SpriteFrame[] = [];
            switch (true) {
                case this.typeFloorBase == TYPE_FLOOR_BASE.Top: listSFPrize = cbGetListSfPrize('Purple'); break;
                case this._infoFloorSkyLift.isSavePoint: listSFPrize = cbGetListSfPrize('Red'); break;
                default: listSFPrize = cbGetListSfPrize('Blue'); break;
            }
            this.prizeFloor.SetPrize(data.listPrize);
            this.prizeFloor.SetUI(listSFPrize);
        }
        if (this.typeFloorBase != TYPE_FLOOR_BASE.Top && this._listNSeparate != null && this.sfSeparate != null) {
            const numSeparate: number = DataSkyLiftSys.Instance.GetNumSeparateById(this._infoFloorSkyLift.idFloor);
            this.InitSeparate(numSeparate);
        }
    }

    /**
     * func này để set progress cho anim cũng như tiến trình
     * @param sfBgLevel 
     * @param progress 
     */
    public SetUpProgress(progressPlayer: number, sfBgLevelReached: SpriteFrame, sfBgLevelNoReach: SpriteFrame) {

        const progressSet = DataSkyLiftSys.Instance.GetProgressSetFromId(this._infoFloorSkyLift.idFloor, progressPlayer);

        this.SaveProgress(progressPlayer);

        switch (true) {
            // case pass || full
            case this._infoFloorSkyLift.idFloor == 0:
                this.spBgLevel.spriteFrame = sfBgLevelReached;
                break;
            case this.typeFloorBase == TYPE_FLOOR_BASE.Top && progressPlayer == CONFIG_SL.MAX_PROGRESS:
                this.spBgLevel.spriteFrame = sfBgLevelReached;
                break;
            case this.typeFloorBase == TYPE_FLOOR_BASE.Top && progressPlayer < CONFIG_SL.MAX_PROGRESS:
                this.spBgLevel.spriteFrame = sfBgLevelNoReach;
                break;
            case progressPlayer >= this._infoFloorSkyLift.progress:
                this.spBgLevel.spriteFrame = sfBgLevelReached;
                break;
            default:
                this.spBgLevel.spriteFrame = sfBgLevelNoReach;
                break;
        }

        // ngoài trừ top ra còn lại đều có progress để set
        if (this.typeFloorBase != TYPE_FLOOR_BASE.Top) {
            const transSpProgress = this.spProgress.node.getComponent(UITransform)
            const oldSize: Size = transSpProgress.contentSize.clone();
            const heightNew = progressSet * this.MAX_HEIGHT[this.typeFloorBase];
            const resultHeight = heightNew > this.MAX_HEIGHT[this.typeFloorBase] ? this.MAX_HEIGHT[this.typeFloorBase] : heightNew;
            transSpProgress.contentSize = new Size(oldSize.x, resultHeight);
        }

        // set up rail
        if (this.typeFloorBase != TYPE_FLOOR_BASE.Base && this._infoFloorSkyLift.isSavePoint) {
            const raimUICom = this.spRailing.node.getComponent(UITransform);
            const baseSize = raimUICom.contentSize.clone();
            raimUICom.contentSize = new Size(progressPlayer >= this._infoFloorSkyLift.progress ? this.MAX_WIDTH_RAILING[1] : this.MAX_WIDTH_RAILING[0], baseSize.height);
        }

        // set update prize
        if (this._infoFloorSkyLift.listPrize.length > 0) {
            const nameAnimChoice = DataSkyLiftSys.Instance.IsReceivePrizeClone(this._infoFloorSkyLift.idFloor) ? this.animPrize.NAME_ANIM.IDLE_OPEN : this.animPrize.NAME_ANIM.IDLE_CLOSE;
            this.animPrize.SetUpAnim(nameAnimChoice);
        }
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private InitSeparate(numSeparate: number) {
        if (this.typeFloorBase != TYPE_FLOOR_BASE.Top) {
            if (this._listNSeparate.length == numSeparate) { return; }
            else { this._listNSeparate.forEach(item => item.destroy()); this._listNSeparate = []; }

            const totalHeight = this.MAX_HEIGHT[this.typeFloorBase];

            for (let i = 0; i < numSeparate; i++) {
                const posS = new Vec3(0, totalHeight / (numSeparate + 1) * (i + 1))

                // init node
                let nSeparate: Node = new Node();
                nSeparate.addComponent(Sprite).spriteFrame = this.sfSeparate;
                nSeparate.setParent(this.nListSeparate);
                nSeparate.position = posS;

                this._listNSeparate.push(nSeparate);
            }
        }
    }

    private SaveProgress(progressPlayer: number) {
        this._progressNow = DataSkyLiftSys.Instance.GetProgressOfFloorNow(this._infoFloorSkyLift.idFloor, progressPlayer);
        // console.log("check", this._infoFloorSkyLift.idFloor, this._progressNow);
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public GetWPosSeparateWithProgress(progressCheck: number) {
        let indexSeparate = progressCheck - this._infoFloorSkyLift.progress - 1;
        let result = this.GetWPosCarWithBgLevel();

        if (indexSeparate >= 0 && indexSeparate < this._listNSeparate.length) {
            const wPosBySeparate = this._listNSeparate[indexSeparate].worldPosition.clone().add3f(CONFIG_SL.DIFF_X_CAR_AND_SEPARATE, 0, 0);
            if (result.y < wPosBySeparate.y) {
                result = wPosBySeparate;
            }
        }

        return result;
    }

    public GetWPosCarWithBgLevel(): Vec3 {
        let result = this.spBgLevel.node.worldPosition.clone();
        result = result.add3f(CONFIG_SL.DIFF_X_CAR_AND_SEPARATE, 0, 0);
        if (this.typeFloorBase != TYPE_FLOOR_BASE.Base && this._infoFloorSkyLift.isSavePoint) {
            result.add3f(0, CONFIG_SL.DIFF_Y_CAR_AND_FLOOR, 0)
        }
        return result;
    }

    public async IncreaseProgress(progressNew: number) {
        this.SaveProgress(progressNew);

        if (this.typeFloorBase == TYPE_FLOOR_BASE.Top) { return; }
        const progressSetNew: number = DataSkyLiftSys.Instance.GetProgressSetFromId(this._infoFloorSkyLift.idFloor, progressNew);
        const heightNew: number = progressSetNew * this.MAX_HEIGHT[this.typeFloorBase];
        const resultHeight: number = heightNew > this.MAX_HEIGHT[this.typeFloorBase] ? this.MAX_HEIGHT[this.typeFloorBase] : heightNew;
        tween(this.spProgress.getComponent(UITransform))
            .to(CONFIG_SL.TIME_ANIM_INCREASE_SCORE, { height: resultHeight })
            .start();
        await Utils.delay(CONFIG_SL.TIME_ANIM_INCREASE_SCORE * 1000);
    }

    public async DecreaseLevel(sfBgNorReach: SpriteFrame, timeAnimDecrease: number = 0.2) {

        const timeDecreaseEachLevel = timeAnimDecrease / (this._progressNow - 1);
        if (this._progressNow > 0) {
            for (let i = this._progressNow - 1; i >= 0; i--) {
                await new Promise<void>(resolve => {
                    const heightNew = i / this._progressNow * this.MAX_HEIGHT[this.typeFloorBase];
                    const resultHeight: number = heightNew > this.MAX_HEIGHT[this.typeFloorBase] ? this.MAX_HEIGHT[this.typeFloorBase] : heightNew;

                    tween(this.spProgress.getComponent(UITransform))
                        .to(timeDecreaseEachLevel, { height: resultHeight })
                        .call(() => resolve())
                        .start();
                })
            }
        }

        this._progressNow = 0;

        // không diễn hoạt để nhấn mạnh vào cảm giác tụt cảm xúc , chán
        if (this.typeFloorBase != TYPE_FLOOR_BASE.Base && !this._infoFloorSkyLift.isSavePoint) {
            this.spBgLevel.spriteFrame = sfBgNorReach;
        }
    }

    public async AnimReachLevel(sfBgReach: SpriteFrame) {
        let listPromise: Promise<void>[] = [];

        //anim scale bglevel và thay vào spriteFrame đã unlock
        listPromise.push(new Promise<void>(resolve => {
            // trong trường hợp event đã nhận thưởng rồi thì sẽ ko chạy anim này nữa
            if (this._infoFloorSkyLift != null && !DataSkyLiftSys.Instance.IsReceivePrizeClone(this._infoFloorSkyLift.idFloor)) {
                this.animPrize.PlayAnim(this.animPrize.NAME_ANIM.OPEN);
            }

            tween(this.spBgLevel.node)
                .to(0.2, { scale: Vec3.ONE.clone().multiplyScalar(1.1) }, { easing: "quintOut" })
                .call(() => { this.spBgLevel.spriteFrame = sfBgReach; })
                .to(0.2, { scale: Vec3.ONE }, { easing: "quintIn" })
                .call(() => { resolve(); })
                .start();
        }));

        //diễn hoạt nếu như là floor có thể save được thì sẽ kéo dài ra
        if (this._infoFloorSkyLift.isSavePoint) {
            listPromise.push(this.AnimOpenRail());
        }

        if (!DataSkyLiftSys.Instance.IsReceivePrizeClone(this.InfoFloorSkyLift.idFloor)) {
            this.animPrize.PlayAnimReceive(this._infoFloorSkyLift.listPrize);
        }

        await Promise.all(listPromise);
    }

    public AnimOpenRail() {
        const uiComRail = this.spRailing.node.getComponent(UITransform);
        const oldSizeRail = uiComRail.contentSize.clone();
        const newSizeRail = new Size(this.MAX_WIDTH_RAILING[1], oldSizeRail.height);
        const timeOpenRail: number = 1;
        return new Promise<void>(resolve => {
            tween(uiComRail)
                .to(timeOpenRail, { contentSize: newSizeRail }, { easing: "quintOut" })
                .call(() => { resolve() })
                .start();
        });
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