import { _decorator, Color, Component, Node } from 'cc';
import { ItemPrizeSuperCustom } from '../../UIReceivePrize/ItemPrizeSuperCustom';
import { IPrize } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('ShopItemPack_Prize_Base')
export class ShopItemPack_Prize_Base extends Component {
    @property([ItemPrizeSuperCustom]) listItems: ItemPrizeSuperCustom[] = [];

    Init(listPrize: IPrize[]) {
        this.listItems.forEach((item, index) => item.SetUp(listPrize[index], this.node.worldPosition));
    }

    ChangeColorTextPrize(colorFront: Color, colorShadow: Color) {
        this.listItems.forEach((item, index) => item.ChangeColorTextPrize(colorFront, colorShadow));
    }
}


