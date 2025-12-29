import { _decorator, Component, Node, Prefab, sp, Vec3, instantiate, Color, ParticleSystem2D, tween, Sprite, Vec2, CCBoolean, Enum } from 'cc';
import { ResourceUtils } from '../../Utils/ResourceUtils';
import { URL_FX_BUILDING, URL_FX_BUILDING_2 } from '../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { URL_FX_UNLOCK_PARKING, URL_FX_UNLOCK_PARKING_2 } from '../../AnimsPrefab/Fx_unlock_parking/Type_FxUnlockParking';
import { MConst } from '../../Const/MConst';
const { ccclass, property } = _decorator;

export enum TYPE_EFFECT_SKELETON {
    FX_BUILDING,
    FX_BUILDING_2,
    FX_UNLOCK_PARKING
}
Enum(TYPE_EFFECT_SKELETON);

export enum TYPE_PARTICLE {

}

@ccclass('EffectsSys')
export class EffectsSys extends Component {
    public static Instance: EffectsSys;

    @property([Node]) listEffectSkeleton: Node[] = [];
    @property([Node]) listNTempEffectSkeleton: Node[] = [];
    @property([Prefab]) listPrefabsParticles: Prefab[] = [];
    @property(Node) parentNodeParticle: Node;

    protected onEnable(): void {
        if (EffectsSys.Instance == null) {
            EffectsSys.Instance = this;
        }
    }

    protected onDisable(): void {
        EffectsSys.Instance = null;
    }

    protected start(): void {
        // old code
        this.listEffectSkeleton.forEach(item => {
            item.getComponent(sp.Skeleton).setCompleteListener(() => { item.active = false; });
            item.active = false;
        });

        // new code
        this.LoadFromResources_FX_Building();
    }

    //#region common
    public playEffectSkeleton(type: TYPE_EFFECT_SKELETON, wPos: Vec3, nameAnimation: string = 'animation') {
        // MConsolLog.Log("play effect " + type);

        let nEffect = this.listEffectSkeleton[type];
        nEffect.worldPosition = wPos;
        nEffect.active = true;
        nEffect.getComponent(sp.Skeleton).setAnimation(0, nameAnimation, false);
        this.PlaySoundWhenStartPlayEffect(type);
        return new Promise<void>(resolve => {
            let timeWait = nEffect.getComponent(sp.Skeleton).findAnimation(nameAnimation).duration / nEffect.getComponent(sp.Skeleton).timeScale;
            this.scheduleOnce(() => {
                this.PlaySoundWhenEndPlayEffect(type);
                resolve();
            }, timeWait);
        });
    }

    public getTimeEffectSkeleton(type: TYPE_EFFECT_SKELETON, nameAnimation: string = 'animation'): number {
        return this.listEffectSkeleton[type].getComponent(sp.Skeleton).findAnimation(nameAnimation).duration / this.listEffectSkeleton[type].getComponent(sp.Skeleton).timeScale;
    }

    /**this func will not active effect so you need to active it after use this func*/
    public async genAndPlayEffectSkeleton(type: TYPE_EFFECT_SKELETON, wPos: Vec3, nameAnimation: string = 'animation', parent?: Node) {
        let nEffect = this.InitEff(type);
        nEffect.setParent(parent == null ? this.listEffectSkeleton[type].getParent() : parent);
        nEffect.worldPosition = wPos;
        nEffect.active = true;
        nEffect.getComponent(sp.Skeleton).setAnimation(0, nameAnimation, false);
        nEffect.getComponent(sp.Skeleton).setCompleteListener(() => { nEffect.destroy(); });
        this.PlaySoundWhenStartPlayEffect(type);
        return new Promise<void>(resolve => {
            let timeWait = nEffect.getComponent(sp.Skeleton).findAnimation(nameAnimation).duration / nEffect.getComponent(sp.Skeleton).timeScale;
            this.scheduleOnce(() => {
                try {
                    this.PlaySoundWhenEndPlayEffect(type);
                    this.ReUseEff(type, nEffect);
                    resolve();
                } catch (e) { }
            }, timeWait);
        });
    }

    public genAndPlayParticle(type: TYPE_PARTICLE, wPos: Vec3): Node {
        let nParticle = instantiate(this.listPrefabsParticles[type]);
        // set parent
        nParticle.setParent(this.parentNodeParticle);
        nParticle.worldPosition = wPos;

        // auto remove
        this.scheduleOnce(() => {
            nParticle.destroy();
        }, 0.5);

        return nParticle;
    }
    //#end region common


    //#region self func
    private PlaySoundWhenStartPlayEffect(type: TYPE_EFFECT_SKELETON) {

    }

    private PlaySoundWhenEndPlayEffect(type: TYPE_EFFECT_SKELETON) {

    }
    //#endregion self func

    //#region OP effect
    @property(Node) nTempSample: Node;
    @property(Node) nTempSample_2: Node;
    @property(Node) nTempSample_3: Node;
    @property(Node) nTempSample_4: Node;

    public _sample_FX_Building: Node = null;
    public _sample_FX_Building_2: Node = null;
    public _sample_FX_UnLockParking: Node = null;
    public _sample_AnimBooster: Node = null;
    public async LoadFromResources_FX_Building() {
        if (this._sample_FX_Building == null && this.nTempSample != null && this.listNTempEffectSkeleton[TYPE_EFFECT_SKELETON.FX_BUILDING] != null) {
            this._sample_FX_Building = instantiate(await ResourceUtils.loadPrefab(URL_FX_BUILDING));
            this._sample_FX_Building.active = false;
            this._sample_FX_Building.setParent(this.nTempSample);
        }

        if (this._sample_FX_Building_2 == null && this.nTempSample_2 != null && this.listNTempEffectSkeleton[TYPE_EFFECT_SKELETON.FX_BUILDING_2] != null) {
            this._sample_FX_Building_2 = instantiate(await ResourceUtils.loadPrefab(URL_FX_BUILDING_2));
            this._sample_FX_Building_2.active = false;
            this._sample_FX_Building_2.setParent(this.nTempSample_2);
        }

        if (this._sample_FX_UnLockParking == null && this.nTempSample_3 != null && this.listNTempEffectSkeleton[TYPE_EFFECT_SKELETON.FX_UNLOCK_PARKING] != null) {
            this._sample_FX_UnLockParking = instantiate(await ResourceUtils.loadPrefab(URL_FX_UNLOCK_PARKING_2));
            this._sample_FX_UnLockParking.active = false;
            this._sample_FX_UnLockParking.setParent(this.nTempSample_3);
        }
    }

    private CheckIsValid_Effect(typeEF: TYPE_EFFECT_SKELETON) {
        switch (typeEF) {
            case TYPE_EFFECT_SKELETON.FX_BUILDING:
                return this._sample_FX_Building != null;
            case TYPE_EFFECT_SKELETON.FX_BUILDING_2:
                return this._sample_FX_Building_2 != null;
            case TYPE_EFFECT_SKELETON.FX_UNLOCK_PARKING:
                return this._sample_FX_UnLockParking != null;
        }
    }

    private GetSample_Effect(typeEF: TYPE_EFFECT_SKELETON) {
        switch (typeEF) {
            case TYPE_EFFECT_SKELETON.FX_BUILDING:
                return this._sample_FX_Building;
            case TYPE_EFFECT_SKELETON.FX_BUILDING_2:
                return this._sample_FX_Building_2;
            case TYPE_EFFECT_SKELETON.FX_UNLOCK_PARKING:
                return this._sample_FX_UnLockParking;
        }
    }

    public InitEff(type: TYPE_EFFECT_SKELETON): Node {
        if (!this.CheckIsValid_Effect(type)) return null;

        if (this.listNTempEffectSkeleton[type].children.length > 0) {
            return this.listNTempEffectSkeleton[type].children[0];
        } else {
            return instantiate(this.GetSample_Effect(type));
        }
    }

    public ReUseEff(type: TYPE_EFFECT_SKELETON, nReUse: Node) {
        if (this == null || this.listNTempEffectSkeleton[type] == null) return;
        nReUse.active = false;
        nReUse.setParent(this.listNTempEffectSkeleton[type]);
    }
    //#endregion OP effect
}


