import { _decorator, CCFloat, Color, Component, instantiate, Label, Node, Prefab, Size, Sprite, SpriteFrame, Tween, tween, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { InfoPrizePass, IPrize, TYPE_CURRENCY, TYPE_EVENT_GAME, TYPE_PRIZE } from '../../../Utils/Types';
import { ItemPrizeLobby } from '../UIReceivePrize/ItemPrizeLobby';
import { DataLevelPassSys } from '../../../DataBase/DataLevelPassSys';
import { CurrencySys } from '../../CurrencySys';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import * as I18n from 'db://i18n/LanguageData';
import { DataShopSys } from '../../DataShopSys';
import { CONFIG_LP, EVENT_LEVEL_PASS, LEVEL_PASS_DESCRIBE_NOTI } from './TypeLevelPass';
import { TYPE_BUBBLE } from '../Others/Bubble/TypeBubble';
import { ICustomBubble } from '../Others/Bubble/BubbleSys';
import { MConfigs } from '../../../Configs/MConfigs';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { Utils } from '../../../Utils/Utils';
import { CaculTimeEvents2 } from '../../LobbyScene/CaculTimeEvents2';
import { PokiSDKManager } from '../../../Utils/poki/PokiSDKManager';
const { ccclass, property } = _decorator;

export enum STATE_ITEM_PRIZE_LEVEL_PASS {
    CAN_NOT_CLAIM,
    WAIT_TO_CLAIM,
    CLAIMED
}

export function GetNameStateItemPrizeLevelPass(state: STATE_ITEM_PRIZE_LEVEL_PASS) {
    switch (state) {
        case STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM:
            return 'CAN_NOT_CLAIM';
        case STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM:
            return 'WAIT_TO_CLAIM';
        case STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED:
            return 'CLAIMED';
        default:
            return 'null';
    }
}

@ccclass('ItemPrizeLevelPass')
export class ItemPrizeLevelPass extends Component {
    @property(Node) nPrizeFree: Node;
    @property(Node) nPrizePremium: Node;
    @property(Node) nLight: Node;
    @property(Node) nTichV_Free: Node;
    @property(Node) nTichV_Prenium: Node;
    @property(Label) lbLevel: Label;
    @property(Node) btnClaimFree: Node
    @property(Node) btnClaimPremium: Node
    @property(Node) icLockFree: Node;
    @property(Node) icLockPremium: Node;
    @property(Sprite) spProgress_1: Sprite;
    @property(Sprite) spProgress_2: Sprite;
    @property(Sprite) bgLevel: Sprite;
    @property(Node) nParticle: Node;
    @property([Sprite]) listSpShadowByReceived_Free: Sprite[] = [];
    @property([Sprite]) listSpShadowByReceived_Prenium: Sprite[] = [];

    @property(Node) nPosPrizeFree: Node;
    @property(Node) nPosPrizePrenium: Node;

    @property(CCFloat) diffYForChest: number = -10;
    @property(SpriteFrame) sfCoinSpe_1: SpriteFrame;
    @property(SpriteFrame) sfCoinSpe_2: SpriteFrame;

    private _itemPrizePrefab: Prefab = null
    private _infoItem: InfoPrizePass = null; public get InfoItem(): InfoPrizePass { return this._infoItem; }
    private _stateFree: STATE_ITEM_PRIZE_LEVEL_PASS = STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM;
    private _statePremium: STATE_ITEM_PRIZE_LEVEL_PASS = STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM;
    private _nVisualPrizeFree: Node = null;
    private _nVisualPrizePremium: Node = null;
    private _sfBgLvLock: SpriteFrame = null;
    private _sfBgLvUnlock: SpriteFrame = null;
    private _cbPlayAnimPrizeNormal: CallableFunction = null;

    private readonly scaleItemPrize: Vec3 = new Vec3(1.5, 1.5, 1.5);
    private readonly distanceLocChestNormal = new Vec3(-20, -20, 0); // because the anchor bg is not 0.5 0.5 < suit with item normal>
    private readonly distanceLocChestPremium = new Vec3(-10, -20, 0); // because the anchor bg is not 0.5 0.5 < suit with item normal>

    //#region public SetUp
    public SetUpUINormal(info: InfoPrizePass, itemPrize: Prefab, sfBgLvLock: SpriteFrame, sfBgLvUnlock: SpriteFrame) {
        this.BaseSetUp(info, itemPrize, sfBgLvLock, sfBgLvUnlock);

        const listPrizeFree: IPrize[] = info.listItemsPassFree;
        const listPrizePremium: IPrize[] = info.listItemsPassPremium;

        this._nVisualPrizeFree = instantiate(this._itemPrizePrefab);
        this._nVisualPrizePremium = instantiate(this._itemPrizePrefab);
        this._nVisualPrizeFree.getComponent(ItemPrizeLobby).SetUp(listPrizeFree[0], Vec3.ZERO, 1);
        this._nVisualPrizeFree.getComponent(ItemPrizeLobby).ScaleSelfSpecial(this.scaleItemPrize);
        this._nVisualPrizePremium.getComponent(ItemPrizeLobby).ScaleSelfSpecial(this.scaleItemPrize);
        const isPrizeCoinPrenium = listPrizePremium[0].typePrize == TYPE_PRIZE.MONEY;
        this._nVisualPrizePremium.getComponent(ItemPrizeLobby).SetUp(listPrizePremium[0], Vec3.ZERO, 1, !isPrizeCoinPrenium);
        if (isPrizeCoinPrenium && this._nVisualPrizePremium != null) {
            this._nVisualPrizePremium.getComponent(ItemPrizeLobby).icItem.spriteFrame = this.sfCoinSpe_2;
            this._nVisualPrizePremium.getComponent(ItemPrizeLobby).icItem.node.scale = this.scaleItemPrize.clone().multiplyScalar(0.8);
        }
        this._nVisualPrizeFree.setParent(this.nPrizeFree); this._nVisualPrizeFree.setWorldPosition(this.nPosPrizeFree.worldPosition.clone());
        this._nVisualPrizePremium.setParent(this.nPrizePremium); this._nVisualPrizePremium.setWorldPosition(this.nPosPrizePrenium.worldPosition.clone());
        this._nVisualPrizeFree.getComponent(ItemPrizeLobby).lbNum.node.position = new Vec3(0, -40, 0);
        this._nVisualPrizePremium.getComponent(ItemPrizeLobby).lbNum.node.position = new Vec3(0, -40, 0);

        //updateStateAgain
        this.UpdateState(0, this._stateFree);
        this.UpdateState(1, this._statePremium);
    }

    public SetUpUIChest(info: InfoPrizePass, itemPrize: Prefab, sfChestFree: SpriteFrame
        , listChestPremium: SpriteFrame[], sfBgLvLock: SpriteFrame, sfBgLvUnlock: SpriteFrame) {
        this.BaseSetUp(info, itemPrize, sfBgLvLock, sfBgLvUnlock);
        // init node and add component sprite => then use spriteFrame suit with it
        let indexChest = -1;
        switch (info.index) {
            case 4: indexChest = 1; break;
            case 9: indexChest = 1; break;
            case 19: indexChest = 1; break;
            case 29: indexChest = 2; break;
            default: indexChest = -1; break;
        }

        if (indexChest == -1) return;

        this._nVisualPrizeFree = new Node();
        this._nVisualPrizePremium = new Node();
        this._nVisualPrizeFree.addComponent(Sprite).spriteFrame = sfChestFree;
        this._nVisualPrizePremium.addComponent(Sprite).spriteFrame = listChestPremium[indexChest];
        this._nVisualPrizeFree.setParent(this.nPrizeFree); this._nVisualPrizeFree.setWorldPosition(this.nPosPrizeFree.worldPosition.clone().add3f(0, this.diffYForChest, 0));
        this._nVisualPrizePremium.setParent(this.nPrizePremium); this._nVisualPrizePremium.setWorldPosition(this.nPosPrizePrenium.worldPosition.clone().add3f(0, this.diffYForChest, 0));

        //updateStateAgain
        this.UpdateState(0, this._stateFree);
        this.UpdateState(1, this._statePremium);
    }

    public SetBgLevelIndex0(sf: SpriteFrame) {
        this.bgLevel.spriteFrame = sf;
        this.lbLevel.node.active = false;
    }

    private sizeH = 220;
    public SetProgressIndex0() {
        let sizeP1 = this.spProgress_1.node.getComponent(UITransform).contentSize.clone();
        let sizeP2 = this.spProgress_2.node.getComponent(UITransform).contentSize.clone();
        sizeP1.height = sizeP2.height = this.sizeH;
        this.spProgress_1.node.getComponent(UITransform).setContentSize(sizeP1.width, sizeP1.height);
        this.spProgress_2.node.getComponent(UITransform).setContentSize(sizeP2.width, sizeP2.height);

        this.spProgress_1.node.position.add3f(0, -5, 0);
        this.spProgress_2.node.position.add3f(0, -5, 0);
    }

    public SetUpUIIndex0(info: InfoPrizePass, itemPrize: Prefab, sfBgLvLock: SpriteFrame, sfBgLvUnlock: SpriteFrame, prizeSpecial: Node) {
        this.BaseSetUp(info, itemPrize, sfBgLvLock, sfBgLvUnlock);

        const listPrizeFree: IPrize[] = this._infoItem.listItemsPassFree;
        // free is normal prize like the other
        this._nVisualPrizeFree = instantiate(this._itemPrizePrefab);
        this._nVisualPrizeFree.getComponent(ItemPrizeLobby).ScaleSelfSpecial(this.scaleItemPrize);
        this._nVisualPrizeFree.getComponent(ItemPrizeLobby).lbNum.node.position = new Vec3(0, -40, 0);
        this._nVisualPrizeFree.getComponent(ItemPrizeLobby).SetUp(listPrizeFree[0], Vec3.ZERO, 1);
        this._nVisualPrizeFree.setParent(this.nPrizeFree); this._nVisualPrizeFree.setWorldPosition(this.nPosPrizeFree.worldPosition.clone());

        // but in premium set other type
        prizeSpecial.active = true;
        this._nVisualPrizePremium = prizeSpecial;
        this._nVisualPrizePremium.setParent(this.nPrizePremium); this._nVisualPrizePremium.setWorldPosition(this.nPosPrizePrenium.worldPosition.clone());

        this.spProgress_1.fillRange = 1;
    }

    public SetUpCallbackReceivePrizeNormal(cbPlayAnimPrizeNormal: CallableFunction) {
        this._cbPlayAnimPrizeNormal = cbPlayAnimPrizeNormal;
    }
    //#endregion 

    //#region self func

    /**
     * this func just can been called when you active level pass first time
     * @param levelPlayerNow 
     */
    public async unlockLevelPassPremium(levelPlayerNow: number) {
        // just update state of premium again 
        let isClaimed = DataLevelPassSys.Instance.IsClaimPrizeAtLevel(this._infoItem.index);
        if (levelPlayerNow > this._infoItem.index) {
            // you can do some anim unlock lock when it opened
            if (!isClaimed.premium) {
                await this.AnimUnlockPremium();
            }
            this.UpdateState(1, isClaimed.premium ? STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED : STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM);
        } else {
            this.UpdateState(1, STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM);
        }
    }
    private BaseSetUp(info: InfoPrizePass, itemPrize: Prefab, sfBgLvLock: SpriteFrame, sfBgLvUnlock: SpriteFrame) {
        this._itemPrizePrefab = itemPrize;
        this._infoItem = info;
        this._sfBgLvLock = sfBgLvLock;
        this._sfBgLvUnlock = sfBgLvUnlock;
        const isBuyPass = DataLevelPassSys.Instance.IsActivePass();

        // set label
        this.lbLevel.string = info.index.toString();

        // check the level of player is reach 
        const levelPlayer = DataLevelPassSys.Instance.GetLevelNow();
        let levelPlayerNow = levelPlayer.level;
        const progressShow = levelPlayer.progressBar;

        // in special case last prize
        if (levelPlayerNow == MConfigs.MAX_PRIZE_LEVEL_PASS && info.index == MConfigs.MAX_PRIZE_LEVEL_PASS - 1) {
            // maybe can claim or was claim
            let isClaimed = DataLevelPassSys.Instance.IsClaimPrizeAtLevel(info.index);
            this.UpdateState(0, isClaimed.free ? STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED : STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM);
            this.UpdateState(1, isClaimed.premium ? STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED : (isBuyPass ? STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM : STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM));
            this.spProgress_1.fillRange = 0.5;
        }
        else if (levelPlayerNow - 1 == info.index) {
            // maybe can claim or was claim
            let isClaimed = DataLevelPassSys.Instance.IsClaimPrizeAtLevel(info.index);
            this.UpdateState(0, isClaimed.free ? STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED : STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM);
            this.UpdateState(1, isClaimed.premium ? STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED : (isBuyPass ? STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM : STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM));
            this.spProgress_1.fillRange = progressShow + 0.5 > 1 ? 1 : progressShow + 0.5;
            // this.bgLevel.spriteFrame = this._sfBgLvUnlock;
        }
        else if (levelPlayerNow == info.index) {
            this.UpdateState(0, STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM);
            this.UpdateState(1, STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM);
            this.spProgress_1.fillRange = progressShow > 0.5 ? progressShow - 0.5 : 0;
        }
        else if (levelPlayerNow > info.index) {
            // maybe can claim or was claim
            let isClaimed = DataLevelPassSys.Instance.IsClaimPrizeAtLevel(info.index);
            this.UpdateState(0, isClaimed.free ? STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED : STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM);
            this.UpdateState(1, isClaimed.premium ? STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED : (isBuyPass ? STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM : STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM));
            this.spProgress_1.fillRange = 1;
            // this.bgLevel.spriteFrame = this._sfBgLvUnlock;
        }
        else {
            this.UpdateState(0, STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM);
            this.UpdateState(1, STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM);
            this.spProgress_1.fillRange = 0;
            // this.bgLevel.spriteFrame = this._sfBgLvLock;
        }
    }

    /**
    * 
    * @param index 0: free | 1 : premium
    * @param newState 
    */
    public UpdateState(index: 0 | 1, newState: STATE_ITEM_PRIZE_LEVEL_PASS) {
        if (index == 0) {
            this._stateFree = newState;
        } else {
            this._statePremium = newState;
        }

        // free pass
        switch (this._stateFree) {
            case STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM:
                this.btnClaimFree.active = false;
                this.icLockFree.active = true;
                this.nParticle.active = true;
                this.nLight.active = false;
                this.nTichV_Free.active = false;
                UnShadowListSprite(this.listSpShadowByReceived_Free, this._nVisualPrizeFree);
                break;
            case STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM:
                this.btnClaimFree.active = true;
                this.icLockFree.active = false;
                this.nParticle.active = true;
                this.nLight.active = true;
                this.nTichV_Free.active = false;
                UnShadowListSprite(this.listSpShadowByReceived_Free, this._nVisualPrizeFree);
                break;
            case STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED:
                this.btnClaimFree.active = false;
                this.icLockFree.active = false;
                this.nParticle.active = false;
                this.nLight.active = false;
                this.nTichV_Free.active = true;
                ShadowListSprite(this.listSpShadowByReceived_Free, this._nVisualPrizeFree);
                break;
        }

        // premium pass
        switch (this._statePremium) {
            case STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM:
                this.btnClaimPremium.active = false;
                this.icLockPremium.active = true;
                this.nTichV_Prenium.active = false;
                UnShadowListSprite(this.listSpShadowByReceived_Prenium, this._nVisualPrizePremium);
                break;
            case STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM:
                this.btnClaimPremium.active = true;
                this.icLockPremium.active = false;
                this.nTichV_Prenium.active = false;
                UnShadowListSprite(this.listSpShadowByReceived_Prenium, this._nVisualPrizePremium);
                break;
            case STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED:
                this.btnClaimPremium.active = false;
                this.icLockPremium.active = false;
                this.nTichV_Prenium.active = true;
                ShadowListSprite(this.listSpShadowByReceived_Prenium, this._nVisualPrizePremium);
                break;
        }
    }

    private AnimUnlockPremium() {
        const timeAnim = 1;
        const basePos = this.icLockPremium.position.clone();
        const endPos = basePos.add3f(10, -100, 0);
        this.icLockPremium.getComponent(UIOpacity).opacity = 255;
        const self = this;
        return new Promise<void>((resolve) => {
            Tween.stopAllByTarget(this.icLockPremium);
            tween(this.icLockPremium)
                .to(timeAnim, { position: endPos, angle: -70 }, {
                    easing: 'smooth', onUpdate(target, ratio) {
                        self.icLockPremium.getComponent(UIOpacity).opacity = (1 - ratio) * 255;
                    },
                })
                .call(() => {
                    self.icLockPremium.active = false;
                    self.icLockPremium.position = basePos;
                    resolve();
                })
                .start();
        })
    }

    /**
     * this func play anim when player click item
     * @param indexTypeCheck 0 = free , 1 = premium
     * @returns 
     */
    private AnimClickItem(indexTypeCheck: number) {
        // check if isPlaying anim claim , not do any anim in here
        if (this._isPlayingAnimReceive) return;
        let stateCheck = indexTypeCheck == 0 ? this._stateFree : this._statePremium;
        let icLock = indexTypeCheck == 0 ? this.icLockFree : this.icLockPremium;
        let nItem = indexTypeCheck == 0 ? this.nPrizeFree : this.nPrizePremium;
        const timeAnim = 0.6;

        function animItem() {
            Tween.stopAllByTarget(nItem);
            nItem.scale = Vec3.ONE;
            tween(nItem)
                .to(timeAnim / 2, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: 'smooth' })
                .to(timeAnim / 2, { scale: Vec3.ONE }, { easing: 'smooth' })
                .start();
        }

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

        switch (stateCheck) {
            case STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM:
                animLock();
                // animItem();
                break;
            case STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM:
                // not do any anim in here
                break;
            case STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED:
                // animItem();
                break;
        }
    }
    //#endregion

    //#region common func
    public CanReceivePrizeFreeOrPremium(): boolean {
        if (this._stateFree == STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM || this._statePremium == STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM) {
            return true;
        }
        return false;
    }


    public GetPrizeFreeIfCanReceive(): IPrize[] {
        if (this._stateFree == STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM) {
            return this._infoItem.listItemsPassFree;
        }
        return [];
    }

    public GetPrizePremiumIfCanReceive(): IPrize[] {
        if (this._statePremium == STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM) {
            return this._infoItem.listItemsPassPremium;
        }
        return [];
    }

    public GetStateFree() { return this._stateFree; }
    //#endregion common func

    //#region func anim receive prize
    private _isPlayingAnimReceive: boolean = false;
    private async ClaimItemFree() {
        // receiveChest 
        // check the index to decideWhich indexChest is suitable with anim
        let indexChest = -1;
        switch (this._infoItem.index) {
            case 4: indexChest = 0; break;
            case 9: indexChest = 0; break;
            case 9: indexChest = 0; break;
            case 19: indexChest = 1; break;
            case 29: indexChest = 2; break;
        }

        //save received prize item
        DataLevelPassSys.Instance.SaveClaimPrizeAtLevel(this._infoItem.index, 'free', true);

        if (indexChest != -1) {
            PrizeSys.Instance.AddPrize(DataLevelPassSys.Instance.GetListPrizeAtLevel(this._infoItem.index).free, 'LevelPass_ClaimPrizeFree', true, false);
            // the receive chest in lobby already claim prize
            clientEvent.dispatchEvent(EVENT_LEVEL_PASS.RECEIVE_CHEST, this._infoItem.listItemsPassFree, 0, 'LevelPass_ClaimPrizeFree');
        } else {
            const visualPrize: Node = this._nVisualPrizeFree;
            const wPos: Vec3 = this._nVisualPrizeFree.worldPosition.clone();
            // call save claim prize in here
            // save the prize was claimed => do not call save in this func because in the func addPrize it was call save data
            PrizeSys.Instance.AddPrize(DataLevelPassSys.Instance.GetListPrizeAtLevel(this._infoItem.index).free, 'LevelPass_ClaimPrizeFree');
            await this._cbPlayAnimPrizeNormal(visualPrize, wPos);
        }
    }

    private async ClaimItemPremium() {
        // receiveChest 
        // check the index to decideWhich indexChest is suitable with anim
        let indexChest = -1;
        switch (this._infoItem.index) {
            case 4: indexChest = 1; break;
            case 9: indexChest = 1; break;
            case 19: indexChest = 1; break;
            case 29: indexChest = 2; break;
        }

        //save received prize item
        DataLevelPassSys.Instance.SaveClaimPrizeAtLevel(this._infoItem.index, 'prenium', true);

        if (indexChest != -1 && this._infoItem.index != 0) {
            PrizeSys.Instance.AddPrize(DataLevelPassSys.Instance.GetListPrizeAtLevel(this._infoItem.index).premium, 'LevelPass_ClaimPrizePremium', true, false);
            // the receive chest in lobby already claim prize
            clientEvent.dispatchEvent(EVENT_LEVEL_PASS.RECEIVE_CHEST, this._infoItem.listItemsPassPremium, indexChest, 'LevelPass_ClaimPrizePremium');
        } else {
            //================== play anim ================
            const visualPrize: Node = this._nVisualPrizePremium;
            const wPos: Vec3 = this._nVisualPrizePremium.worldPosition.clone();
            // call save claim prize in here
            // save the prize was claimed => do not call save in this func because in the func addPrize it was call save data
            PrizeSys.Instance.AddPrize(DataLevelPassSys.Instance.GetListPrizeAtLevel(this._infoItem.index).premium, 'LevelPass_ClaimPrizePremium');
            await this._cbPlayAnimPrizeNormal(visualPrize, wPos);
        }
    }
    //#endregion

    //#region common btn
    private onBtnItemFree() {
        LogEventManager.Instance.logButtonClick(`free_prize_${GetNameStateItemPrizeLevelPass(this._stateFree)}`, "ItemUILevelPass");

        const index = this._infoItem.index;
        const wLocShowNotification = this.nPosPrizeFree.worldPosition.clone();

        // play anim item
        this.AnimClickItem(0);

        // check state item to call claim item
        if (this._stateFree == STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM) {
            // // kiểm tra xe nếu như chỉ có 1 item chưa nhận thưởng => thì ta sẽ chạy theo logic như này
            // // còn nếu người chơi có nhiều hơn 1 itemPrize chưa nhận thưởng thì ta sẽ bắn sang giao diện nhận thưởng của lobby để nhận thưởng một lượt
            // if (DataLevelPassSys.Instance.GetNumPrizeCanClaim() == 1) {
            //     this.ClaimItemFree();
            //     this.UpdateState(0, STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED);
            // } else {
            //     clientEvent.dispatchEvent(EVENT_LEVEL_PASS.RECEIVE_LIST_ITEM_PRIZE);
            // }

            this.ClaimItemFree();
            this.UpdateState(0, STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED);
        } else if (this._stateFree == STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM) {
            if (index == 4 || index == 9 || index == 19 || index == 29) {
                let iCustomBubble: ICustomBubble = null;
                if (index == 4) {
                    iCustomBubble = {
                        bb: [0, 0, -120, 0],
                        ar: [0, 0, 120, 0]
                    }
                }
                else if (index == 9) {
                    iCustomBubble = {
                        ar: [0, 0, 35, 0],
                    }
                }

                clientEvent.dispatchEvent(EVENT_LEVEL_PASS.NOTIFICATION.ITEMS,
                    Array.from(this._infoItem.listItemsPassFree)
                    , TYPE_BUBBLE.BOTTOM_LEFT
                    , wLocShowNotification
                    , true
                    , this.node.parent
                    , iCustomBubble
                )
            } else {
                const iCustomBubble: ICustomBubble = {
                    ar: [0, 0, 10, 0]
                }

                clientEvent.dispatchEvent(EVENT_LEVEL_PASS.NOTIFICATION.TEXT
                    , LEVEL_PASS_DESCRIBE_NOTI.NOTIFI_CAN_NOT_COLLECTED_FREE
                    , TYPE_BUBBLE.BOTTOM_LEFT
                    , wLocShowNotification
                    , true
                    , this.node.parent
                    , iCustomBubble
                );
            }
        } else {
            clientEvent.dispatchEvent(EVENT_LEVEL_PASS.NOTIFICATION.TEXT
                , LEVEL_PASS_DESCRIBE_NOTI.NOTIFI_HAS_COLLECTED
                , TYPE_BUBBLE.BOTTOM_LEFT
                , wLocShowNotification
                , true
                , this.node.parent
            );
        }
    }

    private onBtnItemPremium() {
        LogEventManager.Instance.logButtonClick(`prenium_prize_${GetNameStateItemPrizeLevelPass(this._statePremium)}`, "ItemUILevelPass");

        const index = this._infoItem.index;
        const isBuyPass = DataLevelPassSys.Instance.IsActivePass();
        const wLocShowNotification = this.nPosPrizePrenium.worldPosition.clone();
        // play anim item
        this.AnimClickItem(1);

        // check state item to call claim item
        if (this._statePremium == STATE_ITEM_PRIZE_LEVEL_PASS.WAIT_TO_CLAIM) {
            // // kiểm tra xe nếu như chỉ có 1 item chưa nhận thưởng => thì ta sẽ chạy theo logic như này
            // // còn nếu người chơi có nhiều hơn 1 itemPrize chưa nhận thưởng thì ta sẽ bắn sang giao diện nhận thưởng của lobby để nhận thưởng một lượt
            // if (DataLevelPassSys.Instance.GetNumPrizeCanClaim() == 1) {
            //     this.ClaimItemPremium();
            //     this.UpdateState(1, STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED);
            // } else {
            //     clientEvent.dispatchEvent(EVENT_LEVEL_PASS.RECEIVE_LIST_ITEM_PRIZE);
            // }

            PokiSDKManager.Instance.Show_RewardedVideoAsync(this.node.name, "btnItemPremium", async (err, succ) => {
                this.ClaimItemPremium();
                this.UpdateState(1, STATE_ITEM_PRIZE_LEVEL_PASS.CLAIMED);
            });
            
        } else if (this._statePremium == STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM) {
            if (index == 4 || index == 9 || index == 19 || index == 29) {
                clientEvent.dispatchEvent(EVENT_LEVEL_PASS.NOTIFICATION.ITEMS
                    , Array.from(this._infoItem.listItemsPassPremium)
                    , TYPE_BUBBLE.BOTTOM_RIGHT
                    , wLocShowNotification
                    , true
                    , this.node.parent
                )
            } else {
                if (!isBuyPass && index == 0) {
                    // this.ShowUIPopUpBuyLevelPass();
                } else {
                    clientEvent.dispatchEvent(EVENT_LEVEL_PASS.NOTIFICATION.TEXT
                        , isBuyPass ? LEVEL_PASS_DESCRIBE_NOTI.NOTIFI_CAN_NOT_COLLECTED_FREE : LEVEL_PASS_DESCRIBE_NOTI.NOTIFI_CAN_NOT_COLLECTED_PREMIUM
                        , TYPE_BUBBLE.BOTTOM_RIGHT
                        , wLocShowNotification
                        , true
                        , this.node.parent
                    );
                }

            }
        } else {
            clientEvent.dispatchEvent(EVENT_LEVEL_PASS.NOTIFICATION.TEXT
                , isBuyPass ? LEVEL_PASS_DESCRIBE_NOTI.NOTIFI_HAS_COLLECTED : LEVEL_PASS_DESCRIBE_NOTI.NOTIFI_CAN_NOT_COLLECTED_PREMIUM
                , TYPE_BUBBLE.BOTTOM_RIGHT
                , wLocShowNotification
                , true
                , this.node.parent
            );
        }
    }

    private onBtnLevel() {
        LogEventManager.Instance.logButtonClick(`level`, "ItemUILevelPass");

        const wLocShowNotification = this.lbLevel.node.worldPosition.clone();
        if (this._stateFree == STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM) {
            const iCustomBubble: ICustomBubble = {
                bb: [30, 0, 0, 0],
            }

            clientEvent.dispatchEvent(EVENT_LEVEL_PASS.NOTIFICATION.TEXT
                , LEVEL_PASS_DESCRIBE_NOTI.NOTIFI_CAN_NOT_COLLECTED_FREE
                , TYPE_BUBBLE.BOTTOM_MID
                , wLocShowNotification
                , true
                , this.node.parent
                , iCustomBubble
            );
        } else {
            // not show any notification in this situation
        }
    }
    //#endregion

    // private ShowUIPopUpBuyLevelPass() {
    //     const idBundle = DataShopSys.Instance.getIdBundle('LevelPass');
    //     if (FBInstantManager.Instance.checkHaveIAPPack_byProductID(idBundle)) {
    //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
    //         clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_POPUP_BUY_LEVEL_PASS, 1, true, null, false);
    //     } else {
    //         clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
    //     }

    // }
}

const shadowProgress = 200;
function ShadowListSprite(listSp: Sprite[], itemPrize: Node) {
    const colorShadow = new Color(shadowProgress, shadowProgress, shadowProgress);
    listSp.forEach(sp => {
        sp.color = colorShadow;
    })

    // =======================================
    const itemPrizeLobbyCom = itemPrize?.getComponent(ItemPrizeLobby);
    const spComItem = itemPrize?.getComponent(Sprite);
    switch (true) {
        // trường hợp itemPrizeLobby
        case itemPrize != null && itemPrizeLobbyCom != null:
            itemPrizeLobbyCom.ShadowPrize(shadowProgress);
            break;
        // trường hợp chest
        case itemPrize != null && spComItem != null:
            spComItem.color = colorShadow;
            break;
    }
}

function UnShadowListSprite(listSp: Sprite[], itemPrize: Node) {
    listSp.forEach(sp => {
        sp.color = new Color(255, 255, 255);
    })

    // =======================================
    const itemPrizeLobbyCom = itemPrize?.getComponent(ItemPrizeLobby);
    const spComItem = itemPrize?.getComponent(Sprite);
    switch (true) {
        // trường hợp itemPrizeLobby
        case itemPrize != null && itemPrizeLobbyCom != null:
            itemPrizeLobbyCom.UnShadowPrize();
            break;
        // trường hợp chest
        case itemPrize != null && spComItem != null:
            spComItem.color = new Color(255, 255, 255);
            break;
    }
}


