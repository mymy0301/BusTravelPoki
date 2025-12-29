import { _decorator, BoxCollider2D, Collider2D, Component, Label, Node, randomRange, randomRangeInt, RigidBody, RigidBody2D, Sprite, SpriteFrame, Vec2, Vec3 } from 'cc';
import { IPrize, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('ItemUIPhaseSpin')
export class ItemUIPhaseSpin extends Component {
    @property(Sprite) spIcon: Sprite = null;
    @property(Label) lbItem: Label;
    @property([Sprite]) listItemGray: Sprite[] = [];

    //#region common func
    public SetUpPrize(prize: IPrize, sfPrize: SpriteFrame) {
        // MConfigResourceUtils.setImageItem(this.spIcon, prize.typePrize);
        // switch (prize.typePrize) {
        //     case TYPE_PRIZE.MONEY: case TYPE_PRIZE.TICKET: case TYPE_PRIZE.TIME:
        //     case TYPE_PRIZE.HAMMER: case TYPE_PRIZE.SHUFFLE: case TYPE_PRIZE.SORT: case TYPE_PRIZE.VIP_SLOT: case TYPE_PRIZE.MAGNIFYING_GLASS:
        //         this.lbItem.string = prize.GetStringValue();
        //         break;
        // }
        this.spIcon.spriteFrame = sfPrize;
        this.lbItem.string = prize.GetStringValue_2();
        this.spIcon.node.getComponent(Collider2D)?.apply();
    }


    public SetUpOneCoin(sfCoin: SpriteFrame) {
        this.spIcon.spriteFrame = sfCoin;
        this.spIcon.node.scale = Vec3.ONE;
    }

    public SetUpSpecialPrize(isUnlock: boolean, sfCoin: SpriteFrame) {
        // get sf Coin , sf light , particle if you need
        if(sfCoin != null){
            this.spIcon.spriteFrame = sfCoin;
        }
        this.spIcon.node.scale = Vec3.ONE;

        // check update gray sprite
        if (isUnlock) {
            this.listItemGray.forEach(item => item.grayscale = false);
        } else {
            this.listItemGray.forEach(item => item.grayscale = true);
        }
    }

    public AddForceToImpressApear() {
        const randomPower = randomRange(1, 5);
        this.spIcon.node.getComponent(RigidBody2D).linearVelocity = new Vec2(randomPower, 0);
    }
    //#endregion
}




