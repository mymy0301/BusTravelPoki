import { _decorator, Button, Component, Label, Node, Prefab, Size, Sprite, tween, Tween, UIOpacity, UITransform, Vec3, Widget } from 'cc';
import { ItemUltimateSV } from '../../../Common/UltimateScrollView/ItemUltimateSV';
import { EVENT_LEVEL_PROGRESS, InfoPrizeLevelProgressionJSON, LEVEL_PROGRESS_DESCRIBE_NOTI, STATE_ITEM_LPr } from './TypeLevelProgress';
import { DataLevelProgressionSys } from '../../../DataBase/DataLevelProgressionSys';
import { ItemPrizeLevelProgression } from './ItemPrizeLevelProgression';
import { clientEvent } from '../../../framework/clientEvent';
import { TYPE_BUBBLE } from '../Others/Bubble/TypeBubble';
import { IPrize, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { CONFIG_SR } from '../UISpeedRace/TypeEventSpeedRace';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ItemLevelProgression')
export class ItemLevelProgression extends ItemUltimateSV {
    @property(Node) listNClaimed: Node[] = [];
    @property(Node) listNWaitToClaim: Node[] = [];
    @property(Node) listNCanNotClaim: Node[] = [];
    @property(Node) nLock: Node;
    @property(Node) nIcDone: Node;
    @property(UIOpacity) opaListItem: UIOpacity;
    @property(Sprite) spBgLevel: Sprite;
    @property(Sprite) spBgLayerItem: Sprite;
    @property(Sprite) spLight: Sprite;
    @property(Sprite) spProgress: Sprite;
    @property(Node) nBgProgress: Node;
    @property(Label) lbLevel: Label;
    @property(Button) btnClaim: Button;
    @property(Node) nAnchorNoti: Node;

    @property(Node) nLayoutPrize: Node;

    private _stateItem: STATE_ITEM_LPr = STATE_ITEM_LPr.CAN_NOT_CLAIM;

    private _cbGetSfBgLayer: CallableFunction = null;
    private _cbGetSfLight: CallableFunction = null;
    private _cbGetSfBgLevel: CallableFunction = null;
    private _cbGetSfChest: CallableFunction = null;
    private _cbAnimReceivePrize: CallableFunction = null;
    private _cbGenPrize: CallableFunction = null;
    private _cbReUseItems: CallableFunction = null;

    private _infoPrizeJson: InfoPrizeLevelProgressionJSON = null;

    private readonly MAX_HEIGHT_PROGRESS: number = 200;
    private readonly MAX_HEIGHT_PROGRESS_1: number = 300;

    private readonly POS_PROGRESS: Vec3 = new Vec3(0, -200, 0);
    private readonly POS_PROGRESS_1: Vec3 = new Vec3(0, -300, 0);

    private _listPrize: Node[] = [];

    //=====================================
    //#region Init
    public SetUpCB(cbGetSfBgLayer: CallableFunction, cbGetSfLight: CallableFunction, cbGetSfBgLevel: CallableFunction,
        cbGetSfChest: CallableFunction, cbAnimReceivePrize: CallableFunction,
        cbGenPrize: CallableFunction, cbReUseItems: CallableFunction) {
        this._cbGetSfBgLayer = cbGetSfBgLayer;
        this._cbGetSfLight = cbGetSfLight;
        this._cbGetSfBgLevel = cbGetSfBgLevel;
        this._cbGetSfChest = cbGetSfChest;
        this._cbAnimReceivePrize = cbAnimReceivePrize;
        this._cbGenPrize = cbGenPrize;
        this._cbReUseItems = cbReUseItems;
    }

    public SetUpData(data: InfoPrizeLevelProgressionJSON) {
        this._infoPrizeJson = data;

        //get state prize now
        const newState: STATE_ITEM_LPr = DataLevelProgressionSys.Instance.GetStatePrize(data);
        this.ChangeState(newState);

        //update UI info
        this.SetUIWithInfo(newState);

        // reUse prize
        this.ReUseItems();

        // init prize
        this.InitItems(newState);
    }
    //#endregion Init
    //=====================================

    //=====================================
    //#region self
    private SetUIWithInfo(state: STATE_ITEM_LPr) {
        const progresItem: number = DataLevelProgressionSys.Instance.GetProgressPrizeFromData(this._infoPrizeJson);

        // check if item index 1 => update ui progress 
        // check if not update to normal
        const progressTransCom = this.spProgress.node.getComponent(UITransform);
        const bgProgressTransCom = this.nBgProgress.getComponent(UITransform);
        const progressSizeRoot = progressTransCom.contentSize.clone();
        const bgProgressSizeRoot = bgProgressTransCom.contentSize.clone();
        const MaxProgressItem = this._infoPrizeJson.index == 1 ? this.MAX_HEIGHT_PROGRESS_1 : this.MAX_HEIGHT_PROGRESS;
        const PosProgressItem = this._infoPrizeJson.index == 1 ? this.POS_PROGRESS_1 : this.POS_PROGRESS;
        bgProgressTransCom.contentSize = new Size(bgProgressSizeRoot.width, MaxProgressItem);
        this.spProgress.node.position = PosProgressItem;


        // set progress
        const ratioProgress: number = progresItem / this._infoPrizeJson.require_progress;
        const newHeight = ratioProgress * MaxProgressItem;
        progressTransCom.contentSize = new Size(progressSizeRoot.x, newHeight);

        // set bgLevel + level
        this.lbLevel.string = this._infoPrizeJson.index.toString();
        const sfBgLevel = this._cbGetSfBgLevel && this._cbGetSfBgLevel(state);
        this.spBgLevel.spriteFrame = sfBgLevel;

        // set bg layer + light
        const sfBgLayer = this._cbGetSfBgLayer && this._cbGetSfBgLayer(state);
        this.spBgLayerItem.spriteFrame = sfBgLayer;
        const sfLight = this._cbGetSfLight && this._cbGetSfLight(state);
        this.spLight.spriteFrame = sfLight;
    }

    private ChangeState(newState: STATE_ITEM_LPr) {
        this._stateItem = newState;
        switch (newState) {
            case STATE_ITEM_LPr.CAN_NOT_CLAIM:
                break;
            case STATE_ITEM_LPr.CLAIMED:
                break;
            case STATE_ITEM_LPr.WAIT_TO_CLAIM:
                break;
        }
        this.UpdateUI(this._stateItem);
    }

    private UpdateUI(state: STATE_ITEM_LPr) {
        const sfBgLayer = this._cbGetSfBgLayer && this._cbGetSfBgLayer(state);
        const sfLight = this._cbGetSfLight && this._cbGetSfLight(state);
        const sfBgLevel = this._cbGetSfBgLevel && this._cbGetSfBgLevel(state);
        this.spBgLayerItem.spriteFrame = sfBgLayer;
        this.spBgLevel.spriteFrame = sfBgLevel;
        this.spLight.spriteFrame = sfLight;

        this.listNWaitToClaim.forEach(item => item.active = state == STATE_ITEM_LPr.WAIT_TO_CLAIM);
        this.listNClaimed.forEach(item => item.active = state == STATE_ITEM_LPr.CLAIMED);
        this.listNCanNotClaim.forEach(item => item.active = state == STATE_ITEM_LPr.CAN_NOT_CLAIM);

        this.opaListItem.opacity = state == STATE_ITEM_LPr.CLAIMED ? 255 / 2 : 255;
    }

    private RegisterClick() {

    }
    //#endregion self
    //=====================================

    //=====================================
    //#region items
    private ReUseItems() {
        this._cbReUseItems && this._cbReUseItems(this._listPrize);
        this._listPrize = [];
    }

    private InitItems(state: STATE_ITEM_LPr) {
        this._infoPrizeJson.listPrize.forEach(infoPrize => {
            const nPrize: Node = this._cbGenPrize && this._cbGenPrize(infoPrize);
            nPrize.getComponent(ItemPrizeLevelProgression).Init(infoPrize, state);
            this.nLayoutPrize.addChild(nPrize);
            this._listPrize.push(nPrize);
        })
    }
    //#endregion items
    //=====================================

    //=====================================
    //#region btn
    private onClickSelf() {
        // log event click in here

        const nWposAnchor = this.nAnchorNoti.worldPosition.clone();
        switch (this._stateItem) {
            case STATE_ITEM_LPr.CAN_NOT_CLAIM:
                LogEventManager.Instance.logButtonClick(`itemLevelProgress_lock`, "UILevelProgress");
                //notification play more to unlock this level
                clientEvent.dispatchEvent(EVENT_LEVEL_PROGRESS.NOTIFICATION.TEXT
                    , LEVEL_PROGRESS_DESCRIBE_NOTI
                    , TYPE_BUBBLE.BOTTOM_RIGHT
                    , nWposAnchor
                    , true
                    , this.node.parent.parent   // view
                    , null
                );
                this.AnimClickItem();
                break;
            case STATE_ITEM_LPr.WAIT_TO_CLAIM:
                this.BtnClaim();
                break;
            case STATE_ITEM_LPr.CLAIMED:
                LogEventManager.Instance.logButtonClick(`itemLevelProgress_claimed`, "UILevelProgress");
                //NOTE - Not do anything here
                break;
        }
    }

    private BtnClaim() {
        if (this._stateItem == STATE_ITEM_LPr.WAIT_TO_CLAIM) {
            LogEventManager.Instance.logButtonClick(`itemLevelProgress_claim`, "UILevelProgress");

            const dataPrize: IPrize[] = this._infoPrizeJson.listPrize;

            // update ui item
            this._listPrize.forEach(item => item.getComponent(ItemPrizeLevelProgression).ChangeState(STATE_ITEM_LPr.CLAIMED))

            // save data
            PrizeSys.Instance.AddPrize(dataPrize, "LevelProgress");
            DataLevelProgressionSys.Instance.ReceivePrize(this._infoPrizeJson);
            // anim
            const listWPos: Vec3[] = this._listPrize.map(item => item.worldPosition.clone());
            this._cbAnimReceivePrize(this._listPrize, listWPos);
            // update UI
            this.ChangeState(STATE_ITEM_LPr.CLAIMED);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LEVEL_PROGRESSION);
        }
    }
    //#endregion btn
    //=====================================


    //=====================================
    //#region anim
    /**
     * this func play anim when player click item
     * @returns 
     */
    private AnimClickItem() {
        // check if isPlaying anim claim , not do any anim in here
        const icLock = this.nLock
        const timeAnim = 0.6;

        function animLock() {
            Tween.stopAllByTarget(icLock);
            icLock.angle = 0;
            tween(icLock)
                .to(timeAnim / 24, { angle: 20 }, { easing: 'smooth' })
                .to(timeAnim / 12, { angle: -20 }, { easing: 'smooth' })
                .to(timeAnim / 12, { angle: 20 }, { easing: 'smooth' })
                .to(timeAnim / 12, { angle: -20 }, { easing: 'smooth' })
                .to(timeAnim / 12, { angle: 20 }, { easing: 'smooth' })
                .to(timeAnim / 24, { angle: 0 }, { easing: 'smooth' })
                .start();
        }

        switch (this._stateItem) {
            case STATE_ITEM_LPr.CAN_NOT_CLAIM:
                animLock();
                break;
        }
    }
    //#endregion anim
    //=====================================
}


