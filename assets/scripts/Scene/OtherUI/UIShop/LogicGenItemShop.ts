import { _decorator, CCFloat, Component, instantiate, Layout, Node, Prefab, Sprite, SpriteFrame, UITransform, Vec2 } from 'cc';
import { Shop_UIPacks } from './Shop_UIPacks';
import { Shop_UICoin } from './Shop_UICoin';
import { Shop_UITicket } from './Shop_UITicket';
import { Shop_UIDailyQuest } from './Shop_UIDailyQuest';
import { instanceOfDataPageViewShop, PAGE_VIEW_SHOP, PAGE_VIEW_SHOP_2 } from './TypeShop';
import { MConfigs } from '../../../Configs/MConfigs';
import { ENamePACK_UNLIMITED, EnumNamePack, InfoItemBundleStore, InfoPack } from '../../../Utils/Types';
import { DataPackSys } from '../../../DataBase/DataPackSys';
import { ReadDataJson } from '../../../ReadDataJson';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { DataHalloweenSys } from '../../../DataBase/DataHalloweenSys';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { MConst } from '../../../Const/MConst';

const { ccclass, property } = _decorator;

@ccclass('LogicGenItemShop')
export class LogicGenItemShop {
    // add prefab in here
    @property(Prefab) nPFPack: Prefab;
    @property(Prefab) nPFDailyQuest: Prefab;
    @property(Prefab) nPFCoin: Prefab;
    @property(Prefab) nPFTicket: Prefab;
    @property(Prefab) nPFSectionDivider: Prefab;
    @property(Node) nContentSV: Node;

    public _nUIPack: Node;
    public _nUIDailyQuest: Node;
    public _nUICoin: Node;
    public _nUITicket: Node;
    public _nUIShopSectionDivider: Node;

    //#region GEN function
    public GenUIDailyQuest() {
        if (this._nUIDailyQuest == null) {
            this.GenSectionDivider();

            this._nUIDailyQuest = instantiate(this.nPFDailyQuest);
            this._nUIDailyQuest.parent = this.nContentSV;
            this._nUIDailyQuest.getComponent(Shop_UIDailyQuest).InitItems();
        }
    }

    public GenUIPack() {
        if (MConfigs.numIAPTicketHave == 0) return;
        if (this._nUIPack == null) {

            this._nUIPack = instantiate(this.nPFPack);
            this._nUIPack.parent = this.nContentSV;
        }
        this._nUIPack.getComponent(Shop_UIPacks).TryInitPacks();
    }

    public GenUICoin() {
        if (this._nUICoin == null) {
            this.GenSectionDivider();

            this._nUICoin = instantiate(this.nPFCoin);
            this._nUICoin.parent = this.nContentSV;
            this._nUICoin.getComponent(Shop_UICoin).InitItems();
        }
    }

    public GenUITicket() {
        if (MConfigs.numIAPTicketHave == 0) return;

        if (this._nUITicket == null) {
            this.GenSectionDivider();

            this._nUITicket = instantiate(this.nPFTicket);
            this._nUITicket.parent = this.nContentSV;
            this._nUITicket.getComponent(Shop_UITicket).InitItems();
        }
    }

    public GenSectionDivider() {
        let nSectionDivider: Node = instantiate(this.nPFSectionDivider);
        nSectionDivider.parent = this.nContentSV;
        this._nUIShopSectionDivider = nSectionDivider;
    }
    //#endregion GEN function

    // #region scroll view
    private _heightUIPack: number = 0;
    private _heightUIDailyQuest: number = 0;
    private _heightUICoin: number = 0;
    private _heightUITicket: number = 0;
    private _heightSectionDivider: number = 0;
    private _paddingTop: number = 0;

    public UpdateDataHeight() {

        this._heightUIPack = this._nUIPack?.getComponent(UITransform).height;
        this._heightUIDailyQuest = this._nUIDailyQuest.getComponent(UITransform).height;
        this._heightUICoin = this._nUICoin.getComponent(UITransform).height;
        this._heightUITicket = this._nUITicket?.getComponent(UITransform).height;
        this._heightSectionDivider = this._nUIShopSectionDivider.getComponent(UITransform).height;
        this._paddingTop = this.nContentSV.getComponent(Layout).paddingTop;

        // check valid
        if (this._heightUIPack == null) this._heightUIPack = 0;
        if (this._heightUIDailyQuest == null) this._heightUIDailyQuest = 0;
        if (this._heightUICoin == null) this._heightUICoin = 0;
        if (this._heightUITicket == null) this._heightUITicket = 0;
        if (this._heightSectionDivider == null) this._heightSectionDivider = 0;
        if (this._paddingTop == null) this._paddingTop = 0;
    }

    public GetOffSetOfUI(typeUI: PAGE_VIEW_SHOP | PAGE_VIEW_SHOP_2, type: 1 | 2) {
        let heightUI: number = 0;

        this.UpdateDataHeight();

        // check type UI
        if (type == 1) {
            switch (typeUI) {
                case PAGE_VIEW_SHOP.PACKAGE: heightUI = 0; break;
                case PAGE_VIEW_SHOP.COIN: heightUI = this._heightUIPack + this._heightSectionDivider + this._paddingTop; break;
                case PAGE_VIEW_SHOP.DAILY_QUEST: heightUI = this._heightUIPack + this._heightUICoin + this._heightSectionDivider * 2 + this._paddingTop; break;
                case PAGE_VIEW_SHOP.SKIP_ITS: heightUI = this._heightUIPack + this._heightUIDailyQuest + this._heightUICoin + this._heightSectionDivider * 3 + this._paddingTop; break;
            }
        } else {
            switch (typeUI) {
                case PAGE_VIEW_SHOP_2.DAILY_QUEST: heightUI = 0; break;
                case PAGE_VIEW_SHOP_2.COIN: heightUI = this._heightUIDailyQuest + this._heightSectionDivider + this._paddingTop; break;
            }
        }

        // offset
        let offSet = heightUI - this._paddingTop;

        return offSet;
    }

    public GetTypeUIDependOnOffset(offset: number): PAGE_VIEW_SHOP | PAGE_VIEW_SHOP_2 {
        if (MConfigs.numIAPTicketHave > 0) {
            switch (true) {
                case this._heightUIPack > 0 && offset < this._heightUIPack: return PAGE_VIEW_SHOP.PACKAGE;
                case this._heightUICoin > 0 && offset < this._heightUIPack + this._heightUICoin + this._heightSectionDivider: return PAGE_VIEW_SHOP.COIN;
                case this._heightUIDailyQuest > 0 && offset < this._heightUIPack + this._heightUICoin + this._heightUIDailyQuest + this._heightSectionDivider * 2: return PAGE_VIEW_SHOP.DAILY_QUEST;
                case this._heightUITicket > 0 && offset < this._heightUIPack + this._heightUIDailyQuest + this._heightUICoin + this._heightUITicket + this._heightSectionDivider * 3: return PAGE_VIEW_SHOP.SKIP_ITS;
            }
        } else {
            switch (true) {
                case this._heightUIDailyQuest > 0 && offset < this._heightUIPack + this._heightUIDailyQuest: return PAGE_VIEW_SHOP_2.DAILY_QUEST;
                case this._heightUICoin > 0 && offset < this._heightUIPack + this._heightUIDailyQuest + this._heightUICoin + this._heightSectionDivider: return PAGE_VIEW_SHOP_2.COIN;
            }
        }
        // console.log(offset, this._heightUIPack, this._heightUIDailyQuest, this._heightSectionDivider);
        return null;
    }
    // #endregion scroll view

    //=====================================================
    // #region infoPack
    public UpdateInfoShop() {
        if (this._nUIPack != null) {
            this._nUIPack.getComponent(Shop_UIPacks).UpdatePacks();
        }
    }
    // #endregion infoPack
    //=====================================================

    //=====================================================
    // #region expand
    private _idPackHlwInit: string = null;
    public GetInfoShopForExpand(): { pack: InfoPack[], coin: InfoItemBundleStore[] } {
        let resultListPack: InfoPack[] = [];
        let resultListCoin: InfoItemBundleStore[] = [];

        // =================== logic gen pack =========================
        // nếu chưa có IAP thì sẽ là startPack và smallBundle
        //         nếu ko có start pack => small + medium
        // nếu có IAP<10$ Hlw + small 
        //         nếu hlw end => small + medium
        // nếu có IAP>10$ Hlw + medium
        //         nếu hlw end => medium + large

        const listDataPackInity: InfoPack[] = DataPackSys.Instance.InitAllNewPackType('IAP_INFINITY');
        let infoPackStart = null, infoPackHalloween = DataHalloweenSys.Instance.InfoPackHalloweenWorking;
        if (infoPackHalloween == null) { }
        else if (this._idPackHlwInit == null) { this._idPackHlwInit = infoPackHalloween.namePack; }
        else if (infoPackHalloween != null && this._idPackHlwInit != infoPackHalloween.namePack) { infoPackHalloween = null; }

        // check pack starter
        const isPackStarterOngoing = DataPackSys.Instance.IsPackOngoing(EnumNamePack.StartedPack);
        if (isPackStarterOngoing) { infoPackStart = DataPackSys.Instance.getInfoPackFromRoot(EnumNamePack.StartedPack) }

        let totalIAPExpend = DataInfoPlayer.Instance.TotalSpendingMoneyOfUser();
        if (totalIAPExpend == 0) {
            // vì chúng ta chưa cache dữ liệu IAP mua ở đâu do đó chúng ta sẽ kiểm tra các gói pack đã mua trong dữ liệu xem có không? nếu không thì không tính
            totalIAPExpend = DataPackSys.Instance.TotalSpendingMoneyOfUser();

            // chúng ta cũng sẽ kiểm tra cả các gói pack của hlw theo id
            totalIAPExpend += DataHalloweenSys.Instance.TotalPriceSpendingMoney();
        }
        switch (true) {
            case totalIAPExpend == 0:
                if (infoPackStart == null) {
                    resultListPack.push(listDataPackInity.find(p => p.namePack == ENamePACK_UNLIMITED.SmallBundle))
                    resultListPack.push(listDataPackInity.find(p => p.namePack == ENamePACK_UNLIMITED.MediumBundle))
                } else {
                    resultListPack.push(infoPackStart)
                    resultListPack.push(listDataPackInity.find(p => p.namePack == ENamePACK_UNLIMITED.SmallBundle))
                }
                break;
            case totalIAPExpend < 10:
                if (infoPackHalloween == null) {
                    resultListPack.push(listDataPackInity.find(p => p.namePack == ENamePACK_UNLIMITED.SmallBundle))
                    resultListPack.push(listDataPackInity.find(p => p.namePack == ENamePACK_UNLIMITED.MediumBundle))
                } else {
                    resultListPack.push(infoPackHalloween)
                    resultListPack.push(listDataPackInity.find(p => p.namePack == ENamePACK_UNLIMITED.SmallBundle))
                }
                break;
            case totalIAPExpend >= 10:
                if (infoPackHalloween == null) {
                    resultListPack.push(listDataPackInity.find(p => p.namePack == ENamePACK_UNLIMITED.MediumBundle))
                    resultListPack.push(listDataPackInity.find(p => p.namePack == ENamePACK_UNLIMITED.LargeBundle))
                } else {
                    resultListPack.push(infoPackHalloween)
                    resultListPack.push(listDataPackInity.find(p => p.namePack == ENamePACK_UNLIMITED.MediumBundle))
                }
                break;
        }

        // =================== logic gen coin =========================
        const listCoinCanInit = Array.from(ReadDataJson.Instance.GetDataShop_Coins()).filter(item => FBInstantManager.Instance.checkHaveIAPPack_byProductID(item.idBundle));
        resultListCoin.push(listCoinCanInit[0]);
        resultListCoin.push(listCoinCanInit[1]);
        resultListCoin.push(listCoinCanInit[2]);

        return {
            pack: resultListPack,
            coin: resultListCoin
        }
    }
    // #endregion expand
    //=====================================================

    //=====================================================
    //#region anim
    public async PlayAnimShow() {
        this._nUIPack.getComponent(Shop_UIPacks).PrepareAnim();
        this._nUICoin.getComponent(Shop_UICoin).PrepareAnim();
        await this._nUIPack.getComponent(Shop_UIPacks).Play();
        await this._nUICoin.getComponent(Shop_UICoin).Play();
    }
    //#endregion anim
    //=====================================================
}


