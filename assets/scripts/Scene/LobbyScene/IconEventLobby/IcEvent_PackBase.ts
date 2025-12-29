import { _decorator, CCString, Component, Label, Node, Sprite } from 'cc';
import { EnumNamePack, EnumReasonEndPack } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { DataPackSys } from '../../../DataBase/DataPackSys';
import { Utils } from '../../../Utils/Utils';
import { UIBlinh } from '../UIBlinh';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { MConfigs } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;

export interface IIcEvent_PackBase {
    ShowUIPack(): void;
    CloseUIPack(): void;
    TryShowPopUpAtLobby(): boolean;
}

@ccclass('IcEvent_PackBase')
export class IcEvent_PackBase extends Component {
    @property(Label) lbTime: Label;
    @property(CCString) namePack: EnumNamePack = EnumNamePack.StartedPack;
    @property(Node) nNotification: Node;
    private iIcEvent_PackBase: IIcEvent_PackBase = null;
    private checkPackCanInitDone: boolean = false;

    private canPopUpPackStarterFromLobby: boolean = false; public get CanPopUpStarterFromLobby() { return this.canPopUpPackStarterFromLobby; }
    protected onLoad(): void {
        this.CheckPackCanInit();
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this); // listen from dataPackSys

        switch (this.namePack) {
            case EnumNamePack.StartedPack:
                break;
            case EnumNamePack.GreateDealsPack_1: case EnumNamePack.GreateDealsPack_2:
                clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUILbTime, this);
                break;
        }

        this.UpdateNotification();
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this);
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUILbTime, this);
    }

    /**
     * This func will be call in 2 case
     * first when load
     * second when has emit to show in custom case
     */
    public CheckPackCanInit() {

        // Có hai loại pack được hiển thị ở đây đó là pack có thời hạn và pack không thời hạn
        const isPackOngoing = DataPackSys.Instance.IsPackOngoing(this.namePack);
        const canInitPack = DataPackSys.Instance.CheckLogicCanInitPack(this.namePack);
        const canReInitPack = DataPackSys.Instance.CheckLogicCanReInitPack(this.namePack);
        const blinhCom = this.node.getComponent(UIBlinh);

        // check pack là pack có thời hạn
        switch (this.namePack) {
            case EnumNamePack.GreateDealsPack_1:
                switch (true) {
                    case canInitPack:
                        // initPack
                        DataPackSys.Instance.AddNewPack(this.namePack);
                        this.canPopUpPackStarterFromLobby = true;
                        this.node.active = true;

                        // load blinh
                        if (blinhCom != null && !blinhCom.IsInit()) {
                            blinhCom.InitParticle();
                        }
                        break;
                    case canReInitPack:
                        DataPackSys.Instance.ReInitPack(this.namePack, true)
                        this.canPopUpPackStarterFromLobby = true;
                        this.node.active = true;
                        // load blinh
                        if (blinhCom != null && !blinhCom.IsInit()) {
                            blinhCom.InitParticle();
                        }
                        break;
                    case isPackOngoing:
                        this.node.active = true;
                        break;
                    default:
                        this.node.active = false;
                        break;
                }
                break;
            case EnumNamePack.GreateDealsPack_2:
                switch (true) {
                    case canInitPack:
                        DataPackSys.Instance.AddNewPack(this.namePack);
                        this.canPopUpPackStarterFromLobby = true;
                        this.node.active = true;

                        // load blinh
                        if (blinhCom != null && !blinhCom.IsInit()) {
                            blinhCom.InitParticle();
                        }
                        break;
                    case canReInitPack:
                        DataPackSys.Instance.ReInitPack(this.namePack, true);
                        this.canPopUpPackStarterFromLobby = true;
                        this.node.active = true;
                        // load blinh
                        if (blinhCom != null && !blinhCom.IsInit()) {
                            blinhCom.InitParticle();
                        }
                        break;
                    case isPackOngoing:
                        this.node.active = true;
                        break;
                    default:
                        this.node.active = false;
                        break;
                }
                break;
            case EnumNamePack.StartedPack:
                switch (true) {
                    case canInitPack:
                        DataPackSys.Instance.AddNewPack(this.namePack);
                        this.canPopUpPackStarterFromLobby = true;
                        this.node.active = true;

                        // load blinh
                        if (blinhCom != null && !blinhCom.IsInit()) {
                            blinhCom.InitParticle();
                        }
                        break;
                    case isPackOngoing:
                        this.node.active = true;
                        break;
                    default:
                        this.node.active = false;
                        break;
                }
                break;
        }
        this.checkPackCanInitDone = true;
    }

    public Init(iIcEvent_PackBase: IIcEvent_PackBase) {
        this.iIcEvent_PackBase = iIcEvent_PackBase;


    }

    private onClickSelf() {
        LogEventManager.Instance.logButtonClick(`pack_${this.namePack}`, "home");

        this.SetWasShowPack();

        this.UpdateNotification();

        this.iIcEvent_PackBase.ShowUIPack();
    }

    private RemovePack(reasonEndPack: EnumReasonEndPack, namePack: EnumNamePack) {
        if (namePack == this.namePack) {
            this.node.active = false;
        }
    }

    private UpdateUILbTime() {
        if (this.node.active && this.checkPackCanInitDone) {
            const timeNow = Utils.getCurrTime();
            const infoPackStarter = DataPackSys.Instance.getInfoPackSave(this.namePack);
            if (infoPackStarter == null) {
                this.iIcEvent_PackBase.CloseUIPack();
                return;
            }
            const timeLimit = infoPackStarter.timeLimit;
            const timeRemaining = timeLimit - timeNow;

            if (timeRemaining <= 0) {
                // force turn off pack
                this.iIcEvent_PackBase.CloseUIPack();
            } else {
                this.lbTime.string = Utils.convertTimeLengthToFormat(timeRemaining);
            }
        }
    }

    private UpdateNotification() {
        switch (this.namePack) {
            case EnumNamePack.StartedPack:
                this.nNotification.active = !MConfigs.WasShowUIStaterPack;
                break;
            case EnumNamePack.GreateDealsPack_1:
                this.nNotification.active = !MConfigs.WasShowUIGreatDeal_1;
                break;
            case EnumNamePack.GreateDealsPack_2:
                this.nNotification.active = !MConfigs.WasShowUIGreatDeal_2;
                break;
        }
    }

    private SetWasShowPack() {
        switch (this.namePack) {
            case EnumNamePack.StartedPack:
                MConfigs.WasShowUIStaterPack = true;
                break;
            case EnumNamePack.GreateDealsPack_1:
                MConfigs.WasShowUIGreatDeal_1 = true;
                break;
            case EnumNamePack.GreateDealsPack_2:
                MConfigs.WasShowUIGreatDeal_2 = true;
                break;
        }
    }
}


