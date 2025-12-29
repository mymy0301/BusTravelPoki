import { _decorator, AnimationClip, AnimationComponent, Component, instantiate, Node, Pool, Prefab, randomRangeInt, Vec3 } from 'cc';
import { Utils } from '../../../Utils/Utils';
import { KeyLevelProgress } from '../UILevelProgress/KeyLevelProgress';
import CirCleClaimFx from 'db://assets/Effects/fx_circle_claim/circle-claim-fx';
const { ccclass, property } = _decorator;

@ccclass('AnimReceiveLevelProgresion')
export class AnimReceiveLevelProgresion extends Component {
    @property(Prefab) pfKeyLevelProgress: Prefab;
    @property(Node) nCirFx: Node;
    private poolItem: Pool<Node> = null;
    private poolFx: Pool<Node> = null;

    protected start(): void {
        this.poolItem = new Pool<Node>(() => instantiate(this.pfKeyLevelProgress), 0);
        this.poolFx = new Pool<Node>(() => instantiate(this.nCirFx), 0);
    }

    public async PlayAnim(cbMoveFirstDone: CallableFunction, numItem: number = 5) {
        const timeDelayShowEachItem = 0.2;
        let listAnim = [];

        // random list pos
        const posBase = new Vec3(150, -400, 0);

        for (let i = 0; i < numItem; i++) {
            const posSet = posBase.clone().add3f(randomRangeInt(-50, 50), 0, 0);
            const itemAnim = this.GetItem();
            const keyCom = itemAnim.getComponent(KeyLevelProgress);
            let promiseAnim = new Promise<void>(async resolve => {
                // play anim
                await Utils.delay(i * timeDelayShowEachItem * 1000);
                itemAnim.position = posSet;
                itemAnim.active = true;
                await keyCom.PlayAnimReceive();
                this.ReUseItem(itemAnim);

                // cb
                if (i == 0) { cbMoveFirstDone && cbMoveFirstDone() }

                // play fx
                const nFx = this.GetFx();
                nFx.active = true;
                const cirCom = nFx.getComponent(CirCleClaimFx)
                cirCom.show();
                await Utils.delay(cirCom.timeShow * 1000);
                this.ReUseFx(nFx);

                resolve();
            })
            listAnim.push(promiseAnim);
        }

        await Promise.all(listAnim);
    }

    //========================================
    //#region pool
    private GetItem(): Node {
        let nItem = this.poolItem.alloc();
        nItem.getComponent(KeyLevelProgress).PlayAnimIdle();
        nItem.getComponent(KeyLevelProgress).UpdateSfKey();
        nItem.active = false;
        nItem.setParent(this.node);
        return nItem;
    }

    private ReUseItem(item: Node) {
        item.active = false;
        this.poolItem.free(item);
    }

    private GetFx(): Node {
        let nItem = this.poolFx.alloc();
        nItem.setParent(this.node);
        nItem.setSiblingIndex(999);
        nItem.active = true;
        return nItem;
    }

    private ReUseFx(item: Node) {
        item.active = false;
        this.poolFx.free(item);
    }
    //#endregion pool
    //========================================
}


