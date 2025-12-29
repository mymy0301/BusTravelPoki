import { _decorator, Component, instantiate, Layout, Node, Pool, Prefab, tween, UIOpacity, Vec3 } from 'cc';
import { Utils } from '../../../Utils/Utils';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { IPrize, TYPE_CURRENCY, TYPE_PRIZE } from '../../../Utils/Types';
import { ItemPrizeLobby } from '../UIReceivePrize/ItemPrizeLobby';
import { CurrencySys } from '../../CurrencySys';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../Others/AutoScale/TypeAutoScale';
const { ccclass, property } = _decorator;

@ccclass('UIReceivePrizePopupLevelPass')
export class UIReceivePrizePopupLevelPass extends Component {
    @property(Prefab) prefabItemPrize: Prefab = null;
    @property(Node) bgBlack: Node;
    @property(Node) nLbTapToClaim: Node;
    // @property(Sprite) spLabelTile: Sprite;
    @property(Node) nLayout: Node;
    @property(Node) nTemp: Node;

    @property({ group: 'NodeLocation', type: Node }) nStartItem: Node;
    @property({ group: 'NodeLocation', type: Node }) nEndItemReceiveOtherPrize: Node;

    private _poolItem: Pool<Node> = null;
    private _listItem: Node[] = [];

    protected onLoad(): void {
        this._poolItem = new Pool(() => instantiate(this.prefabItemPrize), 0);
    }

    //#region self func

    private ShowShadowWithOpacity() {
        this.bgBlack.active = true;
        this.bgBlack.getComponent(UIOpacity).opacity = 0;
        const timeRaiseShadow = 0.5;
        const self = this;
        tween(this.bgBlack)
            .to(timeRaiseShadow, {}, {
                onUpdate(target, ratio) {
                    self.bgBlack.getComponent(UIOpacity).opacity = 200 * ratio;
                },
            })
            .call(() => {
                self.bgBlack.getComponent(UIOpacity).opacity = 200;
            })
            .start();
    }

    private HideShadowWithOpacity() {
        this.bgBlack.active = true;
        this.bgBlack.getComponent(UIOpacity).opacity = 200;
        const timeRaiseShadow = 0.5;
        const self = this;
        tween(this.bgBlack)
            .to(timeRaiseShadow, {}, {
                onUpdate(target, ratio) {
                    self.bgBlack.getComponent(UIOpacity).opacity = 200 * (1 - ratio);
                },
            })
            .call(() => {
                self.bgBlack.getComponent(UIOpacity).opacity = 0;
                self.bgBlack.active = false;
            })
            .start();
    }

    private GetListWPosSuitForNumItems(numItems: number, speDisY: number = 0): Vec3[] {
        const distanceItemY = 150;
        const distanceItemX = 130;
        const diffHigher123 = 300;
        const diffHigherDefault = 100;
        const sizeWindow = Utils.getSizeWindow();
        const halfWidthScreen = sizeWindow.x / 2;
        const halfHeight = sizeWindow.y / 2;
        switch (numItems) {
            case 1:
                return [new Vec3(halfWidthScreen, halfHeight + diffHigher123 + speDisY, 0)];
            case 2:
                return [new Vec3(halfWidthScreen - 80, halfHeight + diffHigher123 + speDisY, 0), new Vec3(halfWidthScreen + 80, halfHeight + diffHigher123 + speDisY, 0)];
            case 3:
                return [new Vec3(halfWidthScreen - 120, halfHeight + diffHigher123 - 50 + speDisY, 0), new Vec3(halfWidthScreen, halfHeight + diffHigher123 + speDisY, 0), new Vec3(halfWidthScreen + 120, halfHeight + diffHigher123 - 50 + speDisY, 0)];
            default:
                let result = [];
                const defaultColumnEachRow = 4;
                const numRow = Math.floor(numItems / defaultColumnEachRow);

                function addWPosToResult(lengthColumn: number, wPosY: number) {
                    let diff = distanceItemX / 2;
                    for (let i = 0; i < lengthColumn; i++) {
                        let wPos = new Vec3(halfWidthScreen + distanceItemX * (i - lengthColumn / 2.0) + diff, wPosY + speDisY, 0);
                        result.push(wPos);
                    }
                }

                for (let indexRow = 0; indexRow < numRow; indexRow++) {
                    const wPosY = halfHeight + diffHigherDefault + (numRow - indexRow) * distanceItemY;
                    // in case normal row just use formula 
                    addWPosToResult(defaultColumnEachRow, wPosY);
                }
                // check is last row
                if (numItems % defaultColumnEachRow != 0) {
                    const wPosY = halfHeight + diffHigherDefault;
                    addWPosToResult(numItems % 4, wPosY);
                }
                return result;
        }
    }

    private async onBtnClaim() {
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);

        this.nLbTapToClaim.active = false;
        this.nLayout.getComponent(Layout).enabled = false;
        // this.spLabelTile.node.active = false;
        this.HideShadowWithOpacity();

        const self = this;

        function ReUseObj(nSave: Node) {
            nSave.scale = Vec3.ONE;
            nSave.setParent(self.nTemp);
            nSave.active = false;
            self._poolItem.free(nSave);
        }

        // anim move the list item to the right place
        const timeDelayEachItem = 0.1;
        for (let i = 0; i < this._listItem.length; i++) {
            const itemPrize = this._listItem[i];
            const itemCom = itemPrize.getComponent(ItemPrizeLobby);
            let wPosEnd = this.nEndItemReceiveOtherPrize.worldPosition.clone();

            function EmitToAfterAnim(itemCom: ItemPrizeLobby) {
                const numItem = itemCom.getValueItem();
                switch (itemCom.getType()) {
                    case TYPE_PRIZE.TICKET:
                        CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.TICKET, numItem);
                        break;
                    case TYPE_PRIZE.MONEY:
                        CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numItem);
                        break;
                    default:
                        clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.BTN_PLAY_LOBBY);
                        break;
                }
            }

            // move item to the right place
            if (i == this._listItem.length - 1) {
                await itemCom.MoveItemToPlaceEnd(wPosEnd.clone(), ReUseObj);
                EmitToAfterAnim(itemCom);
            } else {
                (async () => {
                    await itemCom.MoveItemToPlaceEnd(wPosEnd.clone(), ReUseObj);
                    EmitToAfterAnim(itemCom);
                })();
                await Utils.delay(timeDelayEachItem * 1000);
            }
        }

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
    }

    //#endregion self func

    //#region public func
    public async ReceivePrize(listPrize: IPrize[]) {
        /**
         * logic show the back ground
         * move the item from middle to the higher middle scene
         */

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);

        // this.spLabelTile.node.active = true;
        this.nLayout.getComponent(Layout).enabled = true;
        this.nLbTapToClaim.active = true;
        this.ShowShadowWithOpacity();

        // ======================= gen item =======================
        let listBaseWPos: Vec3[] = this.GetListWPosSuitForNumItems(listPrize.length);
        this._listItem = [];

        // gen all item 
        for (let i = 0; i < listPrize.length; i++) {
            const dataPrize = listPrize[i];
            let itemPrize = this.GetItemFromPool();
            itemPrize.active = false;
            itemPrize.setParent(this.nLayout, true);
            itemPrize.getComponent(ItemPrizeLobby).SetUp(dataPrize, listBaseWPos[i]);
            this._listItem.push(itemPrize);
        }
        const rootWPos = this.nStartItem.worldPosition.clone();
        for (let i = 0; i < this._listItem.length; i++) {
            const itemPrize = this._listItem[i];
            itemPrize.worldPosition = rootWPos;
        }

        // ======================= anim item =======================
        this.nLayout.getComponent(Layout).updateLayout(true);
        this.nLayout.getComponent(Layout).enabled = false;
        const timeAnimMoveToBaseWPos = 0.4;
        const timeDelayEachItem = 0.01;
        for (let i = 0; i < this._listItem.length; i++) {
            const itemPrize = this._listItem[i];
            const wPosItem = itemPrize.worldPosition.clone();
            itemPrize.active = true;
            if (i == this._listItem.length - 1) {
                await itemPrize.getComponent(ItemPrizeLobby).MoveToBaseWPos(wPosItem, timeAnimMoveToBaseWPos);
            } else {
                itemPrize.getComponent(ItemPrizeLobby).MoveToBaseWPos(wPosItem, timeAnimMoveToBaseWPos);
                await Utils.delay(timeDelayEachItem * 1000);
            }
        }

        // wait until click bg
        await new Promise<void>(async (resolve) => {
            const self = this;
            async function btnListener() {
                self.bgBlack.off(Node.EventType.TOUCH_END, btnListener, self);

                //turn off label 
                self.nLbTapToClaim.active = false;

                // active button
                await self.onBtnClaim();
                resolve();
            }
            self.bgBlack.on(Node.EventType.TOUCH_END, btnListener, self);
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
        });

    }

    //#endregion public func

    //#region func pool
    private GetItemFromPool(): Node {
        if (this.nTemp.children.length > 0) {
            return this.nTemp.children[this.nTemp.children.length - 1];
        } else {
            return this._poolItem.alloc();
        }
    }
}


