import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { UILoadingSys_2 } from '../../OtherUI/UILoadingSys_2';
import { PageLobbyBase } from '../../../Common/PageLobbyBase';
import { UITournament } from '../../OtherUI/UITournament/UITournament';
const { ccclass, property } = _decorator;

@ccclass('PageTournamentSys')
export class PageTournamentSys extends PageLobbyBase {
    public static Instance: PageTournamentSys = null;
    @property(UILoadingSys_2) UILoadingSys_2: UILoadingSys_2;
    private _nUITournament: Node = null;

    protected onLoad(): void {
        if (PageTournamentSys.Instance == null) {
            PageTournamentSys.Instance = this;
        }
    }

    protected onDestroy(): void {
        PageTournamentSys.Instance = null;
    }

    protected onEnable(): void {
        if (this._nUITournament != null) {
            this._nUITournament.getComponent(UITournament).listTournament.HasDataInit && this.UILoadingSys_2.Close();
        }
    }

    protected start(): void {
        // gen UI Tournament and set to this node
        this.UILoadingSys_2.Show();

        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI_SPECIAL, TYPE_UI.UI_TOURNAMENT, this.node, (nUI: Node) => {
            this._nUITournament = nUI;
            nUI.setSiblingIndex(0);
        });
    }

    override ShowPage(): void {

    }

    public HideUILoading() {
        this.UILoadingSys_2.Close();
    }

    public ShowUILoading() {
        this.UILoadingSys_2.Show();
    }
}


