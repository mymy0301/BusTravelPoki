import { _decorator, Component, Label, Node } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { DataLevelProgressionSys } from '../../../DataBase/DataLevelProgressionSys';
import { Utils } from '../../../Utils/Utils';
import { CONFIG_LPr } from '../UILevelProgression/TypeLevelProgress';
import { instanceOfIOpenUIBaseWithInfo, instanceOfIUIKeepTutAndReceiveLobby, IOpenUIBaseWithInfo, IUIKeepTutAndReceiveLobby } from '../../../Utils/Types';
import { MConfigs } from '../../../Configs/MConfigs';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
const { ccclass, property } = _decorator;

@ccclass('UILevelProgressPrepare')
export class UILevelProgressPrepare extends UIBaseSys {
    @property(Label) lbTime: Label;
    @property(Label) lbTitle: Label;
    @property(Label) lbShadowTitle: Label;
    @property(Label) lbContent: Label;

    public async UICloseDone(): Promise<void> {
        if (this._dataCustom != null && this._dataCustom.length > 0) {
            const dataKeepTut = this._dataCustom.find(dataAny => instanceOfIUIKeepTutAndReceiveLobby(dataAny))
            if (dataKeepTut != null) {
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
            }
        }

        if (this._dataCustom != null && this._dataCustom.length > 0) {
            const dataPlayInfo = this._dataCustom.find(dataAny => instanceOfIOpenUIBaseWithInfo(dataAny))
            if (dataPlayInfo != null) {
                clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
            }
        }
    }

    public async PrepareDataShow(): Promise<void> {
        // update this seasion was popUp event
        MConfigs.IsTryShowPopUpStartEventLP = true;

        // set content
        const idEventNow = DataLevelProgressionSys.Instance.GetIdEventNow();
        const contentEvent = DataLevelProgressionSys.Instance.GetContentEventNow(idEventNow + 1);
        // this.lbTitle.string = this.lbShadowTitle.string = contentEvent;
        // this.lbContent.string = `${contentEvent} has started!\nCollect cars to win amazing rewards!`

        // set time
        this.lbTime.string = Utils.convertTimeLengthToFormat_ForEvent(CONFIG_LPr.TIME_LONG_EVENT);
    }

    public BtnPlay() {
        let cloneDataCustom = this._dataCustom;
        // remove info dataCustom
        if (cloneDataCustom != null && cloneDataCustom.length > 0) {
            const indexDataAny = cloneDataCustom.findIndex(dataAny => instanceOfIUIKeepTutAndReceiveLobby(dataAny));
            if (indexDataAny != -1) {
                (cloneDataCustom as any[]).splice(indexDataAny, 1);
            }
        }

        // trong case user ko mở từ tut event => mà từ lần sau đó
        if (DataLevelProgressionSys.Instance.GetIdEventNow() == 0) {
            // check có case open UI with base info hay không? đã ko thì thêm vào
            let iOpenInfoBase: IOpenUIBaseWithInfo = {
                isShowInfo: true
            };
            if (cloneDataCustom != null && cloneDataCustom.length > 0) {
                const indexDataBaseInfo = cloneDataCustom.findIndex(dataAny => instanceOfIOpenUIBaseWithInfo(dataAny));
                if (indexDataBaseInfo == -1) {
                    (cloneDataCustom as any[]).push(iOpenInfoBase)
                }
            } else {
                cloneDataCustom = [iOpenInfoBase];
            }
        }

        // filter all data null
        if (cloneDataCustom != null) {
            cloneDataCustom = (cloneDataCustom as any[]).filter(item => item != null);
        }

        this._dataCustom = null;

        // init + call open new UI
        DataLevelProgressionSys.Instance.InitNewEvent(true);
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_LEVEL_PROGRESSION_PREPARE, 1);
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LEVEL_PROGRESSION, 1, true, cloneDataCustom);
    }

    public BtnClose() {
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_LEVEL_PROGRESSION_PREPARE, 1);
    }
}


