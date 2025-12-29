import { _decorator, CCBoolean, Component, instantiate, Layout, Node, Prefab } from 'cc';
import { ReadDataJson } from '../../../ReadDataJson';
import { ConvertStringToEnumNamePack, EnumNamePack, InfoPack, InfoPackFromRootJson } from '../../../Utils/Types';
import { DataPackSys } from '../../../DataBase/DataPackSys';
import { Shop_ItemPack } from './Shop_ItemPack';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { DataHalloweenSys } from '../../../DataBase/DataHalloweenSys';
import { ShowItemFromRighToLeft } from '../UIShopShort/ShowItemFromRighToLeft';
import { Utils } from '../../../Utils/Utils';
import { DataChristmasSys } from '../../../DataBase/DataChristmasSys';
const { ccclass, property } = _decorator;

@ccclass('Shop_UIPacks')
export class Shop_UIPacks extends Component {
    @property(Prefab) nItem: Prefab;
    @property(Layout) nLayout: Layout;

    @property(CCBoolean) testPacks = false;

    private _listPacks: Node[] = [];
    // gen item
    protected onLoad(): void {

    }

    public TryInitPacks() {
        // lấy những pack đang hoạt động
        const listDataPack: InfoPack[] = DataPackSys.Instance.getListDataPack();
        const listDataPackInity: InfoPack[] = DataPackSys.Instance.InitAllNewPackType('IAP_INFINITY');
        const dataPackHalloween: InfoPack = DataHalloweenSys.Instance.GetTimeRemain() > 0 ? DataHalloweenSys.Instance.InfoPackHalloweenWorking : null;
        const dataPackChristmas: InfoPack = DataChristmasSys.Instance.GetTimeRemain() > 0 ? DataChristmasSys.Instance.InfoPackChristmasWorking : null;

        // console.log("listDataPack", listDataPack);

        // duyệt danh sách các pack để kiểm tra xem có init được hay không
        for (let i = 0; i < listDataPack.length; i++) {
            const dataItemPack = listDataPack[i];

            // check pack is valid or not
            if (!FBInstantManager.Instance.checkHaveIAPPack_byProductID(dataItemPack.namePack)) {
                // console.log("can not pass this case 1", dataItemPack.namePack);
                continue;
            };

            //check pack was inited 
            if (this._listPacks.find(nItem => nItem.getComponent(Shop_ItemPack).GetIdPack() == dataItemPack.namePack) != null) {
                // console.log("can not pass this case 2", dataItemPack.namePack);
                continue;
            }

            // check pack is unlock or not
            if (!this.testPacks) {
                const enumNamePack: EnumNamePack = ConvertStringToEnumNamePack(dataItemPack.namePack);
                const isPackRemaining: boolean = DataPackSys.Instance.CheckLogicIsRemaingPack(enumNamePack);
                const canInitPack: boolean = DataPackSys.Instance.CheckLogicCanInitPack(enumNamePack);

                if (enumNamePack == EnumNamePack.StartedPack && (canInitPack || DataPackSys.Instance.getInfoPackSave(EnumNamePack.StartedPack).numAvaliable <= 0)) {
                    // console.log("can not pass this case 3", enumNamePack);
                    continue;
                }
                else if ((enumNamePack == null || !isPackRemaining || canInitPack) && enumNamePack != EnumNamePack.StartedPack) {
                    // console.log("can not pass this case 3", enumNamePack);
                    continue;
                };
            }

            // === init item ===
            let nItemPack: Node = instantiate(this.nItem) as Node;
            nItemPack.parent = this.nLayout.node;
            nItemPack.getComponent(Shop_ItemPack).InitItemPack(dataItemPack);
            this._listPacks.push(nItemPack);
        }

        // duyệt pack halloween và kiểm tra xem có thể init được hay không
        if (dataPackHalloween != null) {
            const valid1 = this._listPacks.find(nItem => nItem.getComponent(Shop_ItemPack).GetIdPack() == dataPackHalloween.namePack) != null;
            const valid2 = FBInstantManager.Instance.checkHaveIAPPack_byProductID(dataPackHalloween.namePack)
            if (!valid1 && valid2) {
                // init pack
                let nItemPack: Node = instantiate(this.nItem) as Node;
                nItemPack.parent = this.nLayout.node;
                nItemPack.getComponent(Shop_ItemPack).InitItemPack(dataPackHalloween);
                this._listPacks.push(nItemPack);
            }
        }

        // duyệt pack christmas và kiểm tra xem có thể init được hay không
        if (dataPackChristmas != null) {
            const valid1 = this._listPacks.find(nItem => nItem.getComponent(Shop_ItemPack).GetIdPack() == dataPackChristmas.namePack) != null;
            const valid2 = FBInstantManager.Instance.checkHaveIAPPack_byProductID(dataPackChristmas.namePack);
            // kiểm tra pack ko phải pack chooseOne
            const valid3 = DataChristmasSys.Instance.IsValidToShowOnShop(dataPackChristmas.namePack);
            if (!valid1 && valid2 && valid3) {
                // init pack
                let nItemPack: Node = instantiate(this.nItem) as Node;
                nItemPack.parent = this.nLayout.node;
                nItemPack.getComponent(Shop_ItemPack).InitItemPack(dataPackChristmas);
                this._listPacks.push(nItemPack);
            }
        }


        // duyệt pack infinity và init
        for (let i = 0; i < listDataPackInity.length; i++) {
            const dataItemPack = listDataPackInity[i];
            //check pack was inited 
            if (this._listPacks.find(nItem => nItem.getComponent(Shop_ItemPack).GetIdPack() == dataItemPack.namePack) != null) {
                // console.log("can not pass this case 2");
                continue;
            }

            // check pack is valid or not
            if (FBInstantManager.Instance.checkHaveIAPPack_byProductID(dataItemPack.namePack)) {
                // console.log("can not pass this case 1");
                let nItemPack: Node = instantiate(this.nItem) as Node;
                nItemPack.parent = this.nLayout.node;
                nItemPack.getComponent(Shop_ItemPack).InitItemPack(dataItemPack);
                this._listPacks.push(nItemPack);
            };
        }
    }

    public UpdatePacks() {
        // in this case only has halloween and christmas
        if (this._listPacks.length > 0) {
            // hlw
            const packHalloween = this._listPacks.find(nPack => nPack.getComponent(Shop_ItemPack).InfoPack.type == 'HALLOWEEN');
            if (packHalloween != null) {
                const dataPackHalloweenNow = DataHalloweenSys.Instance.InfoPackHalloweenWorking;
                if (dataPackHalloweenNow == null) {
                    packHalloween.active = false;
                }
            }

            // christmas
            const packChristmas = this._listPacks.find(nPack => nPack.getComponent(Shop_ItemPack).InfoPack.type == 'CHRISTMAS');
            if (packChristmas != null) {
                const dataPackChirstmasNow = DataChristmasSys.Instance.InfoPackChristmasWorking;
                if (dataPackChirstmasNow == null) {
                    packChristmas.active = false;
                }
            }
        }
    }


    public PrepareAnim() {
        this._listPacks.forEach(pack => {
            const comAnim = pack.getComponent(ShowItemFromRighToLeft);
            if (comAnim != null) {
                comAnim.Prepare();
            }
        })
    }

    public async Play() {
        const timeDelay = 0.1;
        for (const pack of this._listPacks) {
            const comAnim = pack.getComponent(ShowItemFromRighToLeft);
            if (comAnim != null) {
                comAnim.Play();
            }
            await Utils.delay(timeDelay * 1000);
        }
    }
}


