import { _decorator, CCFloat, Color, Component, instantiate, Label, macro, Node, Prefab, sp, Sprite, SpriteFrame, Tween, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { GameSoundEffect, IObjConstructor, ISupObjConstructor, IPrize, ISupSke } from '../../../Utils/Types';
import { Ske_ConstructorSys } from './Ske_ConstructorSys';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { MConfigs } from '../../../Configs/MConfigs';
import { DataBuildingSys } from '../../../DataBase/DataBuildingSys';
import { Utils } from '../../../Utils/Utils';
import { FxBuildingSys } from '../../../AnimsPrefab/Fx_building/FxBuildingSys';
import { Constructor_visualPrepareBuild } from './Constructor_visualPrepareBuild';
import { SoundSys } from '../../../Common/SoundSys';
import { AnimBoat_map_1 } from '../../../Map_Lobby/AnimBoat_map_1';
import { AnimPillarLiberty } from '../../../Map_Lobby/AnimPillarLiberty';
const { ccclass, property } = _decorator;

export enum EConstructorState {
    NOT_BUILDING_DONE,
    NOT_BUILDING_YET,
    ANIM_BUILDING_DONE,
    ANIM_APEAR_BUILDING,
    BUILDING_DONE,
}

export const NAME_BG_CONSTRUCTOR = 'BgConstructor';

@ccclass('ConstructorSys')
export class ConstructorSys extends Component {
    @property(Sprite) spConstructor: Sprite;
    @property(Sprite) spConstructorBg: Sprite;
    @property(Sprite) spShadow: Sprite;
    @property(Node) nBox: Node;
    @property(Label) lbRemaining: Label;

    @property(Node) nAnimSke_Bottom: Node;
    @property(Node) nAnimSke_Top: Node;
    @property(Node) nVisualConstructor: Node;
    @property(Node) nVisualPrepareBuild: Node;

    @property(FxBuildingSys) fxBuildingSys: FxBuildingSys;

    @property({ group: "SubCons", type: Node }) nParentSubConstructorTop: Node;
    @property({ group: "SubCons", type: Node }) nParentSubConstructorBottom: Node;
    @property({ group: "Prepare Build", type: SpriteFrame }) imagePre_1: SpriteFrame;
    @property({ group: "Prepare Build", type: SpriteFrame }) imagePre_2: SpriteFrame;
    private nMapSupCons_AfterBuild: Map<number, Node> = null;
    private nMapSupCons_FromStart: Map<number, Node> = null;

    private _iObjConstructor: IObjConstructor = null;
    private _levelMap: number = 0;
    private _nParent: Node = null;
    private _stateConstructor: EConstructorState = EConstructorState.NOT_BUILDING_DONE;

    private listSke_consSys_Bottom: Ske_ConstructorSys[] = [];
    private ske_FX: Ske_ConstructorSys = null;

    private readonly scaleDefaultBox: Vec3 = new Vec3(1, 1, 1);

    private _posDefaultForBox: Vec3 = null;

    //=========================================
    //#region base
    protected update(dt: number): void {
        this._timeScaleNow += dt;
    }
    //#endregion base
    //=========================================


    //#region self func
    /**
     * 
     * @param levelMap 
     * @param iObjConstructor 
     * @param progressConstructorNow 
     *  Nếu progress == -2 => công trình đó đã unlock hoàn toàn
     *  Nếu progress == -1 => công trình đó chưa đến lượt
     *  Nếu progress >= 0 => công trình đó đang được unlock
     */
    public SetUp(levelMap: number, nParent: Node, iObjConstructor: IObjConstructor, progressConstructorNow: number, pfSkeletonConstructor: Prefab) {
        this._iObjConstructor = iObjConstructor;
        this._levelMap = levelMap;
        this._nParent = nParent;

        // init map
        this.nMapSupCons_FromStart = new Map();
        this.nMapSupCons_AfterBuild = new Map();

        // reset data
        this._posDefaultForBox = null;

        // set posDefaultForBox
        this._posDefaultForBox = iObjConstructor.posDefaultForBox;

        // set constructor pos
        this.node.parent = nParent;
        this.node.position = iObjConstructor.pos;

        // scale visual constructor <please do not scale the node parent -> it used for tween scale>
        this.spConstructor.node.scale = iObjConstructor.scaleVisual;
        this.spConstructorBg.node.scale = iObjConstructor.scaleVisual;
        this.spShadow.node.scale = iObjConstructor.scaleVisual;

        // gen image constructor root
        const nameConstructor = MConfigResourceUtils.GetNameImageObjMap(levelMap, 'MainConstructor', iObjConstructor.index);
        const sfConstructor: SpriteFrame = MConfigResourceUtils.GetImageConstructor(levelMap, nameConstructor);
        this.spConstructor.node.name = nameConstructor;
        this.spConstructor.spriteFrame = sfConstructor;
        this.spConstructor.sizeMode = Sprite.SizeMode.TRIMMED;

        // gen image constructor bg
        const nameBlackConstructor = MConfigResourceUtils.GetNameImageObjMap(levelMap, 'Black', iObjConstructor.index);
        const sfBlackConstructor: SpriteFrame = MConfigResourceUtils.GetImageConstructor(levelMap, nameBlackConstructor);
        this.spConstructorBg.name = nameBlackConstructor;
        this.spConstructorBg.spriteFrame = sfBlackConstructor;
        this.spConstructorBg.sizeMode = Sprite.SizeMode.TRIMMED;

        // gen image shadow constructor
        const nameShadowConstructor = MConfigResourceUtils.GetNameImageObjMap(levelMap, 'Shadow', iObjConstructor.index);
        const sfShadowConstructor: SpriteFrame = MConfigResourceUtils.GetImageConstructor(levelMap, nameShadowConstructor);
        if (sfShadowConstructor != null) {
            this.spShadow.node.active = true;
            this.spShadow.node.position = iObjConstructor.posShadow;
            this.spShadow.node.name = nameShadowConstructor;
            this.spShadow.spriteFrame = sfShadowConstructor;
            this.spShadow.sizeMode = Sprite.SizeMode.TRIMMED;
        } else {
            this.spShadow.node.active = false;
        }

        //update progress in here
        switch (true) {
            case progressConstructorNow == -2:
                this.ChangeState(EConstructorState.BUILDING_DONE);
                break;
            case progressConstructorNow == -1:
                this.ChangeState(EConstructorState.NOT_BUILDING_YET);
                break;
            case progressConstructorNow >= 0:
                this.ChangeState(EConstructorState.NOT_BUILDING_DONE);
                this.UpdateUIProgress();
                break;
        }

        // set prepare build
        this.nVisualPrepareBuild.getComponent(Constructor_visualPrepareBuild).SetVisualPrepareBuild(
            iObjConstructor.title,
            iObjConstructor.posPrepareBuild,
            iObjConstructor.scalePrepareBuild,
            iObjConstructor.typePrepareBuild,
            iObjConstructor.maxBrickToUnlock
        )

        // init skeleton
        this.LoadSkeletonBottom(pfSkeletonConstructor);
        this.LoadSkeletonFx(pfSkeletonConstructor);

        // load subConstructorPre
        this.LoadListSupCons_FromStart();

        // Hide Force Noti remain item build
        this.nBox.getComponent(UIOpacity).opacity = 0;
    }
    //#endregion self func

    //#region common func
    public async ChangeState(state: EConstructorState) {
        this._stateConstructor = state;

        switch (state) {
            case EConstructorState.NOT_BUILDING_DONE:
                this.nAnimSke_Bottom.active = false;
                this.nAnimSke_Top.active = false;
                this.nBox.active = true;
                this.spConstructorBg.node.active = true;
                this.nVisualPrepareBuild.active = false;
                // bật fx building
                // console.warn("register building not building done");
                this.fxBuildingSys.RegisterManual();

                break;
            case EConstructorState.ANIM_BUILDING_DONE:
                AniTweenSys.Scale(this.nBox, Vec3.ZERO, 0.2);
                this.nBox.active = false;
                this.nAnimSke_Bottom.active = true;
                this.nAnimSke_Top.active = true;
                this.spConstructorBg.node.active = false;
                this.nVisualPrepareBuild.active = false;

                // tắt fx building
                this.fxBuildingSys.UnRegisterManual();

                // load sub constructor
                this.LoadSupCons_AfterBuildDone();

                await this.PlayAnimBuildingOpen();
                this.ChangeState(EConstructorState.BUILDING_DONE);
                break;
            case EConstructorState.ANIM_APEAR_BUILDING:
                this.nVisualConstructor.active = true;
                this.spConstructorBg.node.active = true;
                this.nAnimSke_Bottom.active = false;
                this.nAnimSke_Top.active = false;
                this.nVisualPrepareBuild.active = false;

                // tắt fx building
                this.fxBuildingSys.UnRegisterManual();

                this.UpdateUIProgress();
                this.nBox.active = true;
                await AniTweenSys.Scale(this.nBox, this.scaleDefaultBox, 0.2);
                this.ChangeState(EConstructorState.NOT_BUILDING_DONE);
                break;
            case EConstructorState.BUILDING_DONE:
                this.nBox.active = false;
                // this.nAnimSke_Bottom.active = true;
                // this.nAnimSke_Top.active = false;
                this.spConstructor.fillRange = 1;
                this.spConstructorBg.node.active = false;
                this.nVisualPrepareBuild.active = false;

                // tắt fx building
                this.fxBuildingSys.UnRegisterManual();

                // load sub constructor
                this.LoadSupCons_AfterBuildDone();
                // check can play anim Idle
                if (this._iObjConstructor.canPlayAnimIdle) {
                    this.PlayAnimBuildingIdle();
                }
                await this.ShowSubContructor();
                break;
            case EConstructorState.NOT_BUILDING_YET:
                this.nVisualConstructor.active = false;
                this.nAnimSke_Bottom.active = false;
                this.nAnimSke_Top.active = false;
                this.spConstructorBg.node.active = true;
                this.nVisualPrepareBuild.active = true;

                // tắt fx building
                this.fxBuildingSys.UnRegisterManual();

                break;
        }
    }

    private UpdateUIProgress() {
        const progress = DataBuildingSys.Instance.GetProgressConstructorNow() / this._iObjConstructor.maxBrickToUnlock;
        this.spConstructor.fillRange = progress;

        // udpate lb
        const blockRemaining = this._iObjConstructor.maxBrickToUnlock - DataBuildingSys.Instance.GetProgressConstructorNow();
        this.lbRemaining.string = blockRemaining.toString();

        // update pos noti
        if (this._posDefaultForBox == null || this._posDefaultForBox == undefined) {
            // progress * height visual
            const heightVisual: number = this.spConstructorBg.node.getComponent(UITransform).height;
            const posY: number = progress * heightVisual - heightVisual / 2;
            this.nBox.position = new Vec3(0, posY);
        } else {
            this.nBox.position = this._posDefaultForBox;
        }
    }

    public IncreaseProgressBuilding() {
        DataBuildingSys.Instance.IncreaseProgressConstructorNow();
        // scale nVisual a little
        this.scaleImpress();
        this.UpdateUIProgress();
    }

    public GetMaxRemainingProgress() {
        return this._iObjConstructor.maxBrickToUnlock - DataBuildingSys.Instance.GetProgressConstructorNow();
    }

    public GetListPrize(): IPrize[] {
        return this._iObjConstructor.listPrize;
    }

    public GetNameConstructor(): string {
        return this._iObjConstructor.title;
    }

    //#endregion common func

    //#region scale impress
    @property(CCFloat) timeNextScale = 0.2;
    private _timeScaleNow: number = this.timeNextScale;
    private async scaleImpress() {
        if (this._timeScaleNow >= this.timeNextScale) {
            this._timeScaleNow = 0;
            await AniTweenSys.ScaleCoinPoppularUse(this.nVisualConstructor, MConfigs.TIME_SCALE_CONSTRUCTOR_WHEN_BUILDING, MConfigs.SCALE_CONSTRUCTOR_WHEN_BUILDING);
        }
    }
    //#endregion scale impress

    //#region Skeleton
    public async PlayAnimBuildingOpen() {
        try {
            const self = this;
            // load prefab have skeleton object constructor
            // bật anim đầu tiên run
            // sau khi bật anim run xong sẽ bật anim idle
            await this.WaitLoadSkeletonDone();
            // console.log("PlayAnimBuildingOpen");
            const nameAnimOpen = this.listSke_consSys_Bottom[0].GetNameEffectProjectToPlay(this._levelMap, this._iObjConstructor.index, 'open');
            const nameAnimFX = this.listSke_consSys_Bottom[0].GetNameEffectProjectToPlay(this._levelMap, this._iObjConstructor.index, 'FX');
            const timeWaitBetweenTopAndBottom = this._iObjConstructor.timeWaitBetweenTopAndBottom;

            this.listSke_consSys_Bottom.forEach(skeCons => skeCons.node.active = true);
            this.ske_FX.node.active = true;

            await Promise.all([
                this.ske_FX.AwaitPlayAnim(nameAnimFX),
                await Utils.delay(timeWaitBetweenTopAndBottom * 1000),
                // play sound + anim
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CONSTRUCTOR_UNLOCKED),
                new Promise<void>(async resolve => {
                    if (self._iObjConstructor.canPlayAnimOpen) {
                        for (let i = 0; i < self.listSke_consSys_Bottom.length; i++) {
                            const rightName = self.listSke_consSys_Bottom.length == 1 ? nameAnimOpen : `${nameAnimOpen}_${i + 1}`;

                            // trong trường hợp ko có nhiều hơn 2 anim => tên sẽ bỏ hậu tố _${index}
                            // còn nếu có nhiều hơn 2 anim thì tên sẽ có thêm hậu tố _${index}

                            const skeBottom = self.listSke_consSys_Bottom[i];
                            if (i == self.listSke_consSys_Bottom.length - 1) await skeBottom.AwaitPlayAnim(rightName);
                            else skeBottom.AwaitPlayAnim(rightName);
                        }
                    }
                    resolve();
                })
            ]);
        } catch (e) {
            console.error(e);
        }
    }

    public async PlayAnimBuildingIdle() {
        await this.WaitLoadSkeletonDone();
        const nameAnimIdle = this.listSke_consSys_Bottom[0].GetNameEffectProjectToPlay(this._levelMap, this._iObjConstructor.index, 'idle');

        this.ske_FX.node.active = false;
        this.listSke_consSys_Bottom.forEach((cons: Ske_ConstructorSys, index: number) => {
            const rightNameIdle = this.listSke_consSys_Bottom.length == 1 ? nameAnimIdle : `${nameAnimIdle}_${index + 1}`;
            cons.node.active = true;
            cons.PlayAnimLoopWithDelay(rightNameIdle, 0);
        })
    }

    private LoadSkeletonBottom(pfSkeleton: Prefab) {
        const self = this;

        function InitSke(infoSke: ISupSke): Node {
            // init node
            let nSkeleton: Node = instantiate(pfSkeleton);
            // load skeleton image
            const namePathSkeleton: string = MConfigResourceUtils.GetNameImageObjMap(self._levelMap, 'Skeleton', self._iObjConstructor.index);
            const dataSkeleton: sp.SkeletonData = MConfigResourceUtils.GetSkeletonConstructor(self._levelMap, namePathSkeleton);
            const skeCom = nSkeleton.getComponent(Ske_ConstructorSys);
            skeCom.SetData(dataSkeleton);
            // console.log(namePathSkeleton, dataSkeleton);

            switch (infoSke.parent) {
                case "top": nSkeleton.setParent(self.nAnimSke_Top); break;
                case "bottom": default: nSkeleton.setParent(self.nAnimSke_Bottom); break;
            }
            nSkeleton.setPosition(infoSke.pos);
            nSkeleton.setScale(infoSke.scale);
            nSkeleton.active = false;

            return nSkeleton;
        }

        // check num skeBottom and gen
        for (let i = 0; i < this._iObjConstructor.listSupSke.length; i++) {
            const infoSke = this._iObjConstructor.listSupSke[i];
            const skeCons = InitSke(infoSke);
            skeCons.name = `Ske_${i}`;
            this.listSke_consSys_Bottom.push(skeCons.getComponent(Ske_ConstructorSys));
        }
    }

    private LoadSkeletonFx(pfSkeleton: Prefab) {
        // init node
        let nSkeleton: Node = instantiate(pfSkeleton);
        // load skeleton image
        const namePathSkeleton: string = MConfigResourceUtils.GetNameImageObjMap(this._levelMap, 'Skeleton', this._iObjConstructor.index);
        const dataSkeleton: sp.SkeletonData = MConfigResourceUtils.GetSkeletonConstructor(this._levelMap, namePathSkeleton);
        this.ske_FX = nSkeleton.getComponent(Ske_ConstructorSys);
        this.ske_FX.SetData(dataSkeleton);
        nSkeleton.setParent(this.nAnimSke_Top);
        nSkeleton.setPosition(this._iObjConstructor.listSupSke[0].pos);
        nSkeleton.active = false;
    }

    private async WaitLoadSkeletonDone() {
        const self = this;
        // wait until player received done
        return new Promise<void>((resolve) => {
            let ttId = setInterval(() => {
                const valid1 = self == null;
                const valid2 = self.ske_FX != null;
                const valid3 = self.listSke_consSys_Bottom.every(ske => ske == null) === false;
                if (valid1 || (valid2 && valid3)) {
                    clearInterval(ttId);
                    resolve();
                }
            }, 0.5, macro.REPEAT_FOREVER, 0)
        })
    }
    //#endregion Skeleton


    //#region sub constructor
    private LoadSupCons(infoSup: ISupObjConstructor): Node {
        let prefabSubCons = MConfigResourceUtils.map_pf_subs_map_lobby.get(infoSup.namePrefab);
        const subCons = instantiate(prefabSubCons);
        if (infoSup.locateParent != null && infoSup.locateParent == 'top') {
            subCons.setParent(this.nParentSubConstructorTop);
        } else {
            subCons.setParent(this.nParentSubConstructorBottom);
        }
        subCons.setPosition(infoSup.pos);
        subCons.scale = infoSup.scale;
        subCons.name = infoSup.namePrefab;

        return subCons;
    }

    private LoadListSupCons_FromStart() {
        for (let i = 0; i < this._iObjConstructor.listSubConstructors.length; i++) {
            // check valid
            const infoSubCons = this._iObjConstructor.listSubConstructors[i];
            if (!infoSubCons.isShowFromStart) { continue; }
            if (this.nMapSupCons_FromStart.get(i) != null) { continue; }
            // load sup
            const nSub = this.LoadSupCons(infoSubCons);
            nSub.active = true;
            // add to map
            this.nMapSupCons_FromStart.set(i, nSub);
        }
    }

    private LoadSupCons_AfterBuildDone() {
        for (let i = 0; i < this._iObjConstructor.listSubConstructors.length; i++) {
            // check valid
            const infoSubCons = this._iObjConstructor.listSubConstructors[i];
            if (infoSubCons.isShowFromStart) { continue; }
            if (this.nMapSupCons_AfterBuild.get(i) != null) { continue; }
            // load sup
            const nSub = this.LoadSupCons(infoSubCons);
            nSub.active = true;
            // add to list
            this.nMapSupCons_AfterBuild.set(i, nSub);

            // prepare sub constructor
            nSub.active = false;
            const opaCom = nSub.getComponent(UIOpacity);
            if (opaCom != null) {
                opaCom.opacity = 0;
            }
        }
    }

    private async ShowSubContructor() {
        // hiện tại chỉ chạy opacity cho hiển thị dần
        // nếu trong trường hợp có anim riêng thì xin hãy gọi tạo một class chung , interface , hoặc abstract tùy bạn => gọi func cần thiết
        let timeApearSubCons = 0;
        this.nMapSupCons_AfterBuild.forEach(supConsChoice => {
            supConsChoice.active = true;
            const opaComCons = supConsChoice.getComponent(UIOpacity);
            if (opaComCons == null) { return; }
            opaComCons.opacity = 255;

            // depend on what sub constructor you want to do
            switch (true) {
                case this._iObjConstructor.title == "Golden Gate Bridge" && supConsChoice.name == "pf_boat_map_1":
                    const animBoatCom = supConsChoice.getComponent(AnimBoat_map_1);
                    if (animBoatCom != null) {
                        timeApearSubCons = animBoatCom.GetTimeShow();
                        animBoatCom.PlayAnimBoatIdle_Show();
                    }
                    break;
                case this._iObjConstructor.title == "Statue of Liberty" && supConsChoice.name == "pf_pillar_Liberty":
                    const animPillarLiberty = supConsChoice.getComponent(AnimPillarLiberty);
                    if (animPillarLiberty != null) {
                        timeApearSubCons = animPillarLiberty.GetTimeShow();
                        animPillarLiberty.PlayAnimIdle_Show();
                    }
                    break;
            }
        })

        await Utils.delay(timeApearSubCons * 1000);
    }
    //#endregion sub constructor
    //===========================================================

    //===========================================================
    //#region notification
    private readonly TIME_HIDE_SHOW_BOX = 0.4;
    public Hide_notiRemainingItemNeedBuild() {
        // rotate Box + opacity
        const comOpaBox = this.nBox.getComponent(UIOpacity);
        comOpaBox.opacity = 255;
        this.nBox.angle = 180;
        tween(this.nBox)
            .parallel(
                tween().to(this.TIME_HIDE_SHOW_BOX, { angle: 90 }, { easing: "backIn" }),
                tween()
                    .delay(this.TIME_HIDE_SHOW_BOX * 3 / 4)
                    .to(this.TIME_HIDE_SHOW_BOX / 4, {}, {
                        easing: "backIn", onUpdate(target, ratio) {
                            comOpaBox.opacity = (1 - ratio) * 255;
                        },
                    })
            )
            .start();
    }

    public Show_notiRemainingItemNeedBuild() {
        // rotate box + opacity
        const comOpaBox = this.nBox.getComponent(UIOpacity);
        comOpaBox.opacity = 0;
        this.nBox.angle = 270;

        // trong trường hợp giá trị của box là giá trị âm => không show lên
        try {
            const progressShow = Number.parseInt(this.lbRemaining.string);
            if (progressShow < 0) {
                return;
            }
        } catch (e) {
            console.error(e);
            return;
        }
        tween(this.nBox)
            .parallel(
                tween().to(this.TIME_HIDE_SHOW_BOX, { angle: 180 }, { easing: "backOut" }),
                tween().to(this.TIME_HIDE_SHOW_BOX / 4, {}, {
                    easing: "backOut", onUpdate(target, ratio) {
                        comOpaBox.opacity = ratio * 255;
                    },
                })
            )
            .start();
    }
    //#endreigon notification
    //===========================================================
}


