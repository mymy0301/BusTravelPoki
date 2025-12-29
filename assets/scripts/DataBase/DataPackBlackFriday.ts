/**
 * 
 * anhngoxitin01
 * Tue Nov 25 2025 11:48:17 GMT+0700 (Indochina Time)
 * DataPackBlackFriday
 * db://assets/scripts/DataBase/DataPackBlackFriday.ts
*
*/
import { _decorator, Component, Node } from 'cc';
import { InfoPackFromRootJson } from '../Utils/Types';
import { Utils } from '../Utils/Utils';
import { ReadDataJson } from '../ReadDataJson';
import { DataInfoPlayer } from '../Scene/DataInfoPlayer';
import { DataPackSys } from './DataPackSys';
import { PlayerData } from '../Utils/PlayerData';
const { ccclass, property } = _decorator;

@ccclass('DataPackBlackFriday')
export class DataPackBlackFriday {
    public static Instance: DataPackBlackFriday = null;
    private _isPackShowToday: boolean = false; public get IsPackShowToday() { return this._isPackShowToday; }
    private _infoPackCache: InfoPackFromRootJson = null; public get InfoPackCacheNow() { return this._infoPackCache; }

    constructor() {
        if (DataPackBlackFriday.Instance == null) {
            DataPackBlackFriday.Instance = this;
        }
    }

    /**
     * func này chỉ được gọi đúng một lần duy nhất
     */
    public InitPackCache(): boolean {
        const dataPack = this.GetInfoPackNow();
        if (dataPack == null) { return false; }
        this._infoPackCache = dataPack.dataPack;
        return dataPack.needSaveData;
    }

    /**
     * func này được dùng nhằm mục đích để lấy dữ liệu pack hiển thị hợp lý
     * @returns 
     */
    protected GetInfoPackNow(): { dataPack: InfoPackFromRootJson, needSaveData: boolean } {
        //================== valid 0 =========================
        if (this._isPackShowToday) { return null; }

        // sẽ lấy dựa vào ngày hôm nay + sô liệu tiền đã chia
        // sau đó sẽ so sánh với trong bộ dữ liệu đánh dấu đã mua hay chưa
        const dateNow = new Date();
        const day = dateNow.getDate(); const month = dateNow.getMonth(); const year = dateNow.getFullYear();
        const listPackNow = ReadDataJson.Instance.GetDataPacksBlackFriday();
        let isSuitDayShow = false;
        switch (true) {
            case month == 10 && year == 2025 && day == 25: isSuitDayShow = true; break;
            case month == 10 && year == 2025 && day == 26: isSuitDayShow = true; break;
            case month == 10 && year == 2025 && day == 27: isSuitDayShow = true; break;
            case month == 10 && year == 2025 && day == 28: isSuitDayShow = true; break;
            case month == 10 && year == 2025 && day == 29: isSuitDayShow = true; break;
            case month == 10 && year == 2025 && day == 30: isSuitDayShow = true; break;
        }

        // =============== valid 1 =========================
        if (!isSuitDayShow) { return null; }

        // =============== valid 2 =========================
        // trong ngày hôm nay chưa mua lần nào
        const isNotBoughtToday = PlayerData.Instance._listTimeBoughtPackBlackFriday.every(time => !Utils.CheckTimeIsInTodayNoUTC(time));
        if (!isNotBoughtToday) { return null; }


        // =============== tính toán tổng số tiền đã chi để quyết định xem hiển thị gọi pack nào hợp lý
        const levelPlayerNow = PlayerData.Instance._levelPlayer;
        let totalIAPExpend = DataInfoPlayer.Instance.TotalSpendingMoneyOfUser();
        if (totalIAPExpend == 0) {
            // vì chúng ta chưa cache dữ liệu IAP mua ở đâu ở v1.5.1 do đó chúng ta sẽ kiểm tra các gói pack đã mua trong dữ liệu xem có không? nếu không thì không tính
            totalIAPExpend = DataPackSys.Instance.TotalSpendingMoneyOfUser();
        }


        let packChoice: InfoPackFromRootJson = null;
        switch (true) {
            case totalIAPExpend == 0 && levelPlayerNow < 25:
                packChoice = listPackNow[0];
                break;
            case totalIAPExpend == 0 && levelPlayerNow >= 25 && !DataInfoPlayer.Instance.WasBoughtPack(listPackNow[1].namePack):
                packChoice = listPackNow[1];
                break;
            case totalIAPExpend < 5 && !DataInfoPlayer.Instance.WasBoughtPack(listPackNow[2].namePack):
                packChoice = listPackNow[2];
                break;
            case totalIAPExpend >= 5 && !DataInfoPlayer.Instance.WasBoughtPack(listPackNow[3].namePack):
                packChoice = listPackNow[3];
                break;
        }


        let needSaveData: boolean = false;

        // cache lại pack cho ngày hôm đấy
        // kiểm tra nếu như đã qua ngày hoặc bằng null mới cập nhật lại
        const valid1 = packChoice != null;
        const valid2 = PlayerData.Instance._cachePackBlackFriday == null || !Utils.CheckTimeIsInTodayNoUTC(PlayerData.Instance._cachePackBlackFriday.time);
        if (valid1 && valid2) {
            needSaveData = true;
            PlayerData.Instance._cachePackBlackFriday = {
                time: Utils.getCurrTime(),
                idPack: packChoice.namePack
            }
        }
        // sau đó gán lại giá trị cho pack sửu dụng
        // kiểm tra nếu như packChoice ko null tức là có giá trị
        if (packChoice != null) {
            const packCache = listPackNow.find(pack => pack.namePack == PlayerData.Instance._cachePackBlackFriday.idPack);
            if (packCache != null) {
                packChoice = packCache;
            }
        }

        return {
            dataPack: packChoice,
            needSaveData: needSaveData
        }
    }

    /**
     * func này đc dùng để cập nhật dữ liệu
     */
    public BuyPackSuccess(needSaveData: boolean = false) {
        this._infoPackCache = null;
        PlayerData.Instance._listTimeBoughtPackBlackFriday.push(Utils.getCurrTime());
        if (needSaveData) {
            PlayerData.Instance.SavePackBlackFriday();
        }
    }

    public SavePackWasShowToday() { this._isPackShowToday = true; }
}