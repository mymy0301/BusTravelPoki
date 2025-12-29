import { _decorator, Component, Material, Node, Prefab, Sprite, Vec3 } from 'cc';
import { MConst } from '../../../Const/MConst';
import { clientEvent } from '../../../framework/clientEvent';
import { ReadMapLobbyJson } from '../../../MJson/ReadMapLobbyJson';
import { ConstructorSys, EConstructorState } from '../UIBackground/ConstructorSys';
import { UIReceivePrizeLobby } from '../UIReceivePrizeLobby';
import { GameSoundEffect, IMapLobbyJson, IPrize, TYPE_PRIZE, TYPE_QUEST_DAILY, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { DataBuildingSys } from '../../../DataBase/DataBuildingSys';
import { AnimReceiveFinishBuilding, param_AnimReceiveFinishBuilding } from '../AnimReceivePrize/AnimReceiveFinishBuilding';
import { CurrencySys } from '../../CurrencySys';
import { DataItemSys } from '../../DataItemSys';
import { SoundSys } from '../../../Common/SoundSys';
const { ccclass, property } = _decorator;

@ccclass('BuildingLobbySys')
export class BuildingLobbySys extends Component {
    @property(Node) nUIBackground: Node;
    @property(Prefab) pfConstructor: Prefab;
    @property(Prefab) pfSkeletonConstructor: Prefab;
    @property(AnimReceiveFinishBuilding) animReceiveFinishBuilding = new AnimReceiveFinishBuilding();
    @property(Node) nBgMap: Node;

    _listNConstructor: Node[] = [];
    _infoMap: IMapLobbyJson = null;

    protected onLoad(): void {

    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_BUILDING.INCREASE_PROGRESS_BUILDING, this.IncreaseBuilding, this);
        clientEvent.on(MConst.EVENT_BUILDING.FINISH_BUILDING_CONSTRUCTOR_NOW, this.FinishBuilding, this);
        clientEvent.on(MConst.EVENT_BUILDING.SHOW_NOTI_REMAIN_CONS_NOW, this.ShowNotiRemainCons, this);
        clientEvent.on(MConst.EVENT_BUILDING.HIDE_NOTI_REMAIN_CONS_NOW, this.HideNotiRemainCons, this);
    }

    protected onDestroy(): void {

    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_BUILDING.INCREASE_PROGRESS_BUILDING, this.IncreaseBuilding, this);
        clientEvent.off(MConst.EVENT_BUILDING.FINISH_BUILDING_CONSTRUCTOR_NOW, this.FinishBuilding, this);
        clientEvent.off(MConst.EVENT_BUILDING.SHOW_NOTI_REMAIN_CONS_NOW, this.ShowNotiRemainCons, this);
        clientEvent.off(MConst.EVENT_BUILDING.HIDE_NOTI_REMAIN_CONS_NOW, this.HideNotiRemainCons, this);
    }

    public async GenMap() {
        this.nUIBackground.destroyAllChildren();

        const levelBuildingNow: number = DataBuildingSys.Instance.GetIndexMapNow();
        const numConstructorUnlockNow: number = DataBuildingSys.Instance.GetIndexConstructorUnlockNow();
        const progressConstructorNow: number = DataBuildingSys.Instance.GetProgressConstructorNow();

        const dataGenNewMap = await ReadMapLobbyJson.Instance.ReadMapAndSetUpBase(
            levelBuildingNow, numConstructorUnlockNow, progressConstructorNow,
            this.nUIBackground, this.pfConstructor, this.pfSkeletonConstructor, this.nBgMap.getComponent(Sprite).getSharedMaterial(0),
        );

        this._listNConstructor = dataGenNewMap.listConstructor;
        this._infoMap = dataGenNewMap.infoMap;
        // console.log("dataGenNewMap", dataGenNewMap, this._listNConstructor, this._infoMap);
    }

    //====================================================
    //#region func listen
    private IncreaseBuilding() {
        const indexConstructorUnlockNow = DataBuildingSys.Instance.GetIndexConstructorUnlockNow();
        let nConstructorBuilding: Node = this._listNConstructor[indexConstructorUnlockNow];
        if (nConstructorBuilding == null || nConstructorBuilding.getComponent(ConstructorSys) == null) return;
        nConstructorBuilding.getComponent(ConstructorSys).IncreaseProgressBuilding();
    }

    private async FinishBuilding(nCoin: Node, nTicket: Node, listOtherPrize: Node[], wPosChest: Vec3, scaleChest: Vec3, cb: () => void) {


        // ||**DQ**||
        clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.BUILD_A_CONSTRUCTOR, 1);

        const indexConstructorUnlockNow = DataBuildingSys.Instance.GetIndexConstructorUnlockNow();
        let nConstructorBuilding: Node = this._listNConstructor[indexConstructorUnlockNow];
        const construcCom: ConstructorSys = nConstructorBuilding.getComponent(ConstructorSys);

        // call receive prize 
        let listPrize: IPrize[] = construcCom.GetListPrize();
        let prizeMoney = listPrize.find(item => item.typePrize == TYPE_PRIZE.MONEY);
        let prizeTicket = listPrize.find(item => item.typePrize == TYPE_PRIZE.TICKET);
        const numCoin: number = prizeMoney != null ? prizeMoney.value : 0;
        const numTicket: number = prizeTicket != null ? prizeTicket.value : 0;
        const wPosCoin: Vec3 = nCoin != null ? nCoin.worldPosition.clone() : Vec3.ZERO;
        const wPosTicket: Vec3 = nTicket != null ? nTicket.worldPosition.clone() : Vec3.ZERO;

        // save data
        DataBuildingSys.Instance.IncreaseNumConstructorUnlock();
        if (numCoin > 0) { CurrencySys.Instance.AddMoney(numCoin, "unlock_constructor", true, false); };
        if (numTicket > 0) { CurrencySys.Instance.AddTicket(numTicket, "unlock_constructor", true, false); };
        if (listOtherPrize.length > 0) { DataItemSys.Instance.AddItemPrize(listPrize, "unlock_constructor", true, true); };

        // chạy anim hiển thị subItem của constructor đó
        await construcCom.ChangeState(EConstructorState.ANIM_BUILDING_DONE);

        SoundSys.Instance.playSoundEffectOneShotDelayTime(GameSoundEffect.SOUND_REWARDS, 1, 0.1);

        const paramAnim: param_AnimReceiveFinishBuilding = {
            numCoin: numCoin,
            wPosCoin: wPosCoin,
            numTicket: numTicket,
            wPosTicket: wPosTicket,
            nTicket: nTicket,
            listNOtherItems: [],
            nameConstructor: construcCom.GetNameConstructor(),
            superUIAnimCustom: UIReceivePrizeLobby.Instance.superUIAnimCustom,
        }
        // await this.animReceiveFinishBuilding.runAnim(paramAnim);
        await this.animReceiveFinishBuilding.runAnim2(paramAnim, wPosChest, scaleChest);

        cb();
    }

    private ShowNotiRemainCons() {
        const indexConsNow: number = DataBuildingSys.Instance.GetIndexConstructorUnlockNow();
        let nConstructorBuilding: Node = this._listNConstructor[indexConsNow];
        nConstructorBuilding.getComponent(ConstructorSys).Show_notiRemainingItemNeedBuild();
    }

    private HideNotiRemainCons() {
        const indexConsNow: number = DataBuildingSys.Instance.GetIndexConstructorUnlockNow();
        let nConstructorBuilding: Node = this._listNConstructor[indexConsNow];
        nConstructorBuilding.getComponent(ConstructorSys).Hide_notiRemainingItemNeedBuild();
    }
    //#endregion func listen
    //================================================================

    //================================================================
    //#region common func
    public GetRemaingProgressBuilding() {
        const numConstructorUnlockNow = DataBuildingSys.Instance.GetIndexConstructorUnlockNow();
        let nConstructorBuilding: Node = this._listNConstructor[numConstructorUnlockNow];
        if (nConstructorBuilding == null) return;
        return nConstructorBuilding.getComponent(ConstructorSys).GetMaxRemainingProgress();
    }

    public GetNConstructorBuidling() {
        const numConstructorUnlockNow = DataBuildingSys.Instance.GetIndexConstructorUnlockNow();
        return this._listNConstructor[numConstructorUnlockNow];
    }

    public GetNFocusConstructor() {
        const numConstructorUnlockNow = DataBuildingSys.Instance.GetIndexConstructorUnlockNow();
        const nConstructor = this._listNConstructor[numConstructorUnlockNow];
        const result = nConstructor.getComponent(ConstructorSys).spConstructor.node;
        return result;
    }

    public IsUnlockFullMap() {
        const numConstructorUnlockNow = DataBuildingSys.Instance.GetIndexConstructorUnlockNow();
        return numConstructorUnlockNow == this._listNConstructor.length;
    }

    public async OpenConstructorNowToBuild() {
        const numConstructorUnlockNow = DataBuildingSys.Instance.GetIndexConstructorUnlockNow();
        const nConsBuidling = this._listNConstructor[numConstructorUnlockNow];
        await nConsBuidling.getComponent(ConstructorSys).ChangeState(EConstructorState.ANIM_APEAR_BUILDING);
    }

    public GetPrizeFinishMap(): IPrize[] {
        return this._infoMap.listPrize;
    }

    public GetNameFinishMap(): string {
        return this._infoMap.title;
    }
    //#endregion common func
    //================================================================
}


