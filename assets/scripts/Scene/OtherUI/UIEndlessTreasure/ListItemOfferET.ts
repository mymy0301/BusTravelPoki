import { _decorator, Component, Node, tween, UITransform, Vec3 } from 'cc';
import { B_ScrollViewSys, IScrollViewSys } from '../../../Common/UltimateScrollView/B_ScrollViewSys';
import { DataEndlessTreasureSys } from '../../../DataBase/DataEndlessTreasureSys';
import { LineOfferET } from './LineOfferET';
import { Utils } from '../../../Utils/Utils';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_ENDLESS_TREASURE } from './TypeEventEndlessTreasure';
import { B_ItemScrollViewSys } from '../../../Common/UltimateScrollView/B_ItemScrollViewSys';
import { ItemOfferET } from './ItemOfferET';
import { InfoPackEndlessTreasure } from '../../../Utils/Types';
import { MConst, TYPE_UI } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ListItemOfferET')
export class ListItemOfferET extends B_ScrollViewSys implements IScrollViewSys {
    private _totalLinePack: number = -1;
    protected onLoad(): void {
        super.onLoad();
        this.SetUp_interface(this);
    }

    SetUpItemData(nItem: Node, data: any, index: number, cbShowAnchor: CallableFunction, cbHideAnchor: CallableFunction, isUseAnim: boolean): void {
        nItem.getComponent(LineOfferET).SetUp(data[0], data[1]);
    }

    public async SetData() {
        const dataPack = DataEndlessTreasureSys.Instance.GetDataPack();
        const packCombined = this.GetDataPackCombine(dataPack);
        this._totalLinePack = packCombined.length;

        //========== set init ==========
        this.SetUp_data(packCombined);
        this.InitItemsFirstTime();
    }

    public async UpdateItem(numItemBought: number) {
        const halfViewHeight = this.nView.getComponent(UITransform).height / 2;

        // get the holder
        const isNextLine = numItemBought % 2 == 0
        const holder = this.ListHolder[!isNextLine ? 0 : 1];
        if (holder == null) {
            return;
        }
        const lineCom = holder.getComponent(B_ItemScrollViewSys).GetItemReuse().getComponent(LineOfferET);
        const isUnlockItem2 = (Math.floor((numItemBought + 1) / 2)) % 2 != 0;

        this.nBlockView.active = true;

        numItemBought % 2 == 0 && this.ScrollToNextItem(Utils.ConvertVec2ToVec3(this.GetOffSetFromIndex(1)).add3f(0, halfViewHeight, 0));
        isUnlockItem2 ? await lineCom.offer2.getComponent(ItemOfferET).UnlockItem() : await lineCom.offer1.getComponent(ItemOfferET).UnlockItem();

        if (isNextLine) {
            const dataPack = DataEndlessTreasureSys.Instance.GetDataPack();
            // update data
            const packCombined = this.GetDataPackCombine(dataPack);
            this._totalLinePack = packCombined.length;
            this.UpdateData(packCombined);
            this.nContent.setPosition(new Vec3(0, halfViewHeight));
        }

        await Utils.delay(1 * 1000);
        this.nBlockView.active = false;
    }

    private GetDataPackCombine(dataPack: InfoPackEndlessTreasure[]): InfoPackEndlessTreasure[] {
        const packCombined = [];
        let tempPack = [];
        dataPack.forEach(pack => {
            tempPack.push(pack);
            if (tempPack.length == 2 && tempPack.findIndex(pack => !pack.isBought) >= 0) {
                packCombined.push(Utils.CloneListDeep(tempPack));
                tempPack = [];
            } else if (tempPack.length == 2) {
                tempPack = [];
            }
        })
        if (tempPack.length > 0 && tempPack.findIndex(pack => !pack.isBought) >= 0) {
            packCombined.push(Utils.CloneListDeep(tempPack));
            tempPack = [];
        }

        return packCombined;
    }

    private ScrollToNextItem(pos: Vec3) {
        const self = this;
        tween(this.nContent)
            .to(0.5, { position: pos }, {
                easing: 'smooth', onUpdate(target, ratio) {
                    self.onScrolling();
                },
            })
            .start();
    }
}


