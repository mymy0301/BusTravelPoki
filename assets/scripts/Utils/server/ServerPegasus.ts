import { _decorator, CCBoolean, Component, director, Node } from 'cc';
import { MConfigFacebook } from '../../Configs/MConfigFacebook';
import { MConst } from '../../Const/MConst';
import { clientEvent } from '../../framework/clientEvent';
import { FBInstantManager } from '../facebooks/FbInstanceManager';
import { IPrize, TYPE_GAME_PLAY_TOURNAMENT } from '../Types';
const { ccclass, property } = _decorator;

@ccclass('ServerPegasus')
export class ServerPegasus extends Component {
    public static Instance: ServerPegasus;
    @property(CCBoolean) isTest = false;

    private _playerID: string = null;

    protected onLoad(): void {
        if (ServerPegasus.Instance == null) {
            ServerPegasus.Instance = this;
            director.addPersistRootNode(this.node);
        }
    }

    private GetBaseForHeader(typeForHeader: 'PUT' | 'GET' | 'POST' | 'DELETE'): Headers {
        const header = new Headers();
        header.append("x-signature", MConfigFacebook.Instance.signature);
        header.append("x-id", MConst.SERVER_GAME_ID);
        if (typeForHeader == 'POST' || typeForHeader == 'PUT') {
            header.append("Content-Type", "application/json");
        }
        return header;
    }

    /**
     * This func used for set up data
     * @note Must call before used any other func in this class 
     * @param playerID :string
     */
    public SetUp(playerID: string) {
        this._playerID = playerID;
    }

    /**
     * This func used for init player
     * @note Must use await
     * @param playerId :string
     * @param namePlayer :string
     * @param avatar :string
     * @param asid :string
     * @returns Promise<boolean>
     */
    public async InitPlayerInfo(playerId: string, namePlayer: string, avatar: string, asid: string, level: number = 1): Promise<boolean> {
        await FBInstantManager.Instance.GetSignature();
        if (MConfigFacebook.Instance.signature == null || asid == null) { return null; }

        const myHeaders = this.GetBaseForHeader('POST');

        const raw = JSON.stringify({
            "gameId": MConst.SERVER_GAME_ID,
            "playerId": playerId,
            "name": namePlayer,
            "avatar": avatar,
            "asid": asid,
            "level": level
        });

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        // post data
        return new Promise<boolean>((resolve, reject) => {
            fetch(`${MConst.URL_SERVER}/player/`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    resolve(true);
                })
                .catch((error) => {
                    console.error(error);
                    resolve(false);
                });
        })
    }

    /**
     * This func used for update player point
     * @param jsonPutToServer sample: {"level":10, "score": 50}
     * @returns 
     */
    public async UpdatePlayerPoint(jsonPutToServer: any): Promise<boolean> {
        await FBInstantManager.Instance.GetSignature();

        if (MConfigFacebook.Instance.signature == null || this._playerID == null || jsonPutToServer == null) { return null; }

        const myHeaders = this.GetBaseForHeader('PUT');

        const raw = JSON.stringify(jsonPutToServer);

        const requestOptions: RequestInit = {
            method: "PUT",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        return new Promise<boolean>((resolve, reject) => {
            fetch(`${MConst.URL_SERVER}/player/${MConst.SERVER_GAME_ID}/${this._playerID}/points`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    resolve(true);
                })
                .catch((error) => {
                    console.error(error)
                    resolve(false);
                });
        })
    }

    /**
     * DON't KNOW YET WHAT THIS DO FOR , USE IT LATER
     * @param jsonPutToServer 
     * @returns 
     */
    public async UpdatePlayerData(jsonPutToServer: UpdatePlayerData): Promise<boolean> {
        await FBInstantManager.Instance.GetSignature();
        if (MConfigFacebook.Instance.signature == null || this._playerID == null) { return null; }

        const myHeaders = this.GetBaseForHeader('PUT');

        const raw = JSON.stringify(jsonPutToServer);

        const requestOptions: RequestInit = {
            method: "PUT",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        return new Promise<boolean>((resolve, reject) => {
            fetch(`${MConst.URL_SERVER}/player/${MConst.SERVER_GAME_ID}/${this._playerID}/data`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    resolve(true);
                })
                .catch((error) => {
                    console.error(error)
                    resolve(false);
                });
        })
    }

    /**
     * This func will return info of a player
     * @note Must use await 
     * @param playerIds 
     * @returns 
     */
    public async GetPlayerByPlayerIds(playerIds: string[]): Promise<IDataGetPlayerByPlayerIds> {
        await FBInstantManager.Instance.GetSignature();
        if (MConfigFacebook.Instance.signature == null || playerIds == null) { return; }

        const myHeaders = this.GetBaseForHeader('GET');

        const requestOptions: RequestInit = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        let stringPlayerIds = '';
        for (let i = 0; i < playerIds.length; i++) {
            stringPlayerIds += playerIds[i]
            if (i < playerIds.length - 1) {
                stringPlayerIds += ','
            }
        }

        return new Promise<IDataGetPlayerByPlayerIds>((resolve, reject) => {
            fetch(`${MConst.URL_SERVER}/player/?playerIds=${stringPlayerIds}&gameId=${MConst.SERVER_GAME_ID}`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    /**
                     * ====================== CUSTOM ============================
                     * ============ you can resolve something in here ===========
                     * ==========================================================
                     */
                    resolve(JSON.parse(result) as unknown as IDataGetPlayerByPlayerIds);
                })
                .catch((error) => {
                    resolve(null);
                    console.error(error);
                });
        })
    }

    /**
     * This func will return IDataGetTopPlayer
     * @note Must use await 
     * @param limit 1-100
     * @param sortField type field, auto is level
     * @param sortOrder desc || asc
     * @returns 
     */
    public async GetTopPlayer(limit: number, sortField: string = 'level', sortOrder: SortOrder_1 = "desc"): Promise<IDataGetTopPlayer> {
        await FBInstantManager.Instance.GetSignature();

        if (MConfigFacebook.Instance.signature == null || limit <= 0 || (sortOrder != "desc" && sortOrder != "asc") || sortField == null) { return; }

        const myHeaders = this.GetBaseForHeader('GET');

        const requestOptions: RequestInit = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        return new Promise<IDataGetTopPlayer>((resolve, reject) => {
            fetch(`${MConst.URL_SERVER}/player/top-players?gameId=${MConst.SERVER_GAME_ID}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    resolve(JSON.parse(result) as unknown as IDataGetTopPlayer);
                })
                .catch((error) => {
                    console.error(error);
                    return null;
                });
        })
    }


    /**
     * This func will create a leaderboard
     * @param contextId 
     * @param tournamentId 
     * @param leaderboardName 
     * @param expireTime must > 1000
     * @param sortOrder 
     * @param dataCustom 
     * @returns 
     */
    public async CreateLeaderboardByPlayer(contextId: string, tournamentId: string, leaderboardName: string, expireTime: number = 1751849456,
        sortOrder: SortOrder_2 = "HIGHER_IS_BETTER", dataCustom = ""): Promise<boolean> {
        await FBInstantManager.Instance.GetSignature();

        if (MConfigFacebook.Instance.signature == null || leaderboardName == null || expireTime <= 1000 || this._playerID == null || contextId == null || tournamentId == null) { return; }

        const myHeaders = this.GetBaseForHeader('POST');

        const raw = JSON.stringify({
            "gameId": MConst.SERVER_GAME_ID,
            "name": leaderboardName,
            "expireTime": 1751849456,
            "contextId": contextId,
            "tournamentId": tournamentId,
            "creatorPlayerId": this._playerID,
            "sortOrder": sortOrder,
            "data": dataCustom
        });

        const requestOptions: RequestInit = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        return new Promise<boolean>((resolve, reject) => {
            fetch(`${MConst.URL_SERVER}/leaderboard/`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    resolve(true);
                })
                .catch((error) => {
                    console.error(error);
                    resolve(false);
                });
        })
    }

    /**
     * This func will update score to leaderboard
     * @note Must use await
     * @param leaderboardId : string
     * @param score : number
     * @returns Promise<boolean>
     */
    public async UpdatePlayerScoreInLeaderboard(leaderboardId: string, score: number): Promise<boolean> {
        await FBInstantManager.Instance.GetSignature();

        if (MConfigFacebook.Instance.signature == null || leaderboardId == null || this._playerID == null) { return new Promise<boolean>((resolve, reject) => { resolve(false); }); }

        const myHeaders = this.GetBaseForHeader('POST');

        const raw = JSON.stringify({
            "gameId": MConst.SERVER_GAME_ID,
            "playerId": this._playerID,
            "leaderboardId": leaderboardId,
            "score": score
        });

        const requestOptions: RequestInit = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        return new Promise<boolean>((resolve, reject) => {
            fetch(`${MConst.URL_SERVER}/player-score/`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    resolve(true);
                })
                .catch((error) => {
                    console.error(error)
                    resolve(false);
                });
        })

    }

    /**
     * This func used for call all leaderboard data
     * @returns Promise<IDataLeaderboardList>
     */
    public async GetLeaderboardList(): Promise<IDataLeaderboardList> {
        await FBInstantManager.Instance.GetSignature();

        if (MConfigFacebook.Instance.signature == null) { return; }

        const myHeaders = this.GetBaseForHeader('GET');

        const requestOptions: RequestInit = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        return new Promise<IDataLeaderboardList>((resolve, reject) => {
            fetch(`${MConst.URL_SERVER}/leaderboard/${MConst.SERVER_GAME_ID}`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    resolve(JSON.parse(result) as unknown as IDataLeaderboardList);
                })
                .catch((error) => {
                    console.error(error);
                    resolve(null);
                });
        })
    }

    /**
     * This func used for get leaderboard by contextIds
     * @param contextIds :string - contextIds of facebook
     * @returns 
     */
    public async GetLeaderboardByContextIds(contextIds: string[]): Promise<IDataLeaderboardByContextIds> {
        await FBInstantManager.Instance.GetSignature();

        if (MConfigFacebook.Instance.signature == null || contextIds == null) {
            clientEvent.dispatchEvent(MConst.EVENT_SERVER.GET_LEADER_BOARD_DONE, null);
            return null;
        }

        const myHeaders = this.GetBaseForHeader('GET');

        const requestOptions: RequestInit = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        return new Promise<IDataLeaderboardByContextIds>((resolve, reject) => {
            let URL_CAll = `${MConst.URL_SERVER}/leaderboard/${MConst.SERVER_GAME_ID}/contextIds?contextIds=`;
            let urlContextId = '';
            for (let i = 0; i < contextIds.length; i++) {
                urlContextId += contextIds[i]
                if (i < contextIds.length - 1) {
                    urlContextId += ','
                }
            }

            // check add url context id
            if (urlContextId != '') {
                URL_CAll += `${urlContextId}`;
            }

            // fetch data
            fetch(URL_CAll, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    clientEvent.dispatchEvent(MConst.EVENT_SERVER.GET_LEADER_BOARD_DONE, result as unknown as IDataLeaderboardByContextIds)
                    resolve(JSON.parse(result) as unknown as IDataLeaderboardByContextIds);
                })
                .catch((error) => {
                    console.error(error);
                    clientEvent.dispatchEvent(MConst.EVENT_SERVER.GET_LEADER_BOARD_DONE, null);
                    resolve(null);
                });
        })
    }

    /**
     * This func used for get top players in leaderboard
     * @param idLeaderboard : string
     * @param limit : number {0-100} - 0 call all
     * @returns 
     */
    public async GetTopPlayersInLeaderboard(idLeaderboard: string, limit: number): Promise<IDataTopPlayerInLeaderboard> {
        // console.error("GetTopPlayersInLeaderboard", idLeaderboard, limit);
        if(this.isTest){
            return new Promise<IDataTopPlayerInLeaderboard>((resolve, reject) => {
                let result = {
                    "success": true,
                    "data": [
                        {
                            "rank": 1,
                            "score": -300,
                            "playerId": "8608913472562567",
                            "name": "Yana",
                            "avatar": ""
                        },
                        {
                            "rank": 2,
                            "score": -310,
                            "playerId": "9266110853400420",
                            "name": "Piyada",
                            "avatar": ""
                        },
                        {
                            "rank": 3,
                            "score": -320,
                            "playerId": "9656013884413742",
                            "name": "Omphile",
                            "avatar": ""
                        },
                        {
                            "rank": 4,
                            "score": -330,
                            "playerId": "8995523880472007",
                            "name": "Kim",
                            "avatar": ""
                        },
                        {
                            "rank": 5,
                            "score": -340,
                            "playerId": "27668166666162250",
                            "name": "Nguyễn",
                            "avatar": ""
                        },
                        {
                            "rank": 6,
                            "score": -350,
                            "playerId": "8817721644931751",
                            "name": "Thảo",
                            "avatar": ""
                        },
                        {
                            "rank": 7,
                            "score": -360,
                            "playerId": "27811560091775849",
                            "name": "Nur",
                            "avatar": ""
                        },
                        {
                            "rank": 8,
                            "score": -370,
                            "playerId": "9179450665444627",
                            "name": "Hợp",
                            "avatar": ""
                        },
                        {
                            "rank": 9,
                            "score": -380,
                            "playerId": "8672254089532616",
                            "name": "Nina",
                            "avatar": ""
                        },
                        {
                            "rank": 10,
                            "score": -390,
                            "playerId": "9560188313995300",
                            "name": "Tamanna",
                            "avatar": ""
                        }
                    ],
                    "total": 113
                }

                // let result = {
                //     "success": true,
                //     "data": [
                //     ],
                //     "total": 0
                // }
                resolve(result as unknown as IDataTopPlayerInLeaderboard);
                return;
            })
        }
        await FBInstantManager.Instance.GetSignature();

        // console.log("Check what make you null", MConfigFacebook.Instance.signature, idLeaderboard, limit);
        if (MConfigFacebook.Instance.signature == null || idLeaderboard == null || limit < 0) { return null; }

        const myHeaders = this.GetBaseForHeader('GET');

        const requestOptions: RequestInit = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        return new Promise<IDataTopPlayerInLeaderboard>((resolve, reject) => {
            fetch(`${MConst.URL_SERVER}/player-score/leaderboard/${idLeaderboard}?limit=${limit}`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    resolve(JSON.parse(result) as unknown as IDataTopPlayerInLeaderboard);
                })
                .catch((error) => {
                    console.error(error);
                    resolve(null);
                });
        })
    }

    /**
     * this func will return data of players around player in leaderboard
     * @param idLeaderboard :string
     * @param limit : number {1-100}
     * @returns Promise<IDataGetPLayerAroundPlayerInLeaderboard>
     */
    public async GetPlayersAroundPlayerInLeaderboard(idLeaderboard: string, limit: number): Promise<IDataGetPLayerAroundPlayerInLeaderboard> {
        await FBInstantManager.Instance.GetSignature();

        if (MConfigFacebook.Instance.signature == null || idLeaderboard == null || limit <= 0) { return null; }

        const myHeaders = this.GetBaseForHeader('GET');

        const requestOptions: RequestInit = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        return new Promise<IDataGetPLayerAroundPlayerInLeaderboard>((resolve, reject) => {
            fetch(`${MConst.URL_SERVER}/player-score/leaderboard/${idLeaderboard}/around/${this._playerID}?limit=${limit}`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    resolve(JSON.parse(result) as unknown as IDataGetPLayerAroundPlayerInLeaderboard);
                })
                .catch((error) => {
                    console.error(error);
                    resolve(null);
                });
        })
    }

    /**
     * this func used for get json game data from server
     * @returns 
     */
    public async GetDataGameServer(): Promise<IDataJsonGameServer> {
        if(this.isTest){
            return new Promise<IDataJsonGameServer>((resolve, reject) => {
                let result = {
                    "success": true,
                    "data": {
                        "LiveTournament": "[{\"ID\":\"67248535c126851d56237e33\",\"contextID\":\"27436872142624221\",\"tournamentID\":\"8394973187296656\",\"nameLeaderboard\":\"Pro Tournament\",\"startTime\":1732534617,\"endTime\":1831656108,\"title\":\"Pro Tournament\",\"des\":\" \"}]",
                        "TimeNextBanner": "60",
                        "TimeNextInter": "60"
                    }
                }

                resolve(result as unknown as IDataJsonGameServer);
            })
        }
        await FBInstantManager.Instance.GetSignature();

        // console.log("Check what make you null", MConfigFacebook.Instance.signature, idLeaderboard, limit);
        if (MConfigFacebook.Instance.signature == null) { return null; }

        const myHeaders = this.GetBaseForHeader('GET');

        const requestOptions: RequestInit = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        return new Promise<IDataJsonGameServer>((resolve, reject) => {
            fetch(`${MConst.URL_SERVER}/game-data/${MConst.SERVER_GAME_ID}`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    // console.log(result);
                    resolve(JSON.parse(result) as unknown as IDataJsonGameServer);
                })
                .catch((error) => {
                    console.error(error);
                    resolve(null);
                });
        })
    }
}

export interface UpdatePlayerData {
    data: {
        id: string,
        fb_instant_game_campaign_id: string,
        fb_instant_game_adset_id: string,
        fb_instant_game_ad_id: string
    }
}

export interface IDataGetPlayerByPlayerIds {
    success: boolean,
    data: IDataPlayer_GetPlayerByIds[]
}

export interface IDataPlayer_GetPlayerByIds {
    _id: "",
    playerId: "",
    avatar: "",
    data: "",
    level: 0,
    name: "",
    score: 0
}

export interface IDataGetTopPlayer {
    status: number,
    data: IDataPlayer_TopPlayer[],
    message: string
}

export interface IDataPlayer_TopPlayer {
    _id: "",
    playerId: "",
    avatar: "",
    level: 0,
    name: "",
    score: 0
}

export interface IDataLeaderboardList {
    success: boolean,
    data: IDataLeaderboard[],
    total: number,
    message: string
}

export interface IDataLeaderboard {
    _id: string,
    gameId: string,
    expireTime: number,                 // expire time tournament
    name: string,                       // name Tournament
    sortOrder: string,
    creatorType: string,                // SYSTEM | PLAYER
    contextId: string,
    tournamentId: string,
    data: any,
    createdAt: string,                  // 2024-08-28T11:19:13.214Z
    updatedAt: string,                  // 2024-08-28T11:19:13.214Z
    __v: number                         // NOT KNOW WHAT IS THIS MEANING => MAY BE VERSION
}

export interface IDataLeaderboardByContextIds {
    success: boolean,
    data: IInfoLeaderboardByContextId[]
}

export interface IInfoLeaderboardByContextId {
    _id: string,
    gameId: string,
    expireTime: number,                 // expire time tournament
    name: string,                       // name Tournament
    sortOrder: string,
    creatorType: CreatorType,                // SYSTEM | PLAYER
    creatorPlayerId: string,
    contextId: string,
    tournamentId: string,
    data: any,
    levels: number[],
    rewards: IPrize[][]
}

export interface IDataTopPlayerInLeaderboard {
    success: boolean,
    data: IDataPlayer_LEADERBOARD[],
    total: number
}

/**
 * rank , score , playerId , name , avatar
 */
export interface IDataPlayer_LEADERBOARD {
    rank: number,
    score: number,
    playerId: string,
    name: string,
    avatar: string
}

export interface IDataGetPLayerAroundPlayerInLeaderboard {
    success: boolean,
    data: IDataPlayer_LEADERBOARD[]
}

export interface IDataJsonGameServer {
    success: boolean,
    data: any
}

export interface IDataTourFromServer {
    "ID": string,
    "contextID": string
    "tournamentID": string
    "nameLeaderboard": string,
    "rewardType": number,
    "startTime": number,
    "endTime": number,
    "title": string,
    "des": string,
    "time": number,
    "type": TYPE_GAME_PLAY_TOURNAMENT,
    "theme": string
}

export interface JsonUpdateScoreToServer {
    "gameId": string,
    "playerId": string,
    "name": string,
    "avatar": string,
    "asid": string,
    "level": number
}

export type SortOrder_1 = "desc" | "asc";
export type SortOrder_2 = "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
export type CreatorType = "SYSTEM" | "PLAYER";


