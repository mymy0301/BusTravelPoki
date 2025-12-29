import { _decorator, Component, Node } from 'cc';
import { ReadMapLobbyJson } from '../MJson/ReadMapLobbyJson';
import { PlayerData } from '../Utils/PlayerData';
import { IObjConstructor, IPrize, TYPE_LEVEL_NORMAL } from '../Utils/Types';
import { CheatingSys } from '../Scene/CheatingSys';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('DataBuildingSys')
export class DataBuildingSys {
    public static Instance: DataBuildingSys = null;

    constructor() {
        if (DataBuildingSys.Instance == null) {
            DataBuildingSys.Instance = this;
        }
    }

    public UpdateCheat() {
        // check cheat and change the data
        if (CheatingSys.Instance.isCheatMapLobby) {
            const levelMapReadCheat: number = CheatingSys.Instance.levelMapRead;
            const progressConstructorNow: number = CheatingSys.Instance.progressConstructorNow;
            const totalConstructorUnlocked: number = CheatingSys.Instance.totalConstructorUnlocked;
            const autoResetTut: boolean = CheatingSys.Instance.tutBuildingAutoReset;

            let isChangeData: boolean = false;

            if (levelMapReadCheat > 0) {
                isChangeData = true;
                PlayerData.Instance._building_indexMap = levelMapReadCheat;
            }
            if (progressConstructorNow >= 0) {
                isChangeData = true;
                PlayerData.Instance._building_progressConstructorNow = progressConstructorNow;
            }

            if (totalConstructorUnlocked >= 0) {
                isChangeData = true;
                PlayerData.Instance._buidling_numConstructorUnlock = totalConstructorUnlocked;
            }

            if (autoResetTut) {
                isChangeData = true;
                PlayerData.Instance._isPlayTutorialBuilding = false;
            }

            if (isChangeData) {
                PlayerData.Instance.SaveBuilding();
            }
        }
    }

    public GetInfo_TopUI_BuildingNow(): { title: string, listPrize: IPrize[] } {
        // get data from json 
        return ReadMapLobbyJson.Instance.GetInfoConstructor(PlayerData.Instance._building_indexMap, PlayerData.Instance._buidling_numConstructorUnlock);
    }

    public GetInfoConstructorNow() {
        return ReadMapLobbyJson.Instance.GetInfoFullConstructor(PlayerData.Instance._building_indexMap, PlayerData.Instance._buidling_numConstructorUnlock);
    }

    public GetNameMapNow(): string {
        return ReadMapLobbyJson.Instance.GetNameMap(PlayerData.Instance._building_indexMap);
    }

    public IncreaseNextMap(needSaveData: boolean = false) {
        clientEvent.dispatchEvent(MConst.EVENT_BUILDING.UPDATE_UI_BTN_BUILD);
        // update data here
        PlayerData.Instance._building_indexMap += 1;
        PlayerData.Instance._buidling_numConstructorUnlock = 0;
        PlayerData.Instance._building_isReceivedPrizeTotal = false;
        if (needSaveData) {
            PlayerData.Instance.SaveBuilding();
        }
    }

    public AddBlock(numBlock: number, needSaveData: boolean = true) {
        PlayerData.Instance._building_numItemBuildingHave += numBlock;
        if (needSaveData) {
            PlayerData.Instance.SaveBuilding();
        }
    }
    // public AddBlock(typeLevelOld: number) {
    //     switch (typeLevelOld) {
    //         case TYPE_LEVEL_NORMAP.NORMAL:
    //             PlayerData.Instance._buidling_numConstructorUnlock += 10;
    //             break;
    //         case TYPE_LEVEL_NORMAP.HARD:
    //             PlayerData.Instance._buidling_numConstructorUnlock += 20;
    //             break;
    //         case TYPE_LEVEL_NORMAP.SUPER_HARD:
    //             PlayerData.Instance._buidling_numConstructorUnlock += 30;
    //             break;
    //     }
    //     PlayerData.Instance.SaveBuilding();
    // }

    public GetIndexMapNow(): number {
        return PlayerData.Instance._building_indexMap;
    }

    public GetIndexConstructorUnlockNow(): number {
        return PlayerData.Instance._buidling_numConstructorUnlock;
    }

    public IncreaseNumConstructorUnlock() {
        PlayerData.Instance._buidling_numConstructorUnlock += 1;
        PlayerData.Instance._building_progressConstructorNow = 0;
        PlayerData.Instance.SaveBuilding();
        clientEvent.dispatchEvent(MConst.EVENT_BUILDING.UPDATE_UI_BTN_BUILD);
    }

    public GetProgressConstructorNow(): number {
        return PlayerData.Instance._building_progressConstructorNow;
    }

    public GetMaxProgressConstructorNow(): number {
        try {
            const maxProgressConstructorNow = ReadMapLobbyJson.Instance.GetInfoJsonMap(this.GetIndexMapNow()).listConstructors[this.GetIndexConstructorUnlockNow()].maxBrickToUnlock;
            return maxProgressConstructorNow;
        } catch (error) {
            return -1;
        }
    }

    public IncreaseProgressConstructorNow() {
        PlayerData.Instance._building_numItemBuildingHave -= 1;
        PlayerData.Instance._building_progressConstructorNow += 1;
        if (PlayerData.Instance._building_numItemBuildingHave <= 0) {
            clientEvent.dispatchEvent(MConst.EVENT_BUILDING.UPDATE_UI_BTN_BUILD);
        }
        PlayerData.Instance.SaveBuilding();
    }

    public GetNumBlockPlayerNow() {
        return PlayerData.Instance._building_numItemBuildingHave;
    }

    public IsPlayTutBuilding() {
        return PlayerData.Instance._isPlayTutorialBuilding;
    }

    public SetDoneTutBuidling() {
        PlayerData.Instance._isPlayTutorialBuilding = true;
        PlayerData.Instance.SaveBuilding();
    }

    public GetNumConsUnlocked(): number {
        return PlayerData.Instance._buidling_numConstructorUnlock;
    }

    public GetTotalConsThisMap(): number {
        const infoMap = ReadMapLobbyJson.Instance.GetInfoJsonMap(PlayerData.Instance._building_indexMap);
        return infoMap.listConstructors.length;
    }

    public CanReceivePrizeUnlockFullMap(): boolean {
        const maxConstructUnlocked = PlayerData.Instance._buidling_numConstructorUnlock;
        const maxConstructThisMap = ReadMapLobbyJson.Instance.GetInfoJsonMap(PlayerData.Instance._building_indexMap).listConstructors.length;
        const isReceivePrizeFullMapDone = PlayerData.Instance._building_isReceivedPrizeTotal;
        return !isReceivePrizeFullMapDone && maxConstructUnlocked == maxConstructThisMap;
    }

    public SaveReceivePrizeFullMapDone(needSaveData: boolean = true) {
        PlayerData.Instance._building_isReceivedPrizeTotal = true;
        if (needSaveData) {
            PlayerData.Instance.SaveBuilding();
        }
    }

    public CanFinishConstructorNowFromHome(): boolean {
        // trong trường hợp đặc biệt
        // nếu như user đã đạt đến constuctor cuối cùng rùi thì 

        // check if block now can pas Building
        const maxBrickToUnlockBuilding = this.GetInfoConstructorNow().maxBrickToUnlock;
        return PlayerData.Instance._building_progressConstructorNow >= maxBrickToUnlockBuilding;
    }

    public NumConsCanBuildInThisMap(): number {
        // get num brick can build
        let numBrickCanBuild = PlayerData.Instance._building_numItemBuildingHave;
        const indexConsNow = PlayerData.Instance._buidling_numConstructorUnlock;
        const progressConsNow = PlayerData.Instance._building_progressConstructorNow;

        let result = 0;

        // get info map now
        const infoMap = ReadMapLobbyJson.Instance.GetInfoJsonMap(PlayerData.Instance._building_indexMap);

        for (let i = indexConsNow; i < infoMap.listConstructors.length; i++) {
            const infoConsCheck: IObjConstructor = infoMap.listConstructors[i];

            //check constructor đầu tiên
            if (i == indexConsNow) {
                numBrickCanBuild -= (infoConsCheck.maxBrickToUnlock - progressConsNow);
            } else {
                numBrickCanBuild -= infoConsCheck.maxBrickToUnlock;
            }

            // kiểm tra còn brick hay không
            if (numBrickCanBuild >= 0) {
                result += 1;
            } else {
                break;
            }
        }

        return result;
    }

    public WasReceivePrizeButDataIsDone(): boolean {
        const maxConstructUnlocked = PlayerData.Instance._buidling_numConstructorUnlock;
        const maxConstructThisMap = ReadMapLobbyJson.Instance.GetInfoJsonMap(PlayerData.Instance._building_indexMap).listConstructors.length;
        const isReceivePrizeFullMapDone = PlayerData.Instance._building_isReceivedPrizeTotal;
        return isReceivePrizeFullMapDone && maxConstructUnlocked == maxConstructThisMap;
    }
}


