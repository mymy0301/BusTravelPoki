import { _decorator, easing, Label, Layout, Node, RealCurve, tween, Vec3 } from 'cc';
import { UIReceivePrizeLobbyBase } from './UIReceivePrizeLobbyBase';
import { ItemPrizeLobby_2 } from './ItemPrizeLobby_2';
import { AnimChestSys } from '../../../AnimsPrefab/AnimChestSys';
import { NameAnimChest_idle_after_open, NameAnimChest_open, NameAnimChest_wait_to_open } from '../../../Utils/TypeAnimChest';
import { Utils } from '../../../Utils/Utils';
import { MConfigs } from '../../../Configs/MConfigs';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { GameSoundEffect, IPrize, TYPE_CURRENCY, TYPE_PRIZE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { SoundSys } from '../../../Common/SoundSys';
import { CurrencySys } from '../../CurrencySys';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../../OtherUI/Others/AutoScale/TypeAutoScale';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { instanceOfIReceiveChestFromWPos, IReceiveChestFromWPos } from './TypeUIReceivePrizeLobby';
const { ccclass, property } = _decorator;

@ccclass('UIReceivePrizeLobby_Chest')
export class UIReceivePrizeLobby_Chest extends UIReceivePrizeLobbyBase {
    @property(Node) nTitle: Node;
    @property(Node) nLbTabContinue: Node;
    @property(AnimChestSys) animChest: AnimChestSys;
    @property([Label]) listLabel: Label[] = [];
    @property(Layout) layoutTotal: Layout;
    @property(Node) nParentItem: Node;

    @property(RealCurve) rc_x: RealCurve = new RealCurve();
    @property(RealCurve) rc_y: RealCurve = new RealCurve();
    @property(RealCurve) rc_scale: RealCurve = new RealCurve();

    private _isReceiveChestFromWPos: boolean = false;

    private readonly locItem = {
        "5P": [
            new Vec3(-200, -58, 0),
            new Vec3(-100, 0, 0),
            new Vec3(0, 0, 0),
            new Vec3(100, 0, 0),
            new Vec3(200, -58, 0)
        ],
        "4P": [
            new Vec3(-152, -58, 0),
            new Vec3(-53, 1.3, 0),
            new Vec3(53, 1.3, 0),
            new Vec3(152, -58, 0)
        ],
        "3P": [
            new Vec3(-135, -58, 0),
            new Vec3(0, 0, 0),
            new Vec3(135, -58, 0)
        ],
        "2P": [
            new Vec3(-100, 0, 0),
            new Vec3(100, 0, 0)
        ],
        "1P": [
            new Vec3(0, 0, 0)
        ]
    }

    private _cbPlayDone: CallableFunction = null;

    protected onEnable(): void {
        this.nBlockUI.active = true;
        // hide all UI
        this.SetPrepareUI();
        // play anim
    }

    protected onDisable(): void {
        // reUse items
        this.poolItemPrize.ReUseAllObjUsing(this.nParentPoolItem);
    }

    override async Play(): Promise<void> {

        // =================== set data prepare play anim ==================
        const actionPrize = this._dataCustom;

        // set title
        this.listLabel.forEach((label, index) => {
            label.string = actionPrize.nameTitle;
        });

        // get the list posItem
        let listPosItem: Vec3[] = [];
        const scaleItem: Vec3 = MConfigs.GetScaleItem(actionPrize.data.length);
        const scaleFont = MConfigs.GetFontSizeSuit(scaleItem.x);
        const posLabel = MConfigs.DistanceLocLabel(actionPrize.data.length);

        switch (actionPrize.data.length) {
            case 5: listPosItem = this.locItem["5P"]; break;
            case 4: listPosItem = this.locItem["4P"]; break;
            case 3: listPosItem = this.locItem["3P"]; break;
            case 2: listPosItem = this.locItem["2P"]; break;
            case 1: listPosItem = this.locItem["1P"]; break;
            default: listPosItem = this.locItem["1P"]; break;
        }

        // depend on dataPrize => gen prize suit with it
        for (let index = 0; index < actionPrize.data.length; index++) {
            const posItem = listPosItem[index] == null ? Vec3.ZERO : listPosItem[index];

            const iPrize = actionPrize.data[index];
            let itemPrize = this.poolItemPrize.GetObj();
            const itemPrizeCom = itemPrize.getComponent(ItemPrizeLobby_2);

            itemPrizeCom.SetUp(iPrize);
            itemPrizeCom.SetSizeLabel(scaleFont);
            itemPrizeCom.SetLocLabel(posLabel);
            itemPrizeCom.HideSkeleton();
            itemPrizeCom.HideVisualNode(0);

            itemPrize.active = true;
            itemPrize.parent = this.nParentItem;
            itemPrize.position = posItem;
            itemPrize.scale = scaleItem;
            this._listPrizes.push(itemPrize);
        }

        // depend on dataCustom is a list and check it has a param interface set to prize move from x to y
        this._isReceiveChestFromWPos = false;
        if (actionPrize.dataCustom != null) {
            try {
                const iReceiveChestFromWPos: IReceiveChestFromWPos = actionPrize.dataCustom.find(iCheck => instanceOfIReceiveChestFromWPos(iCheck));
                if (iReceiveChestFromWPos != null) {
                    this.animChest.node.worldPosition = iReceiveChestFromWPos.fromWPos;
                    this.animChest.node.scale = iReceiveChestFromWPos.scaleStart;
                    this._isReceiveChestFromWPos = true;
                }
            } catch (e) {

            }
        }


        // ==================== play anim ======================
        return new Promise<void>(async resolve => {
            await this.AnimShowUI(() => {
                resolve();
            })
        })
    }

    private SetPrepareUI() {
        // turn on block
        this.nBlockUI.active = true;

        // set title
        this.listLabel.forEach((label, index) => {
            label.string = "";
        });

        // clear list Prize
        this._listPrizes = [];

        this.listLabel.forEach((label, index) => {
            label.node.active = false;
        })

        this.nLbTabContinue.active = false;

        this.animChest.HideAnim();
    }

    public async AnimShowUI(cbDone: CallableFunction) {
        const self = this;
        const hasCustomChest = this._dataCustom != null && this._dataCustom.customAnimChest != null;
        this._cbPlayDone = cbDone;
        // console.log("AnimShowUI SOUND_REWARDS_SHOWSOUND_REWARDS_SHOWSOUND_REWARDS_SHOW");
        SoundSys.Instance.playSoundEffectOneShotDelayTime(GameSoundEffect.CHEST_CLAIM, 1, 0.2);
        // convert dataCustom to ActionReceivePrizeClass
        const actionPrize = this._dataCustom;
        let nameAnim: string = "";
        let nameAnimIdleOpen: string = "";
        let isOpenChestDone: boolean = true;

        // show avatar , name , title
        this.animChest.MEffect.node.scale = new Vec3(0.666, 0.666, 0.666);
        switch (true) {
            case (actionPrize.type == TYPE_RECEIVE_PRIZE_LOBBY.SEASON_PASS_CHEST || actionPrize.type == TYPE_RECEIVE_PRIZE_LOBBY.LEVEL_PASS_CHEST)
                && (actionPrize.indexUIPrize == 0):
                nameAnim = NameAnimChest_open.Chest_free;
                nameAnimIdleOpen = NameAnimChest_idle_after_open.Chest_free;
                this.animChest.MEffect.node.scale = Vec3.ONE;
                break;
            case (actionPrize.type == TYPE_RECEIVE_PRIZE_LOBBY.SEASON_PASS_CHEST || actionPrize.type == TYPE_RECEIVE_PRIZE_LOBBY.LEVEL_PASS_CHEST)
                && (actionPrize.indexUIPrize == 1):
                nameAnim = NameAnimChest_open.Chest_prenium;
                nameAnimIdleOpen = NameAnimChest_idle_after_open.Chest_prenium;
                this.animChest.MEffect.node.scale = Vec3.ONE;
                break;
            case actionPrize.type == TYPE_RECEIVE_PRIZE_LOBBY.FINISH_MAP_LOBBY:
                nameAnim = NameAnimChest_open.Box_blue;
                nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_blue;
                break;
            case actionPrize.type == TYPE_RECEIVE_PRIZE_LOBBY.TOURNAMENT:
                switch (actionPrize.indexUIPrize) {
                    case 0: nameAnim = NameAnimChest_open.Box_red; nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_red; break;
                    case 1: nameAnim = NameAnimChest_open.Box_pink; nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_pink; break;
                    case 2: nameAnim = NameAnimChest_open.Box_green; nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_green; break;
                }
            case actionPrize.type == TYPE_RECEIVE_PRIZE_LOBBY.DASH_RUSH:
                nameAnim = NameAnimChest_open.Box_red; nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_red;
                break;
            case actionPrize.type == TYPE_RECEIVE_PRIZE_LOBBY.SPEED_RACE:
                switch (actionPrize.indexUIPrize) {
                    case 0: nameAnim = NameAnimChest_open.Box_red; nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_red; break;
                    case 1: nameAnim = NameAnimChest_open.Box_pink; nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_pink; break;
                    case 2: nameAnim = NameAnimChest_open.Box_green; nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_green; break;
                }
                break;
            case actionPrize.type == TYPE_RECEIVE_PRIZE_LOBBY.HAT_RACE:
                switch (actionPrize.indexUIPrize) {
                    case 0: nameAnim = NameAnimChest_open.Box_red; nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_red; break;
                    case 1: nameAnim = NameAnimChest_open.Box_pink; nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_pink; break;
                    case 2: nameAnim = NameAnimChest_open.Box_green; nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_green; break;
                }
                break;
            case actionPrize.type == TYPE_RECEIVE_PRIZE_LOBBY.FINISH_BUILDING_CONSTRUCTOR_LOBBY:
                nameAnim = NameAnimChest_open.Box_blue; nameAnimIdleOpen = NameAnimChest_idle_after_open.Box_blue;
                break;
        }

        if (hasCustomChest && this._dataCustom.customAnimChest.cbOpenChest != null) { isOpenChestDone = false; }

        //======================= anim ========================
        const scaleItem: Vec3 = MConfigs.GetScaleItem(actionPrize.data.length);

        this.ShowShadowWithOpacity();

        // show title + header
        this.listLabel.forEach((label, index) => {
            label.node.active = true;
        });

        // tween move the chest to the pos zero
        if (this._isReceiveChestFromWPos) {
            const timeMoveChest: number = 0.5;
            const distanceX = this.animChest.node.getPosition().x;
            const distanceY = this.animChest.node.getPosition().y;
            const distanceScaleX = this.animChest.node.getScale().x - 1;


            tween(this.animChest.node)
                .to(timeMoveChest, {}, {
                    onUpdate(target, ratio) {
                        const trueX = distanceX * easing.quintOut(1 - ratio);
                        const trueY = distanceY * (1 - ratio);
                        const trueScaleX = 1 + distanceScaleX * self.rc_scale.evaluate(1 - ratio);
                        self.animChest.node.position = new Vec3(trueX, trueY, 0);
                        self.animChest.node.scale = Vec3.ONE.clone().multiplyScalar(trueScaleX);
                    },
                })
                .call(() => {
                    if (hasCustomChest) {
                        this._dataCustom.customAnimChest.cbOpenChest(this.animChest.node, () => { isOpenChestDone = true });
                    }
                })
                .start();
        }

        // play anim chest
        if (hasCustomChest) {
            this._dataCustom.customAnimChest.cbSetPrepareChest(this.animChest.node);
        } else {
            this.animChest.PlayAnim(nameAnim, false);
            this.animChest.AddAnim(nameAnimIdleOpen, true, 0);
        }

        await Utils.delay((MConfigs.timeWaitToMoveItems + 0.5) * 1000);
        await Utils.WaitReceivingDone(() => isOpenChestDone);

        const timeAnimMoveToBaseWPos = 0.2;
        const timeAnimDelayEachItem = 0.02;
        for (let i = 0; i < this._listPrizes.length; i++) {
            const itemPrize = this._listPrizes[i];
            itemPrize.scale = new Vec3(0.1, 0.1, 0.1);
            const itemPrizeCom = itemPrize.getComponent(ItemPrizeLobby_2);
            itemPrizeCom.ShowVisualNode(timeAnimMoveToBaseWPos, 50);
            await AniTweenSys.Scale(itemPrize, scaleItem, timeAnimMoveToBaseWPos);
            itemPrize.getComponent(ItemPrizeLobby_2).ShowSkeleton();
            await Utils.delay(timeAnimDelayEachItem * 1000);
        }
        // đợi phần thưởng cuối cùng hiển thị
        await Utils.delay(timeAnimMoveToBaseWPos * 1000);


        //======================= after anim done ================
        this.nBlockUI.active = false;
        this.nLbTabContinue.active = true;

        await Utils.delay(0.5 * 1000);  // delay to click

        this.registerClickShadow(this.onBtnContinue.bind(this));
    }

    private async onBtnContinue() {
        LogEventManager.Instance.logButtonClick("claim", "UIReceivePrizeLobby");

        // unregister click shadow
        this.unRegisterClickShadow(this.onBtnContinue.bind(this));

        // hide UI
        this.nBlockUI.active = true;
        this.nLbTabContinue.active = false;
        this.listLabel.forEach((label, index) => {
            label.node.active = false;
        })
        this.animChest.HideAnim();

        // hide shadow with opacity
        this.HideShadowWithOpacity();

        // move item to the locate it received
        const timeDelayEachItem = 0.1;
        const sizeWindow = Utils.getSizeWindow();
        let listPromise: Promise<any>[] = [];

        // turn off layout to ensure it not wrong when reUseObject in layout
        this.ChangeEnableLayoutItem(false);


        // kiểm tra chạy custom hoặc chạy auto
        if (this._dataCustom != null && this._dataCustom.customAnimReceive != null) {
            await this._dataCustom.customAnimReceive(this._listPrizes,
                (nItem: Node) => { this.poolItemPrize.ReUseObj(nItem); },
                (iPrize: IPrize) => { this.EmitToAfterAnim(iPrize); }
            );
        } else {
            for (let i = 0; i < this._listPrizes.length; i++) {
                const itemPrize = this._listPrizes[i];
                const itemCom = itemPrize.getComponent(ItemPrizeLobby_2);
                let wPosEnd: Vec3 = new Vec3(sizeWindow.width, 0, 0);
                let canNextLogic: boolean = false;


                switch (itemCom.prizeData.typePrize) {
                    case TYPE_PRIZE.TICKET:
                        clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_TICKET, (wPosUITicket: Vec3) => {
                            canNextLogic = true;
                            wPosEnd = wPosUITicket;
                        })
                        await Utils.WaitReceivingDone(() => { return canNextLogic })
                        break;
                    case TYPE_PRIZE.MONEY:
                        clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_COIN, (wPosUICoin: Vec3) => {
                            canNextLogic = true;
                            wPosEnd = wPosUICoin;
                        })
                        await Utils.WaitReceivingDone(() => { return canNextLogic })
                        break;
                    default:
                        clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_BTN_PLAY, (wPosBtnPlay: Vec3) => {
                            wPosEnd = wPosBtnPlay;
                            canNextLogic = true;
                        })
                        await Utils.WaitReceivingDone(() => { return canNextLogic })
                        break;
                }


                // prize money
                switch (itemCom.prizeData.typePrize) {
                    case TYPE_PRIZE.MONEY:
                        const wPosStart = itemCom.node.worldPosition.clone();
                        // ẩn item coin đi và hiển thị coin 3D
                        (async () => {
                            await itemCom.HideVisualNode(0.8);
                            this.poolItemPrize.ReUseObj(itemPrize);
                        })();

                        // hiển thị coin 3D
                        SoundSys.Instance.playSoundEffectOneShotDelayTime(GameSoundEffect.SOUND_REWARDS, 1, 0.1);
                        listPromise.push(this._superUIAnimCustom.ReceivePrizeCoin(null, itemCom.prizeData.value, wPosStart, wPosEnd,
                            null,
                            (numCoinIncrease: number) => {
                                CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numCoinIncrease);
                                clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.UI_COIN_PAGE_HOME);
                                clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_COIN_PAGE_HOME, null, null, MConfigs.FX_NEW_CUSTOM);
                            }));
                        break;
                    default:
                        listPromise.push(itemCom.MoveItemToPlaceEnd(wPosEnd.clone(), (nItem: Node) => {
                            this.poolItemPrize.ReUseObj(nItem);
                            this.EmitToAfterAnim(itemCom.prizeData);
                        }, new Vec3(0.2, 0.2, 0.2)));
                        break;
                }
            }

            // await all promise item done
            await Promise.all(listPromise);
        }

        this._cbPlayDone();

        //turn on layout to ensure
        this.ChangeEnableLayoutItem(true);
    }

    public EmitToAfterAnim(prize: IPrize) {
        const numItem = prize.value
        switch (prize.typePrize) {
            case TYPE_PRIZE.TICKET:
                CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.TICKET, numItem);
                clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_TICKET_PAGE_HOME);
                break;
            case TYPE_PRIZE.MONEY:
                CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numItem);
                break;
            default:
                clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_BTN_PLAY_PAGE_HOME);
                clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.BTN_PLAY_LOBBY);
                break;
        }
    }
}


