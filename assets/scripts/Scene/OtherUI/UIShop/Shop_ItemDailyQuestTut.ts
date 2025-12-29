import { _decorator, Component, Label, Node } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../../../Const/MConst';
import { DataDailyQuestSys } from '../../../DataBase/DataDailyQuestSys';
const { ccclass, property } = _decorator;

@ccclass('Shop_ItemDailyQuestTut')
export class Shop_ItemDailyQuestTut extends Component {
    @property(Label) lbTime: Label;

    protected onEnable(): void {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateLabelTime, this);
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateLabelTime, this);
    }

    private UpdateLabelTime() {
        this.lbTime.string = DataDailyQuestSys.Instance.GetTextTimeShow();
    }
}


