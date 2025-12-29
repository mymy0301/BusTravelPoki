import { _decorator, Component, Label, Node } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { PlayerTopUIRankTournament } from './PlayerTopUIRankTournament';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { clientEvent } from '../../../framework/clientEvent';
import { IDataPlayer_LEADERBOARD, IDataTourFromServer, IInfoLeaderboardByContextId } from '../../../Utils/server/ServerPegasus';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { Utils } from '../../../Utils/Utils';
import { JSON_GAME_MANAGER_TOUR, TYPE_QUEST_DAILY } from '../../../Utils/Types';
import { GameManager } from '../../GameManager';
import { FBInstantCommon_Callback222, FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { MConsolLog } from '../../../Common/MConsolLog';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { ListRankTournament_2 } from './ListRankTournament_2';
import { EVENT_RANK_TOURNAMNET } from './TypeTournament';
import { UITournamentLeaderBoardGroupManager } from './UITournamentLeaderBoardGroupManager';
const { ccclass, property } = _decorator;

@ccclass('UIRankTournament')
export class UIRankTournament extends UIBaseSys {
    @property(Label) lbTitleTournament: Label;
    @property(Label) lbTitleShadowTournament: Label;
    @property(Label) lbTime: Label;
    @property(Label) lbNumPlayer: Label;
    @property(Node) nBtnPlay: Node;
    // @property(ListRankTournament_2) listRankTournament_2: ListRankTournament_2;
    @property([PlayerTopUIRankTournament]) playerTopUIRankTournament: PlayerTopUIRankTournament[] = [];

    @property(UITournamentLeaderBoardGroupManager) leaderBoardGroupManager: UITournamentLeaderBoardGroupManager;

    protected onDestroy(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateLbTime, this);
    }

    infoLeaderboardByContextId: IInfoLeaderboardByContextId = null;
    public async PrepareDataShow(): Promise<void> {
        clientEvent.dispatchEvent(EVENT_RANK_TOURNAMNET.FORCE_CLOSE_NOTI);
        // this.listRankTournament_2.SetUpData(this._dataCustom);
        this.leaderBoardGroupManager.resetRankGroup();
        this.infoLeaderboardByContextId = this._dataCustom as IInfoLeaderboardByContextId;
        // const dataRankTour = this._dataCustom as IInfoLeaderboardByContextId;
        // const listPlayer: IDataPlayer_LEADERBOARD[] = DataLeaderboardSys.Instance.GetLeaderboard(dataRankTour.contextId);

        this.UpdateLbNumPlayers();
        this.UpdateLbTime();
        this.UpdateLbTileTour();
        this.SetUpTop3Player();
    }

    public async UIShowDone(): Promise<void> {
        LogEventManager.Instance.logPopupShow("UIRankTournament", "UIRankTournament");

        this.leaderBoardGroupManager.initRankGroup(this.infoLeaderboardByContextId);
    }

    protected start(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateLbTime, this);
        this.UpdateLbTime();
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateLbTime, this);
    }

    private UpdateLbNumPlayers() {
        const dataRankTour = this._dataCustom as IInfoLeaderboardByContextId;
        let totalPlayers: number = DataLeaderboardSys.Instance.GetLeaderboardTotal(dataRankTour.contextId);
        let dataPlayers = DataLeaderboardSys.Instance.GetLeaderboard(dataRankTour.contextId);

        if (dataPlayers == null) {
            this.lbNumPlayer.string = "??? players";
        } else {
            if (dataPlayers.length > totalPlayers) totalPlayers = dataPlayers.length;
            this.lbNumPlayer.string = `${totalPlayers} players`;
        }
    }

    //#region SELF FUNC
    private UpdateLbTime() {
        const dataRankTour = this._dataCustom as IInfoLeaderboardByContextId;
        let time = DataLeaderboardSys.Instance.GetTimeTournament(dataRankTour.contextId);
        if (time < 0) {
            this.lbTime.string = "FINISHED";
            if (this.nBtnPlay.active) {
                this.nBtnPlay.active = false;
            }
        } else {
            this.lbTime.string = Utils.convertTimeLengthToFormat(time);
            if (!this.nBtnPlay.active) {
                this.nBtnPlay.active = true;
            }
        }
    }
    private UpdateLbTileTour() {
        const tileTournament = this._dataCustom as IInfoLeaderboardByContextId;
        this.lbTitleTournament.string = tileTournament.name;
        this.lbTitleShadowTournament.string = tileTournament.name;
    }

    private SetUpTop3Player() {
        const dataRankTour = this._dataCustom as IInfoLeaderboardByContextId;
        let dataPlayerLeaderboard = DataLeaderboardSys.Instance.GetLeaderboard(dataRankTour.contextId);
        if (dataPlayerLeaderboard == null || dataPlayerLeaderboard.length == 0) {
            dataPlayerLeaderboard = [];
            let myPlayer: IDataPlayer_LEADERBOARD = {
                rank: 1,
                score: -10000,
                playerId: "" + MConfigFacebook.Instance.playerID,
                name: MConfigFacebook.Instance.playerName,
                avatar: MConfigFacebook.Instance.playerPhotoURL
            }
            dataPlayerLeaderboard.push(myPlayer);
        }
        // console.log("leaderBoard: ", dataPlayerLeaderboard);
        for (let i = 0; i < this.playerTopUIRankTournament.length; i++) {
            const dataPlayer = dataPlayerLeaderboard[i];
            if (dataPlayer == null) {
                this.playerTopUIRankTournament[i].Hide();
            } else {
                this.playerTopUIRankTournament[i].SetUp(dataPlayer);
            }
        }
    }
    //#endregion SELF FUNC

    //#region FUNC BTN 
    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick("close", "UIRankTournament");
        // this.listRankTournament.ResetData();
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_RANK_TOURNAMENT, 1);
    }

    private OnBtnPlay() {
        LogEventManager.Instance.logButtonClick("play", "UIRankTournament");
        const dataRankTour = this._dataCustom as IInfoLeaderboardByContextId;

        async function JoinGameSuccess(infoTour: IInfoLeaderboardByContextId) {
            let jsonGameManager = new JSON_GAME_MANAGER_TOUR();
            jsonGameManager.id_leaderboard = infoTour._id;
            jsonGameManager.context_tournament = infoTour.contextId;
            jsonGameManager.tournament_id = infoTour.tournamentId;
            jsonGameManager.name_leaderboard = infoTour.name;
            jsonGameManager.levels = infoTour.levels;
            jsonGameManager.rewards = infoTour.rewards;
            GameManager.Instance.PreparePlayTournament(jsonGameManager);

            // ||**DQ**||
            clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.PLAY_TOURNAMENT_GAME, 1);
        }

        let cb: FBInstantCommon_Callback222 = async (error: Error | null, success: string) => {
            // JoinGameSuccess(dataRankTour);

            // FBInstantManager.Instance.tournamentID = dataRankTour.contextId;
            // MConsolLog.Log("In real Tournament ID: ", dataRankTour.contextId);
            if (success == MConst.FB_CALLBACK_SUCCESS) {
                // we was set config when show UIRank from ItemUILiveTournaments
                // MConsolLog.Log(MConfigs.Mode.TOURNAMENT);
                JoinGameSuccess(dataRankTour);

                FBInstantManager.Instance.tournamentID = dataRankTour.contextId;
                MConsolLog.Log("In real Tournament ID: ", dataRankTour.contextId);

            } else {
                console.log(error);
            }
        };

        // call join Tournament
        FBInstantManager.Instance.joinTournament(dataRankTour.contextId, cb);
    }
    //#endregion FUNC BTN
}


