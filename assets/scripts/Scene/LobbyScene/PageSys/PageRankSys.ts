import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { UIRank } from '../../OtherUI/UIRank/UIRank';
import { UILoadingSys_2 } from '../../OtherUI/UILoadingSys_2';
import { PAGE_VIEW_LOBBY_NAME } from '../../../Utils/Types';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { PageLobbyBase } from '../../../Common/PageLobbyBase';
import { DataWeeklySys } from '../../../DataBase/DataWeeklySys';
const { ccclass, property } = _decorator;

@ccclass('PageRankSys')
export class PageRankSys extends PageLobbyBase {

    public static Instance: PageRankSys = null;
    @property(UILoadingSys_2) UILoadingSys_2: UILoadingSys_2;

    protected onLoad(): void {
        if (PageRankSys.Instance == null) {
            PageRankSys.Instance = this;
            this.UILoadingSys_2.Show();
        }
    }

    protected onDestroy(): void {
        PageRankSys.Instance = null;
    }

    private isCallLoadUI: boolean = false;
    override ShowPage(): void {
        if (this.isCallLoadUI) return;
        this.isCallLoadUI = true;
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI_SPECIAL, TYPE_UI.UI_RANK, this.node, null, () => {
            this.UILoadingSys_2.Close();
        });
    }
}


