import { _decorator, Component, Label, Node } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { JSON_GAME_MANAGER_TOUR, TYPE_GAME_PLAY_TOURNAMENT } from '../../../Utils/Types';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { GameManager } from '../../GameManager';
import { MConfigs } from '../../../Configs/MConfigs';
import { clientEvent } from '../../../framework/clientEvent';
import { PageTournamentSys } from '../../LobbyScene/PageSys/PageTournamentSys';
import { ListTournament } from './ListTournament';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
const { ccclass, property } = _decorator;

@ccclass('UITournament')
export class UITournament extends UIBaseSys {
    @property(Node) listNWhen_passLevelTour: Node[] = [];
    @property(Node) listNWhen_not_passLevelTour: Node[] = [];
    @property(Node) listNWhen_no_tour: Node[] = [];
    @property(Label) lbLockTour: Label;
    @property(ListTournament) listTournament: ListTournament;

    protected onLoad(): void {
        this.lbLockTour.string = `Unlock tournament\nat lv.${MConfigs.LEVEL_TUTORIAL_EVENT.Tournament}`;

        if (GameManager.Instance.GetLevelPlayerNow() >= MConfigs.LEVEL_TUTORIAL_EVENT.Tournament) {
            // check have any tournament
            const listIdTour = DataLeaderboardSys.Instance.GetListTouringByContextId();

            if (listIdTour.length > 0) {
                this.listNWhen_not_passLevelTour.forEach((item) => item.active = false);
                this.listNWhen_passLevelTour.forEach((item) => item.active = true);
                this.listNWhen_no_tour.forEach((item) => item.active = false);
            } else {
                this.listNWhen_no_tour.forEach((item) => item.active = true);
                this.listNWhen_not_passLevelTour.forEach((item) => item.active = false);
                this.listNWhen_passLevelTour.forEach((item) => item.active = false);
                PageTournamentSys.Instance.HideUILoading();
            }
        } else {
            this.listNWhen_not_passLevelTour.forEach((item) => item.active = true);
            this.listNWhen_passLevelTour.forEach((item) => item.active = false);
            this.listNWhen_no_tour.forEach((item) => item.active = false);
            PageTournamentSys.Instance.HideUILoading();
        }
    }
}


