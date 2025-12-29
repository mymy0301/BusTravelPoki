import { _decorator, Button, Component, Label, Node, Sprite } from 'cc';
import { IcEvent_PackBase, IIcEvent_PackBase } from './IcEvent_PackBase';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { IUIPackDefault } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('IcEvent_PackGreatDeal_2')
export class IcEvent_PackGreatDeal_2 extends IcEvent_PackBase implements IIcEvent_PackBase {
    protected onLoad(): void {
        super.onLoad();
        this.Init(this);
    }
    ShowUIPack(): void {
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PACK_GREATE_DEALS_2, 1);
    }
    CloseUIPack(): void {
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PACK_GREATE_DEALS_2, 1);
    }
    TryShowPopUpAtLobby(): boolean {
        //NOTE - this commnet code below will not used because we not popUp pack when pack 1 bought done

        // // check logic again because maybe user buy pack 1 when it pop Up first time
        // this.CheckPackCanInit();

        if (this.CanPopUpStarterFromLobby) {
            let dataCustom: IUIPackDefault = {
                isCallFromLobby: true
            }
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PACK_GREATE_DEALS_2, 1, true, dataCustom, true);
            return true;
        }
        return false;
    }
}


