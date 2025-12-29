import { _decorator, Component, Label, Node, AudioClip, CCBoolean, Material, Button, Color, Sprite } from 'cc';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { TYPE_ITEM } from 'db://assets/scripts/Utils/Types';
import { DataItemSys } from '../../../DataItemSys';
import { MConfigs } from 'db://assets/scripts/Configs/MConfigs';
import { LEVEL_TUT_IN_GAME } from '../../../OtherUI/UITutorialInGame/TypeTutorialInGame';
const { ccclass, property } = _decorator;

enum STATE_VISUAL {
    LOCK,
    PREPARE_UNLOCK,
    UNLOCK
}

@ccclass('VisualItemInGame')
export class VisualItemInGame extends Component {
    @property([Node]) nGray: Node[] = [];
    @property(Material) matGray: Material;
    @property(Label) lbNumItem: Label;
    @property(Node) nAds: Node;
    @property(Node) nNumItem: Node;
    @property({ type: TYPE_ITEM }) typeItem: TYPE_ITEM = TYPE_ITEM.SORT;
    @property(Label) lbNameBooster: Label;
    @property(Node) nIc: Node;
    @property(Node) nIcLock: Node;
    @property(Button) btnItem: Button;

    private _stateVisual: STATE_VISUAL = STATE_VISUAL.LOCK;

    private readonly outlineColorLbNormal: Color = new Color().fromHEX("#121874");
    private readonly outlineColorLbLock: Color = new Color().fromHEX("#3A3A3A");

    //=============================================================
    //#region lifeCircle
    protected onEnable(): void {
        //auto update visual if it enable
        clientEvent.on(MConst.EVENT_ITEM_IN_GAME.UPDATE_NUM_ITEM, this.UpdateNumItem, this);
        if (DataItemSys.Instance != null) {
            let numItemHave = DataItemSys.Instance.GetNumItem(this.typeItem);
            this.UpdateNumItem(this.typeItem, numItemHave);
        }
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_ITEM_IN_GAME.UPDATE_NUM_ITEM, this.UpdateNumItem, this);
    }
    //#endregion lifeCircle
    //=============================================================


    //=============================================================
    //#region self
    private UpdateState(state: STATE_VISUAL) {
        this._stateVisual = state;

        switch (state) {
            case STATE_VISUAL.LOCK:
                this.nIcLock.active = true;
                this.nIc.active = false;
                this.nAds.active = false;
                this.nNumItem.active = false;
                this.SetGrayOrUnGray(true, true);
                this.SetLevelLock();
                break;
            case STATE_VISUAL.PREPARE_UNLOCK:
                this.nIcLock.active = false;
                this.nIc.active = true;
                this.CheckCanShowAds();
                this.SetGrayOrUnGray(true, true);
                break;
            case STATE_VISUAL.UNLOCK:
                this.nIcLock.active = false;
                this.nIc.active = true;
                this.CheckCanShowAds();
                this.SetGrayOrUnGray(false);
                break;
        }
    }

    private CheckCanShowAds() {
        if (this.lbNumItem.string == "0") {
            this.nAds.active = true;
            this.nNumItem.active = false;
        } else {
            this.nAds.active = false;
            this.nNumItem.active = true;
        }
    }


    private SetLevelLock() {
        switch (this.typeItem) {
            case TYPE_ITEM.SHUFFLE: this.lbNameBooster.string = `Level ${LEVEL_TUT_IN_GAME.SHUFFLE}`; break;
            case TYPE_ITEM.SORT: this.lbNameBooster.string = `Level ${LEVEL_TUT_IN_GAME.SORT}`; break;
            case TYPE_ITEM.VIP_SLOT: this.lbNameBooster.string = `Level ${LEVEL_TUT_IN_GAME.VIP_SLOT}`; break;
        }
    }
    //#endregion self
    //=============================================================


    //=============================================================
    //#region public
    public Hide() {
        this.node.active = false;
    }

    public Show() {
        this.node.active = true;
    }

    public ChangeStateLock() { this.UpdateState(STATE_VISUAL.LOCK) }
    public ChangeStatePreUnlock() { this.UpdateState(STATE_VISUAL.PREPARE_UNLOCK) }
    public ChangeStateUnlock() { this.UpdateState(STATE_VISUAL.UNLOCK) }

    public SetGrayOrUnGray(gray: boolean, canSetUnActive: boolean = true) {
        if (gray) {
            GrayAllNode(this.nGray, this.outlineColorLbLock);
            if (canSetUnActive) {
                this.btnItem.interactable = false;
            }
        } else {
            UnGrayAllNode(this.nGray, this.outlineColorLbNormal);
            this.btnItem.interactable = true;
        }
    }
    //#endregion public
    //=============================================================


    //==================================
    //#region event handle
    private UpdateNumItem(typeItem: TYPE_ITEM, numItem: number) {
        if (typeItem != this.typeItem) return;
        if (numItem < 0) numItem = 0;
        this.lbNumItem.string = numItem.toString();
        this.CheckCanShowAds();
    }
    //#endregion event handle
    //==================================

}

export function GrayAllNode(listNode: Node[], colorOutlineGray: Color) {
    // nếu node là Sprite => gray 
    // nếu node là label => add shader gray vào
    listNode.forEach((node: Node) => {
        const spCom = node.getComponent(Sprite);
        const lbCom = node.getComponent(Label);
        if (spCom != null) {
            spCom.grayscale = true;
        } else if (lbCom != null && colorOutlineGray != null) {
            lbCom.outlineColor = colorOutlineGray;
        }
    })
}

export function UnGrayAllNode(listNode: Node[], colorOutlineUngray: Color) {
    listNode.forEach((node: Node) => {
        const spCom = node.getComponent(Sprite);
        const lbCom = node.getComponent(Label);
        if (spCom != null) {
            spCom.grayscale = false;
        } else if (lbCom != null && colorOutlineUngray != null) {
            lbCom.outlineColor = colorOutlineUngray;
        }
    })
}
