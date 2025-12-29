import { _decorator, Component, Node } from 'cc';
import { DataLeaderboardSys } from '../Scene/DataLeaderboardSys';
import { PlayerData } from '../Utils/PlayerData';
import { IPrize, TYPE_PRIZE, TYPE_RECEIVE } from '../Utils/Types';
import { MConfigFacebook } from '../Configs/MConfigFacebook';
const { ccclass, property } = _decorator;

@ccclass('DataWeeklySys')
export class DataWeeklySys {
    public static Instance: DataWeeklySys = null;

    private _mapRankPlayer: Map<string, number> = new Map();
    private _mapPrizePlayer: Map<string, IPrize[][]> = new Map();

    constructor() {
        if (DataWeeklySys.Instance == null) {
            DataWeeklySys.Instance = this;
        }
    }

    public GetNamePreviousWeek(): string {
        const idWeekCheck = DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY_PREVIOUS;
        return idWeekCheck;
    }

    public async GetRankPlayerPreviousWeek(): Promise<{ rank: number, prize: IPrize[][] }> {
        const idWeekCheck = this.GetNamePreviousWeek();
        if (PlayerData.Instance._weekly_list_idClaimed.includes(idWeekCheck)) { return { rank: - 1, prize: null } }
        if (idWeekCheck == null || idWeekCheck.includes("-1")) { return { rank: - 1, prize: null } }

        // trong trường hợp check idWeek không có trong danh sách đã nhận thưởng => tuần trước người chơi chưa chơi || ko được nhận thưởng


        if (this._mapRankPlayer.has(idWeekCheck)) { return { rank: this._mapRankPlayer.get(idWeekCheck), prize: this._mapPrizePlayer.get(idWeekCheck) } }

        return { rank: - 1, prize: null }
    }

    public async UpdateDirtyData() {
        const idWeekCheck = this.GetNamePreviousWeek();

        // C1: Chỉ lấy dữ liệu player để check rank trên server
        // // gọi lấy dữ liệu player
        // let dataPlayersPreviousWeek = await DataLeaderboardSys.Instance.GetLeaderboardByContextsIdsCustom(idWeekCheck);

        // console.log("dataPlayersPreviousWeek", idWeekCheck, dataPlayersPreviousWeek);

        // if (dataPlayersPreviousWeek == null) { return { rank: - 1, prize: null } }
        // if (dataPlayersPreviousWeek.data.length > 0) {
        //     let dataPlayerCheck = dataPlayersPreviousWeek.data.find(player => player.playerId == MConfigFacebook.Instance.playerID);
        //     if (dataPlayerCheck != null) {
        //         this._mapRankPlayer.set(idWeekCheck, dataPlayerCheck.rank);
        //         this._mapPrizePlayer.set(idWeekCheck, dataPlayersPreviousWeek.prize)
        //         return { rank: dataPlayerCheck.rank, prize: dataPlayersPreviousWeek.prize };
        //     }
        // }

        // C2: Lấy dữ liệu của 3 người đầu tiên trên server và kiểm tra xem vị trí của player trong 3 người đó <nếu có>
        let dataPlayerPreviousWeek = await DataLeaderboardSys.Instance.GetLeaderboardByContextsIdsCustom_2(idWeekCheck);
        // console.log("dataPlayersPreviousWeek", idWeekCheck, dataPlayerPreviousWeek);

        if (dataPlayerPreviousWeek != null && dataPlayerPreviousWeek.data.length > 0) {
            let dataPlayerCheck = dataPlayerPreviousWeek.data.find(player => player.playerId == MConfigFacebook.Instance.playerID);
            if (dataPlayerCheck != null) {
                this._mapRankPlayer.set(idWeekCheck, dataPlayerCheck.rank);
                this._mapPrizePlayer.set(idWeekCheck, dataPlayerPreviousWeek.prize)
                return { rank: dataPlayerCheck.rank, prize: dataPlayerPreviousWeek.prize };
            }
        }
    }

    public CompareAndUpdateSaveWeekly(needSaveData: boolean = true) {
        const idWeeklyNow = DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY;

        // in case player has played the game before
        if (idWeeklyNow != PlayerData.Instance._weekly_id) {
            PlayerData.Instance._weekly_id = idWeeklyNow;
            DataWeeklySys.Instance.UpdateRootLevel(false);
            PlayerData.Instance.SaveWeekly(needSaveData);
        }
    }

    public async GetPrizeWeek(): Promise<IPrize[][]> {
        const idWeekCheck = DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY;

        if (this._mapPrizePlayer.has(idWeekCheck)) {
            // console.log("prize", this._mapPrizePlayer.get(idWeekCheck));
            return this._mapPrizePlayer.get(idWeekCheck)
        }
        let dataPlayersWeek = await DataLeaderboardSys.Instance.GetLeaderboardByContextsIdsCustom(idWeekCheck);
        if (dataPlayersWeek != null && dataPlayersWeek.data.length > 0) {
            // console.log("dataPlayersWeek", dataPlayersWeek);
            this._mapPrizePlayer.set(idWeekCheck, dataPlayersWeek.prize);
            return dataPlayersWeek.prize;
        }

        let listPrize = [];
        listPrize[0] = [
            new IPrize(TYPE_PRIZE.SORT, TYPE_RECEIVE.NUMBER, 2),
            new IPrize(TYPE_PRIZE.SHUFFLE, TYPE_RECEIVE.NUMBER, 3),
            new IPrize(TYPE_PRIZE.VIP_SLOT, TYPE_RECEIVE.NUMBER, 2),
            new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 4000)
        ];

        listPrize[1] = [
            new IPrize(TYPE_PRIZE.SORT, TYPE_RECEIVE.NUMBER, 1),
            new IPrize(TYPE_PRIZE.SHUFFLE, TYPE_RECEIVE.NUMBER, 2),
            new IPrize(TYPE_PRIZE.VIP_SLOT, TYPE_RECEIVE.NUMBER, 1),
            new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 2000)
        ];

        listPrize[2] = [
            new IPrize(TYPE_PRIZE.SORT, TYPE_RECEIVE.NUMBER, 1),
            new IPrize(TYPE_PRIZE.SHUFFLE, TYPE_RECEIVE.NUMBER, 1),
            new IPrize(TYPE_PRIZE.VIP_SLOT, TYPE_RECEIVE.NUMBER, 1),
            new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 1000)
        ];

        return listPrize;
    }

    public async ClaimPrizePreviousWeek(idWeekly: string, needSaveData: boolean = true) {
        // check if dataSave more than 10 element => delete first element
        if (PlayerData.Instance._weekly_list_idClaimed.length > 10) {
            PlayerData.Instance._weekly_list_idClaimed.shift();
        }

        PlayerData.Instance._weekly_list_idClaimed.push(idWeekly);

        if (needSaveData) {
            PlayerData.Instance.SaveWeekly();
        }
    }

    public async UpdateRootLevel(needSaveData: boolean = true) {
        PlayerData.Instance._weekly_level_root = 0;
        if (needSaveData) {
            PlayerData.Instance.SaveWeekly();
        }
    }

    public IncreaseLevelWeek(needSaveData: boolean = true) {
        PlayerData.Instance._weekly_level_root += 1;
        if (needSaveData) {
            PlayerData.Instance.SaveWeekly();
        }
    }

    public GetProgressPlayer(): number {
        return PlayerData.Instance._weekly_level_root;
    }
}


