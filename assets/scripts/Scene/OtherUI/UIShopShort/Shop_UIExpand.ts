/**
 * 
 * anhngoxitin01
 * Thu Oct 30 2025 15:59:27 GMT+0700 (Indochina Time)
 * Shop_UIExpand
 * db://assets/scripts/Scene/OtherUI/UIShopShort/Shop_UIExpand.ts
*
*/
import { _decorator, Component, instantiate, Label, Layout, Node, Prefab, UITransform } from 'cc';
import { InfoItemBundleStore, InfoPack } from '../../../Utils/Types';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { Shop_ItemPack } from '../UIShop/Shop_ItemPack';
import { DataHalloweenSys } from '../../../DataBase/DataHalloweenSys';
import { Shop_ItemCoin } from '../UIShop/Shop_ItemCoin';
import { ShowItemFromRighToLeft } from './ShowItemFromRighToLeft';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('Shop_UIExpand')
export class Shop_UIExpand extends Component {
    @property(Shop_ItemPack) listItemPack: Shop_ItemPack[] = [];
    @property(Shop_ItemCoin) listItemCoin: Shop_ItemCoin[] = [];
    @property(Label) lbFake: Label;

    private _listNItems: Node[] = [];

    public TrySetDataPacks(listPackInit: InfoPack[], dataPackCoin: InfoItemBundleStore[]) {
        let isUpdate: boolean = false;

        //  ========================= init packs  ========================= 
        const listDataPack: InfoPack[] = listPackInit;

        // duyệt danh sách các pack để kiểm tra xem có init được hay không
        for (let i = 0; i < listDataPack.length; i++) {
            const dataItemPack = listDataPack[i];

            // check pack is valid or not
            if (!FBInstantManager.Instance.checkHaveIAPPack_byProductID(dataItemPack.namePack)) {
                // console.log("can not pass this case 1", dataItemPack.namePack);
                continue;
            };

            //check pack was inited 
            if (this._listNItems.find(nItem => nItem.getComponent(Shop_ItemPack).GetIdPack() == dataItemPack.namePack) != null) {
                // console.log("can not pass this case 2", dataItemPack.namePack);
                continue;
            }

            // === set up data ===
            this.listItemPack[i].InitItemPack(dataItemPack, true);
            if (this._listNItems.length < 2) {
                this._listNItems.push(this.listItemPack[i].node);
            }
            isUpdate = true;
        }

        //  ========================= init coins  ========================= 
        // duyệt danh sách các pack để kiểm tra xem có init được hay không
        let listCoinCanInit = dataPackCoin.filter(item => FBInstantManager.Instance.checkHaveIAPPack_byProductID(item.idBundle));

        // find the width btn suit max
        let maxWidthText = 0;
        listCoinCanInit.forEach(item => {
            let priceText = FBInstantManager.Instance.getPriceIAPPack_byProductID(item.idBundle);
            priceText = priceText != null ? priceText : item.price.toString();
            this.lbFake.string = priceText;
            this.lbFake.updateRenderData(true);
            maxWidthText = Math.max(maxWidthText, this.lbFake.getComponent(UITransform).contentSize.width);
        })

        // set data
        listCoinCanInit.forEach((item, i) => {
            this.listItemCoin[i].SetUp(item, maxWidthText);
        })

        if (isUpdate) { this.node.getComponent(Layout).updateLayout() }
    }

    public UpdatePacks() {
        // in this case only has halloween
        if (this._listNItems.length > 0) {
            const packHalloween = this._listNItems.find(nPack => nPack.getComponent(Shop_ItemPack).InfoPack.type == 'HALLOWEEN');
            if (packHalloween != null) {
                const dataPackHalloweenNow = DataHalloweenSys.Instance.InfoPackHalloweenWorking;
                if (dataPackHalloweenNow == null) {
                    packHalloween.active = false;
                }
            }
        }
    }


    //===========================================================
    //#region anim
    public PrepareAnim() {
        for (const pack of this.listItemPack) {
            const comShopShow = pack.getComponent(ShowItemFromRighToLeft);
            if (comShopShow == null) { continue; }
            comShopShow.Prepare();
        }

        for (const coin of this.listItemCoin) {
            const comShopShow = coin.getComponent(ShowItemFromRighToLeft);
            if (comShopShow == null) { continue; }
            comShopShow.Prepare();
        }
    }

    public async PlayAnimShow() {
        const timeDelay = 0.1;
        for (const pack of this.listItemPack) {
            const comShopShow = pack.getComponent(ShowItemFromRighToLeft);
            if (comShopShow == null) { continue; }
            comShopShow.Play();
            await Utils.delay(timeDelay * 1000);
        }

        for (const coin of this.listItemCoin) {
            const comShopShow = coin.getComponent(ShowItemFromRighToLeft);
            if (comShopShow == null) { continue; }
            comShopShow.Play();
            await Utils.delay(timeDelay * 1000);
        }
    }
    //#endregion anim
    //===========================================================

}