import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { PAGE_VIEW_LOBBY_NAME } from '../../../Utils/Types';
import { UILoadingSys_2 } from '../../OtherUI/UILoadingSys_2';
import { UILobbySys } from '../UILobbySys';
import { PageLobbyBase } from '../../../Common/PageLobbyBase';
const { ccclass, property } = _decorator;

@ccclass('PageCustomSys')
export class PageCustomSys extends PageLobbyBase {

    public static Instance: PageCustomSys = null;
    @property(UILoadingSys_2) UILoadingSys_2: UILoadingSys_2;

    protected onLoad(): void {
        if (PageCustomSys.Instance == null) {
            PageCustomSys.Instance = this;
        }
        this.UILoadingSys_2.Show();
    }

    protected onDestroy(): void {
        PageCustomSys.Instance = null;
    }

    private isCallLoadUI: boolean = false;
    override ShowPage(): void {
        if (this.isCallLoadUI) return;
        this.isCallLoadUI = true;
        UILobbySys.Instance.ShowUISpecial(TYPE_UI.UI_CUSTOM_INVITE, this.node, null, () => {
            this.UILoadingSys_2?.Close();
        })
    }
}


