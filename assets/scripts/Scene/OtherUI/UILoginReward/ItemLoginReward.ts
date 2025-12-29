import { _decorator, CCBoolean, Color, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { IPrize, TYPE_PRIZE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import * as i18n from 'db://i18n/LanguageData';
import { DataLoginRewardSys } from '../../../DataBase/DataLoginRewardSys';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { DataItemSys } from '../../DataItemSys';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { Utils } from '../../../Utils/Utils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

export enum STATE_ITEM_LOGIN_REWARD {
    LOCK,
    UNLOCK,
    IS_CLAIMED
}

@ccclass('ItemLoginReward')
export class ItemLoginReward extends Component {

    @property(Sprite) spBgItem: Sprite;
    @property(Label) lbAmount: Label;
    @property(Label) lbDay: Label;
    @property(Sprite) spVisualItem: Sprite;
    @property(Node) nLight: Node;
    @property(Color) mColorBrown: Color = new Color();
    @property(Color) mColorGreen: Color = new Color();
    @property(Node) nUIReceivePrizeDone: Node;
    @property(SpriteFrame) sfCoin: SpriteFrame;
    @property(SpriteFrame) sfYellow: SpriteFrame;
    @property(SpriteFrame) sfGreen: SpriteFrame;
    @property(SpriteFrame) sfChest: SpriteFrame;
    @property(CCBoolean) isChest = false;

    private _day: number = 0;
    private _listIPrize: IPrize[] = [];


    private _state: STATE_ITEM_LOGIN_REWARD = STATE_ITEM_LOGIN_REWARD.LOCK;

    public UpdateState(state: STATE_ITEM_LOGIN_REWARD) {
        this._state = state;

        switch (this._state) {
            case STATE_ITEM_LOGIN_REWARD.LOCK:
                this.nUIReceivePrizeDone.active = false;
                this.nLight.active = false;
                this.lbDay.color = this.mColorBrown;
                this.spBgItem.spriteFrame = this.sfYellow;
                break;
            case STATE_ITEM_LOGIN_REWARD.IS_CLAIMED:
                this.nUIReceivePrizeDone.active = true;
                this.nLight.active = false;
                this.lbDay.color = this.mColorBrown;
                this.spBgItem.spriteFrame = this.sfYellow;
                break;
            case STATE_ITEM_LOGIN_REWARD.UNLOCK:
                this.nUIReceivePrizeDone.active = false;
                this.nLight.active = true;
                this.lbDay.color = this.mColorGreen;
                this.spBgItem.spriteFrame = this.sfGreen;
                break;
        }
    }

    public async OnClickItem() {
        LogEventManager.Instance.logButtonClick(`item_prize`, "ItemLoginReward");

        // lưu lại dữ liệu
        // bật anim nhận thưởng
        // kiểm tra trong các trạng thái khác nhau thì kết quả sẽ là khác nhau
        switch (this._state) {
            case STATE_ITEM_LOGIN_REWARD.LOCK:
                break;
            case STATE_ITEM_LOGIN_REWARD.UNLOCK:
                // lưu lại dữ liệu 
                // bật anim nhận thưởng
                // lưu dữ liệu login reward
                PrizeSys.Instance.AddPrize(this._listIPrize, 'UILoginReward', false, false);
                DataLoginRewardSys.Instance.SaveRewardLogin(this._day);

                clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_LOBBY, false);
                await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.LOGIN_REWARD, this._listIPrize, 'UILoginReward', null, null, 'Login Rewards');
                // anim increase progress in login reward
                clientEvent.dispatchEvent(MConst.EVENT_LOGIN_REWARD.INCREASE_PROGRESS);
                this.UpdateState(STATE_ITEM_LOGIN_REWARD.IS_CLAIMED);
                break;
            case STATE_ITEM_LOGIN_REWARD.IS_CLAIMED:
                break;
        }

    }

    public async UpdateUI(iPrize: IPrize, day: number, state: STATE_ITEM_LOGIN_REWARD) {
        // load image item
        if (this.isChest) {
            this.spVisualItem.spriteFrame = this.sfChest;
            this.lbAmount.node.active = false;
        } else {
            if (iPrize.typePrize != TYPE_PRIZE.MONEY) {
                const sfItem = await MConfigResourceUtils.getImageItem(iPrize.typePrize, iPrize.typeReceivePrize);
                this.spVisualItem.spriteFrame = sfItem;
            } else {
                this.spVisualItem.spriteFrame = this.sfCoin;
            }
        }

        // load lb
        this._day = day;
        this._listIPrize = [];
        this._listIPrize.push(iPrize);
        this.lbAmount.string = `x${iPrize.GetStringValue()}`;
        // this.lbDay.string = `${i18n.t("Day")} ${day + 1}`;

        // update state
        this.UpdateState(state);
    }
}




