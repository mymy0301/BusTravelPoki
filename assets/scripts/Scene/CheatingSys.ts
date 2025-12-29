import { _decorator, CCBoolean, CCInteger, CCString, Component, director, Node } from 'cc';
import { setTimeOffset } from '../Utils/Time/time-offset';
const { ccclass, property } = _decorator;

@ccclass('CheatingSys')
export class CheatingSys extends Component {

    public static Instance: CheatingSys;
    private _idAutoIncrease: number = 0;
    private AutoIncreaseId(): number { return this._idAutoIncrease++; }
    @property(CCBoolean) hackMap: boolean = false;

    //==================== Store cheat ====================
    private _idStore: number = this.AutoIncreaseId();
    @property({
        group: { id: 'Store', name: 'Store', displayOrder(this: CheatingSys) { return this._idStore; } }
    })
    isCheatStore = false;

    //===================== Life cheat ===================
    private _idLife: number = this.AutoIncreaseId();
    @property({
        group: { id: 'Life', name: 'Life', displayOrder(this: CheatingSys) { return this._idLife; } }
    })
    isCheatingLife = false;

    //===================== Currency cheat ===================
    private _idCurrency: number = this.AutoIncreaseId();
    @property({
        group: { id: 'Currency', name: 'Currency', displayOrder(this: CheatingSys) { return this._idCurrency; } }
    })
    isCheatingCurrency = false;

    //===================== ItemInGame cheat ===================
    private _idItemInGame: number = this.AutoIncreaseId();
    @property({
        group: { id: 'itemInGame', name: 'itemInGame', displayOrder(this: CheatingSys) { return this._idItemInGame; } }
    })
    isCheatingItemInGame = false;

    //===================== Cheat no draw line ====================
    private _idCheatDrawLine: number = this.AutoIncreaseId();
    @property({
        group: { id: 'CheatDrawLine', name: 'CheatDrawLine', displayOrder(this: CheatingSys) { return this._idCheatDrawLine; } }
    })
    isCheatDrawLine = false;

    //===================== Cheat building ====================
    private _idCheatMapLobby: number = this.AutoIncreaseId();
    @property({
        group: { id: 'CheatMapLobby', name: 'CheatMapLobby', displayOrder(this: CheatingSys) { return this._idCheatMapLobby; } }
    })
    isCheatMapLobby = false;
    @property({
        group: { id: 'CheatMapLobby', name: 'CheatMapLobby', displayOrder(this: CheatingSys) { return this._idCheatMapLobby; } },
        visible(this: CheatingSys) { return this.isCheatMapLobby; }
    })
    levelMapRead: number = -1;
    @property({
        group: { id: 'CheatMapLobby', name: 'CheatMapLobby', displayOrder(this: CheatingSys) { return this._idCheatMapLobby; } },
        visible(this: CheatingSys) { return this.isCheatMapLobby; }
    })
    progressConstructorNow: number = -1;
    @property({
        group: { id: 'CheatMapLobby', name: 'CheatMapLobby', displayOrder(this: CheatingSys) { return this._idCheatMapLobby; } },
        visible(this: CheatingSys) { return this.isCheatMapLobby; }
    })
    totalConstructorUnlocked: number = -1;
    @property({
        group: { id: 'CheatMapLobby', name: 'CheatMapLobby', displayOrder(this: CheatingSys) { return this._idCheatMapLobby; } },
        visible(this: CheatingSys) { return this.isCheatMapLobby; }
    })
    numBlockEachTimeBuild: number = -1;
    @property({
        group: { id: 'CheatMapLobby', name: 'CheatMapLobby', displayOrder(this: CheatingSys) { return this._idCheatMapLobby; } },
        visible(this: CheatingSys) { return this.isCheatMapLobby; }
    })
    tutBuildingAutoReset: boolean = true;


    //====================== Cheat Spin =======================
    private _idCheatSpin: number = this.AutoIncreaseId();
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idCheatSpin; } }
    })
    isCheatSpin = false;
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idCheatSpin; } },
        visible(this: CheatingSys) { return this.isCheatSpin; }
    })
    isAutoResetSpin: boolean = false; public get IsAutoResetSpin() { return this.isCheatSpin && this.isAutoResetSpin; }

    //===================== Cheat reset invite friend ====================
    private _idCheatInviteFriend: number = this.AutoIncreaseId();
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idCheatInviteFriend; } }
    })
    isCheatInviteFriend = false;
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idCheatInviteFriend; } },
        visible(this: CheatingSys) { return this.isCheatInviteFriend; }
    })
    private isAutoResetDataInviteFriend: boolean = false; public get IsAutoResetDataInviteFriend() { return this.isCheatInviteFriend && this.isAutoResetDataInviteFriend; }
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idCheatInviteFriend; } },
        visible(this: CheatingSys) { return this.isCheatInviteFriend; }
    })
    public numFriendHave: number = 0;

    // ==================== SeasonPass cheat ===================
    private _idSeasonPass: number = this.AutoIncreaseId();
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idSeasonPass; } }
    })
    isCheatSeasonPass = false;
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idSeasonPass; } },
        visible(this: CheatingSys) { return this.isCheatSeasonPass; },
        type: CCInteger
    })
    numSeasonPassReward = 0;
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idSeasonPass; } },
        visible(this: CheatingSys) { return this.isCheatSeasonPass; },
        type: CCInteger
    })
    numProgressSeasonPass = 0;
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idSeasonPass; } },
        visible(this: CheatingSys) { return this.isCheatSeasonPass; }
    })
    private autoResetDataSeasonPass = false; public get IsAutoResetDataSeasonPass() { return this.isCheatSeasonPass && this.autoResetDataSeasonPass; }

    //===================== LevelPass cheat =================
    private _idLevelPass: number = this.AutoIncreaseId();
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idLevelPass; } }
    })
    isCheatLevelPass = false;
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idLevelPass; } },
        visible(this: CheatingSys) { return this.isCheatLevelPass; },
        type: CCInteger
    })
    numProgressLevelPass = 0;
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idLevelPass; } },
        visible(this: CheatingSys) { return this.isCheatLevelPass; }
    })
    private autoResetDataLevelPass = false; public get IsAutoResetDataLevelPass(): boolean { return this.isCheatLevelPass && this.autoResetDataLevelPass; }

    //===================== Daily Quest ====================
    private _idDailyQuest: number = this.AutoIncreaseId();
    @property({
        group: { id: 'DailyQuestCheat', name: 'DailyQuest', displayOrder(this: CheatingSys) { return this._idDailyQuest; } }
    })
    isCheatDailyQuest = false;
    @property({
        group: { id: 'DailyQuestCheat', name: 'DailyQuest', displayOrder(this: CheatingSys) { return this._idDailyQuest; } },
        visible(this: CheatingSys) { return this.isCheatDailyQuest; }
    })
    private autoResetDailyQuest = false; public get IsAutoResetDailyQuest() { return this.isCheatDailyQuest && this.autoResetDailyQuest; }
    @property({
        group: { id: 'DailyQuestCheat', name: 'DailyQuest', displayOrder(this: CheatingSys) { return this._idDailyQuest; } },
        visible(this: CheatingSys) { return this.isCheatDailyQuest; }
    })
    private autoFillAllProgress = false; public get IsAutoFillAllProgressQuest() { return this.isCheatDailyQuest && this.autoFillAllProgress; }


    //====================== Cheat Login reward =======================
    private _idCheatLoginReward: number = this.AutoIncreaseId();
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idCheatLoginReward; } }
    })
    isCheatLoginReward = false;
    @property({
        group: { id: 'CheatEventInGame', name: 'CheatEventInGame', displayOrder(this: CheatingSys) { return this._idCheatLoginReward; } },
        visible(this: CheatingSys) { return this.isCheatLoginReward; }
    })
    isAutoResetLoginReward: boolean = false; public get IsAutoResetLoginReward() { return this.isCheatLoginReward && this.isAutoResetLoginReward; }

    //====================== Cheat no ads feature ====================
    private _idCheatNoAdsFeature: number = this.AutoIncreaseId();
    @property({
        group: { id: 'CheatNoAds', name: 'CheatNoAds', displayOrder(this: CheatingSys) { return this._idCheatNoAdsFeature; } }
    })
    isCheatNoAdsFeature = false;

    //====================== Cheat Tournament =====================
    private _idCheatTournament: number = this.AutoIncreaseId();
    @property({
        group: { id: 'CheatTournament', name: 'CheatTournament', displayOrder(this: CheatingSys) { return this._idCheatTournament; } }
    })
    isCheatTournament = false;
    @property({
        group: { id: 'CheatTournament', name: 'CheatTournament', displayOrder(this: CheatingSys) { return this._idCheatTournament; } },
        visible(this: CheatingSys) { return this.isCheatTournament; }
    })
    private isTestReceivePrizeTour: boolean = false; public get IsTestReceivePrizeTour() { return this.isCheatTournament && this.isTestReceivePrizeTour; }
    @property({
        group: { id: 'CheatTournament', name: 'CheatTournament', displayOrder(this: CheatingSys) { return this._idCheatTournament; } },
        visible(this: CheatingSys) { return this.isCheatTournament && this.isTestReceivePrizeTour; }
    })
    private indexPlayerReceive: number = 0; public get IndexPlayerReceiveTour() { return this.indexPlayerReceive; }
    @property({
        group: { id: 'CheatTournament', name: 'CheatTournament', displayOrder(this: CheatingSys) { return this._idCheatTournament; } },
        visible(this: CheatingSys) { return this.isCheatTournament; }
    })
    private isTestMapTournament: boolean = false; public get IsTestMapTournament() { return this.isCheatTournament && this.isTestMapTournament; }

    //==================== Store cheat ====================
    private _idWeekly: number = this.AutoIncreaseId();
    @property({
        group: { id: 'Weekly', name: 'Weekly', displayOrder(this: CheatingSys) { return this._idWeekly; } }
    })
    isCheatWeekly = false;

    //==================== Cheat code =====================
    private _idCheatCode: number = this.AutoIncreaseId();
    @property({
        group: { id: 'CheatCode', name: 'CheatCode', displayOrder(this: CheatingSys) { return this._idCheatCode; } }
    })
    canCheatCode = false;

    //===================== Cheat Facebook ads ====================
    private _idCheatFacebook: number = this.AutoIncreaseId();
    @property({
        group: { id: 'CheatFacebook', name: 'CheatFacebook', displayOrder(this: CheatingSys) { return this._idCheatFacebook; } }
    })
    isCheatFacebookAds = false;
    @property({
        group: { id: 'CheatFacebook', name: 'CheatFacebook', displayOrder(this: CheatingSys) { return this._idCheatFacebook; } }
    })
    isCheatAdsTournament = false;

    public isTestBug: boolean = true;

    //#region func life cycle
    protected onLoad(): void {
        if (CheatingSys.Instance == null) {
            CheatingSys.Instance = this;
            director.addPersistRootNode(this.node);

            // cheat time web
            if (this.cheatTimeWeb) {
                const time1 = this.timeWebCheat;
                setTimeOffset(time1 * 1000);
            }
        } else {
            this.node.destroy();
        }
    }
    //#endregion func life cycle

    //#region func cheat time
    @property(CCBoolean) cheatTimeWeb = false;
    @property(CCInteger) timeWebCheat: number = 0;
    //#enderegion func cheat time
}


export const CHEAT_CODE = {
    CHEAT_AUTO_WIN: "CHEAT_AUTO_WIN",
    CHEAT_RESET_DATA: "CHEAT_RESET_DATA"
}
