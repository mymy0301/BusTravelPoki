import { _decorator, Color, Component, Enum, Label, Node, Sprite } from 'cc';
import { TYPE_ITEM } from '../../../Utils/Types';
import { DataItemSys } from '../../DataItemSys';
import { Utils } from '../../../Utils/Utils';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ItemBoosterUIPrepareNG')
export class ItemBoosterUIPrepareNG extends Component {
    @property(Label) lbNumItem: Label;
    @property(Label) lbTimeInfinity: Label;

    @property({ type: TYPE_ITEM }) private typeItemSupport: TYPE_ITEM = TYPE_ITEM.TIME;

    protected onLoad(): void {
        this.SetLabelNumItem();
        this.lbTimeInfinity.string = 'Loading...';

        // register listener
        clientEvent.on(MConst.EVENT.EVENT_UPDATE_DATA_FROM_DataItemSys, this.SetLabelNumItem, this);
        clientEvent.on(MConst.EVENT_ITEM.UPDATE_TIME_INFI, this.SetLabelTimeItem, this);
        clientEvent.on(MConst.EVENT_ITEM.END_TIME_INFI, this.EndTime, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT.EVENT_UPDATE_DATA_FROM_DataItemSys, this.SetLabelNumItem, this);
        clientEvent.off(MConst.EVENT_ITEM.UPDATE_TIME_INFI, this.SetLabelTimeItem, this);
        clientEvent.off(MConst.EVENT_ITEM.END_TIME_INFI, this.EndTime, this);
    }

    //#region self func
    public GetTypeItem(): TYPE_ITEM {
        return this.typeItemSupport;
    }

    public GetTypeItemSupport(): TYPE_ITEM {
        return this.typeItemSupport;
    }

    private SetLabelNumItem() {
        const _typeItem: TYPE_ITEM = this.GetTypeItem();
        this.lbNumItem.string = DataItemSys.Instance.GetNumItem(_typeItem).toString();
    }

    private SetLabelTimeItem(typeItem: TYPE_ITEM, timeRemaining: number) {
        if (typeItem == this.GetTypeItem()) {
            this.lbTimeInfinity.string = Utils.convertTimeToFormat(timeRemaining);
        }
    }

    private EndTime(typeItem: TYPE_ITEM) {
        if (typeItem == this.GetTypeItem()) {
            this.lbTimeInfinity.string = '00:00';
        }
    }
    //#endregion self func
}


