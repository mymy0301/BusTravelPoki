import { _decorator, Color, Component, Node, Vec3 } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { MConst } from '../Const/MConst';
import { clientEvent } from '../framework/clientEvent';
import { InfoPrizePass, IPrize, PAGE_VIEW_LOBBY_NAME, TYPE_EVENT_GAME, TYPE_RECEIVE_PRIZE_LOBBY } from '../Utils/Types';
import { DataEventsSys } from '../Scene/DataEventsSys';
import { ReadDataJson } from '../ReadDataJson';
import { MConfigs } from '../Configs/MConfigs';
import { CheatingSys } from '../Scene/CheatingSys';
import { PrizeSys } from './PrizeSys';
import { UILobbySys } from '../Scene/LobbyScene/UILobbySys';
import { UIReceivePrizeLobby } from '../Scene/LobbyScene/UIReceivePrizeLobby';
import { CONFIG_SP, EVENT_SEASON_PASS } from '../Scene/OtherUI/UISeasonPass/TypeSeasonPass';
import { CaculTimeEvents2 } from '../Scene/LobbyScene/CaculTimeEvents2';
const { ccclass, property } = _decorator;

@ccclass('DataSeasonPassSys')
export class DataSeasonPassSys {

    public static Instance: DataSeasonPassSys = null;
    private _dataPrizePass: InfoPrizePass[] = [];
    private _insPlayData: PlayerData = null;

    constructor() {
        if (DataSeasonPassSys.Instance == null) {
            DataSeasonPassSys.Instance = this;
            this._insPlayData = PlayerData.Instance;
            clientEvent.on(MConst.EVENT_GAME.GEN_EVENT, this.CreateNewEvent, this);
            clientEvent.on(MConst.EVENT_GAME.RESUME_EVENT, this.ResumeEvent, this);
            clientEvent.on(MConst.EVENT_GAME.END_TIME_EVENT, this.EndTime, this);
            clientEvent.on(EVENT_SEASON_PASS.LOAD_IMAGE_FORCE, this.UpdateUIForce, this);
        }
    }

    //==========================================================================
    //#region setup func
    public SetUp() {
        if (this._dataPrizePass.length == 0) {
            this._dataPrizePass = ReadDataJson.Instance.GetListPrizeSeasonPass();
            if (CheatingSys.Instance.IsAutoResetDataSeasonPass) {
                this.ResetNewSeasonPass();
            }
        }
    }
    //#endregion setup func
    //==========================================================================

    //==========================================================================
    //#region self func
    private SaveSeasonPass() {
        this._insPlayData.SaveEvent_SeasonPass();
    }

    private ResetNewSeasonPass(needSaveData: boolean = true) {
        this._insPlayData._infoEventSeasonPass.progress = 0;
        this._insPlayData._seasonPass_isActive = false;
        this._insPlayData._SP_isFinishEvent = false;
        this._insPlayData._seasonPass_listPrizeFreeClaimed = new Array(MConfigs.MAX_PRIZE_SEASON_PASS).fill(false);
        this._insPlayData._seasonPass_listPrizePreniumClaimed = new Array(MConfigs.MAX_PRIZE_SEASON_PASS).fill(false);
        this.SetReceivePrizeAuto(false, false);
        if (needSaveData) {
            this.SaveSeasonPass();
        }
    }

    private ResetSpecialFeaturesPremium() {
        // clientEvent.dispatchEvent(MConst.EVENT_TILE_PASS.RESET_LIFE);
    }

    public ReceiveAllPrizeCanReceive(): IPrize[] {
        // get the list prize not receive
        let result: IPrize[] = [];
        const levelNow = this.GetLevelNow()
        const levelPlayerNow = levelNow.level;
        const wasUnlockedPrenium = this.IsActivePass();

        function addListIPrizeToResult(listIPrize: IPrize[]) {
            listIPrize.forEach(iPrize => {
                let indexPrize = result.findIndex(p => p.typePrize == iPrize.typePrize);
                if (indexPrize != -1) {
                    result[indexPrize].value += iPrize.value;
                } else {
                    result.push(new IPrize(iPrize.typePrize, iPrize.typeReceivePrize, iPrize.value));
                }
            })
        }

        // loop free + premium
        for (let i = 0; i < MConfigs.MAX_PRIZE_SEASON_PASS; i++) {
            if (i < levelPlayerNow) {
                const listPrizeFreeCheck = this._dataPrizePass[i].listItemsPassFree;
                const listPrizePremium = this._dataPrizePass[i].listItemsPassPremium;
                const statePrize = this.IsClaimPrizeAtLevel(i);
                if (!statePrize.free) {
                    addListIPrizeToResult(listPrizeFreeCheck);
                }
                if (wasUnlockedPrenium && !statePrize.premium) {
                    addListIPrizeToResult(listPrizePremium);
                }
            }
        }

        // check the last item
        // if (this.CanClaimLastPrize() && !this.IsClaimLastPrize()) {
        //     const listLastPrize = this.GetLastPrize();
        //     addListIPrizeToResult(listLastPrize);
        // }

        return result;
    }
    //#endregion
    //==========================================================================

    //==========================================================================
    //#region common func
    public GetTotalProgress() {
        if (CheatingSys.Instance.isCheatSeasonPass) {
            return CheatingSys.Instance.numProgressSeasonPass;
        }
        return this._insPlayData._infoEventSeasonPass.progress;
    }
    public GetProgressNow() {
        let level = this.GetLevelNow();
        return level.progress;
    }

    public getProgressAndLevel(progressTotal: number): { progress: number, level: number } {
        for (let level = 1; level < MConfigs.MAX_PRIZE_SEASON_PASS; level++) {
            let maxProgressAtLevel = this.GetMaxStarAtLevel(level);
            if (progressTotal < maxProgressAtLevel) {
                return { progress: progressTotal, level: level };
            } else {
                progressTotal -= maxProgressAtLevel;
            }
        }

        // check if player was active the pass => to unlock the last prize
        return { progress: this.GetMaxStarAtLevel(MConfigs.MAX_PRIZE_SEASON_PASS - 1), level: MConfigs.MAX_PRIZE_SEASON_PASS };
    }

    public GetLevelNow(): { progress: number, level: number, progressBar: number } {
        let progressCheck = this.GetTotalProgress();
        for (let level = 1; level < MConfigs.MAX_PRIZE_SEASON_PASS; level++) {
            let maxProgressAtLevel = this.GetMaxStarAtLevel(level);
            if (progressCheck < maxProgressAtLevel) {
                return { progress: progressCheck, level: level, progressBar: progressCheck / maxProgressAtLevel };
            } else {
                progressCheck -= maxProgressAtLevel;
            }
        }

        // check if player was active the pass => to unlock the last prize
        return { progress: this.GetMaxStarAtLevel(MConfigs.MAX_PRIZE_SEASON_PASS - 1), level: MConfigs.MAX_PRIZE_SEASON_PASS, progressBar: 1 };
    }

    public GetMaxStarAtLevel(level: number): number {
        this.SetUp();
        if (level == MConfigs.MAX_PRIZE_SEASON_PASS) {
            level = MConfigs.MAX_PRIZE_SEASON_PASS - 1;
        }
        return this._dataPrizePass[level].maxStars;
    }

    public GetListPrizeAtLevel(level: number): { free: IPrize[], premium: IPrize[] } {
        this.SetUp();
        return { free: this._dataPrizePass[level].listItemsPassFree, premium: this._dataPrizePass[level].listItemsPassPremium };
    }

    public IsClaimPrizeAtLevel(level: number): { free: boolean, premium: boolean } {
        return { free: this._insPlayData._seasonPass_listPrizeFreeClaimed[level], premium: this._insPlayData._seasonPass_listPrizePreniumClaimed[level] };
    }

    // public IsClaimLastPrize(): boolean { return this._insPlayData._isClaimedLastPrizeTilePass; }

    public IsActivePass(): boolean { return this._insPlayData._seasonPass_isActive; }

    public GetMaxLevel(): number { return MConfigs.MAX_PRIZE_SEASON_PASS; }

    // public GetLastPrize(): IPrize[] { return ReadDataJson.Instance.GetLastPrizeTilePass(); }

    // public CanClaimLastPrize(): boolean {
    //     let levelNow = this.GetLevelNow();
    //     if (levelNow.progress == this.GetMaxStarAtLevel(MConst.MAX_PRIZE_TILE_PASS) && levelNow.level == MConst.MAX_PRIZE_TILE_PASS) {
    //         return true;
    //     }
    //     return false;
    // }

    public HadPrizeNotReceive(): boolean {
        let levelNow = this.GetLevelNow();
        const isActive = this.IsActivePass();
        // check list free + active list prize
        for (let i = 0; i < levelNow.level; i++) {
            const isClaimPrize = this.IsClaimPrizeAtLevel(i);
            if (!isClaimPrize.free || (isActive && !isClaimPrize.premium)) {
                return true;
            }
        }
        // check last prize
        // if (this.CanClaimLastPrize() && !this.IsClaimLastPrize()) {
        //     return true;
        // }
        return false;
    }

    public ClaimPrizePremium(level: number) {
        // save the prize was claimed => do not call save in this func because in the func addPrize it was call save data
        this._insPlayData._seasonPass_listPrizePreniumClaimed[level] = true;
        // save the data prize
        PrizeSys.Instance.AddPrize(this.GetListPrizeAtLevel(level).premium, `SeasonPass_ClaimPrizePremium`);
    }


    /**
     * 
     * @param level 
     * @param isFree free | premium 
     * @param needSave 
     */
    public SaveClaimPrizeAtLevel(level: number, type: 'free' | 'prenium', needSave: boolean = true) {
        if (type == 'free') {
            this._insPlayData._seasonPass_listPrizeFreeClaimed[level] = true;
        } else {
            this._insPlayData._seasonPass_listPrizePreniumClaimed[level] = true;
        }

        //=============================================================================
        //=============================================================================
        // NOTE: trường hợp đặc biệt //
        // Nếu user nhận phần thưởng cuối cùng thì ta sẽ bắn emit để chấm dứt vòng lặp và force kết thúc event ngay
        if (this.IsReceiveAllPrize()) {
            clientEvent.dispatchEvent(MConst.EVENT_GROUP_LOOP_EVENT.FORCE_CHANGE_TIME, 0, 0);
            CaculTimeEvents2.Instance.ForceChangeTimeEvent(TYPE_EVENT_GAME.SEASON_PASS, 0);
        }
        //=============================================================================
        //=============================================================================

        if (needSave) {
            this.SaveSeasonPass();
        }
    }

    private IsReceiveAllPrize(): boolean {
        return this._insPlayData._seasonPass_listPrizeFreeClaimed.every(t => t) && this._insPlayData._seasonPass_listPrizePreniumClaimed.every(t => t);
    }

    // public ClaimPrizeLastPrize() {
    //     // save the prize was claimed => do not call save in this func because in the func addPrize it was call save data
    //     this._insPlayData._isClaimedLastPrizeTilePass = true;
    //     // save the data prize
    //     PrizeSys.Instance.AddPrize(this.GetLastPrize());
    // }

    public ActiveSuccessSeasonPass() {
        this._insPlayData._seasonPass_isActive = true;
        this.SaveSeasonPass();
    }

    public AddProgress(needSaveData: boolean = true, numProgressAdd: number = 1, isForce: boolean = false) {
        if (!isForce && CaculTimeEvents2.Instance.IsEndEventBeforeCheckLogicToInitNewEvent(TYPE_EVENT_GAME.SEASON_PASS)) { return; }
        this._insPlayData._infoEventSeasonPass.progress += numProgressAdd;
        if (this._insPlayData._infoEventSeasonPass.progress >= CONFIG_SP.MAX_PROGRESS) {
            this._insPlayData._infoEventSeasonPass.progress = CONFIG_SP.MAX_PROGRESS;
            this._insPlayData._SP_isFinishEvent = true;
        }
        if (needSaveData) {
            this.SaveSeasonPass();
        }
    }

    public GetPrizeActive(): IPrize[] {
        return this._dataPrizePass[0].listItemsPassPremium;
    }

    public GetNumPrizeCanClaim(): number {
        let result: number = 0;
        let levelPlayerNow = DataSeasonPassSys.Instance.GetLevelNow().level;

        const isActive = this.IsActivePass();
        // check free first
        for (let i = 0; i < MConfigs.MAX_PRIZE_SEASON_PASS; i++) {
            const isClaimPrize = this.IsClaimPrizeAtLevel(i);
            if (levelPlayerNow > i) {
                if (!isClaimPrize.free) {
                    result += 1;
                }
                if (isActive && !isClaimPrize.premium) {
                    result += 1;
                }
            }
        }

        // check last prize
        // if (this.CanClaimLastPrize() && !this.IsClaimLastPrize()) {
        //     result += 1;
        // }

        return result;
    }

    public getIndexSeasonPass(needCheckForUI: boolean = true): number {
        // nhớ chia lấy dư cho số key lớn nhất trong game để quay vòng hình ảnh chính xác
        if (needCheckForUI) {
            if (this._insPlayData._infoEventSeasonPass.id >= MConfigs.MAX_TYPE_UI_SEASON_PASS)
                return 1;
            else {
                return this._insPlayData._infoEventSeasonPass.id;
            }
        }
        return this._insPlayData._infoEventSeasonPass.id;
    }

    public IsReceviePrizeAuto() {
        return this._insPlayData._SP_isReceivePrizeWhenEndEvent;
    }

    public SetReceivePrizeAuto(status: boolean, needSaveData: boolean) {
        this._insPlayData._SP_isReceivePrizeWhenEndEvent = status;
        this._insPlayData.SaveEvent_SeasonPass(needSaveData);
    }

    public ForceSetAllPrizeCanReceiveToTrue(needSaveData: boolean) {
        // tìm kiếm tất cả prize có thể receive và set bằng true trong bảng dữ liệu
        const dataLevelNow = this.GetLevelNow();

        for (let i = 0; i < dataLevelNow.level; i++) {
            if (i < MConfigs.MAX_PRIZE_SEASON_PASS - 1) {
                PlayerData.Instance._seasonPass_listPrizeFreeClaimed[i] = true;
                if (PlayerData.Instance._seasonPass_isActive) {
                    PlayerData.Instance._seasonPass_listPrizePreniumClaimed[i] = true;
                }
            }
            else if (i == MConfigs.MAX_PRIZE_SEASON_PASS - 1 && dataLevelNow.progress == this.GetMaxStarAtLevel(MConfigs.MAX_PRIZE_SEASON_PASS - 1)) {
                PlayerData.Instance._seasonPass_listPrizeFreeClaimed[i] = true;
                if (PlayerData.Instance._seasonPass_isActive) {
                    PlayerData.Instance._seasonPass_listPrizePreniumClaimed[i] = true;
                }
            }
        }

        this._insPlayData.SaveEvent_SeasonPass(needSaveData);
    }

    public IsReceiveLastOldTypeSeasonPass(): boolean { return PlayerData.Instance._SP_isReceveiveLastOldTypeSeasonPass; }
    /** 
     * This func will call in each case in here:
     * 1: User đang chơi event cũ => check trong PageHome trước khi gọi resume và reset event mới
     * 2: User chưa unlock tut cũ => đợi đến khi đã đủ điểu kiện unlock tut mới -> auto set bằng true luôn để có thể qua chế độ tut mới < trong hàm logicCheckTutSeasonPass >
     * 3: User comback game khi đã hết thời hạn của tut cũ
    */
    public SetReceiveLastOldTypeSeasonPass(isReceived: boolean, needSaveData: boolean = true) { PlayerData.Instance._SP_isReceveiveLastOldTypeSeasonPass = isReceived; PlayerData.Instance.SaveEvent_SeasonPass(needSaveData) }
    //#endregion common func
    //==========================================================================

    //==========================================================================
    //#region listen func
    private CreateNewEvent(type: TYPE_EVENT_GAME) {
        // console.log("type event create new", type);

        if (type != TYPE_EVENT_GAME.SEASON_PASS) {
            return
        }

        // increase index event
        this.IncreaseIndexGen();
        clientEvent.dispatchEvent(EVENT_SEASON_PASS.UPDATE_UI_SEASON_PASS);
        this.ResetNewSeasonPass();
        this.ResetSpecialFeaturesPremium();
    }

    private ResumeEvent(type: TYPE_EVENT_GAME) {
        if (type != TYPE_EVENT_GAME.SEASON_PASS) {
            return
        }

        if (CheatingSys.Instance.isCheatSeasonPass) {
            this._insPlayData._infoEventSeasonPass.progress = CheatingSys.Instance.numProgressSeasonPass;
        }
        clientEvent.dispatchEvent(EVENT_SEASON_PASS.UPDATE_UI_SEASON_PASS);
    }

    public async EndTime(type: TYPE_EVENT_GAME) {
        if (type == TYPE_EVENT_GAME.SEASON_PASS && !DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SEASON_PASS)) {
            // force close without use logic when closeUI
            // clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SEASON_PASS, 1);
            // clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_POPUP_BUY_SEASON_PASS, 1);
            this.ResetSpecialFeaturesPremium();
            // just do not care if player not receive done
            // await this.sendPrizeToReceive();
        }
    }

    private async sendPrizeToReceive() {
        if (this.HadPrizeNotReceive()) {
            // check if player not in the page home 
            // => move to page home
            if (UILobbySys.Instance.GetIndexPageShow() != PAGE_VIEW_LOBBY_NAME.HOME) {
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
                clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.HOME);
            }
            const listPrizeNotReceive = this.ReceiveAllPrizeCanReceive();
            if (!UIReceivePrizeLobby.Instance.IsReceivingAnim) {
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            }

            clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_LOBBY);
            await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.SEASON_PASS_CHEST, listPrizeNotReceive, 'SeasonPass', null, null, "Season Pass");
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_SHADOW_LOBBY);
        }
    }

    private async UpdateUIForce() {
        /**
         * this gun just only call when active Tut dailyChallenge
         */
        this._insPlayData._infoEventSeasonPass.id = 1;
        clientEvent.dispatchEvent(EVENT_SEASON_PASS.UPDATE_UI_SEASON_PASS);
    }
    //#endregion listen func
    //==========================================================================

    //==========================================================================
    //#region IndexGenEvent
    private IncreaseIndexGen() {
        // trong trường hợp người chơi tạo event mới ở đoạn tutorial => ta sẽ làm như sau
        let idEvent_Old = this._insPlayData._infoEventSeasonPass.id;
        if (!DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SEASON_PASS) || idEvent_Old == 0) {
            this._insPlayData._infoEventSeasonPass.id = 0;
        } else {
            idEvent_Old += 1;
            this._insPlayData._infoEventSeasonPass.id = idEvent_Old % MConfigs.MAX_TYPE_UI_SEASON_PASS;
            // Chúng ta pass index Gen 0 bởi vì 0 là index của UI tutorial 
            // bởi vì sau này rất có thể UI tutorial sẽ khác so với vc chỉ có gray UI do đó chúng ta sẽ sử dụng vc index 0 là ui TUT
            if (this._insPlayData._infoEventSeasonPass.id == 0) {
                this._insPlayData._infoEventSeasonPass.id += 1;
            }
        }
    }

    public GetIndexGenSeasonPass() { return this._insPlayData._infoEventSeasonPass.id }
    //#endregion IndexGenEvent
    //==========================================================================

    //==========================================================================
    //#region cheat
    public Test_Reach_FullProgress() {
        this.AddProgress(true, CONFIG_SP.MAX_PROGRESS, true);
    }
    //#endregion cheat
    //==========================================================================
}



