import { _decorator, Button, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { Utils } from '../../../Utils/Utils';
import { IDataPlayer_LEADERBOARD, IInfoLeaderboardByContextId } from '../../../Utils/server/ServerPegasus';
import { ListPrizePreshow } from './ListPrizePreshow';
import { Info } from 'electron/main';
import { InfoTournamentData } from '../../../Utils/Types';
import { ReadDataJson, ReadJsonOptimized } from '../../../ReadDataJson';
import { PageTournamentSys } from '../../LobbyScene/PageSys/PageTournamentSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('ItemTournament')
export class ItemTournament extends Component {
    @property(Sprite) spAvatar: Sprite;
    @property(Label) lbNameTour: Label;
    @property(Label) lbTime: Label;
    @property(Label) lbNumPlayers: Label;
    @property(Label) lbNamePlayer: Label;
    @property(ListPrizePreshow) listPrizePreShow: ListPrizePreshow;

    @property(Node) nodeBtnJoin: Node;
    @property(Node) nodeBtnShowRank: Node;

    private _pathAvatarTop1: string = null;
    private _dataTour: IInfoLeaderboardByContextId = null;
    @property(SpriteFrame) sfAvatarDefault: SpriteFrame = null;

    infoTournamentData: InfoTournamentData = new InfoTournamentData();

    protected onEnable(): void {
        clientEvent.on(MConst.TOURNAMENT_GETTOPPLAYERS_UPDATE,this.setGetTopPlayersUpdate,this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.TOURNAMENT_GETTOPPLAYERS_UPDATE,this.setGetTopPlayersUpdate,this);
    }

    private setGetTopPlayersUpdate(contextID: string) {
        if (this._dataTour != null && contextID == this._dataTour.contextId) {
            let leaderBoard = DataLeaderboardSys.Instance.GetLeaderboard(this._dataTour.contextId);
            if (leaderBoard != null) {
                this.LoadAvatarPlayerTop1(this._dataTour.contextId);
                this.UpdateLbNumPlayers();
                this.UpdateTime();
                // listen clock time global
                clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
                this.UpdateTime();
                clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
            }

        }
    }

    public SetUp(data: IInfoLeaderboardByContextId) {
        // console.log("SetUp ItemTournament",data);
        //update UI in here
        this._dataTour = data;

        if (data != null) {
            PageTournamentSys.Instance.HideUILoading();
        }

        this.lbNameTour.string = data.name;
        let jsonData = JSON.parse(data.data);
        this.infoTournamentData.levels = jsonData.levels;
        for (let i = 0; i < jsonData.rewards.length; i++) {
            let infoPrize = ReadJsonOptimized(jsonData.rewards[i]);
            this.infoTournamentData.rewards.push(infoPrize);
        }
        // set up prize
        if (this.infoTournamentData) {
            this.listPrizePreShow.InitListPrize(this.infoTournamentData.rewards);
        } else {
            this.listPrizePreShow.Hide();
        }
        this._dataTour.levels = this.infoTournamentData.levels;
        this._dataTour.rewards = this.infoTournamentData.rewards;

        let leaderBoard = DataLeaderboardSys.Instance.GetLeaderboard(this._dataTour.contextId);
        if (leaderBoard != null) {
            this.LoadAvatarPlayerTop1(this._dataTour.contextId);
            this.UpdateLbNumPlayers();
            this.UpdateTime();
            // listen clock time global
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
            this.UpdateTime();
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        }

    }

    protected onDestroy(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    private LoadAvatarPlayerTop1(contextId: string) {
        let leaderBoard = DataLeaderboardSys.Instance.GetLeaderboard(contextId);
        if (leaderBoard == null || leaderBoard.length == 0) {
            leaderBoard = [];
            let myPlayer: IDataPlayer_LEADERBOARD = {
                rank: 1,
                score: -10000,
                playerId: "" + MConfigFacebook.Instance.playerID,
                name: MConfigFacebook.Instance.playerName,
                avatar: MConfigFacebook.Instance.playerPhotoURL
            }
            leaderBoard.push(myPlayer);
        }
        // console.log("leaderBoard: ", leaderBoard);
        let infoTop1Tournament = leaderBoard[0];
        if (infoTop1Tournament != null) {
            // set name
            this.lbNamePlayer.string = infoTop1Tournament.name;

            // load image
            this._pathAvatarTop1 = infoTop1Tournament.avatar;
            this.spAvatar.spriteFrame = this.sfAvatarDefault;
            const self = this;
            try {
                ResourceUtils.TryLoadImageAvatar(this._pathAvatarTop1, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                    if (pathAvatar == self._pathAvatarTop1 && self.node != null && self.node.isValid) {
                        self.spAvatar.spriteFrame = spriteFrame;
                    }
                });
            } catch (e) {

            }
        }
    }

    private UpdateTime() {
        // get the time
        let timeRemaining = DataLeaderboardSys.Instance.GetTimeTournament(this._dataTour.contextId);
        if (timeRemaining <= 0) {
            this.lbTime.string = "FINISHED";
            if (this.nodeBtnJoin.active == true) {
                this.nodeBtnJoin.active = false;
                this.nodeBtnShowRank.active = true;
                // set it to the last item of parent
                const numItemOfThisParent = this.node.parent.children.length;
                this.node.setSiblingIndex(numItemOfThisParent - 1);
            }
        } else {
            this.lbTime.string = Utils.convertTimeLengthToFormat(timeRemaining);
            if (this.nodeBtnJoin.active == false) {
                this.nodeBtnJoin.active = true;
                this.nodeBtnShowRank.active = false;
            }
        }

    }

    private UpdateLbNumPlayers() {
        let totalPlayers: number = DataLeaderboardSys.Instance.GetLeaderboardTotal(this._dataTour.contextId);
        let dataPlayers = DataLeaderboardSys.Instance.GetLeaderboard(this._dataTour.contextId);

        if (dataPlayers == null || dataPlayers.length == 0) {
            this.lbNumPlayers.string = "??? players";
        } else {
            if (dataPlayers.length > totalPlayers) totalPlayers = dataPlayers.length;
            this.lbNumPlayers.string = `${totalPlayers} players`;
        }
    }
    //#endregion Update UI Time

    //#region FUNC BTN
    private OnClickBtnJoin() {
        LogEventManager.Instance.logButtonClick(`join`, "ItemTournament");

        //show UIRankTournament of that tournament
        if (this._dataTour != null) {
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_RANK_TOURNAMENT, 1, true, this._dataTour);
        }
    }

    private OnClickBtnShowRank() {
        LogEventManager.Instance.logButtonClick(`show_rank`, "ItemTournament");

        if (this._dataTour != null) {
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_RANK_TOURNAMENT, 1, true, this._dataTour);
        }
    }
    //#endregion FUNC BTN
}


