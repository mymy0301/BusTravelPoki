import { _decorator, Component, Label, Node } from 'cc';
import { IUIPackDefault, UIPackDefault } from './UIPackDefault';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { EnumNamePack, instanceOfIUIPackDefault } from '../../../Utils/Types';
import { DataPackSys } from '../../../DataBase/DataPackSys';
import { FX_popup } from '../../../AnimsPrefab/FX_popup';
const { ccclass, property } = _decorator;

@ccclass('UIPackGreateDeals_1')
export class UIPackGreateDeals_1 extends UIPackDefault implements IUIPackDefault {

    @property(FX_popup) FX_popup: FX_popup;

    protected onLoad(): void {
        super.onLoad();
        this.Init(this);
    }

    protected onEnable(): void {
        super.onEnable();
        this.FX_popup.HideAnim();
    }

    //#region baseUI
    public async UICloseDone(): Promise<void> {
        let typeCloseUI: number = this.CheckTypeCloseUI();

        switch (typeCloseUI) {
            case 1:
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
                break;
            default:
                break;
        }
    }

    public async UIShowDone(): Promise<void> {
        this.FX_popup.PlayAnimGreatDealPack();
    }
    //#endregion baseUI

    //#region IUIPackDefault
    CloseUI(): void {
        let typeCloseUI: number = this.CheckTypeCloseUI();
        if (typeCloseUI == 2) {
            clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI_WITHOUT_TURN_OFF_SHADOW, TYPE_UI.UI_PACK_GREATE_DEALS_1, 1);
        } else {
            clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PACK_GREATE_DEALS_1, 1);
        }
    }

    CustomLogicAfterBuySuccess(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        })
    }
    //#endregion IUIPackDefault

    /**
     * @returns 1: call from lobby
     *          >1: other case
     */
    private CheckTypeCloseUI(): number {
        const numAvaliable = DataPackSys.Instance.getInfoPackSave(this.namePack).numAvaliable;
        const isCallFromLobby: boolean = this._dataCustom != null && instanceOfIUIPackDefault(this._dataCustom)

        switch (true) {
            case isCallFromLobby:
                return 1;
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
                break;
        }

        return 2;
    }

}


