import { _decorator, Component, Node } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { MConst } from '../Const/MConst';
import { IDataPlayer_LEADERBOARD } from '../Utils/server/ServerPegasus';
import { MConfigFacebook } from '../Configs/MConfigFacebook';
import { InfoPrizeFriendJoined, IPrize, TYPE_EVENT_GAME } from '../Utils/Types';
import { CheatingSys } from '../Scene/CheatingSys';
import { ReadDataJson } from '../ReadDataJson';
import { DataLeaderboardSys } from '../Scene/DataLeaderboardSys';
import { DataEventsSys } from '../Scene/DataEventsSys';
const { ccclass, property } = _decorator;

@ccclass('DataFriendJoinedSys')
export class DataFriendJoinedSys {
    public static Instance: DataFriendJoinedSys = null;

    constructor() {
        if (DataFriendJoinedSys.Instance == null) {
            DataFriendJoinedSys.Instance = this;
        }
    }

    public CheckCheatInvite() {
        if (CheatingSys.Instance.IsAutoResetDataInviteFriend) {
            PlayerData.Instance._listIdFriendJoined = [];
            PlayerData.Instance.SaveEvent_FriendJoined();
        }
    }

    private GetListIdNewFriendJoined(oldData: string[], newData: string[]): string[] {
        if (oldData.length == 0) {
            return newData;
        }

        const setOldData: Set<string> = new Set(oldData);
        let result = newData.filter(idPlayer => !setOldData.has(idPlayer));
        return result;
    }

    public IsReceivedItem(indexItemReceive: number): boolean {
        const numItemWasReceived = this.GetNumberPrizeFriendWasReceived(PlayerData.Instance._listIdFriendJoined.length);
        return indexItemReceive < numItemWasReceived;
    }

    public GetAllPrizeFriendJoined(): InfoPrizeFriendJoined[] {
        let result = ReadDataJson.Instance.GetPrizeFriendJoined();
        return result;
    }

    public MaxNumPrize(): number {
        return ReadDataJson.Instance.GetPrizeFriendJoined().length;
    }

    public MaxFriendToReceivePrize(): number {
        const dataJson = ReadDataJson.Instance.GetPrizeFriendJoined();
        return dataJson[dataJson.length - 1].NumFriend;
    }

    public GetNumberFriendNow(): number {
        if (CheatingSys.Instance.IsAutoResetDataInviteFriend) {
            return CheatingSys.Instance.numFriendHave;
        }
        let numPlayerJoined = DataLeaderboardSys.Instance.GetNumFriend();
        return numPlayerJoined;
    }

    public GetNumberFriendLocal(): number {
        return PlayerData.Instance._listIdFriendJoined.length;
    }

    /**
     * Trong trường hợp bạn muốn lấy dữ liệu đã lưu
     * tham số truyền vào là : PlayerData.Instance._listIdFriendJoined.length
     * trong trường hợp bạn muốn lấy dữ liệu thực tế được lưu trên server
     * tham số truyền vào là : this.GetNumberFriendNow();
     * @param numPlayerHave 
     * @returns 
     */
    public GetNumberPrizeFriendWasReceived(numPlayerHave: number): number {
        const listPrize: InfoPrizeFriendJoined[] = ReadDataJson.Instance.GetPrizeFriendJoined();
        if (numPlayerHave == 0) return 0;

        let numFriendNow_Temp: number = numPlayerHave;
        let indexPrizeCanReceive = -1;
        for (let i = 0; i < listPrize.length; i++) {
            const prizeCheck = listPrize[i];
            numFriendNow_Temp -= prizeCheck.NumFriend;
            if (numFriendNow_Temp > 0) {
                indexPrizeCanReceive = i;
            } else if (numFriendNow_Temp == 0) {
                indexPrizeCanReceive = i;
                break;
            } else {
                break;
            }
        }

        return indexPrizeCanReceive + 1;
    }

    public GetProgressToShowUI(): { progress: number, maxProgress: number } {
        let numPrizeReceiveNow = this.GetNumberPrizeFriendWasReceived(PlayerData.Instance._listIdFriendJoined.length);
        const dataPrize = ReadDataJson.Instance.GetPrizeFriendJoined();
        if (numPrizeReceiveNow == dataPrize.length) { return { progress: 1, maxProgress: 1 }; }

        let numFriendNow_Temp: number = this.GetNumberFriendNow();
        for (let i = 0; i < dataPrize.length; i++) {
            const prizeCheck = dataPrize[i];
            numFriendNow_Temp -= prizeCheck.NumFriend;
            if (numFriendNow_Temp < 0) {
                numFriendNow_Temp += prizeCheck.NumFriend;
                return { progress: numFriendNow_Temp, maxProgress: prizeCheck.NumFriend }
            }
        }
    }

    public HavePrizeNotReceiveYet(): boolean {
        const progressPlayerNow: number = this.GetNumberFriendNow();
        let numPrizeWasReceivedByServer = this.GetNumberPrizeFriendWasReceived(progressPlayerNow);
        const progressPlayerSave: number = PlayerData.Instance._listIdFriendJoined.length;
        let numPrizeWasReceivedByLocal = this.GetNumberPrizeFriendWasReceived(progressPlayerSave);

        if (numPrizeWasReceivedByServer > numPrizeWasReceivedByLocal) {
            return true;
        }
        return false;
    }

    public GetPrizePlayerReceiveNext(): IPrize {
        let indexPrizePlayerReceived: number = this.GetNumberPrizeFriendWasReceived(PlayerData.Instance._listIdFriendJoined.length);
        const listPrize: InfoPrizeFriendJoined[] = ReadDataJson.Instance.GetPrizeFriendJoined();
        if (indexPrizePlayerReceived >= listPrize.length) {
            return null;
        } else {
            return listPrize[indexPrizePlayerReceived].values[0];
        }
    }

    public GetInfoPrizeFriendReceiveNext(): InfoPrizeFriendJoined {
        let indexPrizePlayerReceived: number = this.GetNumberPrizeFriendWasReceived(PlayerData.Instance._listIdFriendJoined.length);
        const listPrize: InfoPrizeFriendJoined[] = ReadDataJson.Instance.GetPrizeFriendJoined();
        if (indexPrizePlayerReceived >= listPrize.length) {
            return null;
        } else {
            return listPrize[indexPrizePlayerReceived];
        }
    }

    public GetInfoToReceivePrize(): { listIdPlayerNew: IDataPlayer_LEADERBOARD[], listPrize: IPrize[] } {
        const numPrizeWasReceive: number = this.GetNumberPrizeFriendWasReceived(PlayerData.Instance._listIdFriendJoined.length);
        const numFriendNow: number = this.GetNumberFriendNow();
        const maxNumPrize: number = this.MaxNumPrize();

        if (numFriendNow == numPrizeWasReceive || numPrizeWasReceive >= maxNumPrize) {
            return null;
        }

        // to get id new friend
        let listInfoFriend = Array.from(DataLeaderboardSys.Instance.GetLeaderboard(MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND));
        if (CheatingSys.Instance.IsAutoResetDataInviteFriend) {
            listInfoFriend = [];
            for (let i = 0; i < CheatingSys.Instance.numFriendHave; i++) {
                let t: IDataPlayer_LEADERBOARD = {
                    rank: 0,
                    score: 0,
                    playerId: `id_${i}`,
                    name: `name_${i}`,
                    avatar: ''
                }
                listInfoFriend.push(t);
            }
        }

        listInfoFriend = listInfoFriend.filter(item => item.playerId != MConfigFacebook.Instance.playerID);
        let listIdPlayer: string[] = listInfoFriend.map(item => item.playerId);
        let listIdNewPlayer: string[] = this.GetListIdNewFriendJoined(PlayerData.Instance._listIdFriendJoined, listIdPlayer);

        if (listIdNewPlayer.length == 0) {
            return null;
        }

        const setListIdNewPlayer: Set<string> = new Set(listIdNewPlayer);
        const resultListIdPlayer: IDataPlayer_LEADERBOARD[] = listInfoFriend.filter(item => setListIdNewPlayer.has(item.playerId));

        // Get the list prize
        const listPrizeData: InfoPrizeFriendJoined[] = Array.from(this.GetAllPrizeFriendJoined())
        let numPrizeCanReceive: number = this.GetNumberPrizeFriendWasReceived(resultListIdPlayer.length + PlayerData.Instance._listIdFriendJoined.length);

        let resultListPrize: IPrize[] = [];
        if (numPrizeCanReceive > 0 && numPrizeCanReceive > numPrizeWasReceive) {
            resultListPrize = listPrizeData.splice(numPrizeWasReceive, numPrizeCanReceive - numPrizeWasReceive).map(item => item.values[0]);
        }

        // return data
        return { listIdPlayerNew: resultListIdPlayer, listPrize: resultListPrize };
    }

    public SaveReceivePrizeUntilNow(listInfoFriend: IDataPlayer_LEADERBOARD[]) {
        // to get id new friend
        listInfoFriend = listInfoFriend.filter(item => item.playerId != MConfigFacebook.Instance.playerID);
        let listIdPlayer: string[] = listInfoFriend.map(item => item.playerId);
        // just accept new friend
        const uniqueIds = new Set(listIdPlayer);
        PlayerData.Instance._listIdFriendJoined.forEach(id => uniqueIds.add(id));
        listIdPlayer = Array.from(uniqueIds);
        //save
        PlayerData.Instance._listIdFriendJoined = listIdPlayer;
        PlayerData.Instance.SaveEvent_FriendJoined();
    }

    public CanChanceInviteFriendToGetMorePrize(): boolean {
        return PlayerData.Instance._listIdFriendJoined.length < this.MaxFriendToReceivePrize()
        // && !DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.INVITE_FRIEND)
        // && DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.INVITE_FRIEND)
    }

    public CanReceivePrizeAutoInLobby(): boolean {
        return this.HavePrizeNotReceiveYet()
        // && !DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.INVITE_FRIEND)
        // && DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.INVITE_FRIEND);
    }
}


