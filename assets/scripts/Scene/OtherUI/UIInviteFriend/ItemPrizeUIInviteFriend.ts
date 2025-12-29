import { _decorator, Color, Component, Label, Node, Size, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { ItemScrollViewBase } from '../../../Common/ItemScrollViewBase';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { InfoPrizeFriendJoined, IPrize, STATE_ITEM_PRIZE_INVITE_FRIEND, TYPE_EVENT_GAME, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('ItemPrizeUIInviteFriend')
@requireComponent(ItemScrollViewBase)
export class ItemPrizeUIInviteFriend extends Component {
    @property(Label) lbIndexItem: Label;
    @property(Node) nReceivedItem: Node;
    @property(Sprite) spBgPrize: Sprite;

    @property(Label) lbPrize: Label;
    @property(Sprite) spPrize: Sprite;

    @property(SpriteFrame) sfCoin: SpriteFrame;
    @property(SpriteFrame) sfBgOrange: SpriteFrame;
    @property(SpriteFrame) sfBgGreen: SpriteFrame;
    @property(Color) colorTextOrange: Color = new Color();
    @property(Color) colorTextGreen: Color = new Color();
    @property(Node) nLight: Node;
    @property(Vec3) posLeft: Vec3 = new Vec3(1, 1, 1);
    @property(Vec3) posMid: Vec3 = new Vec3(1, 1, 1);

    private _indexPrize: number = -1;

    private _stateItem: STATE_ITEM_PRIZE_INVITE_FRIEND = STATE_ITEM_PRIZE_INVITE_FRIEND.LOCK;

    //#region setUp
    public SetUp(indexItemPrize: number, data: InfoPrizeFriendJoined, numPrizeWasReceived: number) {
        this._indexPrize = indexItemPrize;

        this.lbIndexItem.string = `${indexItemPrize + 1}`;

        // set prize
        this.Prize(data.values[0]);

        if (indexItemPrize < numPrizeWasReceived) {
            this.ChangeState(STATE_ITEM_PRIZE_INVITE_FRIEND.CLAIMED);
        } else if (indexItemPrize == numPrizeWasReceived) {
            // this.ChangeState(STATE_ITEM_PRIZE_INVITE_FRIEND.UNLOCK);
            this.ChangeState(STATE_ITEM_PRIZE_INVITE_FRIEND.LOCK);
        }
        else {
            this.ChangeState(STATE_ITEM_PRIZE_INVITE_FRIEND.LOCK);
        }
    }

    private Prize(iPrize: IPrize) {
        // nếu nhu là coin thì sẽ set image khác và set text ở giữa
        switch (iPrize.typePrize) {
            case TYPE_PRIZE.MONEY:
                this.spPrize.spriteFrame = this.sfCoin;
                break;
            default:
                MConfigResourceUtils.setImageItem(this.spPrize, iPrize.typePrize, iPrize.typeReceivePrize, 0);
                break;
        }

        // text
        if (iPrize.typeReceivePrize == TYPE_RECEIVE.NUMBER) {
            if (iPrize.typePrize == TYPE_PRIZE.MONEY) {
                // skip set image
                this.lbPrize.string = `${iPrize.value}`;
            } else {
                this.lbPrize.string = `x${iPrize.value}`;
            }
        } else {
            this.lbPrize.string = `${iPrize.value}${iPrize.typeReceivePrize == TYPE_RECEIVE.TIME_MINUTE ? "m" : "h"}`;
        }

        // pos text
        switch (iPrize.typePrize) {
            case TYPE_PRIZE.MONEY:
                this.lbPrize.node.position = this.posMid;
                break;
            default:
                this.lbPrize.node.position = this.posLeft;
                break;
        }
    }

    public onReceiveItem() {
        if (this._indexPrize != -1) {
            this.nReceivedItem.active = true;
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.INVITE_FRIEND);
        } else {
            console.error("indexPrizeInviteFriendWrong");
        }
        this.ChangeState(STATE_ITEM_PRIZE_INVITE_FRIEND.CLAIMED);
    }
    //#endregion setUp

    //#region state
    private ChangeState(state: STATE_ITEM_PRIZE_INVITE_FRIEND) {
        this._stateItem = state;

        switch (state) {
            case STATE_ITEM_PRIZE_INVITE_FRIEND.UNLOCK:
            case STATE_ITEM_PRIZE_INVITE_FRIEND.LOCK:
                this.nReceivedItem.active = false;
                this.spBgPrize.spriteFrame = this.sfBgOrange;
                this.lbIndexItem.color = this.colorTextOrange;
                this.nLight.active = false;
                break;
                // this.nReceivedItem.active = false;
                // this.spBgPrize.spriteFrame = this.sfBgGreen;
                // this.lbIndexItem.color = this.colorTextGreen;
                // this.nLight.active = true;
                break;
            case STATE_ITEM_PRIZE_INVITE_FRIEND.CLAIMED:
                this.nReceivedItem.active = true;
                this.spBgPrize.spriteFrame = this.sfBgOrange;
                this.lbIndexItem.color = this.colorTextOrange;
                this.nLight.active = false;
                break;
        }
    }
    //#endregion state
}


