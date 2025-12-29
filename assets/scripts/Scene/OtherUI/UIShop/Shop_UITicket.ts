import { _decorator, Component, instantiate, Label, Node, Prefab, UITransform } from 'cc';
import { ReadDataJson } from '../../../ReadDataJson';
import { Shop_ItemTicket } from './Shop_ItemTicket';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
const { ccclass, property } = _decorator;

@ccclass('Shop_UITicket')
export class Shop_UITicket extends Component {
    @property(Prefab) pfItemTicket: Prefab;
    @property(Prefab) pfItemTicketTut: Prefab;
    @property(Node) nLayout: Node;
    @property(Label) lbFake: Label;

    public InitItems() {
        let dataPackTicket = Array.from(ReadDataJson.Instance.GetDataShop_Ticket());

        let nItemTicketTut: Node = instantiate(this.pfItemTicketTut);
        nItemTicketTut.parent = this.nLayout;

        let listTicketCanInit = dataPackTicket.filter(item => FBInstantManager.Instance.checkHaveIAPPack_byProductID(item.idBundle));


        // =========== find the width btn suit max ================
        let maxWidthText = 0;
        listTicketCanInit.forEach(item => {
            let priceText = FBInstantManager.Instance.getPriceIAPPack_byProductID(item.idBundle);
            priceText = priceText != null ? priceText : item.price.toString();
            this.lbFake.string = priceText;
            this.lbFake.updateRenderData(true);
            maxWidthText = Math.max(maxWidthText, this.lbFake.getComponent(UITransform).contentSize.width);
        })

        // init item ticket normal
        listTicketCanInit.forEach(item => {
            let nItemTicket: Node = instantiate(this.pfItemTicket);
            nItemTicket.parent = this.nLayout;
            nItemTicket.getComponent(Shop_ItemTicket).SetUp(item, maxWidthText);
        })
    }
}


