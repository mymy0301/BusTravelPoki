import { _decorator, Component, Node } from 'cc';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { TYPE_ITEM } from 'db://assets/scripts/Utils/Types';
import { LogicItemAfterUseDone } from './LogicItemAfterUseDone';
import { LogicItemBeforeUse } from './LogicItemBeforeUse';
import { VisualItemInGame } from './VisualItemInGame';
import { DataItemSys } from '../../../DataItemSys';
const { ccclass, property } = _decorator;

@ccclass('LogicItemInGame')
export class LogicItemInGame extends Component {
    public static Instance: LogicItemInGame = null;

    @property(VisualItemInGame) visualItemVipSlot: VisualItemInGame;
    @property(VisualItemInGame) visualItemShuffle: VisualItemInGame;
    @property(VisualItemInGame) visualItemSort: VisualItemInGame;

    private logicItemAfterUseDone: LogicItemAfterUseDone = new LogicItemAfterUseDone();
    private logicItemBeforeUse: LogicItemBeforeUse = new LogicItemBeforeUse();
    private _itemTypeUsing: TYPE_ITEM = null;
    public _cantUseShuffleAnyMore: boolean = false; /// this param true if no car in ground can shuffle any more
    public _cantUseVipAnyMore: boolean = false;


    protected onLoad(): void {
        if (LogicItemInGame.Instance == null) {
            LogicItemInGame.Instance = this;
        }
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_ITEM_IN_GAME.USE_DONE_ITEM, this.UseDoneItem, this);
        clientEvent.on(MConst.EVENT_ITEM_IN_GAME.USE_VIP_SLOT_SUCCESS, this.UseVipSlotSuccess, this);
        clientEvent.on(MConst.EVENT_ITEM_IN_GAME.READY_USE_NEXT_VIP_SLOT, this.ReadyUseNextVipSlot, this);
    }

    protected onDisable(): void {
        LogicItemInGame.Instance = null;
        clientEvent.off(MConst.EVENT_ITEM_IN_GAME.USE_DONE_ITEM, this.UseDoneItem, this);
        clientEvent.off(MConst.EVENT_ITEM_IN_GAME.USE_VIP_SLOT_SUCCESS, this.UseVipSlotSuccess, this);
        clientEvent.off(MConst.EVENT_ITEM_IN_GAME.READY_USE_NEXT_VIP_SLOT, this.ReadyUseNextVipSlot, this);
    }

    public async UseDoneItem(itemType: TYPE_ITEM) {
        // set item using to null
        this._itemTypeUsing = null;

        // do something after use done item
        switch (itemType) {
            case TYPE_ITEM.VIP_SLOT:
                // turn on blockUI
                // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
                await this.logicItemAfterUseDone.ItemVipSlot();
                // turn off blockUI
                // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
                break;
            case TYPE_ITEM.SHUFFLE:
                // this._itemTypeUsing = null;
                await this.logicItemAfterUseDone.ItemShuffle();
                break;
            case TYPE_ITEM.SORT:
                // this._itemTypeUsing = null;
                await this.logicItemAfterUseDone.ItemSort();
                break;
        }

    }

    /**
     * remember just use this func in GameSys
     * @param itemType 
     */
    public async UseItem(itemType: TYPE_ITEM) {
        this._itemTypeUsing = itemType;

        if (DataItemSys.Instance == null) { return; }
        DataItemSys.Instance.AddItem([itemType], [-1], "use_in_game");
        // do something after use done item
        switch (itemType) {
            case TYPE_ITEM.VIP_SLOT:
                clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.USE_VIP_SLOT);
                await this.logicItemBeforeUse.ItemVipSlot();
                break;
            case TYPE_ITEM.SHUFFLE:
                await this.logicItemBeforeUse.ItemShuffle();
                break;
            case TYPE_ITEM.SORT:
                await this.logicItemBeforeUse.ItemSort();
                break;
        }
    }

    public GetItemTypeUsing(): TYPE_ITEM {
        return this._itemTypeUsing;
    }

    public ResetData() {
        this._cantUseShuffleAnyMore = false;
        this._cantUseVipAnyMore = false;
        this._itemTypeUsing = null;
        this.visualItemVipSlot.Show();
    }

    //#region func listen
    private UseVipSlotSuccess() {
        // hide the visual item vip slot
        this.visualItemVipSlot.Hide();
    }

    private ReadyUseNextVipSlot() {
        // show the visual item vip slot
        this.visualItemVipSlot.Show();
    }

    public CanUseShuffle() {
        // check if any rule will be add in here
        if (!this._cantUseShuffleAnyMore) return;
        this.visualItemShuffle.SetGrayOrUnGray(false, false);
        this._cantUseShuffleAnyMore = false;
    }

    public CanNotUseShuffleAnyMore() {
        this.visualItemShuffle.SetGrayOrUnGray(true, false);
        this._cantUseShuffleAnyMore = true;
    }

    public CanUseVipSlot() {
        if (!this._cantUseVipAnyMore) return;
        this.visualItemVipSlot.SetGrayOrUnGray(false, false);
        this._cantUseVipAnyMore = false;
    }

    public CanNotUseVipSlotAnyMore() {
        this.visualItemVipSlot.SetGrayOrUnGray(true, false);
        this._cantUseVipAnyMore = true;
    }
    //#endregion func listen
}


