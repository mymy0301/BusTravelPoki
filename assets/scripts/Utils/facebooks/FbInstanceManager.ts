import { _decorator, CCBoolean, Component, director, error, Node } from 'cc';
import { ResourceUtils } from '../ResourceUtils';
import { clientEvent } from '../../framework/clientEvent';
import { A2uData } from './message-data';
import { MConst } from '../../Const/MConst';
import { lodash } from '../../framework/lodash';
import { ENV_TYPE, MConfigFacebook } from '../../Configs/MConfigFacebook';
import { LogEventManager } from '../../LogEvent/LogEventManager';
import { SoundSys } from '../../Common/SoundSys';
import { CheatingSys } from '../../Scene/CheatingSys';
import { FriendDataInfo, ITournament, TYPE_QUEST_DAILY } from '../Types';
import { ConfigLogEvent } from '../../LogEvent/ConfigLogEvent';
import * as I18n from 'db://i18n/LanguageData';
import { DataLogEventSys } from '../../LogEvent/DataLogEventSys';
import { WithFriendDataInfo } from '../../WithFriend/WithFriendDataInfo';
import { DataItemSys } from '../../Scene/DataItemSys';
import { DataInfoPlayer } from '../../Scene/DataInfoPlayer';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../../Common/ChangeSceneSys';
import { MConfigs } from '../../Configs/MConfigs';
import { Utils } from '../Utils';
const { ccclass, property } = _decorator;

@ccclass('FBInstantManager')
export class FBInstantManager extends Component {
    @property(CCBoolean) private isTest = false; public get Test() { return this.isTest }
    @property(CCBoolean) private isBuild = false; public get IsBuild() { return this.isBuild }
    @property(CCBoolean) private isInitializeAsync = false;
    private isShowInterstitialAd = true;
    public isCreateShortcutAvailable = true;

    @property({ group: "force" }) private canShowRewardVideo = true;
    @property({ group: "force" }) private canShowInitializeAd = true;
    @property({ group: "force" }) private canShowBanner = true;
    @property({ group: "force" }) private forceOffIAP = true; public get IsForceOffIAP() { return this.forceOffIAP }
    public static Instance: FBInstantManager;
    public tournamentID: string = null;

    public preloadedRewardedVideo = null;
    public preloadedInterstitial = null;

    public namePlayer: string = 'Bibibla';

    protected onLoad(): void {
        if (FBInstantManager.Instance == null) {
            FBInstantManager.Instance = this;
            new MConfigFacebook();
            if (this.isTest) {
                clientEvent.dispatchEvent(MConst.FB_NOT_FOUND_DATA_SAVE, false);
                MConfigFacebook.Instance.envType = ENV_TYPE.LOCAL;
            }
            director.addPersistRootNode(this.node);

            if (FBInstantManager.Instance.isBuild) {
                if (window.mobileCheck() == 1) {
                    MConfigs.isMobile = true;
                } else {
                    MConfigs.isMobile = false;
                    if (!Utils.checkIsDesktopSize()) {
                        MConfigs.isMobile = true;
                        console.log("isMobile", MConfigs.isMobile);
                    }
                }
            } else {
                if (!MConfigs.isMobile) {
                    if (!Utils.checkIsDesktopSize()) {

                        MConfigs.isMobile = true;
                        console.log("isMobile", MConfigs.isMobile);
                    }
                }
            }
        }
    }

    protected start(): void {
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) {
            clientEvent.dispatchEvent(MConst.FB_READY_LOAD);
            MConfigFacebook.Instance.isSetPlayerDataSuccess = true;
        }

        if (FBInstantManager.Instance.isTest) {
            clientEvent.dispatchEvent(MConst.IAP_INIT_SUCCESS);
        }
    }

    protected onDestroy(): void {
        FBInstantManager.Instance = null;
    }

    protected update(dt: number): void {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            if (!this.isInitializeAsync) {
                if (window["phase"] === "fb_init") {
                    this.isInitializeAsync = true;
                    this.setStartGame();
                }
            }
        }
    }

    async InitFBInstant_Finished() {
        /* phương thức này được dùng để lấy dữ liệu khi người chơi khởi động trò chơi từ tin nhắn 
        * ví dụ một số trường hợp có thể sử dụng cho phương thức này:
        * 1: trao thưởng cho người chơi các vật phẩm đặc biệt trong trò chơi nếu người chơi truy cập từ chatbot
        * 2: gửi và nhận quà từ bạn bè cùng chơi
        * 3: gửi data cho game state. Ví dự game chơi turn base với bạn , lượt chơi có thể được encoded thành data và gửi cho bạn bè
        */
        let entryPointData = FBInstant.getEntryPointData();
        // console.log("check entry point data từ facebook ", entryPointData);

        var locale = FBInstant.getLocale(); // 'en_US'
        var platform = FBInstant.getPlatform(); // 'IOS'
        var sdkVersion = FBInstant.getSDKVersion(); // '3.0'
        var playerID = FBInstant.player.getID();
        this.namePlayer = FBInstant.player.getName();
        let playerPhotoUrl = FBInstant.player.getPhoto();

        // console.log("check player photo URl in facebook in case no image", playerPhotoUrl);
        // console.log("check locale in facebook", locale);
        // console.log("check player id in facebook", playerID);

        MConfigFacebook.Instance.playerID = playerID;
        MConfigFacebook.Instance.playerPhotoURL = playerPhotoUrl;
        MConfigFacebook.Instance.playerName = this.namePlayer;
        MConfigFacebook.Instance.playerCountryCode = locale;

        if (entryPointData != null) {
            MConfigFacebook.Instance.entryPointData = entryPointData;

            if (entryPointData != null) {
                try {
                    let entryPointDataPayLoad = JSON.parse(entryPointData);
                    let campID: string = entryPointDataPayLoad.fb_instant_game_campaign_id;
                    if (campID) {
                        ConfigLogEvent.Instance.campID_session = campID;
                    }

                    let adsetID: string = entryPointDataPayLoad.fb_instant_game_adset_id;
                    if (adsetID) {
                        ConfigLogEvent.Instance.adsetID_session = adsetID;
                    }

                    let ads: string = entryPointDataPayLoad.fb_instant_game_ad_id;
                    if (ads) {
                        ConfigLogEvent.Instance.adsID_session = ads;
                    }
                } catch (error) {
                    if (lodash.isObject(entryPointData)) {
                        // console.log(entryPointData.ad_id);
                        let campID: string = entryPointData.fb_instant_game_campaign_id;
                        if (campID) {
                            ConfigLogEvent.Instance.campID_session = campID;
                        }

                        let adsetID: string = entryPointData.fb_instant_game_adset_id;
                        if (adsetID) {
                            ConfigLogEvent.Instance.adsetID_session = adsetID;
                        }

                        let ads: string = entryPointData.fb_instant_game_ad_id;
                        if (ads) {
                            ConfigLogEvent.Instance.adsID_session = ads;
                        }
                    }
                }

                if (typeof entryPointData.withfriendData !== 'undefined') {
                    if (entryPointData.withfriendData.length > 0) {
                        try {
                            DataInfoPlayer.Instance.currWithFriendDataInfo = JSON.parse(entryPointData.withfriendData);
                            console.log(DataInfoPlayer.Instance.currWithFriendDataInfo);
                            if (!DataInfoPlayer.Instance.currWithFriendDataInfo.level) {
                                DataInfoPlayer.Instance.currWithFriendDataInfo.level = lodash.random(5, 10);
                            }
                            if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderID != FBInstantManager.Instance.getID()) {
                                DataInfoPlayer.Instance.currWithFriendDataInfo.receiverID = FBInstantManager.Instance.getID();
                                DataInfoPlayer.Instance.currWithFriendDataInfo.receiverAvatarURL = FBInstantManager.Instance.getPhotoUrl();
                                DataInfoPlayer.Instance.currWithFriendDataInfo.receiverName = FBInstantManager.Instance.getName();
                            }
                        } catch (error) {
                            DataInfoPlayer.Instance.currWithFriendDataInfo = null;
                        }

                    }
                }
            }
        }

        if (MConfigFacebook.Instance.FAN_enable) {
            this.LoadAdScheduleOnce();
        }

        FBInstant.getSupportedAPIs();

        (async () => {
            await this.GetSignature();
        })();

        this.getIAP_AllPack();

        this.getIAP_AllPack_byGraphAPI();

        // this.SubcribeBot();

        this.getTournament();

        this.GetListConnectPlayers();

        this.GetDataPlayer();

        this.GetASID();

        this.CheckCanCreateShortcut((err, success) => { });
    }

    public CreateShortcut() {
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) return;
        if (!this.isCreateShortcutAvailable) return false;
        // console.log("Try call create shortcut");

        let self = this;
        FBInstant.canCreateShortcutAsync().then(function (canCreateShortcut) {
            self.isCreateShortcutAvailable = canCreateShortcut;
            if (canCreateShortcut) {
                FBInstant.createShortcutAsync()
                    .then(function () {
                        FBInstantManager.Instance.isCreateShortcutAvailable = false;
                        // Shortcut created
                    })
                    .catch(function () {
                        // Shortcut not created
                    });
            }
        });
    }

    CheckCanCreateShortcut(cb: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) return true;
        let self = this;
        FBInstant.canCreateShortcutAsync().then((canCreateShortcut) => {
            self.isCreateShortcutAvailable = canCreateShortcut;
            cb(null, MConst.FB_CALLBACK_SUCCESS);
        });
    }

    CreateShortcut2(cb: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) return;
        FBInstant.createShortcutAsync()
            .then(() => {
                // Shortcut created
                cb(null, MConst.FB_CALLBACK_SUCCESS);
            })
            .catch((e) => {
                console.error(e);
                cb(e, MConst.FB_CALLBACK_FAIL);
            });
    }

    public SubcribeBot() {
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) return;

        FBInstant.player.canSubscribeBotAsync().then((can_subscribe) => {
            // console.log("canSubscribeBotAsync:" + can_subscribe);
            FBInstant.player.subscribeBotAsync().then(
                // Player is subscribed to the bot
            ).catch(function (e) {
                // Handle subscription failure
            });
        });
    }

    private getTournament() {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstant.getTournamentAsync().then((tournament) => {
                FBInstantManager.Instance.tournamentID = tournament.getID();
                ConfigLogEvent.Instance.tourID_session = tournament.getID();
            }).catch((e) => {
                console.log(e);
            });
        } else {

        }
    }

    private setStartGame() {
        // phương thức này được gọi dùng để tắt cái loading của facebook đi , cái xoay tròn lúc đầu mặc định vào game
        FBInstant.startGameAsync().then(function () {
            // you can emit an event here after startGameAsync()
            FBInstantManager.Instance.InitFBInstant_Finished();
        }).catch((e) => {
            LogEventManager.Instance.logTriggerStartGameFBErr(e.code, e.message);
            this.scheduleOnce(() => {
                this.setStartGame();
            }, 0.2);
        });
    }

    /**
     * this func will get the list players played the game in the last 90 days that are connected to the current player
     */
    private GetListConnectPlayers() {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstant.player.getConnectedPlayersAsync().then((connectedPlayers: FBInstant.ConnectedPlayer[]) => {

                // you can save the list players in here
                // connectedPlayers.map((player) => {
                //     console.log(player);
                //     // console.log(player.getID(), player.getName(), player.getPhoto());
                // });

                let arrFriendDataInfos: FriendDataInfo[] = [];
                for (let i = 0; i < connectedPlayers.length; i++) {

                    let connectedPlayer: FBInstant.ConnectedPlayer = connectedPlayers[i];
                    let friendInfo: FriendDataInfo = new FriendDataInfo();
                    friendInfo.id = connectedPlayer.getID();
                    friendInfo.photo = connectedPlayer.getPhoto();
                    friendInfo.name = connectedPlayer.getName();
                    //PlayFabManager.instance.addFriend_byID(friendInfo.id);
                    arrFriendDataInfos.push(friendInfo);
                }

                MConfigFacebook.Instance.arrConnectedPlayerInfos = arrFriendDataInfos;
                MConfigFacebook.Instance.arrTempConnectedPlayerInfos = lodash.cloneDeep(arrFriendDataInfos);
                clientEvent.dispatchEvent(MConst.EVENT_LEADERBOARD.UPDATE_DATA_LEADERBOARD_FRIEND);
            });
        }
    }

    private GetDataPlayer() {
        // console.log("GetDataPlayer"+new Date().getTime());
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) return;
        FBInstant.player.getDataAsync(["data"]).then(result => {
            // console.log("GetDataPlayer Finished");
            let data: string = result["data"];
            if (typeof data === 'undefined' || data == null || data == undefined) {
                //console.log("undefinedundefinedundefinedundefinedundefined");
                // console.log("not found any data from facebook", data);
                clientEvent.dispatchEvent(MConst.FB_NOT_FOUND_DATA_SAVE, true);
                // save game => you can put save game code below or in the function listen this emit
            } else {
                // console.log("found any data from facebook", data);
                clientEvent.dispatchEvent(MConst.FB_NOT_FOUND_DATA_SAVE, false);
            }
            // console.log("found data from facebook", data);
            clientEvent.dispatchEvent(MConst.FB_UPDATE_DATA_PLAYER, data);
            MConfigFacebook.Instance.updateDataPlayer(data);
            FBInstantManager.Instance._canSaveData = true;
        }).catch(function (e) {
            FBInstantManager.Instance._canSaveData = false;
            console.error("GetDataPlayer error: ", e);
        });
    }

    private _canSaveData: boolean = false;
    private SetDataPlayer(content: string) {
        // console.log("SetDataPlayerSetDataPlayerSetDataPlayerSetDataPlayer");
        // console.log(content);

        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) return;
        FBInstant.player.setDataAsync({ data: content }).then(() => {
            // console.log("SetDataPlayer Finished");
        });
    }

    public SetDataPlayer_222(content: string) {
        if (!FBInstantManager.Instance._canSaveData) return;
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) return;
        // console.log("call save data with content", content);

        FBInstant.player.setDataAsync({ data: content }).then(() => {
            // console.log("SetDataPlayer Finished", content);
        }).catch(function (e) {
            console.error(e);
        });
    }

    private asID: string = "";
    dataA2U = {};
    /**
     * A unique identifier for the player. This is the standard Facebook Application-Scoped ID which is used for all Graph API calls.
     * If your game shares an AppID with a native game this is the ID you will see in the native game too.
     * Hiểu nôm na là dùng cho việc thông báo notification trên face book, kiểu mời bạn quay trở lại
     */
    GetASID() {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstant.player.getASIDAsync()
                .then(
                    _asid => {
                        // console.log("asid: ", _asid);
                        let data = {
                            a2u: {
                                id: this.getID(),
                                asid: _asid,
                                index: -1,
                                page_key: "18",
                            },
                        };
                        console.log(data);
                        // this.sendA2U(JSON.stringify(data));
                        this.CancelAllNotifications(_asid);
                        MConfigFacebook.Instance.asId = _asid;
                    }
                );
        }
    }

    public GetSignature(): Promise<void> {
        /* phương thức này mục đích lấy chữ lý xác minh số nhận dạng đó đến từ Facebook mà ko bị giả mạo */
        return new Promise<void>((resolve, reject) => {
            if (MConfigFacebook.Instance.envType != ENV_TYPE.FB || FBInstantManager.Instance.isTest) {
                resolve();
            }
            FBInstant.player.getSignedPlayerInfoAsync('metadata')
                .then(signedPlayerInfo => {
                    const playerID: string = signedPlayerInfo.getPlayerID(); // // same value as FBInstant.player.getID()
                    const signature: string = signedPlayerInfo.getSignature();
                    MConfigFacebook.Instance.signature = signature;
                    // console.log("signature: ", signature);
                    resolve();
                })
                .catch(error => {
                    resolve();
                });
        })
    }

    public getID() {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            return FBInstant.player.getID();
        } else {
            return MConfigFacebook.Instance.playerID;
        }
    }

    private CancelAllNotifications(asid: string) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstant.graphApi.requestAsync(
                "/" + asid + "/cancel_all_notifications",
                "POST"
            )
                .then((result: any) => {
                    console.log("resetSendA2u: ", result);
                    this.sendNewA2U(asid);
                })
                .catch((error: any) => {
                    console.log("error send a2u : ", error);
                    this.sendNewA2U(asid);
                });
        }
    }

    private sendNewA2U(asid: string) {
        let DAYS = [0, 1, 2, 4, 6];
        for (let i = 0; i < DAYS.length; i++) {
            let delayTime = 60 * 60 * 1;
            if (DAYS[i] > 0) {
                delayTime = 86400 * DAYS[i];
            };
            let messageData = A2uData.a2uNotification(delayTime);
            FBInstant.graphApi
                .requestAsync(
                    "/" + asid + "/notifications",
                    "POST",
                    messageData
                )
                .then((result: any) => {
                    // console.log("result send a2u : ", result);
                })
                .catch((error: any) => {
                    console.log("error send a2u : ", error);
                });
        }
    }

    //#region functions popular function
    public getEntryPointData() {
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) return null;
        return FBInstant.getEntryPointData();
    }

    public ShareImage(entryPointData: string, base64Image: string, cb?: FBShare_Callback) {
        FBInstant.shareAsync({
            intent: 'REQUEST',
            image: base64Image,
            text: "Play " + MConst.GAME_NAME_TITLE + " with me!",
            data: { entryPointData },
        }).then(function () {
            // continue with the game.
            cb();
        });
    }

    public ShareMyScoreWithFriend(base64Picture: string, jsonSend: any, cb: FBInstantCommon_Callback = () => { }) {
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) { return; }

        FBInstant.shareAsync({
            intent: "INVITE" as "INVITE",
            image: base64Picture,
            text: "Play " + MConst.GAME_NAME_TITLE + " with me!",
            data: jsonSend
        }).then(function () {
            // closes the game after the update is posted.
            console.log("ShareMyScore FINISHED");
            cb();
        })
            .catch(function (e) {
                console.log("ShareMyScore FAIL", e);
                cb();
            });
    }

    public ShareBestScore(base64Picture: string, cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstant.shareAsync({
                intent: "INVITE" as "INVITE",
                image: base64Picture,
                text: 'Play ' + MConst.GAME_NAME_TITLE + "!",
            }).then(function () {
                cb(null, MConst.FB_CALLBACK_SUCCESS);
            })
                .catch(function (e) {
                    cb(new Error("Error!"), MConst.FB_CALLBACK_FAIL);
                });
        } else {
            cb(null, MConst.FB_CALLBACK_SUCCESS);
        }
    };

    public PostSessionScore(score: number) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstant.postSessionScoreAsync(score);
        } else {

        }

    }

    /**
     * This func will send a pop up play with friend
     * @param idFriend if "invite" => choose async , id => choose right id player if something wrong will call chooseAsync
     * @param cb FBInstantCommon_Callback222
     */
    public PlayWithFriend(idFriend?: string, cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            // console.log("555555555555555555", idFriend, Array.from(MConfigFacebook.Instance.arrConnectedPlayerInfos));

            // if (MConfigFacebook.Instance.arrConnectedPlayerInfos.length > 0 && idFriend != "invite") {
            if (idFriend != "invite") {
                // console.log("666666666 Check idFriend: ", idFriend);
                FBInstant.context.createAsync(idFriend)
                    .then(() => {
                        cb(null, MConst.FB_CALLBACK_SUCCESS);
                    }).catch((e) => {
                        // case same context
                        // if same context => let player join the game not need to show play 1Vs1
                        if (e.code == "SAME_CONTEXT" || e.code == "CLIENT_UNSUPPORTED_OPERATION") {
                            cb(null, MConst.FB_CALLBACK_SUCCESS);
                        } else {
                            cb(new Error("FAIL"), MConst.FB_CALLBACK_FAIL);
                        }
                    });
            } else {
                FBInstant.context.chooseAsync()
                    .then(function () {
                        cb(null, MConst.FB_CALLBACK_SUCCESS);
                    })
                    .catch(function (e) {
                        cb(new Error("Fail"), MConst.FB_CALLBACK_FAIL);
                    });
            }

        } else {
            cb(new Error("FAIL"), MConst.FB_CALLBACK_FAIL);
        }
    }

    PlayWithFriend_ChooseAsync(cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstant.context.chooseAsync()
                .then(() => {
                    cb(null, MConst.FB_CALLBACK_SUCCESS);
                })
                .catch((e) => {
                    if (e.code == "SAME_CONTEXT" || e.code == "CLIENT_UNSUPPORTED_OPERATION") {
                        cb(null, MConst.FB_CALLBACK_SUCCESS);
                    } else {
                        cb(new Error("FAIL"), MConst.FB_CALLBACK_FAIL);
                    }
                });
        } else {
            cb(null, MConst.FB_CALLBACK_SUCCESS);
        }
    }

    PlayWithFriend_ID(idFB: string, cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstant.context.createAsync(idFB)
                .then(() => {
                    cb(null, MConst.FB_CALLBACK_SUCCESS);
                }).catch((e) => {
                    // console.log("PlayWithFriend 2222222222");
                    if (e.code == "SAME_CONTEXT" || e.code == "CLIENT_UNSUPPORTED_OPERATION") {
                        cb(null, MConst.FB_CALLBACK_SUCCESS);
                    } else {
                        cb(new Error("FAIL"), MConst.FB_CALLBACK_FAIL);
                    }
                });
        } else {
            cb(null, MConst.FB_CALLBACK_SUCCESS);
        }
    }

    public joinTournament(contextID: string, cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            // console.log("joinTournamentjoinTournamentjoinTournament"+contextID);
            FBInstant.context.switchAsync(contextID).then(() => {
                // console.log("joinTournament SUCCESS");
                cb(null, MConst.FB_CALLBACK_SUCCESS);

                // console.log("contextId ", FBInstant.context.getID());

                // log payload in the tournament 
                // console.log("blob of tournament join", FBInstant.getEntryPointData());
            }).catch(function (e) {
                // console.log("joinTournament FAIL");
                // console.log(e);
                if (e.code == "SAME_CONTEXT" || e.code == "CLIENT_UNSUPPORTED_OPERATION") {
                    cb(null, MConst.FB_CALLBACK_SUCCESS);

                    // log payload in the tournament 
                    // console.log("blob of tournament join", FBInstant.getEntryPointData());
                } else {
                    cb(new Error("FAIL"), MConst.FB_CALLBACK_FAIL);
                }
            });
        } else {
            cb(null, MConst.FB_CALLBACK_SUCCESS);
        }
    }

    public resetContext(cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstantManager.Instance.tournamentID = "";
            // console.log("joinTournamentjoinTournamentjoinTournament"+contextID);
            if (FBInstant.context && FBInstant.context.getID() != null) {
                // console.log("switchAsync SOLO");
                FBInstant.context.switchAsync('SOLO').then(() => {
                    // console.log(FBInstant.context);
                    // console.log(FBInstant.context.getID());
                    cb(null, MConst.FB_CALLBACK_SUCCESS);
                }).catch(function (e) {
                    // console.log("SOLO");
                    // console.log(e);
                    cb(e, MConst.FB_CALLBACK_FAIL);
                });
            }
        } else {
            cb(null, MConst.FB_CALLBACK_SUCCESS);
        }
    }

    public resetContextForced(cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstantManager.Instance.tournamentID = "";
            // console.log("joinTournamentjoinTournamentjoinTournament"+contextID);
            if (FBInstant.context && FBInstant.context.getID() != null) {
                // console.log("switchAsync SOLO");
                FBInstant.context.switchAsync('SOLO', true).then(() => {
                    // console.log(FBInstant.context);
                    // console.log(FBInstant.context.getID());
                    cb(null, MConst.FB_CALLBACK_SUCCESS);
                }).catch(function (e) {
                    // console.log("SOLO");
                    // console.log(e);
                    cb(e, MConst.FB_CALLBACK_FAIL);
                });
            }
        } else {
            cb(null, MConst.FB_CALLBACK_SUCCESS);
        }
    }

    public UpdateContext(base64Picture: string, data, cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstant.updateAsync({
                action: 'CUSTOM',
                cta: "Play " + MConst.GAME_NAME_TITLE + " with me!",
                image: base64Picture,
                text: {
                    default: 'Can you do better?',
                    localizations: {
                        ar_AR: 'هل يمكنك فعل ما هو أفضل؟',
                        ca_ES: '¿Puedes hacerlo mejor?',
                        pt_PT: 'Você pode fazer melhor?',
                        fr_FR: 'Peux-tu faire mieux ?',
                        id_ID: 'Bisakah Anda melakukan yang lebih baik?',
                        vi_VN: 'Bạn có thể làm tốt hơn không?',
                        th_TH: 'คุณทำได้ดีกว่านี้ไหม',
                        tr_TR: 'Daha iyisini yapabilir misin?',
                        de_DE: 'Kannst du es besser?',
                    }
                },
                template: 'test_template',
                strategy: 'IMMEDIATE',
                notification: 'PUSH',
                data: data
            }).then(function () {
                // closes the game after the update is posted.
                if (cb != null) cb(null, MConst.FB_CALLBACK_SUCCESS);
                console.log("updateContext FINISHED");
            })
                .catch(function (e) {
                    if (cb != null) cb(null, MConst.FB_CALLBACK_FAIL);
                    console.log("updateContext FAIL");
                });
        } else {
        }
    }

    public UpdateContext_Invite_222(base64Picture: string, cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            if (FBInstant.context != null) {
                FBInstant.updateAsync({
                    action: 'CUSTOM',
                    cta: "Play",
                    image: base64Picture,
                    text: {
                        default: "Play " + MConst.GAME_NAME_TITLE + " with me!", //namePlayer + ' sloved your word!',
                        localizations: {
                        }
                    },
                    template: 'test_template',
                    strategy: 'IMMEDIATE',
                    notification: 'PUSH'
                }).then(function () {
                    // closes the game after the update is posted.
                    //console.log("updateContext FINISHED");
                    cb(null, MConst.FB_CALLBACK_SUCCESS);
                })
                    .catch(function (e) {
                        //console.log("updateContext FAIL");
                        cb(new Error("Error!"), MConst.FB_CALLBACK_FAIL);
                    });
            } else {
                cb(new Error("Error!"), MConst.FB_CALLBACK_FAIL);
            }
        } else {
            cb(new Error("Error!"), MConst.FB_CALLBACK_FAIL);
        }

    };

    UpdateContext_WithFriend(base64Picture: string, withFriendDataInfo: WithFriendDataInfo, cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            let withfriendData = JSON.stringify(withFriendDataInfo);
            console.log("UpdateContext_WithFriend", withfriendData);
            if (FBInstant.context != null) {
                FBInstant.updateAsync({
                    action: 'CUSTOM',
                    cta: "Play",
                    image: base64Picture,
                    text: {
                        default: "Can you beat " + FBInstantManager.Instance.getName() + " time?",
                        localizations: {
                        }
                    },
                    template: 'test_template',
                    strategy: 'IMMEDIATE',
                    notification: 'PUSH',
                    data: { withfriendData }
                }).then(() => {
                    // closes the game after the update is posted.
                    //console.log("updateContext FINISHED");
                    cb(null, MConst.FB_CALLBACK_SUCCESS);
                })
                    .catch((e) => {
                        console.log("updateContext FAIL", e);
                        cb(new Error("Error!"), MConst.FB_CALLBACK_FAIL);
                    });
            } else {
                cb(new Error("Error!"), MConst.FB_CALLBACK_FAIL);
            }
        } else {
            cb(new Error("Error!"), MConst.FB_CALLBACK_FAIL);
        }

    };

    public UpdateContext_222(base64Picture: string, data, cta: string, contextText: string, cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            console.log("Context player: ", FBInstant.context.getID());

            FBInstant.updateAsync({
                action: 'CUSTOM',
                cta: `${cta}`,
                image: base64Picture,
                text: {
                    default: contextText,
                    localizations: {
                    }
                },
                template: 'test_template',
                strategy: 'IMMEDIATE',
                notification: 'PUSH',
                data: data
            }).then(function () {
                // closes the game after the update is posted.
                if (cb != null) cb(null, MConst.FB_CALLBACK_SUCCESS);
                console.log("updateContext FINISHED");
            })
                .catch(function (e) {
                    if (cb != null) cb(null, MConst.FB_CALLBACK_FAIL);
                    console.log("updateContext FAIL");
                });
        } else {
        }
    }

    /**this func using for post score to the tournament player is playing */
    private PostScoreTournament(score: number, cb?: FBInstantCommon_Callback222) {
        // console.log("PostScoreTournamentPostScoreTournament");
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            let shareTournamentPayload: FBInstant.ShareTournamentPayload = {
                score: score,
                data: {}
            };

            FBInstant.tournament.shareAsync(shareTournamentPayload).then(() => {
                cb!(null, MConst.FB_CALLBACK_SUCCESS);

            }).catch(() => {
                cb!(null, MConst.FB_CALLBACK_FAIL);
            });
        } else {

        }
    }

    /**this func using for create a tournament of player and post score to it*/
    public PostScoreShareTournament(score: number, cb?: FBInstantCommon_Callback222) {
        // console.log("PostScoreTournamentPostScoreTournament", score, "|" + FBInstantManager.Instance.tournamentID);
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            if (FBInstantManager.Instance.tournamentID == "") {
                FBInstantManager.Instance.createTournament(score, cb);
            } else {

                let shareTournamentPayload: FBInstant.ShareTournamentPayload = {
                    score: score
                };

                FBInstant.tournament.shareAsync(shareTournamentPayload).then(() => {
                    // console.log("AAAAAAAAAAAAAAAAAAA");
                    cb!(null, MConst.FB_CALLBACK_SUCCESS);
                }).catch((err) => {
                    // console.log(err);
                    cb!(null, MConst.FB_CALLBACK_FAIL);
                });
            }
        } else {
            cb!(null, MConst.FB_CALLBACK_FAIL);
        }
    }

    public ShareTournamentScore(score: number, cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            let shareTournamentPayload: FBInstant.ShareTournamentPayload = {
                score: score
            };
            FBInstant.tournament.shareAsync(shareTournamentPayload).then(() => {
                // console.log("AAAAAAAAAAAAAAAAAAA");
                cb!(null, MConst.FB_CALLBACK_SUCCESS);
            }).catch((err) => {
                // console.log(err);
                cb!(null, MConst.FB_CALLBACK_FAIL);
            });
        } else {
            cb!(null, MConst.FB_CALLBACK_FAIL);
        }
    }

    private createTournament(score: number, cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            // console.log("createTournamentcreateTournament");
            let createTournamentConfig: FBInstant.CreateTournamentConfig = {
                title: FBInstantManager.Instance.namePlayer + "'s Tournament",
            };
            // console.log(_data);
            const createTournamentPayload: FBInstant.CreateTournamentPayload = {
                initialScore: score,
                config: createTournamentConfig,
            };

            FBInstant.tournament.createAsync(createTournamentPayload)
                .then(tournament => {
                    cb(null, MConst.FB_CALLBACK_SUCCESS);
                }).catch(function (e) {
                    // console.log(e);
                    cb(new Error("A"), MConst.FB_CALLBACK_FAIL);
                });
        }
    }


    /**
     * this func using for play with friend idFB
     * @param idFB 
     * @param cb 
     * @returns 
     */
    public InviteFriend_333(idFB: string, data: any, cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB && idFB == "") { return; }
        FBInstant.context.createAsync(idFB)
            .then(() => {
                cb(null, MConst.FB_CALLBACK_SUCCESS);
            }).catch((err) => {
                // console.log(err);
                // FBInstant.context.chooseAsync()
                //     .then(function () {
                //         console.log("PlayWithFriend ok");
                //         cb(null, MConst.FB_CALLBACK_SUCCESS);
                //     })
                //     .catch(function (e) {
                //         console.log("PlayWithFriend failed");
                //         cb(new Error("No Play!"), MConst.FB_CALLBACK_FAIL);
                //     });
            });
    }

    public GiftForFriend(idFB: string, cb?: FBInstantCommon_Callback222) {
        // console.log("PlayWithFriendPlayWithFriendPlayWithFriend:"+idFB);
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            if (MConfigFacebook.Instance.arrConnectedPlayerInfos.length > 0) {
                let id: string = idFB;
                if (idFB === "") {
                    id = MConfigFacebook.Instance.arrConnectedPlayerInfos[lodash.random(0, MConfigFacebook.Instance.arrConnectedPlayerInfos.length)].id;
                } else if (!MConfigFacebook.Instance.checkIsMyFriend(id)) {
                    id = MConfigFacebook.Instance.arrConnectedPlayerInfos[lodash.random(0, MConfigFacebook.Instance.arrConnectedPlayerInfos.length)].id;
                }

                // console.log(id);
                FBInstant.context.createAsync(id)
                    .then(() => {
                        cb(null, MConst.FB_CALLBACK_SUCCESS);
                    }).catch(() => {
                        FBInstant.context.chooseAsync()
                            .then(function () {
                                // console.log("PlayWithFriend 333333333");
                                cb(null, MConst.FB_CALLBACK_SUCCESS);
                            })
                            .catch(function (e) {
                                // console.log("PlayWithFriend 44444444444");
                                cb(new Error("No Play!"), MConst.FB_CALLBACK_FAIL);
                            });
                    });
            } else {
                FBInstant.context.chooseAsync()
                    .then(function () {
                        // console.log("PlayWithFriend 333333333");
                        cb(null, MConst.FB_CALLBACK_SUCCESS);
                    })
                    .catch(function (e) {
                        // console.log("PlayWithFriend 44444444444");
                        cb(new Error("No Play!"), MConst.FB_CALLBACK_FAIL);
                    });
            }

        } else {
            cb(new Error("No Play!"), MConst.FB_CALLBACK_FAIL);
        }

    }

    public getName() {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            return FBInstant.player.getName();
        } else {
            return "player_test";
        }
    }
    public getId() {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            return FBInstant.player.getID();
        } else {
            return "id_player_test";
        }
    }

    getPhotoUrl() {
        ////console.log("getPhotoUrlgetPhotoUrlgetPhotoUrlgetPhotoUrl");
        ////console.log(FBInstant.player.getPhoto());
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            return FBInstant.player.getPhoto();
        } else {
            return "";
        }

    }
    //#endregion

    //#region function invite friend
    public inviteFriend_222(base64Picture: string, cb?: FBInstantCommon_Callback222) {
        // log event
        LogEventManager.logEvent(LogEventManager.Instance.EVENT.TOUCH_INVITE);

        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB) {
            FBInstant.inviteAsync({
                action: 'CUSTOM',
                cta: "Play",
                image: base64Picture,
                text: {
                    default: 'Play ' + MConst.GAME_NAME_TITLE + "!",
                    localizations: {
                    }
                }
            })
                .then(function () {
                    cb!(null, MConst.FB_CALLBACK_SUCCESS);
                })
                .catch(function (e) {
                    cb!(null, MConst.FB_CALLBACK_FAIL);
                });

        } else {
            cb!(null, MConst.FB_CALLBACK_SUCCESS);
        }
    }
    //#endregion

    //#region Banner Ads 
    private _canShowBanner: boolean = true; public set CanShowBanner(value: boolean) { this._canShowBanner = value; }
    private _hideBannerManual: boolean = false; public set HideBannerManual(value: boolean) { this._hideBannerManual = value; }
    isReloadBanner: boolean = true;
    public Load_BannerAdAsync_SheduleOne(isForceLoad: boolean = false) {
        // console.log("Load_BannerAdAsync_SheduleOneLoad_BannerAdAsync_SheduleOneLoad_BannerAdAsync_SheduleOne");
        const self = this;
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) return;
        if (MConfigFacebook.Instance.playerID) {
            if (!isForceLoad) {
                if (this.isReloadBanner) {
                    this.scheduleOnce(this.Load_BannerAdAsync, 3);
                    this.SetNextTime_ReloadBanner();
                } else {
                    console.log("NOT RELOAD!");
                }
            } else {
                this.unschedule(this.Load_BannerAdAsync);
                this.isReloadBanner = true;
                this.scheduleOnce(this.Load_BannerAdAsync, 3);
                this.SetNextTime_ReloadBanner();
            }
        }
    }

    public Hide_BannerAd() {
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) return;
        this._canShowBanner = false;
        FBInstant.hideBannerAdAsync();
    }

    private SetNextTime_ReloadBanner() {
        this.isReloadBanner = false;
        this.scheduleOnce(function () {
            // Here `this` is referring to the component
            this.isReloadBanner = true;
            this.Load_BannerAdAsync_SheduleOne();
        }, MConfigFacebook.Instance.TIME_NEXT_RELOAD_BANNER);
    }

    private LoadAdScheduleOnce() {
        let self = this;
        this.scheduleOnce(() => {
            // Here `this` is referring to the component
            self.Preload_InterstitialAdAsync();
            self.Load_BannerAdAsync_SheduleOne();
            self.Preload_RewardAdAsync();
        }, 3);
    }

    isPreLoadAd: boolean = false;
    public LoadAdScheduleOnce_NotDelay() {
        // console.error("LoadAdScheduleOnce_NotDelay", this.isPreLoadAd);
        if (this.isPreLoadAd || !this.CanShowBanner) return;
        // console.error("LoadAdScheduleOnce_NotDelay222222222");
        this.isPreLoadAd = true;
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) return;
        this.Preload_InterstitialAdAsync();
        this.Load_BannerAdAsync_SheduleOne();
        this.Preload_RewardAdAsync();
    }

    private Load_BannerAdAsync() {
        if (!this._canShowBanner || !this._hideBannerManual || !this.canShowBanner) {
            // console.log("fail", this._canShowBanner, this._hideBannerManual, this.canShowBanner);
            return;
        }

        LogEventManager.Instance.logAd_Banner_Show(ChangeSceneSys.Instance.GetNameUISceneUsing());

        FBInstant.loadBannerAdAsync(
            MConst.FB_BANNER_PLACEMENT_ID
        ).then(() => {
            if (ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.GAME) {
                // LogEventManager.Instance.logAd_Banner_Success("", "");

                LogEventManager.logEvent(LogEventManager.Instance.EVENT.BANNER_ADS);
                if (ConfigLogEvent.Instance.isPaidUser) {
                    LogEventManager.logEvent(LogEventManager.Instance.EVENT.BANNER_ADS_PAID);
                } else {
                    LogEventManager.logEvent(LogEventManager.Instance.EVENT.BANNER_ADS_ORGANIC);
                }

                LogEventManager.Instance.logCAMPID_BANNER(ConfigLogEvent.Instance.log_CAMP_ID);
                LogEventManager.Instance.logADSETID_BANNER(ConfigLogEvent.Instance.log_ADSET_ID);
                LogEventManager.Instance.logADSID_BANNER(ConfigLogEvent.Instance.log_ADS_ID);

                LogEventManager.Instance.logTOURID_BANNER(ConfigLogEvent.Instance.tourID_session);
                // console.log('success');
            } else {
                this.Hide_BannerAd();
            }

        }).catch(function (e) {
            LogEventManager.Instance.logAd_Banner_Fail(ChangeSceneSys.Instance.GetNameUISceneUsing());
            // console.log(e);
        });
    }
    //#endregion Banner Ads 

    //#region Inter Ads
    _canShowInter: boolean = true; public set HideShowInter(value: boolean) { this._canShowInter = value; }

    isFinishedLoad_InterstitialAd: boolean = false;
    private Preload_InterstitialAdAsync() {
        if (!this.canShowInitializeAd) { return; }
        this.preloadedInterstitial = null;
        let self = this;
        self.isFinishedLoad_InterstitialAd = false;
        FBInstant.getInterstitialAdAsync(
            MConst.FB_INTERSTITIAL_PLACEMENT_ID,
        ).then(function (interstitial) {
            self.preloadedInterstitial = interstitial;
            return self.preloadedInterstitial.loadAsync();
        }).then(function () {
            // Ad not loaded
            self.isFinishedLoad_InterstitialAd = true;
        }).catch(function () {
            self.preloadedInterstitial = null;
            self.isFinishedLoad_InterstitialAd = false;
        });
    }

    fb_InterstitialAd_CallBack: FBIntanstAd_Callback = null;
    public Show_InterstitialAdAsync(location: string, cb?: FBIntanstAd_Callback) {
        // console.log("call inter", this._canShowInter);

        //===================  check in case can not show inter ======================
        // auto return true
        if (!this._canShowInter) {
            cb(null, MConst.FB_INTERSTITIAL_CALLBACK_SUCCESS);
            return;
        }

        //===================  In case can show inter ======================
        let self = this;
        self.fb_InterstitialAd_CallBack = cb;
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        // this.unschedule(this.timeWait_InterstitialAd_Callback);

        if (MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL) {
            if (this.isShowInterstitialAd) {
                // this.scheduleOnce(this.timeWait_InterstitialAd_Callback,this.TIMEWAIT_INTERSTITIAL_AD);
                if (self.fb_InterstitialAd_CallBack) {
                    self.fb_InterstitialAd_CallBack(null, MConst.FB_INTERSTITIAL_CALLBACK_SUCCESS);
                    clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                    self.SetNextTime_ShowInterstitialAd();
                }
            } else {
                if (self.fb_InterstitialAd_CallBack) {
                    clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                    self.fb_InterstitialAd_CallBack(new Error("next TIME!"), MConst.FB_INTERSTITIAL_CALLBACK_FAIL);
                }
            }
        } else {
            // console.log("call inter 222", this.isInitializeAsync, this.canShowInitializeAd, this.isShowInterstitialAd, this.preloadedInterstitial, this.isFinishedLoad_InterstitialAd);
            if (this.isInitializeAsync && this.canShowInitializeAd) {
                if (this.isShowInterstitialAd) {
                    if (this.preloadedInterstitial && this.isFinishedLoad_InterstitialAd) {
                        SoundSys.Instance.pauseSoundShowAd();

                        //log event
                        LogEventManager.Instance.logAd_Interstitial_Show(location, "");
                        LogEventManager.logEvent(LogEventManager.Instance.EVENT.INTER_ADS);
                        if (ConfigLogEvent.Instance.isPaidUser) {
                            LogEventManager.logEvent(LogEventManager.Instance.EVENT.INTER_ADS_PAID);
                        } else {
                            LogEventManager.logEvent(LogEventManager.Instance.EVENT.INTER_ADS_ORGANIC);
                        }
                        LogEventManager.Instance.logCAMPID_INTER(ConfigLogEvent.Instance.log_CAMP_ID);
                        LogEventManager.Instance.logADSETID_INTER(ConfigLogEvent.Instance.log_ADSET_ID);
                        LogEventManager.Instance.logADSID_INTER(ConfigLogEvent.Instance.log_ADS_ID);
                        LogEventManager.Instance.logTOURID_INTER(ConfigLogEvent.Instance.tourID_session);
                        // LogEventManager.instance.logEvent_InterAd();

                        this.preloadedInterstitial
                            .showAsync()
                            .then(function () {
                                LogEventManager.Instance.logAd_Interstitial_Success(location, "");
                                DataLogEventSys.Instance.Add_adInterWatch(); // this func also have log event

                                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                                // console.log("Interstitial ad finished successfully");
                                SoundSys.Instance.resumeSoundShowAd();
                                self.SetNextTime_ShowInterstitialAd();
                                cb(null, MConst.FB_INTERSTITIAL_CALLBACK_SUCCESS);

                                self.Preload_InterstitialAdAsync();
                            })
                            .catch(function (e: any) {
                                LogEventManager.Instance.logAd_Interstitial_Fail(location, "");

                                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                                // console.log("FB_INTERSTITIAL_CALLBACK_FAILFB_INTERSTITIAL_CALLBACK_FAILFB_INTERSTITIAL_CALLBACK_FAIL");
                                console.error(e.message);
                                SoundSys.Instance.resumeSoundShowAd();
                                cb(e.message, MConst.FB_INTERSTITIAL_CALLBACK_FAIL);
                                self.Preload_InterstitialAdAsync();
                            });
                    } else {
                        LogEventManager.Instance.logAd_Interstitial_Fail(location, "");

                        clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                        // console.log("Show_InterstitialAdAsync preload fail!preload fail!preload fail!");
                        cb(new Error("preload fail!"), MConst.FB_INTERSTITIAL_CALLBACK_FAIL);
                        this.Preload_InterstitialAdAsync();
                    }


                } else {
                    //////console.log("Show_InterstitialAdAsync next TIME!next TIME!next TIME!");
                    clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                    self.fb_InterstitialAd_CallBack(new Error("next TIME!"), MConst.FB_INTERSTITIAL_CALLBACK_FAIL);
                }
            } else {
                //////console.log("Show_InterstitialAdAsync INIT FAIL!INIT FAIL!INIT FAIL!INIT FAIL!INIT FAIL!");
                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                self.fb_InterstitialAd_CallBack(new Error("INIT FAIL!"), MConst.FB_INTERSTITIAL_CALLBACK_FAIL);
            }
        }
    }

    private SetNextTime_ShowInterstitialAd() {
        // console.log(this.TIME_NEXT_INTERSTITIAL);
        this.isShowInterstitialAd = false;
        this.scheduleOnce(function () {
            // Here `this` is referring to the component
            this.isShowInterstitialAd = true;
        }, MConfigFacebook.Instance.TIME_NEXT_INTERSTITIAL);
    }

    private SetNextTime_ShowInterstitialAd_AfterReward() {
        // console.log(this.TIME_NEXT_INTERSTITIAL);
        this.isShowInterstitialAd = false;
        this.scheduleOnce(function () {
            // Here `this` is referring to the component
            this.isShowInterstitialAd = true;
        }, MConfigFacebook.Instance.TIME_NEXT_INTERSTITIAL_AFTERREWARD);
    }
    //#endregion Inter Ads

    //#region Reward Ads
    preloadAttemptCount_RewardVideo = 0;
    maxPreloadAttempts_RewardVideo = 3;
    isFinishedLoad_RewardedVideo: boolean = false;
    isLoading_RewardedVideo: boolean = false;

    private Preload_RewardAd_SheduleOne() {
        console.log("Preload_RewardAd_SheduleOne");
        this.scheduleOnce(() => {
            this.Preload_RewardAdAsync();
        }, 5);
    }

    private Preload_RewardAdAsync() {
        console.log("Preload_RewardAdAsync");
        if (this.isLoading_RewardedVideo) {
            // this.schedule(this.timeWait_Loading_RewardVideoAd, 1, 0, this.TIMEWAIT_LOADING_REWARDVIDEO_AD);
            return;
        }

        this.isLoading_RewardedVideo = true;

        this.preloadedRewardedVideo = null;
        let self = this;
        self.isFinishedLoad_RewardedVideo = false;
        if (this.preloadAttemptCount_RewardVideo >= this.maxPreloadAttempts_RewardVideo) {
            console.error('Đã đạt đến số lần preload tối đa. Không cố gắng preload nữa.');
            return;
        }
        this.schedule(this.timeWait_Loading_RewardVideoAd, 1, 0, this.TIMEWAIT_LOADING_REWARDVIDEO_AD);
        FBInstant.getRewardedVideoAsync(
            MConst.FB_REWARDED_PLACEMENT_ID,
        ).then(function (rewardedVideo) {
            self.preloadedRewardedVideo = rewardedVideo;
            return self.preloadedRewardedVideo.loadAsync();
        }).then(function () {
            console.log("Reward video loaded");
            //Ad loaded
            self.unschedule(self.timeWait_Loading_RewardVideoAd);
            self.isLoading_RewardedVideo = false;
            self.isFinishedLoad_RewardedVideo = true;
            self.preloadAttemptCount_RewardVideo = 0;
        }).catch((err) => {
            console.error("Error preload reward video: ", err);
            self.unschedule(self.timeWait_Loading_RewardVideoAd);
            self.isLoading_RewardedVideo = false;
            self.preloadAttemptCount_RewardVideo++;
            self.preloadedRewardedVideo = null;
            self.isFinishedLoad_RewardedVideo = false;
            LogEventManager.Instance.logAd_Reward_PreloadFail(err.message);
            if (self.preloadAttemptCount_RewardVideo >= this.maxPreloadAttempts_RewardVideo) {
                console.error('Đã đạt đến số lần preload tối đa 2222. Không cố gắng preload nữa.');
                // return;
            } else {
                self.Preload_RewardAd_SheduleOne();
            }
        });
    }

    timeWait_Loading_RewardVideoAd() {
        this.isLoading_RewardedVideo = false;
    }

    fb_RewardVideo_CallBack: FBIntanstAd_Callback = null;
    TIMEWAIT_REWARDVIDEO_AD: number = 6;
    TIMEWAIT_LOADING_REWARDVIDEO_AD: number = 4;
    // Show_RewardedVideoAsync(location: string, button_name: string, cb?: FBIntanstAd_Callback) {

    //     // ||**DQ**||
    //     clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.WATCH_ADS, 1);

    //     LogEventManager.Instance.logAd_Reward_Click(location, button_name);
    //     let self = this;
    //     self.fb_RewardVideo_CallBack = cb;
    //     // if(localConfig.instance.isRemoveAd){
    //     //     cb(null, Constants.FB_INTERSTITIAL_CALLBACK_SUCCESS);
    //     //     return;
    //     // }
    //     clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
    //     clientEvent.dispatchEvent(MConst.EVENT.PAUSE_TIME);
    //     this.unschedule(this.timeWait_RewardVideoAd_Callback);
    //     if (MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL || CheatingSys.Instance.isCheatFacebookAds) {
    //         this.schedule(this.timeWait_RewardVideoAd_Callback, 1, 0, this.TIMEWAIT_REWARDVIDEO_AD);

    //         // LogEventManager.Instance.logAd_Reward_Scuccess(location, button_name);
    //         // clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
    //         // cb(null, MConst.FB_REWARD_CALLBACK_SUCCESS);
    //         // clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);

    //         // clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
    //         // self.fb_RewardVideo_CallBack(new Error("load FAIL"), MConst.FB_REWARD_CALLBACK_FAIL);
    //         // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, "No video Available!");
    //         // clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
    //     } else {
    //         if (this.isInitializeAsync && this.canShowRewardVideo) {
    //             // LogEventManager.instance.logEvent_RewardAd();
    //             SoundSys.Instance.pauseSoundShowAd();
    //             //log event

    //             this.schedule(this.timeWait_RewardVideoAd_Callback, 1, 0, this.TIMEWAIT_REWARDVIDEO_AD);
    //             FBInstant.getRewardedVideoAsync(MConst.FB_REWARDED_PLACEMENT_ID)
    //                 .then(function (rewarded) {
    //                     self.preloadedRewardedVideo = rewarded;
    //                     return self.preloadedRewardedVideo.loadAsync();
    //                 })
    //                 .then(function () {
    //                     self.preloadedRewardedVideo.showAsync()
    //                         .then(function () {
    //                             LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS);
    //                             LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_COMPLETED);
    //                             if (ConfigLogEvent.Instance.isPaidUser) {
    //                                 LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_PAID);
    //                                 LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_COMPLETED_PAID);
    //                             } else {
    //                                 LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_ORGANIC);
    //                                 LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_COMPLETED_ORGANIC);
    //                             }

    //                             LogEventManager.Instance.logCAMPID_REWARDED(ConfigLogEvent.Instance.log_CAMP_ID);
    //                             LogEventManager.Instance.logADSETID_REWARDED(ConfigLogEvent.Instance.log_ADSET_ID);
    //                             LogEventManager.Instance.logADSID_REWARDED(ConfigLogEvent.Instance.log_ADS_ID);
    //                             LogEventManager.Instance.logTOURID_REWARDED(ConfigLogEvent.Instance.tourID_session);



    //                             if (self.fb_RewardVideo_CallBack) {
    //                                 self.unschedule(self.timeWait_RewardVideoAd_Callback);
    //                                 self.SetNextTime_ShowInterstitialAd();

    //                                 // Ad watched
    //                                 clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
    //                                 self.fb_RewardVideo_CallBack(null, MConst.FB_REWARD_CALLBACK_SUCCESS);
    //                                 //log event
    //                                 LogEventManager.Instance.logAd_Reward_Scuccess(location, button_name);
    //                                 DataLogEventSys.Instance.Add_adRewardWatch(); // it also have log event in this function

    //                                 SoundSys.Instance.resumeSoundShowAd();
    //                                 self.fb_RewardVideo_CallBack = null;
    //                                 clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
    //                             }
    //                         }).catch(function (err) {
    //                             self.unschedule(self.timeWait_RewardVideoAd_Callback);
    //                             if (err.code == "USER_INPUT") {
    //                                 LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS);
    //                                 if (ConfigLogEvent.Instance.isPaidUser) {
    //                                     LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_PAID);
    //                                 } else {
    //                                     LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_ORGANIC);
    //                                 }

    //                                 LogEventManager.Instance.logCAMPID_REWARDED(ConfigLogEvent.Instance.log_CAMP_ID);
    //                                 LogEventManager.Instance.logADSETID_REWARDED(ConfigLogEvent.Instance.log_ADSET_ID);
    //                                 LogEventManager.Instance.logADSID_REWARDED(ConfigLogEvent.Instance.log_ADS_ID);
    //                                 LogEventManager.Instance.logTOURID_REWARDED(ConfigLogEvent.Instance.tourID_session);

    //                                 LogEventManager.Instance.logAd_Reward_Skip(location, button_name);
    //                             } else {
    //                                 LogEventManager.Instance.logAd_Reward_Show_Fail(location, button_name,err.message);
    //                                 clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("No video Available!"));
    //                             }
    //                             if (self.fb_RewardVideo_CallBack) {
    //                                 SoundSys.Instance.resumeSoundShowAd();
    //                                 clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
    //                                 self.fb_RewardVideo_CallBack(new Error("load FAIL"), MConst.FB_REWARD_CALLBACK_FAIL);
    //                                 clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
    //                                 self.fb_RewardVideo_CallBack = null;

    //                             }
    //                         });
    //                 }).catch(function (err) {
    //                     self.unschedule(self.timeWait_RewardVideoAd_Callback);
    //                     LogEventManager.Instance.logAd_Reward_Fail(location, button_name,err.message);
    //                     if (err.code == "USER_INPUT") {

    //                     } else {
    //                         clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("No video Available!"));
    //                     }
    //                     if (self.fb_RewardVideo_CallBack) {
    //                         SoundSys.Instance.resumeSoundShowAd();
    //                         clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
    //                         self.fb_RewardVideo_CallBack(new Error("load FAIL"), MConst.FB_REWARD_CALLBACK_FAIL);
    //                         clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
    //                         self.fb_RewardVideo_CallBack = null;

    //                     }
    //                 });
    //         } else {
    //             LogEventManager.Instance.logAd_Reward_InitFail(location, button_name);
    //             //////console.log("Show_RewardedVideoAsync INIT FAIL!INIT FAIL!INIT FAIL!INIT FAIL!INIT FAIL!");
    //             clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
    //             cb(new Error("INIT FAIL!"), MConst.FB_REWARD_CALLBACK_FAIL);
    //             clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("No video Available!"));
    //             clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
    //         }
    //     }
    // }


    Show_RewardedVideoAsync(location: string, button_name: string, cb?: FBIntanstAd_Callback) {

        LogEventManager.Instance.logAd_Reward_Click(location, button_name);
        let self = this;
        self.fb_RewardVideo_CallBack = cb;
        // if(localConfig.instance.isRemoveAd){
        //     cb(null, Constants.FB_INTERSTITIAL_CALLBACK_SUCCESS);
        //     return;
        // }
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        clientEvent.dispatchEvent(MConst.EVENT.PAUSE_TIME);
        this.unschedule(this.timeWait_RewardVideoAd_Callback);
        if (MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL || CheatingSys.Instance.isCheatFacebookAds) {
            // ||**DQ**||
            clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.WATCH_ADS, 1);
            // this.schedule(this.timeWait_RewardVideoAd_Callback, 1, 0, this.TIMEWAIT_REWARDVIDEO_AD);

            LogEventManager.Instance.logAd_Reward_Scuccess(location, button_name);
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
            cb(null, MConst.FB_REWARD_CALLBACK_SUCCESS);
            clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);

            // clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
            // self.fb_RewardVideo_CallBack(new Error("load FAIL"), MConst.FB_REWARD_CALLBACK_FAIL);
            // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, "No video Available!");
            // clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
        } else {
            if (this.isInitializeAsync && this.canShowRewardVideo) {
                // LogEventManager.instance.logEvent_RewardAd();
                SoundSys.Instance.pauseSoundShowAd();
                //log event

                this.schedule(this.timeWait_RewardVideoAd_Callback, 1, 0, this.TIMEWAIT_REWARDVIDEO_AD);
                if (this.preloadedRewardedVideo && this.isFinishedLoad_RewardedVideo) {
                    self.preloadedRewardedVideo.showAsync()
                        .then(function () {
                            LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS);
                            LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_COMPLETED);
                            if (ConfigLogEvent.Instance.isPaidUser) {
                                LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_PAID);
                                LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_COMPLETED_PAID);
                            } else {
                                LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_ORGANIC);
                                LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_COMPLETED_ORGANIC);
                            }

                            LogEventManager.Instance.logCAMPID_REWARDED(ConfigLogEvent.Instance.log_CAMP_ID);
                            LogEventManager.Instance.logADSETID_REWARDED(ConfigLogEvent.Instance.log_ADSET_ID);
                            LogEventManager.Instance.logADSID_REWARDED(ConfigLogEvent.Instance.log_ADS_ID);
                            LogEventManager.Instance.logTOURID_REWARDED(ConfigLogEvent.Instance.tourID_session);



                            if (self.fb_RewardVideo_CallBack) {
                                self.unschedule(self.timeWait_RewardVideoAd_Callback);
                                self.SetNextTime_ShowInterstitialAd_AfterReward();

                                // Ad watched
                                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                                self.fb_RewardVideo_CallBack(null, MConst.FB_REWARD_CALLBACK_SUCCESS);
                                //log event
                                LogEventManager.Instance.logAd_Reward_Scuccess(location, button_name);
                                DataLogEventSys.Instance.Add_adRewardWatch(); // it also have log event in this function

                                // ||**DQ**||
                                clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.WATCH_ADS, 1);

                                SoundSys.Instance.resumeSoundShowAd();
                                self.fb_RewardVideo_CallBack = null;
                                clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
                            }
                            self.preloadAttemptCount_RewardVideo = 0;
                            self.Preload_RewardAdAsync();
                        }).catch(function (err) {
                            self.unschedule(self.timeWait_RewardVideoAd_Callback);
                            if (err.code == "USER_INPUT") {
                                LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS);
                                if (ConfigLogEvent.Instance.isPaidUser) {
                                    LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_PAID);
                                } else {
                                    LogEventManager.logEvent(LogEventManager.Instance.EVENT.REWARD_ADS_ORGANIC);
                                }

                                LogEventManager.Instance.logCAMPID_REWARDED(ConfigLogEvent.Instance.log_CAMP_ID);
                                LogEventManager.Instance.logADSETID_REWARDED(ConfigLogEvent.Instance.log_ADSET_ID);
                                LogEventManager.Instance.logADSID_REWARDED(ConfigLogEvent.Instance.log_ADS_ID);
                                LogEventManager.Instance.logTOURID_REWARDED(ConfigLogEvent.Instance.tourID_session);

                                LogEventManager.Instance.logAd_Reward_Skip(location, button_name);
                            } else {
                                LogEventManager.Instance.logAd_Reward_Show_Fail(location, button_name, err.message);
                                clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("No video Available!"));
                            }
                            if (self.fb_RewardVideo_CallBack) {
                                SoundSys.Instance.resumeSoundShowAd();
                                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                                self.fb_RewardVideo_CallBack(new Error("load FAIL"), MConst.FB_REWARD_CALLBACK_FAIL);
                                clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
                                self.fb_RewardVideo_CallBack = null;
                            }
                            self.preloadAttemptCount_RewardVideo = 0;
                            self.Preload_RewardAdAsync();
                        });
                } else {
                    self.unschedule(self.timeWait_RewardVideoAd_Callback);
                    LogEventManager.Instance.logAd_Reward_Fail(location, button_name, "preload RewardedVideo FAIL!");
                    // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("No video Available!"));
                    self.preloadAttemptCount_RewardVideo = 0;
                    self.Preload_RewardAdAsync();

                    // if (self.fb_RewardVideo_CallBack) {
                    //     SoundSys.Instance.resumeSoundShowAd();
                    //     clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                    //     self.fb_RewardVideo_CallBack(new Error("load FAIL"), MConst.FB_REWARD_CALLBACK_FAIL);
                    //     clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
                    //     self.fb_RewardVideo_CallBack = null;
                    // }


                    if (this.preloadedInterstitial && this.isFinishedLoad_InterstitialAd) {
                        //log event
                        LogEventManager.Instance.logAd_Interstitial_Show("rw " + location + " " + button_name, "");
                        LogEventManager.logEvent(LogEventManager.Instance.EVENT.INTER_ADS);
                        if (ConfigLogEvent.Instance.isPaidUser) {
                            LogEventManager.logEvent(LogEventManager.Instance.EVENT.INTER_ADS_PAID);
                        } else {
                            LogEventManager.logEvent(LogEventManager.Instance.EVENT.INTER_ADS_ORGANIC);
                        }
                        LogEventManager.Instance.logCAMPID_INTER(ConfigLogEvent.Instance.log_CAMP_ID);
                        LogEventManager.Instance.logADSETID_INTER(ConfigLogEvent.Instance.log_ADSET_ID);
                        LogEventManager.Instance.logADSID_INTER(ConfigLogEvent.Instance.log_ADS_ID);
                        LogEventManager.Instance.logTOURID_INTER(ConfigLogEvent.Instance.tourID_session);
                        // LogEventManager.instance.logEvent_InterAd();

                        this.preloadedInterstitial
                            .showAsync()
                            .then(function () {
                                LogEventManager.Instance.logAd_Interstitial_Success("rw " + location + " " + button_name, "");
                                DataLogEventSys.Instance.Add_adInterWatch(); // this func also have log event

                                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                                // console.log("Interstitial ad finished successfully");
                                SoundSys.Instance.resumeSoundShowAd();
                                self.SetNextTime_ShowInterstitialAd();
                                // cb(null, MConst.FB_INTERSTITIAL_CALLBACK_SUCCESS);
                                if (self.fb_RewardVideo_CallBack) {
                                    self.fb_RewardVideo_CallBack(null, MConst.FB_REWARD_CALLBACK_SUCCESS);
                                    clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
                                    self.fb_RewardVideo_CallBack = null;
                                }

                                self.Preload_InterstitialAdAsync();
                            })
                            .catch(function (e: any) {
                                clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("No video Available!"));
                                LogEventManager.Instance.logAd_Interstitial_Fail("rw " + location + " " + button_name, "");

                                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                                // console.log("FB_INTERSTITIAL_CALLBACK_FAILFB_INTERSTITIAL_CALLBACK_FAILFB_INTERSTITIAL_CALLBACK_FAIL");
                                console.error(e.message);
                                SoundSys.Instance.resumeSoundShowAd();
                                // cb(e.message, MConst.FB_INTERSTITIAL_CALLBACK_FAIL);
                                if (self.fb_RewardVideo_CallBack) {
                                    self.fb_RewardVideo_CallBack(new Error("load FAIL"), MConst.FB_REWARD_CALLBACK_FAIL);
                                    clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
                                    self.fb_RewardVideo_CallBack = null;
                                }

                                self.Preload_InterstitialAdAsync();
                            });
                    } else {
                        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("No video Available!"));
                        LogEventManager.Instance.logAd_Interstitial_Fail("rw " + location + " " + button_name, "");
                        this.Preload_InterstitialAdAsync();

                        if (self.fb_RewardVideo_CallBack) {
                            SoundSys.Instance.resumeSoundShowAd();
                            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                            self.fb_RewardVideo_CallBack(new Error("load FAIL"), MConst.FB_REWARD_CALLBACK_FAIL);
                            clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
                            self.fb_RewardVideo_CallBack = null;
                        }
                    }
                }
            } else {
                LogEventManager.Instance.logAd_Reward_InitFail(location, button_name);
                //////console.log("Show_RewardedVideoAsync INIT FAIL!INIT FAIL!INIT FAIL!INIT FAIL!INIT FAIL!");
                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                cb(new Error("INIT FAIL!"), MConst.FB_REWARD_CALLBACK_FAIL);
                clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("No video Available!"));
                clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
            }
        }
    }

    timeWait_RewardVideoAd_Callback() {
        this.fb_RewardVideo_CallBack(new Error("load FAIL"), MConst.FB_REWARD_CALLBACK_FAIL);
        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("No video Available!"));
        clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
        clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
        SoundSys.Instance.resumeSoundShowAd();
        this.fb_RewardVideo_CallBack = null;
    }


    //#endregion Reward Ads


    followOfficialPage() {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB && !this.isTest) {
            FBInstant.community.canFollowOfficialPageAsync()
                .then(function (data) {
                    // console.log(data);
                    FBInstant.community.followOfficialPageAsync();
                }).catch((e) => {
                    // console.log(e);
                });
        }
    }

    joinOfficialGroup(cb?: FBInstantCommon_Callback222) {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB && !this.isTest) {
            FBInstant.community.canJoinOfficialGroupAsync()
                .then(function (canJoinOfficialGroupAsync) {
                    if (canJoinOfficialGroupAsync) {
                        FBInstant.community.joinOfficialGroupAsync().then(function () {
                        }).catch(function (e: Error) {
                        });
                    } else {
                    }
                }).catch((e) => {
                });

        }
    }

    getAllTournamentAsync(): Promise<ITournament[]> {
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB || this.isTest) return Promise.resolve([]);
        return FBInstant.tournament.getTournamentsAsync()
            .then(tournaments => {
                // console.log("All Tournaments data: ", tournaments);
                return tournaments as ITournament[];
            })
            .catch(e => {
                return [];
            });
    }

    //#region buy items in shop
    private arrPurchaseInfos: PurchaseInfo[] = [];
    private arrCatalogInfos: CatalogInfo[] = [];
    private arrCatalogInfosCheck: CatalogInfo[] = [];
    private isIAPCheckInitSuccess: boolean = false;
    private isIAPInitSuccess: boolean = true;

    /**
     * This function will get all packs that player can buy
     */
    getIAP_AllPack() {
        FBInstantManager.Instance.arrCatalogInfosCheck = [];
        FBInstant.payments.getCatalogAsync().then((products: FBInstant.Product[]) => {
            // console.log(products);
            for (let i = 0; i < products.length; i++) {
                let productID: string = products[i].productID;
                let price: string = products[i].price;

                let catalogInfo: CatalogInfo = new CatalogInfo(productID, price, 0);
                // console.log(productID);
                // console.log(price);
                FBInstantManager.Instance.arrCatalogInfosCheck.push(catalogInfo);
            }

            FBInstantManager.Instance.isIAPCheckInitSuccess = true;
            clientEvent.dispatchEvent(MConst.IAP_INIT_SUCCESS);

            // console.log("init IAP Success", this.arrCatalogInfosCheck);
        });
    }

    /**
     * This func will save the infomation of all packs in the game
     */
    getIAP_AllPack_byGraphAPI() {
        FBInstant.graphApi.requestAsync(
            "/app/products?fields=id,product_id,name,price,price_amount_cents",
            "GET"
        )
            .then((result: any) => {
                // console.log("getAllCatalogs: ", result);
                let products = result.data;
                for (let i = 0; i < products.length; i++) {
                    // console.log(products[i]);
                    let productID: string = products[i].product_id;
                    let price: string = products[i].price;
                    let price_amount_cents = products[i].price_amount_cents;

                    let catalogInfo: CatalogInfo = new CatalogInfo(productID, price, price_amount_cents);
                    // console.log(productID);
                    // console.log(price);
                    FBInstantManager.Instance.arrCatalogInfos.push(catalogInfo);
                }
                // console.log("arrCatalogInfos: ", FBInstantManager.Instance.arrCatalogInfos);
            })
            .then(() => {
                FBInstantManager.Instance.isIAPInitSuccess = true;
            })
            .catch((error: any) => {
                console.log("getAllCatalogs: ", error);
            });
    }

    getPriceIAPPack_byProductID(packID: string): string {
        return null;
        const defaultValue = GetStringPrice(999);
        // if (FBInstantManager.Instance.isTest || MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL) {
        // return defaultValue;
        // }

        if (!FBInstantManager.Instance.isIAPInitSuccess) {
            // console.log("IAP not ready get");
            return null;
        }

        for (let i = 0; i < FBInstantManager.Instance.arrCatalogInfos.length; i++) {
            if (FBInstantManager.Instance.arrCatalogInfos[i].productID == packID) {
                const price = FBInstantManager.Instance.arrCatalogInfos[i].price_amount_cents;
                if (price > 0) {
                    return GetStringPrice(price);
                }
            }
        }

        return null;
    }

    getValuePriceIAPPack_byProductID(packID: string): number {
        const defaultValue = 9.99;
        if (FBInstantManager.Instance.isTest || MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL) {
            return defaultValue;
        }

        if (!FBInstantManager.Instance.isIAPInitSuccess) return defaultValue;

        for (let i = 0; i < FBInstantManager.Instance.arrCatalogInfos.length; i++) {
            if (FBInstantManager.Instance.arrCatalogInfos[i].productID == packID) {
                return FBInstantManager.Instance.arrCatalogInfos[i].price_amount_cents / 100;
            }
        }

        return defaultValue;
    }

    checkHaveIAPPack_byProductID(packID: string) {
        if (this.forceOffIAP) { return false; }

        if (FBInstantManager.Instance.isTest || MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL) {
            return true;
        }

        // if (FBInstantManager.Instance.checkPlatformIOS()) return false;
        if (!FBInstantManager.Instance.isIAPCheckInitSuccess) return false;

        for (let i = 0; i < FBInstantManager.Instance.arrCatalogInfosCheck.length; i++) {
            if (FBInstantManager.Instance.arrCatalogInfosCheck[i].productID == packID) {
                return true;
            }
        }
        return false;
    }

    getListIAP_Purchase(cb?: FBInstantCommon_Callback222) {
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);

        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) {
            cb(null, MConst.FB_CALLBACK_SUCCESS);
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
            return;
        }

        FBInstantManager.Instance.arrPurchaseInfos = [];
        FBInstant.payments.getPurchasesAsync().then(function (purchases) {
            for (let i = 0; i < purchases.length; i++) {
                let productID: string = purchases[i].productID;
                let purchaseToken: string = purchases[i].purchaseToken;

                let purchaseInfo: PurchaseInfo = new PurchaseInfo(productID, purchaseToken);
                FBInstantManager.Instance.arrPurchaseInfos.push(purchaseInfo);
            }
            cb(null, MConst.FB_CALLBACK_SUCCESS);
        }).catch(function (e) {
            console.log("getListIAP_Purchase", e);
            cb(new Error("IAP Fail!"), MConst.FB_CALLBACK_FAIL);
        });
    }

    buyIAP_consumePackID(packID: string, cb?: FBInstantCommon_Callback222, value: number = -1) {
        if (MConfigFacebook.Instance.envType != ENV_TYPE.FB) {
            let purchase = {
                developerPayload: "pegasus",
                isConsumed: false,
                paymentActionType: "charge",
                paymentID: "2558143497649462",
                productID: "vip",
                purchasePlatform: "FB",
                purchasePrice: { amount: '116377', currency: 'VND' },
                purchaseTime: 1655801596,
                purchaseToken: "570739991312645",
                signedRequest: ""
            }

            if (value == -1) {
                value = FBInstantManager.Instance.getValuePriceIAPPack_byProductID(packID);
            }
            LogEventManager.Instance.logEventIAP(purchase.paymentID, packID, value);
            LogEventManager.Instance.logEventCampIAP(purchase.paymentID, packID, value, ConfigLogEvent.Instance.log_CAMP_ID);

            cb(null, MConst.FB_CALLBACK_SUCCESS);
            return;
        }

        if (!FBInstantManager.Instance.isIAPInitSuccess || !FBInstantManager.Instance.isIAPCheckInitSuccess) {

            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
            cb(new Error("IAP Fail!"), MConst.FB_CALLBACK_FAIL);
            return;
        }

        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        FBInstant.payments.purchaseAsync({
            productID: packID,
            developerPayload: 'pegasus',
        }).then(function (purchase) {
            console.log(purchase);
            // {productID: '12345', purchaseToken: '54321', developerPayload: 'foobar', ...}
            FBInstant.payments.consumePurchaseAsync(purchase.purchaseToken)
                .then(function () {
                    // Purchase successfully consumed!
                    // Game should now provision the product to the player
                    // const valueIAP: number = FBInstantManager.Instance.getValuePriceIAPPack_byProductID(packID);
                    LogEventManager.Instance.logEventIAP(purchase.paymentID, packID, value);
                    LogEventManager.Instance.logEventCampIAP(purchase.paymentID, packID, value, ConfigLogEvent.Instance.log_CAMP_ID);
                    clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                    cb(null, MConst.FB_CALLBACK_SUCCESS);
                })
                .catch(function (e) {
                    console.log("purchaseAsync", e);
                    // case something wrong with fb
                    LogEventManager.Instance.buyPackFail(packID, 1);
                    // Handle subscription failure
                    clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                    cb(new Error("IAP Fail!"), MConst.FB_CALLBACK_FAIL);
                });

        }).catch(function (e) {
            console.log("purchaseAsync", e);
            // case close tab buy fb
            LogEventManager.Instance.buyPackFail(packID, 1);
            // Handle subscription failure
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
            cb(new Error("IAP Fail!"), MConst.FB_CALLBACK_FAIL);
        });
    }

    iap_consumePackID(purchaseToken: string, cb?: FBInstantCommon_Callback222) {
        if (!FBInstantManager.Instance.isIAPInitSuccess || !FBInstantManager.Instance.isIAPCheckInitSuccess) {
            cb(new Error("IAP Fail!"), MConst.FB_CALLBACK_FAIL);
            return;
        }

        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        FBInstant.payments.consumePurchaseAsync(purchaseToken)
            .then(function () {
                // Purchase successfully consumed!
                // Game should now provision the product to the player
                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                cb(null, MConst.FB_CALLBACK_SUCCESS);
            })
            .catch(function (e) {
                // Handle subscription failure
                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                cb(new Error("IAP Fail!"), MConst.FB_CALLBACK_FAIL);
            });
    }

    iap_checkPurchaseInfo(packID: string) {
        for (let i = 0; i < FBInstantManager.Instance.arrPurchaseInfos.length; i++) {
            if (FBInstantManager.Instance.arrPurchaseInfos[i].productID == packID) {
                return FBInstantManager.Instance.arrPurchaseInfos[i].purchaseToken;
            }
        }
        return "";
    }
    //#endregion

    checkPlatformIOS() {
        if (MConfigFacebook.Instance.envType == ENV_TYPE.LOCAL) {
            return false;
        }
        let platform = FBInstant.getPlatform();
        if (platform === "IOS") {
            return true;
        }
        return false;
    }

    //#region test
    public logContext() {
        console.log("context facebook : ", FBInstant.context.getID());
        console.log("idplayer: " + this.getID());
    }

    public GetContextID() { return FBInstant.context.getID(); }
    //#endreion
}

@ccclass('PurchaseInfo')
export class PurchaseInfo {
    productID: string = "";
    purchaseToken: string = "";

    constructor(_productID: string, _purchaseToken: string) {
        this.productID = _productID;
        this.purchaseToken = _purchaseToken;
    }
}

@ccclass('CatalogInfo')
export class CatalogInfo {
    productID: string = "";
    price: string = "";
    price_amount_cents: number;

    constructor(_productID: string, _price: string, _price_amount_cents: number) {
        this.productID = _productID;
        this.price = _price;
        this.price_amount_cents = _price_amount_cents;
    }
}

function GetStringPrice(price_amount_cents: number) {
    let price: number = price_amount_cents / 100;
    return `${price.toFixed(2)}$`;
}

export type FBIntanstAd_Callback = (error: Error | null, success: string) => void;
export type FBShare_Callback = () => void;
export type FBInstantCommon_Callback = () => void;
export type FBInstantCommon_Callback222 = (error: Error | null, success: string) => void;



