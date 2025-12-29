import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('CheckVisualNotiShopCoinAds')
export class CheckVisualNotiShopCoinAds extends Component {
    protected onEnable(): void {
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.SHOW_NOTI);
    }

    protected onDisable(): void {
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.HIDE_NOTI);
    }
}


