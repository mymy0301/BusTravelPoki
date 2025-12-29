import { _decorator, Component, instantiate, Node, ParticleSystem, Pool, Prefab, Vec3 } from 'cc';
import { AnimItemBooster } from 'db://assets/scripts/AnimsPrefab/Anim_item_booster/AnimItemBooster';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { ResourceUtils } from 'db://assets/scripts/Utils/ResourceUtils';
import { Utils } from 'db://assets/scripts/Utils/Utils';
import { PoolGameSys } from '../../../LobbyScene/PoolGameSys';
const { ccclass, property } = _decorator;
const KEY_POOL_EF_SHUFFLE_BLINH = "KEY_POOL_EF_SHUFFLE_BLINH";

@ccclass('EffectShuffleSys')
export class EffectShuffleSys extends Component {
    @property(Node) nLayerEffStar: Node;
    @property(Prefab) pfParticle: Prefab;
    private _skeletonShuffle: Node = null;

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.PLAY_ANIM_SHUFFLE, this.PlayAnimShuffle, this);
        clientEvent.on(MConst.EVENT.PLAY_EF_BLINH_SHUFFLE, this.PlayEFBlinhShuffle, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.PLAY_ANIM_SHUFFLE, this.PlayAnimShuffle, this);
        clientEvent.off(MConst.EVENT.PLAY_EF_BLINH_SHUFFLE, this.PlayEFBlinhShuffle, this);
    }

    protected start(): void {
        // init pf effect
        ResourceUtils.load_Prefab_Bundle(MConst.PATH_PF_ANIM_ITEM_BOOSTER, MConst.BUNDLE_GAME, (err, path, prefab) => {
            if (err == null) {
                this._skeletonShuffle = instantiate(prefab);
                this._skeletonShuffle.parent = this.node;
                this._skeletonShuffle.setSiblingIndex(999);
                this._skeletonShuffle.scale = new Vec3(4, 4, 4);
                this._skeletonShuffle.position = new Vec3(0, -300, 0);

                this._skeletonShuffle.active = false;
            }
        });

        // init pool
        PoolGameSys.Instance.RegisterPool(KEY_POOL_EF_SHUFFLE_BLINH, new Pool<Node>(() => instantiate(this.pfParticle), 0));

        // ResourceUtils.load_Prefab_Bundle(MConst.PATH_PF_PARTICLE_SHUFFLE_BLINH, MConst.BUNDLE_GAME, (err, path, prefab) => {
        //     try {
        //         if (err == null) {
        //             let nParticleBlinh = instantiate(prefab);
        //             nParticleBlinh.active = false;

        //             if (PoolGameSys.Instance != null) {
        //                 PoolGameSys.Instance.RegisterPool(KEY_POOL_EF_SHUFFLE_BLINH, new Pool<Node>(() => instantiate(nParticleBlinh), 0));
        //             }
        //         }
        //     } catch (e) {

        //     }
        // });
    }

    public async PlayAnimShuffle(cb: CallableFunction) {
        this._skeletonShuffle.active = true;
        await this._skeletonShuffle.getComponent(AnimItemBooster).PlayAnimShuffle();
        this._skeletonShuffle.active = false;
        cb();
    }

    public async PlayEFBlinhShuffle(wPos: Vec3) {
        try {
            if (PoolGameSys.Instance == null) { return; }
            let nPfShuffleBlinh: Node = PoolGameSys.Instance.GetItemFromPool(KEY_POOL_EF_SHUFFLE_BLINH);
            const parCom = nPfShuffleBlinh.getComponent(ParticleSystem);

            const totalTimeParticle = 3.2;

            nPfShuffleBlinh.setParent(this.nLayerEffStar);
            nPfShuffleBlinh.worldPosition = wPos;
            nPfShuffleBlinh.active = true;
            parCom.stop();
            parCom.play();
            await Utils.delay(totalTimeParticle * 1000);
            nPfShuffleBlinh.active = false;
            PoolGameSys.Instance.PoolItem(nPfShuffleBlinh, KEY_POOL_EF_SHUFFLE_BLINH);
        } catch (e) {

        }
    }
}


