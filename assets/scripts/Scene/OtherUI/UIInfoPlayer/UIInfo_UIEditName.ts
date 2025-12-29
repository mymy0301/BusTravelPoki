import { _decorator, Component, EditBox, Node, AudioClip } from 'cc';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { PlayerData } from '../../../Utils/PlayerData';
import { CurrencySys } from '../../CurrencySys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import * as i18n from 'db://i18n/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('UIInfo_UIEditName')
export class UIInfo_UIEditName extends Component {
    @property(EditBox) edtName: EditBox;
    @property(Node) bgBlack: Node;
    @property(Node) nTicket: Node;

    private _cbUpdateUIHeader: CallableFunction;

    public RegistenCb(cbUpdateUIHeader: CallableFunction) {
        this._cbUpdateUIHeader = cbUpdateUIHeader;
    }

    public Show() {
        this.node.active = true;
        this.edtName.string = MConfigFacebook.Instance.playerName;

        this.nTicket.active = !PlayerData.Instance._isChangeNameFirstTime;
    }

    public Hide() {
        this.node.active = false;
    }

    public onBtnEditName() {
        if (CurrencySys.Instance.GetTicket() <= 0 && !PlayerData.Instance._isChangeNameFirstTime) {
            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, i18n.t("Not enough Tickets!"));
            return;
        }

        const newName: string = this.edtName.string;

        if (newName.length == 0) {
            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, i18n.t("Please enter your new name"));
            return;
        }

        // check if can used free => turn off 
        // else => reduce ticket
        if (PlayerData.Instance._isChangeNameFirstTime) {
            PlayerData.Instance._isChangeNameFirstTime = false;
        } else {
            CurrencySys.Instance.AddTicket(-1, `UIInfo_UIEditName`);
        }

        // trong trường hợp server lỗi ta vẫn phải thay đổi trên client cho chính xác
        MConfigFacebook.Instance.playerName = newName;
        this._cbUpdateUIHeader();
        this.Hide();
        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, i18n.t("Update name success"))
    }
}


