import { _decorator, Component, Node } from 'cc';
import { DataShopSys } from '../../DataShopSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('NotiIndicatorShop')
export class NotiIndicatorShop extends Component {
    @property(Node) nIcNotiDailyChallenge: Node = null;
    @property(Node) nIcNotiCoin: Node = null;

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_SHOP.UPDATE_NOTI_SHOP_COIN_INDICATOR, this.CheckCoin, this);
        clientEvent.on(MConst.EVENT_SHOP.UPDATE_NOTI_SHOP_DAILY_INDICATOR, this.CheckDaily, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_SHOP.UPDATE_NOTI_SHOP_COIN_INDICATOR, this.CheckCoin, this);
        clientEvent.off(MConst.EVENT_SHOP.UPDATE_NOTI_SHOP_DAILY_INDICATOR, this.CheckDaily, this);
    }

    public CheckCoin() {
        if (this.nIcNotiCoin == null) return;
        this.nIcNotiCoin.active = DataShopSys.Instance.CanShowNotiCoin();
    }

    public CheckDaily() {
        if (this.nIcNotiDailyChallenge == null) return;
        this.nIcNotiDailyChallenge.active = DataShopSys.Instance.CanShowNotiQuest();
    }
}


