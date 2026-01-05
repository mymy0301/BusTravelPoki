import { _decorator, Component, Node } from 'cc';
import { MConst, TYPE_UI } from '../Const/MConst';
import { PlayerData } from '../Utils/PlayerData';
import { PrizeSys } from './PrizeSys';
import { clientEvent } from '../framework/clientEvent';
import { InfoPrizePass, IPrize, PAGE_VIEW_LOBBY_NAME, TYPE_EVENT_GAME, TYPE_RECEIVE_PRIZE_LOBBY } from '../Utils/Types';
import { ReadDataJson } from '../ReadDataJson';
import { CheatingSys } from '../Scene/CheatingSys';
import { MConfigs } from '../Configs/MConfigs';
import { DataEventsSys } from '../Scene/DataEventsSys';
import { UIReceivePrizeLobby } from '../Scene/LobbyScene/UIReceivePrizeLobby';
import { UILobbySys } from '../Scene/LobbyScene/UILobbySys';
import { CONFIG_LP } from '../Scene/OtherUI/UILevelPass/TypeLevelPass';
import { CaculTimeEvents2 } from '../Scene/LobbyScene/CaculTimeEvents2';
const { ccclass, property } = _decorator;

/**
 * remember you save the last prize was saved in the list isReceivedPrizeFree and isReceivedPrizePremium at the last member
 */

@ccclass('DataLevelPassSys')
export class DataLevelPassSys {
    public static Instance: DataLevelPassSys = null;
    private _dataPrizePass: InfoPrizePass[] = [];
    private _insPlayData: PlayerData = null;

    constructor() {
        if (DataLevelPassSys.Instance == null) {
            DataLevelPassSys.Instance = this;
            this._insPlayData = PlayerData.Instance;
            clientEvent.on(MConst.EVENT_GAME.GEN_EVENT, this.CreateNewEvent, this);
            clientEvent.on(MConst.EVENT_GAME.END_TIME_EVENT, this.EndTime, this);
        }
    }

    //#region setup func
    public SetUp() {
        if (this._dataPrizePass.length == 0) {
            this._dataPrizePass = ReadDataJson.Instance.GetListPrizeLevelPass();
            if (CheatingSys.Instance.IsAutoResetDataLevelPass) {
                this.ResetNewLevelPass();
            }
        }
    }
    //#endregion

    //#region self func
    public SaveLevelPass() {
        this._insPlayData.SaveEvent_LevelPass();
    }

    private ResetNewLevelPass(needSaveData: boolean = true) {
        this._insPlayData._infoEventLevelPass.progress = 0;
        this._insPlayData._levelPass_isActive = false;
        this._insPlayData._LP_isFinishEvent = false;
        this._insPlayData._levelPass_listPrizeFreeClaimed = new Array(MConfigs.MAX_PRIZE_LEVEL_PASS).fill(false);
        this._insPlayData._levelPass_listPrizePreniumClaimed = new Array(MConfigs.MAX_PRIZE_LEVEL_PASS).fill(false);
        this.SetReceivePrizeAuto(false, false);
        if (needSaveData) {
            this.SaveLevelPass();
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
        for (let i = 0; i < MConfigs.MAX_PRIZE_LEVEL_PASS; i++) {
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
        // console.log("check result: ", levelNow, result);

        return result;
    }
    //#endregion

    //#region common func

    public GetTotalProgress() {
        if (CheatingSys.Instance.isCheatLevelPass) {
            return CheatingSys.Instance.numProgressLevelPass;
        }
        return this._insPlayData._infoEventLevelPass.progress;
    }
    public GetProgressNow() {
        return PlayerData.Instance._infoEventLevelPass.progress;
    }

    public GetLevelNow(): { progress: number, level: number, progressBar: number } {
        let progressCheck = this.GetTotalProgress();
        for (let level = 1; level < MConfigs.MAX_PRIZE_LEVEL_PASS; level++) {
            let maxProgressAtLevel = this.GetMaxStarAtLevel(level);
            // console.log(progressCheck, maxProgressAtLevel);
            if (progressCheck < maxProgressAtLevel) {
                return { progress: progressCheck, level: level, progressBar: progressCheck / maxProgressAtLevel };
            } else {
                progressCheck -= maxProgressAtLevel;
            }
        }

        // check if player was active the pass => to unlock the last prize
        return { progress: this.GetMaxStarAtLevel(MConfigs.MAX_PRIZE_LEVEL_PASS - 1), level: MConfigs.MAX_PRIZE_LEVEL_PASS, progressBar: 1 };
    }

    public GetMaxStarAtLevel(level: number): number {
        this.SetUp();
        if (level == MConfigs.MAX_PRIZE_LEVEL_PASS) {
            level = MConfigs.MAX_PRIZE_LEVEL_PASS - 1;
        }
        return this._dataPrizePass[level].maxStars;
    }

    public GetListPrizeAtLevel(level: number): { free: IPrize[], premium: IPrize[] } {
        this.SetUp();
        return { free: this._dataPrizePass[level].listItemsPassFree, premium: this._dataPrizePass[level].listItemsPassPremium };
    }

    public IsClaimPrizeAtLevel(level: number): { free: boolean, premium: boolean } {
        return { free: this._insPlayData._levelPass_listPrizeFreeClaimed[level], premium: this._insPlayData._levelPass_listPrizePreniumClaimed[level] };
    }

    // public IsClaimLastPrize(): boolean { return this._insPlayData._isClaimedLastPrizeTilePass; }

    public IsActivePass(): boolean { 
        // return this._insPlayData._levelPass_isActive; 
        return true;
    }

    public GetMaxLevel(): number { return MConfigs.MAX_PRIZE_LEVEL_PASS; }

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
        this._insPlayData._levelPass_listPrizePreniumClaimed[level] = true;
        // save the data prize
        PrizeSys.Instance.AddPrize(this.GetListPrizeAtLevel(level).premium, 'LevelPass_ClaimPrizePremium');
    }


    /**
     * 
     * @param level 
     * @param type free | premium 
     * @param needSave 
     */
    public SaveClaimPrizeAtLevel(level: number, type: 'free' | 'prenium', needSave: boolean = true) {
        // console.log("SaveClaimPrizeAtLevel", level, type, needSave);

        if (type == 'free') {
            this._insPlayData._levelPass_listPrizeFreeClaimed[level] = true;
        } else {
            this._insPlayData._levelPass_listPrizePreniumClaimed[level] = true;
        }

        //=============================================================================
        //=============================================================================
        // NOTE: trường hợp đặc biệt //
        // Nếu user nhận phần thưởng cuối cùng thì ta sẽ bắn emit để chấm dứt vòng lặp và force kết thúc event ngay
        if (this.IsReceiveAllPrize()) {
            clientEvent.dispatchEvent(MConst.EVENT_GROUP_LOOP_EVENT.FORCE_CHANGE_TIME, 0, 0);
            CaculTimeEvents2.Instance.ForceChangeTimeEvent(TYPE_EVENT_GAME.LEVEL_PASS, 0);
        }
        //=============================================================================
        //=============================================================================

        if (needSave) {
            this.SaveLevelPass();
        }
    }

    private IsReceiveAllPrize(): boolean {
        return this._insPlayData._levelPass_listPrizeFreeClaimed.every(t => t) && this._insPlayData._levelPass_listPrizePreniumClaimed.every(t => t);
    }

    // public ClaimPrizeLastPrize() {
    //     // save the prize was claimed => do not call save in this func because in the func addPrize it was call save data
    //     this._insPlayData._isClaimedLastPrizeTilePass = true;
    //     // save the data prize
    //     PrizeSys.Instance.AddPrize(this.GetLastPrize());
    // }

    public ActiveSuccessLevelPass() {
        this._insPlayData._levelPass_isActive = true;
        this.SaveLevelPass();
    }

    public AddProgress(needSaveData: boolean = true, progressIncrease: number = 1, isForce: boolean = false) {
        if (!isForce && CaculTimeEvents2.Instance.IsEndEventBeforeCheckLogicToInitNewEvent(TYPE_EVENT_GAME.LEVEL_PASS)) { return; }
        this._insPlayData._infoEventLevelPass.progress += progressIncrease;
        if (this._insPlayData._infoEventLevelPass.progress >= CONFIG_LP.MAX_PROGRESS) {
            this._insPlayData._infoEventLevelPass.progress = CONFIG_LP.MAX_PROGRESS;
            this._insPlayData._LP_isFinishEvent = true;
        }
        if (needSaveData) {
            this.SaveLevelPass();
        }
    }

    public GetPrizeActive(): IPrize[] {
        return this._dataPrizePass[0].listItemsPassPremium;
    }

    public GetNumPrizeCanClaim(): number {
        let result: number = 0;
        let levelPlayerNow = DataLevelPassSys.Instance.GetLevelNow().level;

        const isActive = this.IsActivePass();
        // check free first
        for (let i = 0; i < MConfigs.MAX_PRIZE_LEVEL_PASS; i++) {
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

    public IsReceviePrizeAuto() {
        return this._insPlayData._LP_isReceivePrizeWhenEndEvent;
    }

    public SetReceivePrizeAuto(status: boolean, needSaveData: boolean) {
        this._insPlayData._LP_isReceivePrizeWhenEndEvent = status;
        this._insPlayData.SaveEvent_LevelPass(needSaveData);
    }

    public ForceSetAllPrizeCanReceiveToTrue(needSaveData: boolean) {
        // tìm kiếm tất cả prize có thể receive và set bằng true trong bảng dữ liệu
        const dataLevelNow = this.GetLevelNow();

        for (let i = 0; i < dataLevelNow.level; i++) {
            if (i < MConfigs.MAX_PRIZE_LEVEL_PASS - 1) {
                PlayerData.Instance._levelPass_listPrizeFreeClaimed[i] = true;
                if (PlayerData.Instance._levelPass_isActive) {
                    PlayerData.Instance._levelPass_listPrizePreniumClaimed[i] = true;
                }
            }
            else if (i == MConfigs.MAX_PRIZE_LEVEL_PASS - 1 && dataLevelNow.progress == this.GetMaxStarAtLevel(MConfigs.MAX_PRIZE_LEVEL_PASS - 1)) {
                PlayerData.Instance._levelPass_listPrizeFreeClaimed[dataLevelNow.level - 1] = true;
                if (PlayerData.Instance._levelPass_isActive) {
                    PlayerData.Instance._levelPass_listPrizePreniumClaimed[i] = true;
                }
            }
        }

        this._insPlayData.SaveEvent_LevelPass(needSaveData);
    }

    public IsReceiveLastOldTypeLevelPass(): boolean { return PlayerData.Instance._LP_isReceveiveLastOldTypeLevelPass; }
    /** 
     * This func will call in each case in here:
     * 1: User đang chơi event cũ => check trong PageHome trước khi gọi resume và reset event mới
     * 2: User chưa unlock tut cũ => đợi đến khi đã đủ điểu kiện unlock tut mới -> auto set bằng true luôn để có thể qua chế độ tut mới < trong hàm logicCheckTutLevelPass >
     * 3: User comback game khi đã hết thời hạn của tut cũ
    */
    public SetReceiveLastOldTypeLevelPass(isReceived: boolean, needSaveData: boolean = true) { PlayerData.Instance._LP_isReceveiveLastOldTypeLevelPass = isReceived; PlayerData.Instance.SaveEvent_LevelPass(needSaveData) }
    //#endregion

    //#region listener func
    private CreateNewEvent(type: TYPE_EVENT_GAME) {
        if (type != TYPE_EVENT_GAME.LEVEL_PASS) {
            return
        }
        this.ResetNewLevelPass();
        this.ResetSpecialFeaturesPremium();
    }

    public async EndTime(type: TYPE_EVENT_GAME) {
        if (type == TYPE_EVENT_GAME.LEVEL_PASS && !DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LEVEL_PASS)) {
            // force close without use logic when closeUI
            // clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_TILE_PASS, 1);
            // clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_POPUP_BUY_TILE_PASS, 1);
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
            await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.LEVEL_PASS_CHEST, listPrizeNotReceive, 'LevelPass', null, null, "Level Pass");
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_SHADOW_LOBBY);
        }
    }
    //#endregion listener func

    //#region test
    public Test_Reach_FullProgress() {
        this.AddProgress(true, CONFIG_LP.MAX_PROGRESS, true);
    }
    //#endregion test
}