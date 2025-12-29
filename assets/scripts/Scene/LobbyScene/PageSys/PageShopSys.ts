import { _decorator, Component, Node, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { DataCustomUIShop, PAGE_VIEW_SHOP, PAGE_VIEW_SHOP_2 } from '../../OtherUI/UIShop/TypeShop';
import { UILoadingSys_2 } from '../../OtherUI/UILoadingSys_2';
import { UIShop } from '../../OtherUI/UIShop/UIShop';
import { PageLobbyBase } from '../../../Common/PageLobbyBase';
const { ccclass, property } = _decorator;

@ccclass('PageShopSys')
export class PageShopSys extends PageLobbyBase {
    @property(UILoadingSys_2) UILoadingSys_2: UILoadingSys_2;
    public _pageStart: PAGE_VIEW_SHOP = PAGE_VIEW_SHOP.PACKAGE;
    private nUIShop: Node = null;

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_SHOP.CHANGE_PAGE_START_AT_LOBBY, this.ChangePageStart, this);
        this.UILoadingSys_2.Show();
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_SHOP.CHANGE_PAGE_START_AT_LOBBY, this.ChangePageStart, this);
    }

    protected onEnable(): void {
        if (this.nUIShop != null) {
            this.nUIShop.getComponent(UIShop).logicGenItemShop.UpdateInfoShop();
        }
    }

    private ChangePageStart(pageStart: PAGE_VIEW_SHOP) {
        if (this.node.isValid && this.nUIShop == null) {
            this._pageStart = pageStart;
        } else if (this.node.isValid && this.nUIShop != null) {
            // update pagePack
            this.nUIShop.getComponent(UIShop).ScrollToPageWhenStart(pageStart, 1);
        }
    }

    override ShowPage(callFromTab: boolean = false): void {
        if (this.nUIShop != null) {
            // trong trường hợp đã có init page thì mỗi khi mở auto trượt vào package nếu là click từ tab
            if (callFromTab) {
                this.ChangePageStart(PAGE_VIEW_SHOP.PACKAGE);
            }
            return;
        }

        //emit code to load UI shop
        let dataCustomUIShop: DataCustomUIShop = {
            isActiveClose: false,
            openUIAfterClose: null,
            pageViewShop_ScrollTo: callFromTab ? PAGE_VIEW_SHOP.PACKAGE : this._pageStart,
            canAutoResumeGame: false
        }

        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI_SPECIAL, TYPE_UI.UI_SHOP, this.node, dataCustomUIShop, async (nUIShow: Node) => {
            this.nUIShop = nUIShow;
            this.UILoadingSys_2.Close();
            const isInit = await nUIShow.getComponent(UIShop).InitShopWhenStart();
            if (isInit) {
                // lý do cần gọi lại hàm này vì trong trường hợp chưa init thì hàm changepageStart sẽ ko chạy được nên ta cần thêm đoạn code này để chạy sau khi đã init
                nUIShow.getComponent(UIShop).ScrollToPageWhenStart(this._pageStart, 1);
            } else {
                if (callFromTab) {
                    nUIShow.getComponent(UIShop).ScrollToPageWhenStart(this._pageStart, 1);
                }
            }
        });
    }
}


