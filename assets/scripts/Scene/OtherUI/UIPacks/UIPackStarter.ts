import { _decorator, Component, Label, Node } from 'cc';
import { IUIPackDefault, UIPackDefault } from './UIPackDefault';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { DataPackSys } from '../../../DataBase/DataPackSys';
import { EnumNamePack, instanceOfIUIPackDefault } from '../../../Utils/Types';
import { FX_popup } from '../../../AnimsPrefab/FX_popup';
const { ccclass, property } = _decorator;

@ccclass('UIPackStarter')
export class UIPackStarter extends UIPackDefault implements IUIPackDefault {

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
        const numAvaliable = DataPackSys.Instance.getInfoPackSave(this.namePack).numAvaliable;
        const isCallFromLobby: boolean = this._dataCustom != null && instanceOfIUIPackDefault(this._dataCustom)

        switch (true) {
            case isCallFromLobby:
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
                break;
        }
    }

    public async UIShowDone(): Promise<void> {
        this.FX_popup.PlayAnimApearStarterPack();
    }
    //#endregion baseUI

    //#region IUIPackDefault
    CloseUI(): void {
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PACK_STARTER, 1);
    }

    CustomLogicAfterBuySuccess(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        })
    }
    //#endregion IUIPackDefault
}


