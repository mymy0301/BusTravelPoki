import { _decorator, Component, Node } from 'cc';
import { MConfigs } from '../Configs/MConfigs';
import { MConfigFacebook } from '../Configs/MConfigFacebook';
import { MConst } from '../Const/MConst';
import { clientEvent } from '../framework/clientEvent';
import { PlayerData } from '../Utils/PlayerData';
import { Utils } from '../Utils/Utils';
import { IDataGetPlayerByPlayerIds, IDataJsonGameServer, IDataLeaderboardByContextIds, IDataPlayer_LEADERBOARD, IDataTopPlayerInLeaderboard, IDataTourFromServer, IInfoLeaderboardByContextId, ServerPegasus, IDataPlayer_GetPlayerByIds, IDataGetPLayerAroundPlayerInLeaderboard } from '../Utils/server/ServerPegasus';
import { LogicGenContextIdWeekly } from '../Utils/server/LogicGenContextIdWeekly';
import { MConsolLog } from '../Common/MConsolLog';
import { CheatingSys } from './CheatingSys';
import { IJsonPrizeLeaderboard, IPrize, TYPE_EVENT_GAME, TYPE_PRIZE, TYPE_RECEIVE } from '../Utils/Types';
import { ReadJsonOptimized } from '../ReadDataJson';
const { ccclass, property } = _decorator;

@ccclass('DataLeaderboardSys')
export class DataLeaderboardSys {
    public static Instance: DataLeaderboardSys;

    private _wasReceiveListRankEventWeekly: boolean = false;
    private _wasReceiveListRankEventWorld: boolean = false;
    private _wasReceiveListRankEventFriend: boolean = false;

    public _logicGenContextIdWeekly: LogicGenContextIdWeekly = null;

    private readonly maxBotOfLeaderboardWorldAndWeekly = 20;
    private readonly maxBotDefaultOfLeaderboardTour = 50;

    private _mapTournamentTotal: Map<string, number> = new Map<string, number>();
    private _mapTournamentGame: Map<string, IDataPlayer_LEADERBOARD[]> = new Map<string, IDataPlayer_LEADERBOARD[]>();          // this map to save <contextIdLeaderboard, data>
    private _mapInfoTournamentGame: Map<string, IInfoLeaderboardByContextId> = new Map<string, IInfoLeaderboardByContextId>();  // this map to save <contextIdLeaderboard, info>
    private _listContextIdTournament: string[] = []; public get ListContextIdTournament(): string[] { return this._listContextIdTournament; } // this list used for save all tournament < expect world , weekly , friend>

    private _server_dataTourGame: IDataTourFromServer[] = [];
    private _server_time_next_banner: number = 0;
    private _server_time_next_inter: number = 0;
    private _server_time_next_inter_after_reward: number = 0;

    private _totalPlayerInWorld: number = 0;

    constructor() {
        if (DataLeaderboardSys.Instance == null) {
            DataLeaderboardSys.Instance = this;

            // init class
            this._logicGenContextIdWeekly = new LogicGenContextIdWeekly();

            clientEvent.on(MConst.EVENT_LEADERBOARD.UPDATE_DATA_LEADERBOARD_FRIEND, this.GenDataFriendLeaderboard, this);
        }
    }

    //#region func gen data bot
    /**
     * this func just only call for world , weekly
     * @param numBotGen 
     * @param seed 
     * @returns 
     */
    private genLeaderboardWithBot(dataRoot: IDataPlayer_LEADERBOARD[], numBotGen: number, seed: string): IDataPlayer_LEADERBOARD[] {
        let mixBotData: IDataPlayer_LEADERBOARD[] = this.mixBot(dataRoot, numBotGen, seed);

        MConsolLog.Log2("Check seed", seed)

        // add player 
        let indexPlayer = mixBotData.findIndex(obj => obj.playerId == MConfigFacebook.Instance.playerID);
        if (indexPlayer == -1) {
            let playerRankInfo = this.CreateItemRankInfo();
            mixBotData.push(playerRankInfo);
        }

        // sort data
        let dataBotAndPlayerReal: IDataPlayer_LEADERBOARD[] = this.sortArr(mixBotData);

        dataBotAndPlayerReal = this.SortDataWithChangeRank(Array.from(dataBotAndPlayerReal));

        return dataBotAndPlayerReal;
    }

    /**
     * this. func only be called by the leaderboard of tournament
     * @param numBotGen 
     * @param seed 
     * @returns 
     */
    private genLeaderboardTourWithBot(dataRoot: IDataPlayer_LEADERBOARD[], numBotGen: number, seed: string): IDataPlayer_LEADERBOARD[] {
        let mixBotData: IDataPlayer_LEADERBOARD[] = this.mixBot(dataRoot, numBotGen, seed);

        // add player 
        let indexPlayer = mixBotData.findIndex(obj => obj.playerId == MConfigFacebook.Instance.playerID);
        if (indexPlayer == -1) {
            let playerRankInfo = this.CreateItemRankInfo();
            playerRankInfo.score = 0;
            mixBotData.push(playerRankInfo);
        }

        // sort data
        let dataBotAndPlayerReal: IDataPlayer_LEADERBOARD[] = this.sortArr(mixBotData);

        dataBotAndPlayerReal = this.SortDataWithChangeRank(Array.from(dataBotAndPlayerReal));

        return dataBotAndPlayerReal;
    }

    public GetInfoPlayerTemp(): IDataPlayer_LEADERBOARD {
        return {
            rank: 1,
            score: 0,
            playerId: MConfigFacebook.Instance.playerID,
            name: MConfigFacebook.Instance.playerName,
            avatar: MConfigFacebook.Instance.playerPhotoURL
        }
    }
    //#endregion

    //#region self func
    private SortDataWithChangeRank(data: IDataPlayer_LEADERBOARD[]): IDataPlayer_LEADERBOARD[] {
        let dataSort = Array.from(data);
        for (let i = 0; i < dataSort.length; i++) {
            dataSort[i].rank = i + 1;
        }
        return data;
    }

    private UpdateLeaderBoardFromServer(contextIdLeaderboard: string, dataPlayer: IDataPlayer_LEADERBOARD[], total: number, acceptPlayerZeroScore: boolean = true) {
        // check if case friend => not to gen bot just only save data
        this._mapTournamentTotal.set(contextIdLeaderboard, total);

        if (contextIdLeaderboard == MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND) {
            // save data
            this._mapTournamentGame.set(contextIdLeaderboard, dataPlayer);

            return;
        }

        if (dataPlayer == null) {
            this._mapTournamentGame.set(contextIdLeaderboard, []);
            return;
        }

        // console.log("UpdateLeaderBoardFromServer", contextIdLeaderboard, dataPlayer);

        // // get data
        // let realData: IDataPlayer_LEADERBOARD[] = [...dataPlayer];
        // // gen seed
        // let seed = '';
        // switch (contextIdLeaderboard) {
        //     case this.ID_LEADERBOARD_WEEKLY: case MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD:
        //         seed = MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD;
        //         break;
        //     default:
        //         seed = contextIdLeaderboard;
        //         break;
        // }

        // // gen data bot
        // let dataBotAndPlayerReal: IDataPlayer_LEADERBOARD[] = [];
        // switch (contextIdLeaderboard) {
        //     case this.ID_LEADERBOARD_WEEKLY: case MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD:
        //         dataBotAndPlayerReal = this.genLeaderboardWithBot(realData, 20, seed); break;
        //     default:
        //         dataBotAndPlayerReal = this.genLeaderboardTourWithBot(realData, 20, seed); break;
        // }

        // // fix the indexRank All player
        // dataBotAndPlayerReal = this.SortDataWithChangeRank(Array.from(dataBotAndPlayerReal));

        // // not accept player have 0 Score except player
        // if (!acceptPlayerZeroScore) {
        //     dataBotAndPlayerReal = dataBotAndPlayerReal.filter(obj => obj.score > 0 && obj.playerId != MConfigFacebook.Instance.playerID || obj.playerId == MConfigFacebook.Instance.playerID);
        // }

        // // save data
        // // console.log("2222222222222", this._mapTournamentGame, dataBotAndPlayerReal);
        this._mapTournamentGame.set(contextIdLeaderboard, dataPlayer);


        clientEvent.dispatchEvent(MConst.TOURNAMENT_GETTOPPLAYERS_UPDATE, contextIdLeaderboard);
    }

    private sortArr(arr: IDataPlayer_LEADERBOARD[]): IDataPlayer_LEADERBOARD[] {
        arr.sort((a, b) => b.score - a.score);

        // find indexRank Player if player is out 100 rank => add him to the last
        let indexPlayer = arr.findIndex(obj => obj.playerId == MConfigFacebook.Instance.playerID);

        // just get 99 first player and player 
        if (arr.length >= 100) {
            let player: IDataPlayer_LEADERBOARD = null;
            if (indexPlayer >= 100) { player = arr[indexPlayer]; }
            arr = arr.slice(0, 100);
            if (indexPlayer >= 100) { arr.push(player); }
        }

        return arr;
    }

    private mixBot(arrReal: IDataPlayer_LEADERBOARD[], numberFake: number, seed: string): IDataPlayer_LEADERBOARD[] {
        let result: IDataPlayer_LEADERBOARD[] = [];

        result.push(...[...MConfigs.getFakeDataUserTournament(numberFake, 0, 3, 8, seed)], ...arrReal);
        result.sort((a, b) => b.score - a.score);

        return result;
    }

    private CreateItemRankInfo(): IDataPlayer_LEADERBOARD {
        let playerRankInfo: IDataPlayer_LEADERBOARD = {
            rank: 999,
            score: PlayerData.Instance._levelPlayer,
            avatar: MConfigFacebook.Instance.playerPhotoURL,
            name: MConfigFacebook.Instance.playerName,
            playerId: MConfigFacebook.Instance.playerID
        }
        return playerRankInfo;
    }

    /**
     * This func will be call in 2 case
     * Case 1: was init leaderboard => not create new just return it
     * Case 2: was not init leaderboard => create new and return it
     * @param contextIdLeaderboard 
     * @returns 
     */
    private GetTempLeaderboard(contextIdLeaderboard: string): IDataPlayer_LEADERBOARD[] {

        if (!this._mapTournamentGame.has(contextIdLeaderboard)) {
            let keyGen = contextIdLeaderboard;
            if (contextIdLeaderboard == MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND) {
                let mapFriendCheck = this._mapTournamentGame.get(contextIdLeaderboard)
                if (mapFriendCheck == null || mapFriendCheck.length <= 0) {
                    // ====================== create list player ======================
                    // for (let i = 0; i < 1; i++) {
                    //     let newPlayer: IDataPlayer_LEADERBOARD = this.CreateItemRankInfo();
                    //     newPlayer.rank = 1;
                    //     newPlayer.playerId = `id_${i}`;
                    //     this._mapTournamentGame.set(contextIdLeaderboard, [newPlayer]);
                    // }

                    // ====================== create only player ======================
                    let newPlayer: IDataPlayer_LEADERBOARD = this.CreateItemRankInfo();
                    newPlayer.rank = 1;
                    this._mapTournamentGame.set(contextIdLeaderboard, [newPlayer]);
                }

            } else {
                // ====================== create only player ======================
                // add player 
                let playerRankInfo = this.CreateItemRankInfo();
                playerRankInfo.rank = 1;
                this._mapTournamentGame.set(contextIdLeaderboard, [playerRankInfo]);

                // ====================== create list player ======================
                // if (contextIdLeaderboard == MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD || contextIdLeaderboard == this.ID_LEADERBOARD_WEEKLY) {
                //     keyGen = MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD;
                //     this._mapTournamentGame.set(contextIdLeaderboard, this.genLeaderboardWithBot([], this.maxBotOfLeaderboardWorldAndWeekly, keyGen));
                // } else {
                //     this._mapTournamentGame.set(contextIdLeaderboard, this.genLeaderboardTourWithBot([], this.maxBotDefaultOfLeaderboardTour, keyGen));
                // }
            }
        }

        let result = this._mapTournamentGame.get(contextIdLeaderboard);
        return result;
    }

    private UpdateLeaderBoard(contextIdLeaderboard: string, newData: IDataPlayer_LEADERBOARD[]) {
        if (this._mapTournamentGame.has(contextIdLeaderboard)) {
            this._mapTournamentGame.set(contextIdLeaderboard, newData);
        }
    }

    private GenDataPlayer(): IDataPlayer_LEADERBOARD {
        return {
            rank: 0,
            score: PlayerData.Instance._levelPlayer,
            playerId: MConfigFacebook.Instance.playerID,
            name: MConfigFacebook.Instance.playerName,
            avatar: MConfigFacebook.Instance.playerPhotoURL
        }
    }

    //#endregion

    // #region common func
    private async GenDataFriendLeaderboard() {
        // console.log("check friend leaderboard", MConfigFacebook.Instance.arrConnectedPlayerInfos);

        if ((MConfigFacebook.Instance.arrConnectedPlayerInfos != null && MConfigFacebook.Instance.arrConnectedPlayerInfos.length > 0)) {
            let dataPlayer: IDataGetPlayerByPlayerIds = await ServerPegasus.Instance.GetPlayerByPlayerIds(MConfigFacebook.Instance.arrConnectedPlayerInfos.map(player => player.id));
            // test 
            // let dataPlayer: IDataGetPlayerByPlayerIds = await ServerPegasus.Instance.GetPlayerByPlayerIds(['8318176264925852', '8409258099162808']);
            // console.log("check dataPlayerFromServer", dataPlayer);

            if (dataPlayer != null && dataPlayer.success) {
                let result: IDataPlayer_LEADERBOARD[] = [];
                let dataPlayerFriend: IDataPlayer_GetPlayerByIds[] = dataPlayer.data;
                for (let i = 0; i < dataPlayerFriend.length; i++) {
                    const dataConvert = dataPlayerFriend[i];
                    let player: IDataPlayer_LEADERBOARD = {
                        rank: 0,
                        score: dataConvert.level == null ? 1 : dataConvert.level,
                        playerId: dataConvert.playerId,
                        name: dataConvert.name,
                        avatar: dataConvert.avatar
                    }
                    result.push(player);
                }

                // add the player
                result.push(this.GenDataPlayer());

                // sort the data suit with score
                result = result.sort((a, b) => b.score - a.score);
                result = Array.from(this.SortDataWithChangeRank(Array.from(result)));
                this.UpdateLeaderBoardFromServer(MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND, Array.from(result), result.length);

                // console.log("check result friend leaderboard", Array.from(result));
            }
        }
    }

    public async GetLeaderboardByContextsIdsCustom(contextId: string): Promise<{ data: IDataPlayer_LEADERBOARD[], prize: IPrize[][] }> {
        let jsonGetLeaderboardByContextIds = await ServerPegasus.Instance.GetLeaderboardByContextIds([contextId]);

        // console.log("jsonGetLeaderboardByContextIds", jsonGetLeaderboardByContextIds);

        if (jsonGetLeaderboardByContextIds != null && jsonGetLeaderboardByContextIds.success) {
            let dataLeaderboardWeek = await ServerPegasus.Instance.GetPlayersAroundPlayerInLeaderboard(jsonGetLeaderboardByContextIds.data[0]._id, 1);

            // console.log("dataLeaderboardWeek", dataLeaderboardWeek);

            if (dataLeaderboardWeek != null && dataLeaderboardWeek.success && jsonGetLeaderboardByContextIds.data[0].data != null) {
                const listPrize = [];
                const jsonPrizeWeekly = JSON.parse(jsonGetLeaderboardByContextIds.data[0].data).rewards;
                for (let i = 0; i < jsonPrizeWeekly.length; i++) {
                    const element = jsonPrizeWeekly[i];
                    let listPrizeCheck = ReadJsonOptimized(element);
                    listPrize.push(listPrizeCheck);
                }
                return { data: dataLeaderboardWeek.data, prize: listPrize };
            }
        }

        return null;
    }

    public async GetLeaderboardByContextsIdsCustom_2(contextId: string): Promise<{ data: IDataPlayer_LEADERBOARD[], prize: IPrize[][] }> {
        let jsonGetLeaderboardByContextIds = await ServerPegasus.Instance.GetLeaderboardByContextIds([contextId]);
        // console.log("jsonGetLeaderboardByContextIds", jsonGetLeaderboardByContextIds, contextId);
        // console.log("jsonGetLeaderboardByContextIds", jsonGetLeaderboardByContextIds.data[0]._id);

        if (jsonGetLeaderboardByContextIds != null && jsonGetLeaderboardByContextIds.success) {
            let dataLeaderboardWeek = await ServerPegasus.Instance.GetTopPlayersInLeaderboard(jsonGetLeaderboardByContextIds.data[0]._id, 3);

            // console.log("dataLeaderboardWeek", dataLeaderboardWeek);

            if (dataLeaderboardWeek != null && dataLeaderboardWeek.success) {
                const listPrize = [];
                const jsonPrizeWeekly = JSON.parse(jsonGetLeaderboardByContextIds.data[0].data).rewards;
                for (let i = 0; i < jsonPrizeWeekly.length; i++) {
                    const element = jsonPrizeWeekly[i];
                    let listPrizeCheck = ReadJsonOptimized(element);
                    listPrize.push(listPrizeCheck);
                }
                return { data: dataLeaderboardWeek.data, prize: listPrize };
            }
        }

        return null;
    }

    public async CallGetLeaderboardWeekly_Global() {
        /**
         * ============ NOTE THIS WILL TAKE SO LONG ============
         * =====================================================
         * because you call all but you mút do it because you need to get the list player of world
         */

        // call info leaderboard by contextID than add to the map
        (async () => {
            let jsonGetLeaderboardByContextIds = await ServerPegasus.Instance.GetLeaderboardByContextIds([MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD, this.ID_LEADERBOARD_WEEKLY]);
            if (jsonGetLeaderboardByContextIds != null && jsonGetLeaderboardByContextIds.success) {
                this._mapInfoTournamentGame.set(MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD, jsonGetLeaderboardByContextIds.data[0]);
                this._mapInfoTournamentGame.set(this.ID_LEADERBOARD_WEEKLY, jsonGetLeaderboardByContextIds.data[1]);
            }
        })();

        //world 
        (async () => {
            let dataLeaderboardWorld: IDataTopPlayerInLeaderboard = await ServerPegasus.Instance.GetTopPlayersInLeaderboard(MConst.LEADERBOARD_ID_WORLD_SERVER, 100);
            if (dataLeaderboardWorld != null && dataLeaderboardWorld.total != null) {
                this._totalPlayerInWorld = dataLeaderboardWorld.total;
                this.UpdateLeaderBoardFromServer(MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD, dataLeaderboardWorld.data, dataLeaderboardWorld.total, false);
                // clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_INDEX_NOTIFICATION, TYPE_EVENT_GAME.UI_RANK);
            }
        })();

        // week
        (async () => {
            let jsonCallLeaderboardWeek: IDataLeaderboardByContextIds = await ServerPegasus.Instance.GetLeaderboardByContextIds([this.ID_LEADERBOARD_WEEKLY]);
            if (jsonCallLeaderboardWeek != null && jsonCallLeaderboardWeek.data != null && jsonCallLeaderboardWeek.data.length > 0) {
                // console.log("leaderboard week: ", this.ID_LEADERBOARD_WEEKLY, jsonCallLeaderboardWeek);
                let dataLeaderboardWeek = await ServerPegasus.Instance.GetTopPlayersInLeaderboard(jsonCallLeaderboardWeek.data[0]._id, 100);
                if (dataLeaderboardWeek != null && dataLeaderboardWeek.data != null) {
                    this.UpdateLeaderBoardFromServer(this.ID_LEADERBOARD_WEEKLY, dataLeaderboardWeek.data, dataLeaderboardWeek.total, false);
                }
            }
        })();
    }

    private _isCallingTournament: boolean = true;
    public async CallGetLeaderboardTournaments() {
        // console.log("CallGetLeaderboardTournaments", this._server_dataTourGame);
        if (this._server_dataTourGame == null || this._server_dataTourGame.length == 0) {
            console.error("dataServer is null");
            return;
        } else {
            // console.log("11111111111", dataServer);
        }

        let listInfoLeaderboardTournament: IInfoLeaderboardByContextId[] = [];

        // filter all the tournament is continuing and tournament was end 1d
        // const currentTime = Utils.getCurrTime();
        // this._server_dataTourGame.filter(item => item.endTime > currentTime + 60 * 60 * 24);

        // sort all the tournament has endTime longer to the Top
        // this._server_dataTourGame.sort((a, b) => b.endTime - a.endTime);

        if (this._server_dataTourGame == null || this._server_dataTourGame.length == 0) { return; }

        const listContextIds = this._server_dataTourGame.map(item => item.contextID);
        const listTimeExpire = this._server_dataTourGame.map(item => item.endTime);
        const listNameLeaderboard = this._server_dataTourGame.map(item => item.title);
        let jsonGetLeaderboardByContext = null;
        if (ServerPegasus.Instance.isTest) {
            jsonGetLeaderboardByContext = {
                "success": true,
                "data": [
                    {
                        "_id": "67248535c126851d56237e33",
                        "gameId": "66f4bca79285160baf34d11d",
                        "expireTime": 1931656108,
                        "name": "Pro Tournament",
                        "sortOrder": "HIGHER_IS_BETTER",
                        "creatorType": "SYSTEM",
                        "contextId": "27436872142624221",
                        "tournamentId": "8394973187296656",
                        "data": "{\"levels\":[1,3],\"rewards\":[{\"SORT\":5,\"SHUFFLE\":5,\"VIP_SLOT\":5},{\"SORT\":3,\"SHUFFLE\":3},{\"SORT\":2},{\"SORT\":2},{\"SORT\":2},{\"SORT\":1},{\"SORT\":1},{\"SORT\":1},{\"SORT\":1},{\"SORT\":1}]}"

                    }
                ]
            }
        } else {
            jsonGetLeaderboardByContext = await ServerPegasus.Instance.GetLeaderboardByContextIds(listContextIds);
        }
        if (jsonGetLeaderboardByContext == null) {
            return;
        }

        // console.log("jsonGetLeaderboardByContext", jsonGetLeaderboardByContext);
        // filter data for suit with root data json in game data
        for (let i = 0; i < jsonGetLeaderboardByContext.data.length; i++) {
            let info = jsonGetLeaderboardByContext.data[i];
            if (info.contextId == listContextIds[i]) {
                info.expireTime = listTimeExpire[i];
                info.name = listNameLeaderboard[i];
            }
        }
        listInfoLeaderboardTournament = jsonGetLeaderboardByContext.data;
        // console.log("listInfoLeaderboardTournament", listInfoLeaderboardTournament);

        // /**
        //  * ===========================================================
        //  * ================= code sample for develop =================
        //  * ===========================================================
        //  */
        // // code sample for develop
        // if (CheatingSys.Instance.IsDevelopingTour) {
        //     let t: IInfoLeaderboardByContextId = {
        //         _id: "11111111111",
        //         gameId: "11111111111111",
        //         expireTime: 99952522,                 // expire time tournament
        //         name: "Test",                       // name Tournament
        //         sortOrder: "desc",                  // desc | asc
        //         creatorType: "SYSTEM",                // SYSTEM | PLAYER
        //         creatorPlayerId: "1111111111",
        //         contextId: "contextTest",
        //         tournamentId: "tournamentTest",
        //         data: `{"prize1":"0_0_10", "prize2":"1_0_10", "prize3":"3_0_10"}`
        //     }
        //     listInfoLeaderboardTournament.push(t);
        // }

        // just loop for System
        listInfoLeaderboardTournament = listInfoLeaderboardTournament.filter(item => item.creatorType == 'SYSTEM');

        // save list tournament by system => you can change this code for suit with your game
        this._listContextIdTournament = listInfoLeaderboardTournament.map(item => item.contextId);

        // save list context ids
        this._listContextIdTournament.forEach((contextId: string, index: number) => {
            this._mapInfoTournamentGame.set(contextId, listInfoLeaderboardTournament[index]);
        })

        // console.log("listInfoLeaderboardTournament", listInfoLeaderboardTournament);
        // call leaderboard
        for (const infoLeaderboard of listInfoLeaderboardTournament) {
            // console.log("CallGetLeaderboardTournamentFromServerAAAAAAA", infoLeaderboard);
            await this.CallGetLeaderboardTournamentFromServer(infoLeaderboard);
        }

        // console.log("check map tournament", Array.from(this._mapTournamentGame));

        this._isCallingTournament = false;
    }

    public async CallGetLeaderboardTournamentFromServer(infoLeaderboard: IInfoLeaderboardByContextId) {
        // console.log("CallGetLeaderboardTournamentFromServer", infoLeaderboard.contextId);
        let jsonCallTopPlayers = await ServerPegasus.Instance.GetTopPlayersInLeaderboard(infoLeaderboard._id, 100);
        // console.log("jsonCallTopPlayers", jsonCallTopPlayers);
        if (jsonCallTopPlayers != null) {
            const dataPlayers: IDataPlayer_LEADERBOARD[] = jsonCallTopPlayers.data;
            this.UpdateLeaderBoardFromServer(infoLeaderboard.contextId, dataPlayers, jsonCallTopPlayers.total, false);
        } else {
            this.UpdateLeaderBoardFromServer(infoLeaderboard.contextId, [], 0, false);
        }
    }

    public GetLeaderboard(contextIdLeaderboard: string): IDataPlayer_LEADERBOARD[] {
        if (this._mapTournamentGame.has(contextIdLeaderboard)) {
            if (contextIdLeaderboard == MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND) {
                return this.SortDataWithChangeRank(Array.from(this._mapTournamentGame.get(contextIdLeaderboard)));
            } else {
                return this._mapTournamentGame.get(contextIdLeaderboard);
            }
        } else if (contextIdLeaderboard == MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND
            || contextIdLeaderboard == MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD
            || contextIdLeaderboard == this.ID_LEADERBOARD_WEEKLY || contextIdLeaderboard == this.ID_LEADERBOARD_WEEKLY_PREVIOUS) {
            if (contextIdLeaderboard == MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND) {
                return Array.from(this.GetTempLeaderboard(contextIdLeaderboard))
            } else {
                return this.GetTempLeaderboard(contextIdLeaderboard);
            }
        }
        return null;
    }

    public GetLeaderboardTotal(contextIdLeaderboard: string): number {
        if (this._mapTournamentTotal.has(contextIdLeaderboard)) {
            return this._mapTournamentTotal.get(contextIdLeaderboard);
        }
        return 0;
    }

    public CheckAlreadyHaveDataInMapTournament(contextIdTournament: string): boolean {
        return this._mapTournamentGame.has(contextIdTournament);
    }

    public GetNumFriend(): number {
        let dataFriend = Array.from(this.GetLeaderboard(MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND));
        dataFriend = dataFriend.filter(item => item.playerId != MConfigFacebook.Instance.playerID);
        return dataFriend.length;
    }

    public GetIndexPlayerLeaderboard(contextIdLeaderboard: string) {
        let indexPlayer = -1;
        // console.log("7777777777777", contextIdLeaderboard, this._mapTournamentGame.get(contextIdLeaderboard));
        if (this._mapTournamentGame.has(contextIdLeaderboard)) {
            indexPlayer = this._mapTournamentGame.get(contextIdLeaderboard).findIndex(obj => obj.playerId == MConfigFacebook.Instance.playerID);
            // console.log("8888888888888", indexPlayer);
        }
        return indexPlayer;
    }

    public GetDataPlayerOfLeaderboard(contextIdLeaderboard: string): IDataPlayer_LEADERBOARD {
        let indexPlayer = -1;
        let leaderboardCheck: IDataPlayer_LEADERBOARD[] = null;
        if (this._mapTournamentGame.has(contextIdLeaderboard))
            leaderboardCheck = this._mapTournamentGame.get(contextIdLeaderboard);
        else
            leaderboardCheck = this.GetLeaderboard(contextIdLeaderboard);

        // return data
        if (leaderboardCheck != null) {
            indexPlayer = leaderboardCheck.findIndex(obj => obj.playerId == MConfigFacebook.Instance.playerID);
            if (indexPlayer != -1) {
                return leaderboardCheck[indexPlayer];
            }
        }

        return null;
    }

    public UpdateBestScore(level: number, contextIdLeaderboard: string) {
        // find player and save to new level
        // sort again the data
        // ================== update world leaderBoard ==================
        // there are two case , player not in the leaderBoard => add him
        // had player just change and sort
        const self = this;

        function updateNewLeaderboard(leaderBoard: IDataPlayer_LEADERBOARD[], newStar: number = level): { newData: IDataPlayer_LEADERBOARD[], isHigherScore: boolean } {
            let oldIndexPlayer = leaderBoard.findIndex(obj => obj.playerId == MConfigFacebook.Instance.playerID);
            let newIndexPlayer = -1;
            if (oldIndexPlayer == -1) {
                let playerRankInfo = self.CreateItemRankInfo();
                playerRankInfo.score = 0;
                leaderBoard.push(playerRankInfo);
                oldIndexPlayer = leaderBoard.length - 1;
            }

            // if score old player isHigher => don't update
            if (leaderBoard[oldIndexPlayer].score >= newStar) {
                return { newData: leaderBoard, isHigherScore: false };
            }

            // update score Player
            leaderBoard[oldIndexPlayer].score = newStar;
            let dataBotAndPlayerReal: IDataPlayer_LEADERBOARD[] = self.sortArr(leaderBoard);

            // sort rank again
            dataBotAndPlayerReal = self.SortDataWithChangeRank(Array.from(dataBotAndPlayerReal));

            return { newData: dataBotAndPlayerReal, isHigherScore: true };
        }

        // ========= update score ================
        let leaderboardUpdate: IDataPlayer_LEADERBOARD[] = this._mapTournamentGame.get(contextIdLeaderboard);
        if (leaderboardUpdate == null) {
            leaderboardUpdate = [];
        }
        let dataAfterUpdate = updateNewLeaderboard(leaderboardUpdate);
        this._mapTournamentGame.set(contextIdLeaderboard, dataAfterUpdate.newData);
        //============ push to server ==============
        // just not push score to the leaderboard friend
        if (contextIdLeaderboard != MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND) {
            let infoLeaderboard = this.GetInfoLeaderboardByContextId(contextIdLeaderboard);
            if (infoLeaderboard != null && infoLeaderboard._id != null && dataAfterUpdate.isHigherScore) {
                {
                    (async () => {
                        let jsonUpdateScoreDone = await ServerPegasus.Instance.UpdatePlayerScoreInLeaderboard(infoLeaderboard._id, level);
                        if (jsonUpdateScoreDone != null) {
                            MConsolLog.Log2("Update score done", jsonUpdateScoreDone);
                        } else {
                            MConsolLog.Log2("1. Can not update score, something wrong");
                        }
                    })();
                }
            } else {
                MConsolLog.Log2("2. Can not update score, something wrong");
            }
        }
    }

    public UpdateScoreTournament(score: number, contextIdLeaderboard: string) {
        // find player and save to new level
        // sort again the data
        // ================== update world leaderBoard ==================
        // there are two case , player not in the leaderBoard => add him
        // had player just change and sort
        const self = this;

        function updateNewLeaderboard(leaderBoard: IDataPlayer_LEADERBOARD[], newScore: number = score): { newData: IDataPlayer_LEADERBOARD[], isHigherScore: boolean } {
            let oldIndexPlayer = leaderBoard.findIndex(obj => obj.playerId == MConfigFacebook.Instance.playerID);

            // console.log(newScore);

            if (oldIndexPlayer == -1) {
                let playerRankInfo = self.CreateItemRankInfo();
                playerRankInfo.score = newScore;
                leaderBoard.push(playerRankInfo);
                let dataLeaderBoardNew: IDataPlayer_LEADERBOARD[] = self.sortArr(leaderBoard);

                // sort rank again
                dataLeaderBoardNew = self.SortDataWithChangeRank(Array.from(dataLeaderBoardNew));

                return { newData: dataLeaderBoardNew, isHigherScore: true };
            } else {
                if (leaderBoard[oldIndexPlayer].score >= newScore) {
                    return { newData: leaderBoard, isHigherScore: false };
                }

                // update score Player
                leaderBoard[oldIndexPlayer].score = newScore;
                let dataLeaderBoardNew: IDataPlayer_LEADERBOARD[] = self.sortArr(leaderBoard);

                // sort rank again
                dataLeaderBoardNew = self.SortDataWithChangeRank(Array.from(dataLeaderBoardNew));
                return { newData: dataLeaderBoardNew, isHigherScore: true };
            }

            // if score old player isHigher => don't update
        }

        // ========= update score ================
        let leaderboardUpdate: IDataPlayer_LEADERBOARD[] = this._mapTournamentGame.get(contextIdLeaderboard);
        if (leaderboardUpdate == null) {
            leaderboardUpdate = [];
        }
        let dataAfterUpdate = updateNewLeaderboard(leaderboardUpdate);
        this._mapTournamentGame.set(contextIdLeaderboard, dataAfterUpdate.newData);
        //============ push to server ==============
        let infoLeaderboard = this.GetInfoLeaderboardByContextId(contextIdLeaderboard);
        if (infoLeaderboard != null && infoLeaderboard._id != null) {
            (async () => {
                let jsonUpdateScoreDone = await ServerPegasus.Instance.UpdatePlayerScoreInLeaderboard(infoLeaderboard._id, score);
                if (jsonUpdateScoreDone != null) {
                    MConsolLog.Log2("Update score done", jsonUpdateScoreDone);
                } else {
                    MConsolLog.Log2("1. Can not update score, something wrong");
                }
            })();
        }

    }

    public async UpdateInfoPlayer(level: number) {
        let result = await ServerPegasus.Instance.UpdatePlayerPoint({ level: level })
        // console.log("result after Update info player", result);
    }

    public GetTimeTournament(contextIdLeaderboard: string): number {
        let timeRemaining = -1;
        let infoTournamentGame: IInfoLeaderboardByContextId = this._mapInfoTournamentGame.get(contextIdLeaderboard);
        if (infoTournamentGame != null) {
            timeRemaining = infoTournamentGame.expireTime - Utils.getCurrTime();
        }
        return timeRemaining;
    }

    public GetInfoLeaderboardByContextId(contextIdLeaderboard: string): IInfoLeaderboardByContextId {
        // console.log("contextIdLeaderboard", contextIdLeaderboard,this._mapInfoTournamentGame);
        return this._mapInfoTournamentGame.get(contextIdLeaderboard);
    }

    public GetListTouringByContextId(): IInfoLeaderboardByContextId[] {
        let result: IInfoLeaderboardByContextId[] = [];
        this._server_dataTourGame.forEach(tour => {
            const infoCheck = this._mapInfoTournamentGame.get(tour.contextID);
            if (infoCheck != null) {
                result.push(infoCheck);
            }
        })
        return result;
    }

    public GenListDataFriendInWorld(): IDataPlayer_LEADERBOARD[] {
        let result: IDataPlayer_LEADERBOARD[] = [];
        // loop the data leaderboard Global to check 
        let listDataPlayerWorld: IDataPlayer_LEADERBOARD[] = this._mapTournamentGame.get(MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD);
        if (listDataPlayerWorld != null) {
            for (let i = 0; i < MConfigFacebook.Instance.arrConnectedPlayerInfos.length; i++) {
                const playerIdFriend: string = MConfigFacebook.Instance.arrConnectedPlayerInfos[i].id;
                let player = listDataPlayerWorld.find(player => player.playerId == playerIdFriend);
                if (player != null)
                    result.push(player);
            }
            result.push(this.GenDataPlayer());

            // sort the data suit with rank
            result = result.sort((a, b) => b.score - a.score);

            result = this.SortDataWithChangeRank(Array.from(result));
        }
        return Array.from(result);
    }

    public get ID_LEADERBOARD_WEEKLY(): string {
        return `${MConst.SERVER_GAME_ID}_${this._logicGenContextIdWeekly.ContextIdThisGamePhase}`;
    }

    public get ID_LEADERBOARD_WEEKLY_PREVIOUS(): string {
        return `${MConst.SERVER_GAME_ID}_${this._logicGenContextIdWeekly.ContextIdPreviousGamePhase}`;
    }

    public async GetAllContextIdTournaments(): Promise<string[]> {
        // await calling tournament is done
        // in case can not get the leaderboard => just accept for player join the game
        const MaxTimeWait: number = 0.2 * 20;  // wait to get the data 4s
        let timeCacul = 0;
        while (this._isCallingTournament && timeCacul < MaxTimeWait) {
            timeCacul += 0.2;
            await Utils.delay(0.2 * 1000);
        }
        return this._listContextIdTournament;
    }

    // public async GetDataGameServer() {
    //     let dataGameJson: IDataJsonGameServer = null;
    //     dataGameJson = await ServerPegasus.Instance.GetDataGameServer();
    //     if (dataGameJson == null) return;
    //     this._serverData_dataTour = JSON.parse(dataGameJson.data) as undefined as IDataTourFromServer[];
    // }

    /**
     * remember you must wait for call get data game server
     * @returns 
     */
    public async GetDataGameServer() {
        // console.log("GetDataGameServer");
        let dataGameJson: IDataJsonGameServer = null;
        dataGameJson = await ServerPegasus.Instance.GetDataGameServer();
        if (dataGameJson == null || dataGameJson.data == null) return null;
        this._server_dataTourGame = JSON.parse(dataGameJson.data.LiveTournament) as undefined as IDataTourFromServer[];
        this._server_time_next_banner = dataGameJson.data.TimeNextBanner != null ? Number.parseInt(dataGameJson.data.TimeNextBanner) : 60;
        this._server_time_next_inter = dataGameJson.data.TimeNextInter != null ? Number.parseInt(dataGameJson.data.TimeNextInter) : 60;
        this._server_time_next_inter_after_reward = dataGameJson.data.TimeNextInterAfterRW != null ? Number.parseInt(dataGameJson.data.TimeNextInterAfterRW) : 60;

        // set to facebook


        MConfigFacebook.Instance.TIME_NEXT_RELOAD_BANNER = this._server_time_next_banner;
        MConfigFacebook.Instance.TIME_NEXT_INTERSTITIAL = this._server_time_next_inter;
        MConfigFacebook.Instance.TIME_NEXT_INTERSTITIAL_AFTERREWARD = this._server_time_next_inter_after_reward;
        // console.log("check time ads", MConfigFacebook.Instance.TIME_NEXT_INTERSTITIAL, MConfigFacebook.Instance.TIME_NEXT_RELOAD_BANNER);
        // console.log("check data game server", this._server_dataTourGame);
    }

    public GetTournamentDataJsonContinuing(tournamentId: string): IDataTourFromServer {
        // console.log("GetTournamentDataJsonContinuing",this._server_dataTourGame);
        if (this._server_dataTourGame == null || this._server_dataTourGame.length == 0 || tournamentId == null || tournamentId == "") {
            return null;
        }

        let indexTour = this._server_dataTourGame.findIndex(tour => tour.tournamentID == tournamentId && tour.endTime > Utils.getCurrTime());

        if (indexTour != -1) {
            return this._server_dataTourGame[indexTour];
        } else {
            return null;
        }
    }
    //#endregion common func

    //#region func for check receive prize in lobby
    public GetContextIdTournamentExprireToReceivePrize(): string[] {
        let result: string[] = [];

        // console.log("all tour have", this._server_dataTourGame);
        // console.log("all tour in player save", PlayerData.Instance._listIdTourWasClaimed);

        if (this._server_dataTourGame.length > 0) {
            // filter tournament is done but not in save list
            let listTournamentExprire: IDataTourFromServer[] = this._server_dataTourGame.filter(tour => tour.endTime < Utils.getCurrTime());
            // check tournament ID is not received and is done
            for (let i = 0; i < listTournamentExprire.length; i++) {
                const tourCheck = listTournamentExprire[i];
                if (PlayerData.Instance._listIdTourWasClaimed.indexOf(tourCheck.contextID) == -1) {
                    result.push(tourCheck.contextID);
                }
            }
        }
        return result;
    }

    public GetJsonToReceivePrizeTournament(contextIdTournament: string): { nameTournament: string, indexPlayer: number, listPrize: IPrize[] } {
        // console.log("555555555555555", Array.from(this._mapInfoTournamentGame));
        // console.log("6666666666666666", contextIdTournament);

        const infoDataTournament: IInfoLeaderboardByContextId = this._mapInfoTournamentGame.get(contextIdTournament);
        if (infoDataTournament != null) {
            const indexPlayerOfTour: number = CheatingSys.Instance.IsTestReceivePrizeTour ? CheatingSys.Instance.IndexPlayerReceiveTour : this.GetIndexPlayerLeaderboard(infoDataTournament.contextId);
            // let listPrizePlayerReceiveForThatTour: IPrize[] = this.GetPrizePlayerReceiveByContextId(infoDataTournament, indexPlayerOfTour);
            const tourCheck = this.GetListTouringByContextId().find(tour => tour.contextId == contextIdTournament);
            const dataAfterOptimize = JSON.parse(tourCheck.data).rewards;
            let listPrizePlayerReceiveForThatTour: IPrize[] = ReadJsonOptimized(dataAfterOptimize[indexPlayerOfTour]);

            // console.log("tourCheck:", tourCheck);
            // console.log("dataAfterOptimize:", dataAfterOptimize);
            // console.log("listPrizePlayerReceiveForThatTour:", listPrizePlayerReceiveForThatTour);

            if (CheatingSys.Instance.IsTestReceivePrizeTour) {
                listPrizePlayerReceiveForThatTour = [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 1)];
            }
            // console.log("GetJsonToReceivePrizeTournament", listPrizePlayerReceiveForThatTour);
            if (listPrizePlayerReceiveForThatTour != null && listPrizePlayerReceiveForThatTour.length > 0) {
                return {
                    nameTournament: infoDataTournament.name,
                    indexPlayer: indexPlayerOfTour,
                    listPrize: listPrizePlayerReceiveForThatTour
                }
            }
        }
        return null;
    }

    public AutoRemoveTheIndexTourWasReceivedMoreThanNumberTournament(maxTournamentLimited: number) {
        if (PlayerData.Instance._listIdTourWasClaimed.length > maxTournamentLimited) {
            let numTournamentNeedToRemove = this._listContextIdTournament.length - maxTournamentLimited;
            for (let i = 0; i < numTournamentNeedToRemove; i++) {
                PlayerData.Instance._listIdTourWasClaimed.shift();
            }
            PlayerData.Instance.SaveIdTourWasClaimed();
        }
    }

    private GetPrizePlayerReceiveByContextId(infoDataTournament: IInfoLeaderboardByContextId, indexPlayer: number): IPrize[] {
        const listPrizeTour = this.GenListPrizeTourType3(infoDataTournament.data);
        if (CheatingSys.Instance.IsTestReceivePrizeTour) {
            return listPrizeTour[indexPlayer];
        } else {
            if (indexPlayer < listPrizeTour.length && indexPlayer >= 0) {
                return listPrizeTour[indexPlayer];
            }
        }
        return null;
    }

    //#endregion func for check receive prize in lobby

    //#region FUNC TOUR TYPE 1
    private ReadDataPrize(json: string): IPrize {
        if (json == null || json == "") return null;
        let dataResult = json.split("_");
        dataResult = dataResult.filter(item => item != "" && item != null);
        const typePrize: number = Number.parseInt(dataResult[0]);
        const typeReceive: number = Number.parseInt(dataResult[1]);
        const value: number = Number.parseInt(dataResult[2]);
        let result: IPrize = new IPrize(typePrize, typeReceive, value);
        return result;
    }


    /**
     * 
     * @param json data of info tournament
     * @returns 
     */
    public GenListPrizeTourType3(json: string): IPrize[][] {
        if (json == null || json == "") return null;
        let result: IPrize[][] = [];

        /**
         * gen prize logic gen prize with logic
         *  TOP 3: 2 prize1 + 2 prize2
         *  TOP 2: 5 prize1 + 5 prize2
         *  TOP 1: prize1 + prize2 + prize3     => in prize 3 we set it with true value you set
         */

        const iJsonPrizeLeaderboard: IJsonPrizeLeaderboard = JSON.parse(json) as IJsonPrizeLeaderboard;

        const listPrizeTop1: IPrize[] = [];
        const listPrizeTop2: IPrize[] = [];
        const listPrizeTop3: IPrize[] = [];
        const samplePrize1: IPrize = DataLeaderboardSys.Instance.ReadDataPrize(iJsonPrizeLeaderboard.prize1);
        const samplePrize2: IPrize = DataLeaderboardSys.Instance.ReadDataPrize(iJsonPrizeLeaderboard.prize2);
        const samplePrize3: IPrize = DataLeaderboardSys.Instance.ReadDataPrize(iJsonPrizeLeaderboard.prize3);
        // gen top 3
        if (samplePrize1 != null) {
            listPrizeTop3.push(new IPrize(samplePrize1.typePrize, TYPE_RECEIVE.NUMBER, 2));
            listPrizeTop3.push(new IPrize(samplePrize2.typePrize, TYPE_RECEIVE.NUMBER, 2));
        } else {
            console.log("samplePrize1 null");
        }
        // gen top 2
        if (samplePrize2 != null) {
            listPrizeTop2.push(new IPrize(samplePrize1.typePrize, TYPE_RECEIVE.NUMBER, 5));
            listPrizeTop2.push(new IPrize(samplePrize2.typePrize, TYPE_RECEIVE.NUMBER, 5));
        } else {
            console.log("samplePrize2 null");
        }
        // gen top 1

        listPrizeTop1.push(samplePrize1, samplePrize2, samplePrize3);

        result.push(listPrizeTop1, listPrizeTop2, listPrizeTop3);

        return result;
    }
    //#endregion FUNC TOUR TYPE 1







    public GetAllDataPreviousPlayGame() {
        // lây dữ liệu global, weekly, tour , previous weekly trong 1 get duy nhất

    }
}


