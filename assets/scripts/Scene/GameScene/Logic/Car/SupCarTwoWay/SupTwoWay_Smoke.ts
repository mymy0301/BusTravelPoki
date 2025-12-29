import { _decorator, Component, Node, Pool, RealCurve, Size, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { M_ERROR } from 'db://assets/scripts/Configs/MConfigError';
import { PoolGameSys } from '../../../../LobbyScene/PoolGameSys';
const { ccclass, property } = _decorator;

const NAME_POOL = "SmokeCarTwoWay";

@ccclass('SupTwoWay_Smoke')
export class SupTwoWay_Smoke extends Component {
    @property(SpriteFrame) sfSmoke: SpriteFrame;
    @property(RealCurve) rvScale: RealCurve = new RealCurve();
    private readonly TIME_SMOKE: number = 0.7; public get GET_TIME_SMOKE() { return this.TIME_SMOKE }

    protected onEnable(): void {
        const poolTwoWay: Pool<Node> = new Pool(() => {
            const newNSmoke = new Node();
            newNSmoke.name = "SmokeCarTwoWay";
            newNSmoke.addComponent(Sprite).spriteFrame = this.sfSmoke;
            return newNSmoke;
        }, 0)
        PoolGameSys.Instance.RegisterPool(NAME_POOL, poolTwoWay);
    }

    public GetSmoke() {
        return PoolGameSys.Instance.GetItemFromPool(NAME_POOL);
    }

    public ReUseSmoke(nSmoke: Node) {
        try {
            nSmoke.active = false;
            PoolGameSys.Instance.PoolItem(nSmoke, NAME_POOL);
        } catch (e) {
            console.error(`#${M_ERROR.SMOKE}`);
        }
    }

    public AnimSmoke(nSmoke: Node, pos: Vec3) {
        nSmoke.position = pos;
        nSmoke.scale = Vec3.ZERO;
        const self = this;

        tween(nSmoke)
            .to(this.TIME_SMOKE, {}, {
                onUpdate(target, ratio) {
                    const scaleTrue = Vec3.ONE.clone().multiplyScalar(self.rvScale.evaluate(ratio));
                    nSmoke.scale = scaleTrue;
                },
            })
            .call(() => {
                this.ReUseSmoke(nSmoke);
            })
            .start();
    }

    public GetListSpawnPos(num: number, recSize: Size){
        const distanceX = recSize.width / num;
        const distanceY = recSize.height / num;
        const positions: Vec3[] = [];
        for (let i = 0; i < num; i++) {
            for (let j = 0; j < num; j++) {
                const x = -recSize.width / 2 + distanceX / 2 + i * distanceX;
                const y = -recSize.height / 2 + distanceY / 2 + j * distanceY;
                positions.push(new Vec3(x, y, 0));
            }
        }
        return positions;
    }
}