import { _decorator, Component, instantiate, Node, ParticleSystem, Prefab, Vec3 } from 'cc';
import { Coin3D } from './Coin_3D/Coin3D';
import { IPrize } from '../../Utils/Types';
import { ItemPrizeLobby } from './UIReceivePrize/ItemPrizeLobby';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('SuperUIAnimCustom')
export class SuperUIAnimCustom extends Component {
    @property(Node) nUIAnim: Node;

    //#region OP coin 3D
    @property(Prefab) pfCoin3D: Prefab;
    @property(Node) nTempCoin: Node;
    private GetNCoin(): Node {
        if (this.nTempCoin.children.length > 0) {
            return this.nTempCoin.children[0];
        } else {
            let nCoin = instantiate(this.pfCoin3D);
            nCoin.name = "Coin3D";
            nCoin.parent = this.nUIAnim;
            return nCoin;
        }
    }

    private ReUseCoin(nCoin: Node) {
        if (this == null) return;
        if (this.nTempCoin == null || !this.nTempCoin.isValid) return;
        if (nCoin == null || !nCoin.isValid) return;
        nCoin.setParent(this.nTempCoin);
        nCoin.active = false;
    }
    /**
     * Hiệu ứng này sẽ là đồng tiền xoay 3D và bay về phía vị trí chỉ định
     * Không có save dữ liệu trong hàm này
     * @param  outlineLabel giá trị này có thể null
     */
    public async ReceivePrizeCoin(outlineLabel: string, numCoin: number, wPosStart: Vec3, wPosEnd: Vec3,
        cbReceiveFirstCon: CallableFunction, cbReceiveEachCoin: CallableFunction, cbEnd: CallableFunction = null) {
        // gen coin 3D
        let nCoin3D = this.GetNCoin();
        nCoin3D.setParent(this.nUIAnim);
        nCoin3D.active = true;
        await nCoin3D.getComponent(Coin3D).AnimCoinApear(0, outlineLabel, numCoin, wPosStart, wPosEnd, cbReceiveFirstCon, cbReceiveEachCoin);
        this.ReUseCoin(nCoin3D);
    }
    // #endregion OP coin 3D

    // #region OP ItemPrizeLobby
    @property(Prefab) pfItemPrizeLobby: Prefab;
    @property(Node) nTempItemPrizeLobby: Node;

    private GetNItemPrizeLobby(): Node {
        if (this.nTempItemPrizeLobby.children.length > 0) {
            return this.nTempItemPrizeLobby.children[0];
        } else {
            let nCoin = instantiate(this.pfItemPrizeLobby);
            nCoin.name = "ItemCustomSuper";
            nCoin.parent = this.nUIAnim;
            return nCoin;
        }
    }

    private ReUseNItemPrizeLobby(nItemCustomSuper: Node) {
        if (this == null) return;
        if (this.nTempItemPrizeLobby == null || !this.nTempItemPrizeLobby.isValid) return;
        if (nItemCustomSuper == null || !nItemCustomSuper.isValid) return;
        nItemCustomSuper.setParent(this.nTempItemPrizeLobby);
    }

    public async ReceivePrizeItem_1(iPrize: IPrize, wPosStart: Vec3, wPosEnd: Vec3, useLight: boolean = false) {
        // gen custom super item
        let nItemPrizeLobby: Node = this.GetNItemPrizeLobby();
        nItemPrizeLobby.setParent(this.nUIAnim);

        const itemPrizeLobbyCom = nItemPrizeLobby.getComponent(ItemPrizeLobby);

        itemPrizeLobbyCom.SetUp(iPrize, new Vec3(0, 0, 0), 1);
        if (useLight) itemPrizeLobbyCom.TurnOnLight();
        itemPrizeLobbyCom.PrepareAnim_Bezier(wPosStart);
        nItemPrizeLobby.active = true;

        const timeWaitAfterScale: number = 0.4;
        await itemPrizeLobbyCom.Anim_BezierMove(wPosEnd, timeWaitAfterScale);

        this.ReUseNItemPrizeLobby(nItemPrizeLobby);
    }
    // #endregion OP ItemPrizeLobby

    //#region OP Item
    @property(Node) nTempItem: Node;

    public GetNItem(): Node {
        if (this.nTempItem.children.length > 0) {
            return this.nTempItem.children[0];
        } else {
            let nCoin = new Node();
            nCoin.parent = this.nUIAnim;
            return nCoin;
        }
    }

    public ReUseNItem(nItem: Node) {
        if (this == null) return;
        if (this.nTempItem == null || !this.nTempItem.isValid) return;
        if (nItem == null || !nItem.isValid) return;
        nItem.setParent(this.nTempItem);
    }
    //#endregion OP Item

    //#region OP VFX flash
    @property(Prefab) pbVFXFlash: Prefab;
    @property(Node) nTempVFXFlash: Node;

    public GetNVFXFlash(): Node {
        if (this.nTempVFXFlash.children.length > 0) {
            return this.nTempVFXFlash.children[0];
        } else {
            let nVFXFlash = instantiate(this.pbVFXFlash);
            nVFXFlash.parent = this.nUIAnim;
            return nVFXFlash;
        }
    }

    public ReUseNVFXFlash(nVFXFlash: Node) {
        if (this == null) return;
        if (this.nTempVFXFlash == null || !this.nTempVFXFlash.isValid) return;
        if (nVFXFlash == null || !nVFXFlash.isValid) return;
        nVFXFlash.setParent(this.nTempVFXFlash);
    }

    public async PlayVFXFlash(wPosStart: Vec3) {
        let nVFXFlash = this.GetNVFXFlash();
        nVFXFlash.setParent(this.nUIAnim);
        nVFXFlash.setSiblingIndex(0);
        nVFXFlash.worldPosition = new Vec3(wPosStart.x, wPosStart.y, 1);
        nVFXFlash.active = true;
        const comParticle: ParticleSystem = nVFXFlash.getComponent(ParticleSystem);
        comParticle.play();
        await Utils.WaitReceivingDone(() => comParticle.isStopped);
        this.ReUseNVFXFlash(nVFXFlash);
    }

    //#endregion OP VFX flash
}


