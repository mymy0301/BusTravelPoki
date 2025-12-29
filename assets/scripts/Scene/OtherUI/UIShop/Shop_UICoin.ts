import { _decorator, Component, instantiate, Label, Node, Prefab, Size, UITransform } from 'cc';
import { ReadDataJson } from '../../../ReadDataJson';
import { Shop_ItemCoin } from './Shop_ItemCoin';
import { Shop_ItemCoinAds } from './Shop_ItemCoinAds';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../../../Common/ChangeSceneSys';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { MConfigs } from '../../../Configs/MConfigs';
import { ShowItemFromRighToLeft } from '../UIShopShort/ShowItemFromRighToLeft';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('Shop_UICoin')
export class Shop_UICoin extends Component {
    @property(Prefab) pfItemCoin: Prefab;
    @property(Prefab) pfItemEmptyCoin: Prefab;
    @property(Prefab) pfItemCoinAds: Prefab;
    @property(Prefab) pfItemCoinFree: Prefab;
    @property(Node) nLayout: Node;
    @property(Label) lbFake: Label;

    private _nItemCoinAds: Node = null;
    private _nItemCoinFree: Node = null;

    protected onEnable(): void {
        this.TryUpdateItemCoinAds();
    }

    public InitItems() {
        let dataPackCoin = Array.from(ReadDataJson.Instance.GetDataShop_Coins());

        // ================== init item coin free ===============
        let nItemCoinFree: Node = instantiate(this.pfItemCoinFree);
        this._nItemCoinFree = nItemCoinFree;
        nItemCoinFree.parent = this.nLayout;

        // ================== init coin ads ======================
        let nItemCoinAds: Node = instantiate(this.pfItemCoinAds);
        this._nItemCoinAds = nItemCoinAds;
        nItemCoinAds.parent = this.nLayout;
        nItemCoinAds.getComponent(Shop_ItemCoinAds).SetUp(ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.GAME ? 'game' : 'home');

        // =================== init item coin normal =============
        let numItemCanNotBuyIAP = 0;

        let listCoinCanInit = dataPackCoin.filter(item => FBInstantManager.Instance.checkHaveIAPPack_byProductID(item.idBundle));
        numItemCanNotBuyIAP = dataPackCoin.length - listCoinCanInit.length;
        numItemCanNotBuyIAP = numItemCanNotBuyIAP < MConfigs.LIMIT_ITEM_COIN_EMPTY ? numItemCanNotBuyIAP : MConfigs.LIMIT_ITEM_COIN_EMPTY;

        // find the width btn suit max
        let maxWidthText = 0;
        listCoinCanInit.forEach(item => {
            let priceText = FBInstantManager.Instance.getPriceIAPPack_byProductID(item.idBundle);
            priceText = priceText != null ? priceText : item.price.toString();
            this.lbFake.string = priceText;
            this.lbFake.updateRenderData(true);
            maxWidthText = Math.max(maxWidthText, this.lbFake.getComponent(UITransform).contentSize.width);
        })

        // console.log("maxWidthText", maxWidthText);

        listCoinCanInit.forEach(item => {
            let nItemCoin: Node = instantiate(this.pfItemCoin);
            nItemCoin.parent = this.nLayout;
            nItemCoin.getComponent(Shop_ItemCoin).SetUp(item, maxWidthText);
        })

        for (let i = 0; i < numItemCanNotBuyIAP; i++) {
            let nItemCoin: Node = instantiate(this.pfItemEmptyCoin);
            nItemCoin.parent = this.nLayout;
        }
    }

    public TryUpdateItemCoinAds() {
        if (this._nItemCoinAds == null) return;
        this._nItemCoinAds.getComponent(Shop_ItemCoinAds).UpdateManualUI();
    }

    public PrepareAnim() {
        this.node.children.forEach(pack => {
            const comAnim = pack.getComponent(ShowItemFromRighToLeft);
            if (comAnim != null) {
                comAnim.Prepare();
            }
        })
    }

    public async Play() {
        const timeDelay = 0.1;
        for (const pack of this.node.children) {
            const comAnim = pack.getComponent(ShowItemFromRighToLeft);
            if (comAnim != null) {
                comAnim.Play();
            }
            await Utils.delay(timeDelay * 1000);
        }
    }
}



