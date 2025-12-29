import { _decorator, Component, instantiate, Layout, Node, Prefab, Size, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { ItemPlayerInviteFriend } from './ItemPlayerInviteFriend';
import { Utils } from '../../../Utils/Utils';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { IPrize, TYPE_ITEM, TYPE_PRIZE } from '../../../Utils/Types';
import { LifeSys2 } from '../../LifeSys2';
import { ItemPrizeLobby } from '../UIReceivePrize/ItemPrizeLobby';
import { CurrencySys } from '../../CurrencySys';
import { UIPageHomeSys } from '../../LobbyScene/PageSys/UIPageHomeSys';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../Others/AutoScale/TypeAutoScale';
const { ccclass, property } = _decorator;

@ccclass('UIReceivePrizeInviteFriend')
export class UIReceivePrizeInviteFriend extends Component {
    @property(Prefab) pfPlayer: Prefab;
    @property(Prefab) pfPrize: Prefab;
    @property(Node) nLayoutPlayer: Node;
    @property(Node) nLayoutPrize: Node;
    @property(Node) nTapToClaim: Node;

    @property(Node) nTitlePlayer: Node;
    @property(Node) nTitlePrize: Node;

    @property(Node) nTempPlayer: Node;
    @property(Node) nTempPrize: Node;

    @property(Node) nBgBlack: Node;

    private _callBackShowUIInviteFriend: CallableFunction = null;
    private _dataShow: { listIdPlayer: IDataPlayer_LEADERBOARD[], listPrize: IPrize[] } = null;

    public SetUpCallBackShowUIInviteFriend(callback: CallableFunction) { this._callBackShowUIInviteFriend = callback; }

    public async ShowPlayer(data: { listIdPlayer: IDataPlayer_LEADERBOARD[], listPrize: IPrize[] }) {
        this._dataShow = data;
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        this.nLayoutPlayer.getComponent(UIOpacity).opacity = 0;

        // hide UIItem
        this.nTitlePlayer.active = false;
        this.nTitlePrize.active = false;
        this.nTapToClaim.active = false;
        this.nLayoutPrize.active = false;

        this.nLayoutPlayer.active = true;

        // set up for bg
        this.nBgBlack.active = true;
        this.nBgBlack.getComponent(UIOpacity).opacity = 0;
        this.ShowShadowWithOpacity();

        // init player
        for (let i = 0; i < data.listIdPlayer.length; i++) {
            let nPlayer: Node = this.GetNode(this.nTempPlayer, this.pfPlayer);
            nPlayer.setParent(this.nLayoutPlayer);
            nPlayer.getComponent(ItemPlayerInviteFriend).SetUp(data.listIdPlayer[i]);
            nPlayer.getComponent(UIOpacity).opacity = 0;
        }

        // init the list WPosSuitWithEachPlayer
        const player_numItemTotal = data.listIdPlayer.length;
        const player_FixCol = 5;
        const player_distanceX_layout = 25;
        const player_distanceY_layout = 25;
        const player_sizeItem: Size = this.nLayoutPlayer.children[0].getComponent(UITransform).contentSize;
        const player_WPosRoot = this.nLayoutPlayer.worldPosition.clone();
        let listWPosSuitWithEachPlayer: Vec3[] = GetListPosSuit(player_numItemTotal, player_FixCol, player_distanceX_layout, player_distanceY_layout, player_sizeItem, player_WPosRoot);
        for (let i = 0; i < data.listIdPlayer.length; i++) {
            this.nLayoutPlayer.children[i].worldPosition = listWPosSuitWithEachPlayer[i];
        }

        await Utils.delay(0.5 * 1000);

        // show UI Suit
        this.nTitlePlayer.active = true;

        //  show the avatar player
        // set all the nPrize and nPlayer lower than right Pos = 50 with opacity = 0
        this.nLayoutPlayer.children.forEach(element => {
            element.getComponent(UIOpacity).opacity = 0;
        })
        this.nLayoutPlayer.getComponent(UIOpacity).opacity = 255;
        await this.ShowEachAvatar();
        await Utils.delay(0.3 * 1000);
        // show btn claim and register receive prize
        this.nTapToClaim.active = true;
        this.nBgBlack.on(Node.EventType.TOUCH_END, this.ShowUIReceivePrize, this);

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }

    private async ShowUIReceivePrize() {
        const data = this._dataShow;

        this.ReusedAllNodeChild(this.nLayoutPlayer, this.nTempPlayer);

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        this.nBgBlack.off(Node.EventType.TOUCH_END, this.ShowUIReceivePrize, this);
        this.nLayoutPrize.getComponent(UIOpacity).opacity = 0;

        // hide UIItem
        this.nTitlePlayer.active = false;
        this.nTitlePrize.active = false;
        this.nTapToClaim.active = false;
        this.nLayoutPlayer.active = false;

        this.nLayoutPrize.active = true;

        // get node of prize
        let nPrize = this.GetNode(this.nTempPrize, this.pfPrize);

        // init the list WPosSuitWithEachPrize
        const prize_numItemTotal = data.listPrize.length;
        const prize_FixCol = 5;
        const prize_distanceX_layout = 25;
        const prize_distanceY_layout = 25;
        const prize_sizeItem: Size = nPrize.getComponent(UITransform).contentSize;
        const prize_WPosRoot = this.nLayoutPrize.worldPosition.clone();
        let listWPosSuitWithEachPrize: Vec3[] = GetListPosSuit(prize_numItemTotal, prize_FixCol, prize_distanceX_layout, prize_distanceY_layout, prize_sizeItem, prize_WPosRoot);
        nPrize.destroy();

        // init prize
        for (let i = 0; i < data.listPrize.length; i++) {
            let nPrize: Node = this.GetNode(this.nTempPrize, this.pfPrize);
            nPrize.scale = new Vec3(1.4, 1.4, 1.4);
            nPrize.setParent(this.nLayoutPrize);
            nPrize.setWorldPosition(listWPosSuitWithEachPrize[i]);
            nPrize.getComponent(ItemPrizeLobby).SetUp(data.listPrize[i], nPrize.position.clone());
            nPrize.getComponent(ItemPrizeLobby).TurnOnLight();
            nPrize.active = true;
        }

        // show UI Suit
        this.nTitlePrize.active = true;

        //============== way 1 to scale prize =============
        // const distanceY = -50;
        // this.nLayoutPrize.children.forEach((node) => {
        //     node.getComponent(UIOpacity).opacity = 0;
        //     const posNode = node.position.clone();
        //     node.position = posNode.add3f(0, distanceY, 0);
        // });

        // this.nLayoutPrize.getComponent(UIOpacity).opacity = 255;

        // const timeAnimPlayerAndPrize = 0.3;
        // this.nLayoutPrize.children.forEach((node) => {
        //     const basePos = node.position.clone();
        //     tween(node)
        //         .to(timeAnimPlayerAndPrize, { position: basePos.add3f(0, -distanceY, 0) }, {
        //             onUpdate(target, ratio) {
        //                 node.getComponent(UIOpacity).opacity = 255 * ratio;
        //             },
        //         })
        //         .start();
        // })

        // await Utils.delay(timeAnimPlayerAndPrize * 1000);

        // ============== way 2 to scale prize =============
        await this.ShowEachPrize();

        // show btn claim and register receive prize
        this.nTapToClaim.active = true;
        this.nBgBlack.on(Node.EventType.TOUCH_END, this.ReceivePrize, this);

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }

    private async ReceivePrize_2() {
        this.nBgBlack.off(Node.EventType.TOUCH_END, this.ReceivePrize, this);

        // hide all anything not usedfull
        this.nLayoutPlayer.active = false;
        this.nTitlePlayer.active = false;
        this.nTitlePrize.active = false;
        this.nTapToClaim.active = false;


        for (let i = 0; i < this.nLayoutPrize.children.length; i++) {
            let node = this.nLayoutPrize.children[i];
            const amountPrize = node.getComponent(ItemPrizeLobby).getValueItem();
            node.active = false;
            CurrencySys.Instance.AddMoney(amountPrize, "UIInviteFriend", false);
        }

        this.nBgBlack.active = false;
        this.nLayoutPrize.active = false;
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);

        if (this._callBackShowUIInviteFriend != null) {
            this._callBackShowUIInviteFriend();
        }

        // reUsed Node
        this.ReusedAllNodeChild(this.nLayoutPrize, this.nTempPrize);
    }

    private async ReceivePrize() {
        let canNextLogic = false;
        this.nBgBlack.off(Node.EventType.TOUCH_END, this.ReceivePrize, this);

        // get all the wPosNeed Move to prize
        let wPosTicket, wPosCoin, wPosBtnPlay;

        canNextLogic = false;
        clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_BTN_PLAY, (wPosBtnPlay: Vec3) => {
            canNextLogic = true;
            wPosBtnPlay = wPosBtnPlay;
        })
        await Utils.WaitReceivingDone(() => { return canNextLogic })

        canNextLogic = false;
        clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_COIN, (wPosUICoin: Vec3) => {
            canNextLogic = true;
            wPosCoin = wPosUICoin;
        })
        await Utils.WaitReceivingDone(() => { return canNextLogic })

        canNextLogic = false;
        clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_TICKET, (wPosUITicket: Vec3) => {
            canNextLogic = true;
            wPosTicket = wPosUITicket;
        })
        await Utils.WaitReceivingDone(() => { return canNextLogic })



        // hide all anything not usedfull
        this.nLayoutPlayer.active = false;
        this.nTitlePlayer.active = false;
        this.nTitlePrize.active = false;
        this.nTapToClaim.active = false;

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        this.HideShadowWithOpacity();
        // move the prize
        const timeMoveToEndPos = 0.6;
        const timeDelayEachItem = 0.1;
        for (let i = 0; i < this.nLayoutPrize.children.length; i++) {
            let node = this.nLayoutPrize.children[i];
            let wPosEnd: Vec3 = Vec3.ZERO;
            const typeReceivePrize = node.getComponent(ItemPrizeLobby).getTypeReceivePrize();
            const amountPrize = node.getComponent(ItemPrizeLobby).getValueItem();
            const typePrize = node.getComponent(ItemPrizeLobby).getType();
            switch (typePrize) {
                case TYPE_PRIZE.TICKET:
                    wPosEnd = wPosTicket;
                    break;
                case TYPE_PRIZE.MONEY:
                    wPosEnd = wPosCoin;
                    break;
                default:
                    wPosEnd = wPosBtnPlay;
                    break;
            }

            tween(node)
                .to(timeMoveToEndPos, { worldPosition: wPosEnd })
                .call(() => {
                    switch (typePrize) {
                        case TYPE_PRIZE.TICKET: case TYPE_PRIZE.MONEY:
                            CurrencySys.Instance.AddMoney(amountPrize, "UIInviteFriend", false);
                            break;
                        default:
                            clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.BTN_PLAY_LOBBY);
                            break;
                    }
                })
                .call(() => {
                    node.active = false;
                })
                .start();

            await Utils.delay(timeDelayEachItem * 1000);
        }

        this.nBgBlack.active = false;
        this.nLayoutPrize.active = false;
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);

        if (this._callBackShowUIInviteFriend != null) {
            this._callBackShowUIInviteFriend();
        }

        // reUsed Node
        this.ReusedAllNodeChild(this.nLayoutPrize, this.nTempPrize);
    }

    private ShowShadowWithOpacity() {
        const timeRaiseShadow = 0.5;
        const self = this;
        tween(this.nBgBlack)
            .to(timeRaiseShadow, {}, {
                onUpdate(target, ratio) {
                    self.nBgBlack.getComponent(UIOpacity).opacity = 180 * ratio;
                },
            })
            .call(() => {
                self.nBgBlack.getComponent(UIOpacity).opacity = 180;
            })
            .start();
    }

    private HideShadowWithOpacity(timeCustom: number = 0.5) {
        const timeRaiseShadow = timeCustom;
        const self = this;
        tween(this.nBgBlack)
            .to(timeRaiseShadow, {}, {
                onUpdate(target, ratio) {
                    self.nBgBlack.getComponent(UIOpacity).opacity = 180 * (1 - ratio);
                },
            })
            .call(() => {
                self.nBgBlack.getComponent(UIOpacity).opacity = 0;
            })
            .start();
    }

    //#region self func
    private GetNode(nSaveTemp: Node, prefabNode: Prefab): Node {
        if (nSaveTemp.children.length == 0) {
            return instantiate(prefabNode);
        } else {
            let nChoice = nSaveTemp.children[nSaveTemp.children.length - 1];
            nChoice.setParent(null);
            return nChoice;
        }
    }

    private ReusedAllNodeChild(nLayout: Node, nTemp: Node) {
        const length = nLayout.children.length;
        for (let i = length - 1; i >= 0; i--) {
            let nReused = nLayout.children[i];
            nReused.active = false;
            nReused.setParent(nTemp);
        }
    }
    //#endregion self func

    //#region ShowEachAvatar
    private async ShowEachAvatar() {
        const timePauseEachAvatar = 0.1;
        const timeScaleItem = 0.2;
        for (let i = 0; i < this.nLayoutPlayer.children.length; i++) {
            const nPlayer = this.nLayoutPlayer.children[i];
            nPlayer.getComponent(UIOpacity).opacity = 0;
            const scaleBase = nPlayer.scale.clone();
            nPlayer.scale = Vec3.ZERO;
            nPlayer.active = true;
            tween(this.nLayoutPlayer.children[i])
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

    private async ShowEachPrize() {
        const timeShowItem = 0.7;
        const distanceY = -50;
        const opacityLayout = this.nLayoutPrize.getComponent(UIOpacity);
        // prepare before show prize
        opacityLayout.opacity = 0;
        const basePosLayoutPrize = this.nLayoutPrize.position.clone();
        this.nLayoutPrize.position = basePosLayoutPrize.clone().add3f(0, distanceY, 0);

        tween(this.nLayoutPrize)
            .to(timeShowItem, { position: basePosLayoutPrize }, {
                easing: 'sineIn', onUpdate(target, ratio) {
                    opacityLayout.opacity = 255 * ratio;
                }
            })
            .start();

        await Utils.delay(timeShowItem * 1000);
    }
    //#endregion ShowEachAvatar
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


