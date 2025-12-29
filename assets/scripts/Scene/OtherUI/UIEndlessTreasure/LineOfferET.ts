import { _decorator, Component, Node } from 'cc';
import { ItemOfferET } from './ItemOfferET';
import { InfoPackEndlessTreasure } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('LineOfferET')
export class LineOfferET extends Component {
    @property(ItemOfferET) offer1: ItemOfferET;
    @property(ItemOfferET) offer2: ItemOfferET;

    //=================
    //#regoin SetUp
    public SetUp(infoPack1: InfoPackEndlessTreasure, infoPack2: InfoPackEndlessTreasure) {
        let isOdd = false;
        if (infoPack2 != null) {
            // có 2 pack
            this.offer1.node.active = this.offer2.node.active = true;

            isOdd = (infoPack2.GetIndexBundle() / 2) % 2 != 0;
            if (isOdd) {
                this.offer1.SetUp(infoPack1);
                this.offer2.SetUp(infoPack2);
            } else {
                this.offer2.SetUp(infoPack1);
                this.offer1.SetUp(infoPack2);
            }
        } else {
            // có 1 pack
            isOdd = ((infoPack1.GetIndexBundle() + 1) / 2) % 2 != 0;
            if (isOdd) {
                this.offer1.node.active = true;
                this.offer1.SetUp(infoPack1);
                this.offer2.node.active = false;
            } else {
                this.offer2.node.active = true;
                this.offer2.SetUp(infoPack1);
                this.offer1.node.active = false;
            }
        }
    }
    //#endregion SetUp
    //=================
}


