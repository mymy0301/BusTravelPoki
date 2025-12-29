import { _decorator, Component, instantiate, Node, ParticleSystem, Pool, Prefab, Sprite, Vec2, Vec3 } from 'cc';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { Utils } from 'db://assets/scripts/Utils/Utils';
import { M_ERROR } from 'db://assets/scripts/Configs/MConfigError';
import { DIRECT_CAR } from 'db://assets/scripts/Utils/Types';
import { PoolGameSys } from '../../../LobbyScene/PoolGameSys';
const { ccclass, property } = _decorator;

const NAME_POOL = "EffectSmokeCarTwoWay"

@ccclass('EffectSmokeCarTwoWay')
export class EffectSmokeCarTwoWay extends Component {
    @property(Prefab) pfSmoke: Prefab;

    //============================================
    //#region base
    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.PLAY_PARTICLE_SMOKE_CAR_TWO_WAY, this.PlayParticleSmoke, this);
        //register pool
        this.RegisterPool();
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.PLAY_PARTICLE_SMOKE_CAR_TWO_WAY, this.PlayParticleSmoke, this);
    }
    //#endregion base
    //============================================

    //============================================
    //#region pool
    private RegisterPool() {
        const poolTwoWay: Pool<Node> = new Pool(() => instantiate(this.pfSmoke), 0)
        PoolGameSys.Instance.RegisterPool(NAME_POOL, poolTwoWay);
    }
    //#endregion pool
    //===========================================

    private readonly TIME_SMOKE: number = 1;
    public async PlayParticleSmoke(wPos: Vec3, directionCar: DIRECT_CAR) {
        try {
            //=========== set angle ================
            let angelChoice = 0;
            switch (directionCar) {
                case DIRECT_CAR.TOP: case DIRECT_CAR.BOTTOM:
                    angelChoice = 90;
                    break;
                case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.TOP_RIGHT:
                    angelChoice = 45;
                    break;
                case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.BOTTOM_RIGHT:
                    angelChoice = -45;
                    break;
            }

            const nSmoke: Node = PoolGameSys.Instance.GetItemFromPool(NAME_POOL);
            nSmoke.angle = angelChoice;
            const parCom = nSmoke.getComponent(ParticleSystem);
            parCom.stop();
            nSmoke.parent = this.node;
            nSmoke.worldPosition = wPos;
            nSmoke.active = true;
            parCom.play();
            await (Utils.delay(this.TIME_SMOKE * 1000));
            if (PoolGameSys.Instance != null) {
                nSmoke.active = false;
                PoolGameSys.Instance.PoolItem(nSmoke, NAME_POOL);
            }
        } catch (e) {
            console.error(`#${M_ERROR.SMOKE}`);
        }
    }

}