import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { Utils } from '../../../Utils/Utils';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { DataSeasonPassSys } from '../../../DataBase/DataSeasonPassSys';
const { ccclass, property } = _decorator;

@ccclass('DoubleKeyVisualSys')
export class DoubleKeyVisualSys extends Component {
    @property(Node) nIcKey: Node;
    @property(Label) lbDoubleKey: Label;
    @property(Label) lbTime: Label;

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_DOUBLE_KEY.UPDATE_TIME_INFI, this.UpdateLabel, this);
        clientEvent.on(MConst.EVENT_DOUBLE_KEY.END_TIME_INFI_WHEN_RUNNING, this.TurnOff, this);
        clientEvent.on(MConst.EVENT_DOUBLE_KEY.FORCE_STOP_TIME, this.TurnOff, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_DOUBLE_KEY.UPDATE_TIME_INFI, this.UpdateLabel, this);
        clientEvent.off(MConst.EVENT_DOUBLE_KEY.END_TIME_INFI_WHEN_RUNNING, this.TurnOff, this);
        clientEvent.off(MConst.EVENT_DOUBLE_KEY.FORCE_STOP_TIME, this.TurnOff, this);

    }

    public SetUp() {
        // check if is double key => turn on 
        // this.lbDoubleKey.outlineColor = DataSeasonPassSys.Instance.getColorOutlineTextX2();
        this.nIcKey.getComponent(Sprite).spriteFrame = MConfigResourceUtils.getKeySeasonPass(DataSeasonPassSys.Instance.getIndexSeasonPass());
        if (DataSeasonPassSys.Instance.IsDoublingKey()) {
            this.TurnOn();
        } else {
            this.TurnOff();
        }
    }

    private UpdateLabel(time: number) {
        this.lbTime.string = Utils.convertTimeToFormat(time);
    }

    public TurnOn() {
        this.node.active = true;
        // in case it was turn off but in game running in somehow it call turn on again 
        if (!DataSeasonPassSys.Instance.IsDoublingKey()) {
            this.TurnOff();
        }
    }

    public TurnOff() {
        this.node.active = false;
    }
}


