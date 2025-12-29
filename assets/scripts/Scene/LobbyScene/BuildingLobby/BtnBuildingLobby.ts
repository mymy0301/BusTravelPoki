import { _decorator, Component, Label, Node, ProgressBar } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { DataBuildingSys } from '../../../DataBase/DataBuildingSys';
const { ccclass, property } = _decorator;

@ccclass('BtnBuildingLobby')
export class BtnBuildingLobby extends Component {
    @property(Node) nNotification: Node;
    // @property(Label) lbNumBuildingCanBuild: Label;
    @property(ProgressBar) pb: ProgressBar;
    @property(Label) lbNameMapShadow: Label;
    @property(Label) lbNameMap: Label;

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_BUILDING.UPDATE_UI_BTN_BUILD, this.onUpdateNotification, this);
        this.onUpdateNotification();
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_BUILDING.UPDATE_UI_BTN_BUILD, this.onUpdateNotification, this);
    }

    private UpdateProgress() {
        const progressNow = DataBuildingSys.Instance.GetNumConsUnlocked()
        const progressMax = DataBuildingSys.Instance.GetTotalConsThisMap();
        if (progressMax <= 0) {
            this.pb.progress = 0;
        } else {
            this.pb.progress = progressNow / progressMax;
        }
    }

    private UpdateNameMap() {
        const nameMap = DataBuildingSys.Instance.GetNameMapNow();
        this.lbNameMapShadow.string = nameMap;
        this.lbNameMap.string = nameMap;
    }

    onUpdateNotification() {
        const numBlockPlayerNow = DataBuildingSys.Instance.GetNumBlockPlayerNow();
        // this.lbNumBuildingCanBuild.string = numBuidlingCanBuild.toString();
        this.nNotification.active = numBlockPlayerNow > 0;
        this.UpdateNameMap();
        this.UpdateProgress();
        return;
    }
}


