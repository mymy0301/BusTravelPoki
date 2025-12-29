import { _decorator, Button, Component, Label, Node, Sprite } from 'cc';
import { IcEvent_PackBase, IIcEvent_PackBase } from './IcEvent_PackBase';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { IUIPackDefault } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('IcEvent_PackGreatDeal')
export class IcEvent_PackGreatDeal extends IcEvent_PackBase implements IIcEvent_PackBase {
    protected onLoad(): void {
        super.onLoad();
        this.Init(this);
    }

    //#region func interface
    ShowUIPack(): void {
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PACK_GREATE_DEALS_1, 1);
    }
    CloseUIPack(): void {
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PACK_GREATE_DEALS_1, 1);
    }
    TryShowPopUpAtLobby(): boolean {
        if (this.CanPopUpStarterFromLobby) {
            let dataCustom: IUIPackDefault = {
                isCallFromLobby: true
            }
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PACK_GREATE_DEALS_1, 1, true, dataCustom);
            return true;
        }
        return false;
    }
    //#endregion func interface
}


