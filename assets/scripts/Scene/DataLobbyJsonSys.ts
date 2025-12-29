import { _decorator, Component, Node } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
const { ccclass, property } = _decorator;

@ccclass('DataLobbyJsonSys')
export class DataLobbyJsonSys {
    public static Instance: DataLobbyJsonSys;
    constructor() {
        if (DataLobbyJsonSys.Instance == null) {
            DataLobbyJsonSys.Instance = this;
        }
    }

    /**
     * Logic save data đó là ta sẽ lưu trữ lại dữ liệu của người chơi trước khi chuyển scene game
     * Sau đó khi chơi xong sẽ emit change scene type receive at lobby
     * người chơi sẽ nhận thưởng từng hạng mục trong json và lưu lại giá trị là -1 khi người chơi đã nhận thưởng hết
     * ```
     * Các giá trị sẽ được cập nhật tương ứng với từng đối tượng trong json để khi về lobby sẽ có giá trị trước khi chơi
     * => chạy anim nhận thưởng
     * => tăng tiến độ theo dữ liệu đã lưu < thực tế chứ không phải theo lobby json>
     * => làm theo cách này khi người chơi từ load => lobby sẽ auto cập nhật theo giá trị đã lưu và skip anim này (hoặc có thể check json để chạy anim tiếp).
     * ```
     * Tuy nhiên trong game này chúng ta có đối tượng là coin , một currency sẽ thay đổi ngay cả khi người chơi ko gọi hàm này
     * => Để tránh xung đột dữ liệu , những dữ liệu khác sẽ được lưu trữ trước khi chơi
     *    Còn các dữ liệu như coin , currency thì sẽ được cập nhật biên độ thay đổi sau mỗi khi hoàn thành màn chơi
     *    Dữ liệu sẽ đưuọc update sau khi về lobby và chạy xong anim
     * => Trong trường hợp người chơi từ load => lobby thì chúng ta sẽ check dữ liệu coin và buidling trong json đã được nhận hay chưa
     *      nếu chưa được nhận thì ta sẽ manual update dữ liệu và chỉnh lại thành đã nhận => để có thể skip anim nhận thưởng ở lobby 
     */
    public SaveDataLobbyJson() {
        this.SaveSeasonPassProgress(PlayerData.Instance._infoEventSeasonPass.progress, false);
        this.SaveLevelPassProgress(PlayerData.Instance._infoEventLevelPass.progress, false);
        this.SaveLevelProgression(PlayerData.Instance.LPr_progress, false);
        // console.log("SaveDataLobbyJson: ",  PlayerData.Instance._dataLobbyJson.seasonPass);

        // json coin sẽ được save riêng lúc người chơi quay về từ game sang lobby
        // json numBuilding sẽ được save riêng lúc người chơi quay về từ game sang lobby

        PlayerData.Instance.SaveDataLobbyJson();
    }

    //#region save data
    public SaveSeasonPassProgress(progressSeasonPass: number, needSaveData: boolean = true) {
        PlayerData.Instance._dataLobbyJson.seasonPass = progressSeasonPass;
        PlayerData.Instance.SaveDataLobbyJson(needSaveData);
    }
    public SaveLevelPassProgress(progressLevelPass: number, needSaveData: boolean = true) {
        PlayerData.Instance._dataLobbyJson.levelPass = progressLevelPass;
        PlayerData.Instance.SaveDataLobbyJson(needSaveData);
    }
    public SaveLevelProgression(progressLevelProgression: number, needSaveData: boolean = true) {
        PlayerData.Instance._dataLobbyJson.levelProgress = progressLevelProgression;
        PlayerData.Instance.SaveDataLobbyJson(needSaveData);
    }
    public CanPlaySpeedRace(active: boolean, needSaveData: boolean = true) {
        PlayerData.Instance._dataLobbyJson.isReceiveSpeedRace = active;
        PlayerData.Instance.SaveDataLobbyJson(needSaveData);
    }
    public SaveNumCoin(numCoin: number, needSaveData: boolean = true) {
        PlayerData.Instance._dataLobbyJson.numCoin = numCoin;
        PlayerData.Instance.SaveDataLobbyJson(needSaveData);
    }
    public SaveNumBuilding(numBuilding: number, needSaveData: boolean = true) {
        PlayerData.Instance._dataLobbyJson.numBuilding = numBuilding;
        PlayerData.Instance.SaveDataLobbyJson(needSaveData);
    }
    public CanPlayPiggy(active: boolean, needSaveData: boolean = true) {
        PlayerData.Instance._dataLobbyJson.isReceivePiggyBank = active;
        PlayerData.Instance.SaveDataLobbyJson(needSaveData);
    }
    public CanPlayDashRush(active: boolean, needSaveData: boolean = true) {
        PlayerData.Instance._dataLobbyJson.isReceiveDashRush = active;
        PlayerData.Instance.SaveDataLobbyJson(needSaveData);
    }
    //#endregion save data

    //#region common
    public GetSeasonPassProgress(): number {
        return PlayerData.Instance._dataLobbyJson.seasonPass;
    }
    public GetLevelPassProgress(): number {
        return PlayerData.Instance._dataLobbyJson.levelPass;
    }
    public GetLevelProgress(): number {
        return PlayerData.Instance._dataLobbyJson.levelProgress;
    }
    public GetNumCoin(): number {
        return PlayerData.Instance._dataLobbyJson.numCoin;
    }
    public GetNumBuilding(): number {
        return PlayerData.Instance._dataLobbyJson.numBuilding;
    }
    public IsPlayPiggy() {
        return PlayerData.Instance._dataLobbyJson.isReceivePiggyBank;
    }
    public IsPlaySpeedRace() {
        return PlayerData.Instance._dataLobbyJson.isReceiveSpeedRace;
    }
    public IsPlayDashRush() {
        return PlayerData.Instance._dataLobbyJson.isReceiveDashRush;
    }
    public GetNumLevelProgress() {
        return PlayerData.Instance._dataLobbyJson.levelProgress;
    }
    //#endregion

    //#region self
    public CheckDataLobbyAtLoad(cbAddCoin: CallableFunction, cbAddBuilding: CallableFunction): boolean {
        const numCoin = DataLobbyJsonSys.Instance.GetNumCoin();
        const numBuilding = DataLobbyJsonSys.Instance.GetNumBuilding();
        let needSaveLobby: boolean = false;
        if (numCoin > 0) {
            cbAddCoin(numCoin)
            DataLobbyJsonSys.Instance.SaveNumCoin(-1, false);
            needSaveLobby = true;
        }
        if (numBuilding > 0) {
            cbAddBuilding(numBuilding);
            DataLobbyJsonSys.Instance.SaveNumBuilding(-1, false);
            needSaveLobby = true;
        }
        if (DataLobbyJsonSys.Instance.IsPlayPiggy()) {
            DataLobbyJsonSys.Instance.CanPlayPiggy(false, false);
            needSaveLobby = true;
        }

        if (DataLobbyJsonSys.Instance.IsPlayDashRush()) {
            DataLobbyJsonSys.Instance.CanPlayDashRush(false, false);
            needSaveLobby = true;
        }

        if (DataLobbyJsonSys.Instance.IsPlaySpeedRace()) {
            DataLobbyJsonSys.Instance.CanPlaySpeedRace(false, false);
            needSaveLobby = true;
        }
       
        return needSaveLobby;
    }
    //#endregion self
}


