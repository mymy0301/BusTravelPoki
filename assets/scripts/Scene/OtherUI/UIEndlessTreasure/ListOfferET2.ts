import { _decorator, Component, instantiate, Node, NodePool, Prefab, tween, UIOpacity, Vec3 } from 'cc';
import { DataEndlessTreasureSys } from '../../../DataBase/DataEndlessTreasureSys';
import { InfoPackEndlessTreasure } from '../../../Utils/Types';
import { ItemOfferET } from './ItemOfferET';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('ListOfferET2')
export class ListOfferET2 extends Component {
    @property(Prefab) itemOffer: Prefab;
    @property(Node) listNHolderPack: Node[] = [];
    @property(Node) nMoveIn: Node;
    @property(Node) nParentList: Node;
    @property(Node) nBlockUI: Node;
    private _listPackShowing: Node[] = [];
    private mPool: NodePool = new NodePool();

    protected onEnable(): void {
        this.nBlockUI.active = false;
    }

    //=============================================
    //#region self
    public InitListPack() {
        const dataPack: InfoPackEndlessTreasure[] = DataEndlessTreasureSys.Instance.GetDataPack().filter(pack => !pack.isBought);
        console.log(dataPack);
        for (let i = 0; i < 4 && i < dataPack.length; i++) {
            // init pack and set to pos holderPack
            const dataPackSet = dataPack[i];
            const wPosHolderPack = this.listNHolderPack[i].worldPosition;
            const pack = this.InitPack(dataPackSet, wPosHolderPack);
            pack.setScale(Vec3.ONE);
            pack.active = true;
            this._listPackShowing.push(pack);
        }
    }

    private InitPack(dataPack: InfoPackEndlessTreasure, wPos: Vec3) {
        // init pack and set to pos holderPack
        const dataPackSet = dataPack;
        const wPosHolderPack = wPos;
        let nOffer = this.GetItem(this.nParentList);
        nOffer.worldPosition = wPosHolderPack;
        nOffer.getComponent(ItemOfferET).SetUp(dataPackSet);
        return nOffer;
    }

    public async AnimMovePack() {
        const timeMoveOut: number = 0.3;
        const timeWaitEachItemAnim: number = 0.16;
        const timeMoveToPreviousIndex: number = 0.5;

        this.nBlockUI.active = true;

        //=================================================
        // move item according to script
        for (let i = 0; i < this._listPackShowing.length; i++) {
            // item index 0 scale and move out
            // item index 1->5 move to index previous
            // gen new item if can => scale and move from index 6 => index 5
            const itemMove: Node = this._listPackShowing[i];
            const opaItem: UIOpacity = itemMove.getComponent(UIOpacity);
            switch (true) {
                case i == 0:
                    await itemMove.getComponent(ItemOfferET).AnimBuySucess();
                    tween(itemMove)
                        .to(timeMoveOut, { scale: Vec3.ZERO }, {
                            easing: 'smooth', onUpdate(target, ratio) {
                                opaItem.opacity = (1 - ratio) * 255;
                            },
                        })
                        .start();
                    break;
                default:
                    const indexPrevious = i - 1;
                    const wPosPrevious = this.listNHolderPack[indexPrevious].worldPosition.clone();

                    tween(itemMove)
                        .to(timeMoveToPreviousIndex, { worldPosition: wPosPrevious }, { easing: 'cubicOut' })
                        .call(() => {
                            if (indexPrevious == 0) {
                                // call anim unlock
                                itemMove.getComponent(ItemOfferET).UnlockItem();
                            }
                        })
                        .start();

                    await Utils.delay(timeWaitEachItemAnim * 1000);
                    break;
            }
        }

        //=================================================
        // ReUse first item
        this.RemoveOutPack();


        //=================================================
        // check can gen next item => if can wait anim for item new, if not => just pass it
        const newListPack = DataEndlessTreasureSys.Instance.GetDataPack().filter(pack => !pack.isBought);
        if (newListPack.length >= this.listNHolderPack.length && newListPack.length > 0) {
            // init new pack and set to the wposMoveIn + anim
            const dataNewPack = newListPack[this._listPackShowing.length];   // in this case not -1 because you remove out pack old
            const wPosMoveIn = this.nMoveIn.worldPosition.clone();
            const wPosEnd = this.listNHolderPack[this.listNHolderPack.length - 1].worldPosition.clone();
            let newPack = this.InitPack(dataNewPack, wPosMoveIn);
            newPack.scale = Vec3.ZERO;
            newPack.getComponent(UIOpacity).opacity = 255;
            newPack.active = true;
            newPack.getComponent(ItemOfferET).SetUp(dataNewPack);
            this._listPackShowing.push(newPack);

            tween(newPack)
                .to(timeMoveToPreviousIndex, { scale: Vec3.ONE, worldPosition: wPosEnd }, { easing: 'cubicOut' })
                .start();
        }
        await Utils.delay(timeMoveToPreviousIndex * 1000);

        this.nBlockUI.active = false;
    }

    public RemoveOutPack() {
        const packMoveOut = this._listPackShowing.shift();
        this.ReUseItem(packMoveOut);
    }
    //#endregion self
    //=============================================

    //=============================================
    //#region pool
    private GetItem(parentNode: Node): Node {
        let result: Node = null;
        if (this.mPool.size() > 0) { // use size method to check if there're nodes available in the pool
            result = this.mPool.get();
        } else { // if not enough node in the pool, we call cc.instantiate to create node
            result = instantiate(this.itemOffer);
        }
        result.active = false;
        result.scale = Vec3.ZERO;
        result.parent = parentNode; // add new enemy node to the node tree
        return result;
    }

    private ReUseItem(item: Node) {
        this.mPool.put(item);
    }
    //#endregion pool
    //=============================================
}


