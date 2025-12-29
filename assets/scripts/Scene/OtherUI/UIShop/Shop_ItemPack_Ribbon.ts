import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Shop_ItemPack_Ribbon')
export class Shop_ItemPack_Ribbon extends Component {
    @property([Node]) listNRibbon: Node[] = [];
    @property(Node) nRootRibbon: Node;

    public Hide() {
        this.listNRibbon.forEach(item => item.active = false);
    }

    public Show() {
        this.listNRibbon.forEach(item => item.active = true);
    }
}


