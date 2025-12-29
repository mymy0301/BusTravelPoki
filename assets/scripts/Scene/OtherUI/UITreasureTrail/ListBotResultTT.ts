/**
 * 
 * anhngoxitin01
 * Tue Aug 19 2025 10:07:13 GMT+0700 (Indochina Time)
 * ListBotResultTT
 * db://assets/scripts/Scene/OtherUI/UITreasureTrail/ListBotResultTT.ts
*
*/
import { _decorator, Component, instantiate, Node, Pool, Prefab, Size, SpriteFrame, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { InfoBot_TreasureTrail } from '../../../Utils/Types';
import { PoolLobbySys } from '../../LobbyScene/PoolLobbySys';
import { AvatarTT } from '../UITreasureTrailPrepare/AvatarTT';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;
const KEY_POOL_BOT = "KEY_POOL_BOT_RESULT";

@ccclass('ListBotResultTT')
export class ListBotResultTT extends Component {
    @property(Prefab) pfBot: Prefab;
    @property(SpriteFrame) sfBotAva: SpriteFrame;
    private _listBot: Node[] = [];

    //==========================================
    //#region base
    public RegisterPoolItem() {
        if (PoolLobbySys.Instance != null && !PoolLobbySys.Instance.IsRegisterPool(KEY_POOL_BOT)) {
            // console.log("call register pool");
            const newPool = new Pool<Node>(() => instantiate(this.pfBot), 0)
            PoolLobbySys.Instance.RegisterPool(KEY_POOL_BOT, newPool);
        }
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    private async ShowEachAvatar() {
        const timePauseEachAvatar = 0.1;
        const timeScaleItem = 0.2;
        for (let i = 0; i < this._listBot.length; i++) {
            const nPlayer = this._listBot[i];
            nPlayer.getComponent(UIOpacity).opacity = 0;
            const scaleBase = nPlayer.scale.clone();
            nPlayer.scale = Vec3.ZERO;
            nPlayer.active = true;
            tween(nPlayer)
                .to(timeScaleItem, { scale: scaleBase.clone().add3f(0.1, 0.1, 0.1) }, {
                    easing: 'bounceOut', onUpdate(target, ratio) {
                        nPlayer.getComponent(UIOpacity).opacity = 255 * ratio;
                    },
                })
                .to(0.1, { scale: scaleBase })
                .start();
            await Utils.delay(timePauseEachAvatar * 1000);
        }
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    /**
     * Hãy nhớ rằng danh sách này ko bao gồm player
     * @param listInfoBot 
     */
    public InitBot(listInfoBotExcludePlayer: InfoBot_TreasureTrail[]) {
        const numPlayerInit = listInfoBotExcludePlayer.length;

        // init node
        listInfoBotExcludePlayer.forEach(infoBot => {
            // init bot and active it false
            const nItem: Node = PoolLobbySys.Instance.GetItemFromPool(KEY_POOL_BOT);
            nItem.setParent(this.node);
            nItem.getComponent(AvatarTT).SetUp(this.sfBotAva, infoBot.avatar);
            nItem.getComponent(UIOpacity).opacity = 0;
            this._listBot.push(nItem);
        })

        // init the list WPosSuitWithEachPlayer
        const player_numItemTotal = listInfoBotExcludePlayer.length;
        const player_FixCol = 5;
        const player_distanceX_layout = 20;
        const player_distanceY_layout = 20;
        const player_sizeItem: Size = this._listBot[0].getComponent(UITransform).contentSize.clone();
        const player_WPosRoot = this.node.worldPosition.clone();
        let listWPosSuitWithEachPlayer: Vec3[] = GetListWPosSuit(player_numItemTotal, player_FixCol, player_distanceX_layout, player_distanceY_layout, player_sizeItem, player_WPosRoot);
        for (let i = 0; i < numPlayerInit; i++) {
            this._listBot[i].worldPosition = listWPosSuitWithEachPlayer[i];
        }
    }

    public ReUseAllData() {
        PoolLobbySys.Instance.PoolListItems(this._listBot, KEY_POOL_BOT);
        this._listBot = [];
    }

    public async ShowListPlayer() {
        await this.ShowEachAvatar();
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

function GetListWPosSuit(numberItem: number, fixCol: number, distanceX: number, distanceY: number, sizeItem: Size, WPosRoot: Vec3): Vec3[] {
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
        const y = WPosRoot.y - sizeItem.height / 2 - i * (sizeItem.height + distanceY);
        listVec3Row.forEach((wPos) => {
            wPos.y = y;
        })
        numberItem -= fixCol;
        result.push(...listVec3Row);
    }

    return result;
}