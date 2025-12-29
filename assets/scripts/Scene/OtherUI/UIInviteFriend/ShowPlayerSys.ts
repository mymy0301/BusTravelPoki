import { _decorator, Component, Node, Prefab, Size, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { ObjectPool } from '../../../Utils/ObjPool';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { IPrize } from '../../../Utils/Types';
import { ItemPlayerInviteFriend } from './ItemPlayerInviteFriend';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('ShowPlayerSys')
export class ShowPlayerSys extends Component {
    @property(Prefab) pfPlayer: Prefab;
    @property(Prefab) pfLbNamePlayer: Prefab;
    @property(Node) nTempPlayer: Node;
    @property(Node) nTempNamePlayer: Node;
    @property(Node) nTapToClaim: Node;
    @property(Node) nLayoutPlayer: Node;
    @property(Node) nLayoutNamePlayer: Node;
    @property(Node) nLbTitle: Node;

    private mObjPoolPlayer: ObjectPool = new ObjectPool();
    private mObjPoolNamePlayer: ObjectPool = new ObjectPool();

    protected onLoad(): void {
        this.mObjPoolPlayer.InitObjectPool(this.nTempPlayer, this.pfPlayer, this.nTempPlayer);
        this.mObjPoolNamePlayer.InitObjectPool(this.nTempNamePlayer, this.pfLbNamePlayer, this.nTempNamePlayer);
    }

    // #region object pool
    public InitObject_P(): Node {
        return this.mObjPoolPlayer.GetObj();
    }

    public InitObject_LbP(): Node {
        return this.mObjPoolNamePlayer.GetObj();
    }

    public ReUseObject_P(objReUse: Node) {
        if (!this.nTempPlayer.isValid) return;
        objReUse.active = false;
        this.mObjPoolPlayer.ReUseObj4(objReUse);
    }

    public ReUseObject_LbP(objReUse: Node) {
        if (!this.nTempNamePlayer.isValid) return;
        objReUse.active = false;
        this.mObjPoolNamePlayer.ReUseObj4(objReUse);
    }

    public AutoReUseAllDataHave() {
        this.nLayoutPlayer.children.forEach((objReUse) => this.ReUseObject_P(objReUse));
        this.nLayoutNamePlayer.children.forEach((objReUse) => this.ReUseObject_LbP(objReUse));
    }
    // #endregion object pool

    //#region btn
    private _logicContinue: boolean = false;
    private OnTapToContinue() {
        this._logicContinue = true;
    }
    //#endregion btn

    public async ShowPlayer(data: { listIdPlayerNew: IDataPlayer_LEADERBOARD[], listPrize: IPrize[] }) {
        this._logicContinue = false;

        // hide UIItem
        this.nTapToClaim.active = false;

        this.nLbTitle.active = true;

        let numPlayerInit = data.listIdPlayerNew.length > 20 ? 20 : data.listIdPlayerNew.length;

        // init player
        for (let i = 0; i < numPlayerInit; i++) {
            let nPlayer: Node = this.InitObject_P();
            nPlayer.setParent(this.nLayoutPlayer);
            nPlayer.getComponent(ItemPlayerInviteFriend).SetUp(data.listIdPlayerNew[i]);
            nPlayer.getComponent(UIOpacity).opacity = 0;
        }

        //init namePlayer
        for (let i = 0; i < numPlayerInit; i++) {
            let nNamePlayer: Node = this.InitObject_LbP();
            nNamePlayer.setParent(this.nLayoutNamePlayer);
            nNamePlayer.getComponent(UIOpacity).opacity = 0;
        }

        // init the list WPosSuitWithEachPlayer
        const player_numItemTotal = numPlayerInit;
        const player_FixCol = 4;
        const player_distanceX_layout = 50;
        const player_distanceY_layout = 50;
        const player_sizeItem: Size = this.nLayoutPlayer.children[0].getComponent(UITransform).contentSize;
        const player_WPosRoot = this.nLayoutPlayer.worldPosition.clone();
        let listWPosSuitWithEachPlayer: Vec3[] = GetListPosSuit(player_numItemTotal, player_FixCol, player_distanceX_layout, player_distanceY_layout, player_sizeItem, player_WPosRoot);
        for (let i = 0; i < numPlayerInit; i++) {
            this.nLayoutPlayer.children[i].worldPosition = listWPosSuitWithEachPlayer[i];
            this.nLayoutNamePlayer.children[i].worldPosition = listWPosSuitWithEachPlayer[i];
        }

        await Utils.delay(0.5 * 1000);

        //  show the avatar player
        // set all the nPrize and nPlayer lower than right Pos = 50 with opacity = 0
        this.nLayoutPlayer.children.forEach(element => {
            element.getComponent(UIOpacity).opacity = 0;
        })
        this.nLayoutNamePlayer.children.forEach(element => {
            element.getComponent(UIOpacity).opacity = 0;
        })
        await this.ShowEachAvatar();
        await Utils.delay(0.3 * 1000);
        // show btn claim and register receive prize
        this.nTapToClaim.active = true;

        await Utils.WaitReceivingDone(() => this._logicContinue);

        this.nTapToClaim.active = false;
        this.nLbTitle.active = false;
    }

    private async ShowEachAvatar() {
        const timePauseEachAvatar = 0.1;
        const timeScaleItem = 0.2;
        for (let i = 0; i < this.nLayoutPlayer.children.length; i++) {
            const nPlayer = this.nLayoutPlayer.children[i];
            const nNamePlayer = this.nLayoutNamePlayer.children[i];
            nPlayer.getComponent(UIOpacity).opacity = 0;
            nNamePlayer.getComponent(UIOpacity).opacity = 0;
            const scaleBase = nPlayer.scale.clone();
            nPlayer.scale = Vec3.ZERO;
            nNamePlayer.scale = Vec3.ZERO;
            nPlayer.active = true;
            nNamePlayer.active = true;
            tween(nPlayer)
                .to(timeScaleItem, { scale: scaleBase.clone().add3f(0.1, 0.1, 0.1) }, {
                    easing: 'bounceOut', onUpdate(target, ratio) {
                        nPlayer.getComponent(UIOpacity).opacity = 255 * ratio;
                    },
                })
                .to(0.1, { scale: scaleBase })
                .start();
            tween(nNamePlayer)
                .to(timeScaleItem, { scale: scaleBase.clone().add3f(0.1, 0.1, 0.1) }, {
                    easing: 'bounceOut', onUpdate(target, ratio) {
                        nNamePlayer.getComponent(UIOpacity).opacity = 255 * ratio;
                    },
                })
                .to(0.1, { scale: scaleBase })
                .start();
            await Utils.delay(timePauseEachAvatar * 1000);
        }
    }
}


function GetListPosSuit(numberItem: number, fixCol: number, distanceX: number, distanceY: number, sizeItem: Size, WPosRoot: Vec3): Vec3[] {
    let result: Vec3[] = [];
    function getListPosEachRow(indexRow: number, totalItem: number): Vec3[] {
        let listWPosThisRow: Vec3[] = [];
        for (let i = 0; i < totalItem; i++) {
            const x = (i - (totalItem - 1) / 2) * (sizeItem.width + distanceX) + WPosRoot.x;
            let wPosItem: Vec3 = new Vec3(x, WPosRoot.y, 0);
            listWPosThisRow.push(wPosItem);
        }
        return listWPosThisRow;
    }

    // split row
    let numRow = Math.ceil(numberItem / fixCol);
    for (let i = 0; i < numRow; i++) {
        let numberItemThisRow = numberItem - fixCol > 0 ? fixCol : numberItem;
        let listVec3Row = getListPosEachRow(i, numberItemThisRow);
        const y = ((numRow - 1) / 2 - i) * (sizeItem.height + distanceY) + WPosRoot.y;
        listVec3Row.forEach((wPos) => {
            wPos.y = y;
        })
        numberItem -= fixCol;
        result.push(...listVec3Row);
    }

    return result;
}


