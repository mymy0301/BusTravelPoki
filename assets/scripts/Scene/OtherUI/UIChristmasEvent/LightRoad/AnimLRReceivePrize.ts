/**
 * 
 * anhngoxitin01
 * Thu Nov 20 2025 09:40:21 GMT+0700 (Indochina Time)
 * AnimLRReceivePrize
 * db://assets/scripts/Scene/OtherUI/UIChristmasEvent/LightRoad/AnimLRReceivePrize.ts
*
*/
import { _decorator, Component, instantiate, Node, Vec3 } from 'cc';
import { IInfoChestLightRoad } from './TypeLightRoad';
import { ActionReceivePrizeClass, IReceiveChestFromWPos } from '../../../LobbyScene/UIReceivePrizeLobby/TypeUIReceivePrizeLobby';
import { ItemPrizeLobby_2 } from '../../../LobbyScene/UIReceivePrizeLobby/ItemPrizeLobby_2';
import { GameSoundEffect, TYPE_CURRENCY, TYPE_PRIZE } from 'db://assets/scripts/Utils/Types';
import { SoundSys } from 'db://assets/scripts/Common/SoundSys';
import { SuperUIAnimCustom } from '../../SuperUIAnimCustom';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { CurrencySys } from '../../../CurrencySys';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../../Others/AutoScale/TypeAutoScale';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from 'db://assets/scripts/AnimsPrefab/Fx_building/Type_FxBuilding';
import { MConfigs } from 'db://assets/scripts/Configs/MConfigs';
import { ResourceUtils } from 'db://assets/scripts/Utils/ResourceUtils';
import { UIReceivePrizeLobbyBase } from '../../../LobbyScene/UIReceivePrizeLobby/UIReceivePrizeLobbyBase';
import { AnimChestSys } from 'db://assets/scripts/AnimsPrefab/AnimChestSys';
import { NameAnimChest_idle_after_open, NameAnimChest_idle_close, NameAnimChest_open } from 'db://assets/scripts/Utils/TypeAnimChest';
import { Utils } from 'db://assets/scripts/Utils/Utils';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { EVENT_CHRISTMAS_EVENT } from '../TypeChristmasEvent';
const { ccclass, property } = _decorator;

@ccclass('AnimLRReceivePrize')
export class AnimLRReceivePrize extends Component {
    @property(Node) nBtnPlay: Node;
    @property(Node) nCoin: Node;
    @property(Node) nTicket: Node;
    @property(Node) nChest: Node;
    @property(SuperUIAnimCustom) superUIAnimCustom: SuperUIAnimCustom;
    @property(Node) nOtherUI: Node;

    private _nUIReceivePrizeLobby_Chest = null;

    //=======================================================================
    //#region init
    public async InitUIReceiveChest() {
        if (this._nUIReceivePrizeLobby_Chest == null) {
            const pfChest = await ResourceUtils.loadPrefab("/Prefabs/UIReceivePrize/UIReceivePrizeLobby_Chest", (finished: number, total: number) => { });
            let nUI = instantiate(pfChest) as Node;
            nUI.parent = this.nOtherUI;
            nUI.active = false;
            nUI.getComponent(UIReceivePrizeLobbyBase).SetUpBase(this.superUIAnimCustom);
            this._nUIReceivePrizeLobby_Chest = nUI;
        }
    }
    //#endregion init

    //=======================================================================
    // #region anim
    private async PlayReceivePrizeWithClick(action: ActionReceivePrizeClass, cbDone: CallableFunction) {
        if (this._nUIReceivePrizeLobby_Chest == null) {
            await this.InitUIReceiveChest();
        }

        // play ui chest
        const nUIplay = this._nUIReceivePrizeLobby_Chest;
        const comUIBase = nUIplay.getComponent(UIReceivePrizeLobbyBase);
        comUIBase.SetDataToShow(action);
        nUIplay.active = true;
        await comUIBase.Play();
        nUIplay.active = false;

        cbDone && cbDone();
    }
    // #endregion anim

    //=======================================================================
    // #region public
    public AnimReceivePrizeFromChest(event: 'lightRoad' | 'HatRace', infoPrize: IInfoChestLightRoad, cbDone: CallableFunction) {
        const self = this;
        // tìm anim chest phù hợp
        let nameChestClose = '';
        let nameChestOpen = '';
        let nameChestIdle = '';
        switch (infoPrize.visual) {
            case 0:
                nameChestOpen = NameAnimChest_open.Box_red;
                nameChestClose = NameAnimChest_idle_close.Box_red;
                nameChestIdle = NameAnimChest_idle_after_open.Box_red;
                break;
            case 1:
                nameChestOpen = NameAnimChest_open.Box_pink;
                nameChestClose = NameAnimChest_idle_close.Box_pink;
                nameChestIdle = NameAnimChest_idle_after_open.Box_pink;
                break;
            case 2:
                nameChestOpen = NameAnimChest_open.Box_green;
                nameChestClose = NameAnimChest_idle_close.Box_green;
                nameChestIdle = NameAnimChest_idle_after_open.Box_green;
                break;
        }

        const iReceiveFromWPos: IReceiveChestFromWPos = {
            fromWPos: infoPrize.wPosChest.clone(),
            scaleStart: new Vec3(0.5, 0.5, 0.5)
        }

        const action: ActionReceivePrizeClass = {
            nameTitle: "",
            type: null,
            dataCustom: [iReceiveFromWPos],
            indexUIPrize: infoPrize.visual,
            data: infoPrize.listPrize,
            reasonReceivePrize: "ChestLightRoad"
        }


        action.customAnimReceive = (listNPrizes: Node[], cbPool: CallableFunction, cbEmitDoneAfterDoneAnim: CallableFunction) => {
            return new Promise<void>(async resolve => {
                // duyệt phần thưởng và di chuyển hợp lệ ở đây
                // nếu tiền bay về tiền ,nếu ticket bay về ticket, nếu item bay về nút play
                let listPromise = [];

                for (const itemPrize of listNPrizes) {
                    const itemCom = itemPrize.getComponent(ItemPrizeLobby_2);
                    const wPosStart = itemCom.node.worldPosition.clone();

                    // tìm điểm kết thúc
                    let wPosEnd = new Vec3(0, 0, 0);
                    switch (event) {
                        case 'lightRoad':
                            wPosEnd = self.nBtnPlay.worldPosition.clone();
                            break;
                        case 'HatRace':
                            wPosEnd = null;
                            break;
                    }
                    switch (itemCom.prizeData.typePrize) {
                        case TYPE_PRIZE.MONEY:
                            wPosEnd = self.nCoin.worldPosition.clone();

                            (async () => {
                                await itemCom.HideVisualNode(0.8);
                                cbPool && cbPool(itemPrize);
                            })();

                            // hiển thị coin 3D
                            SoundSys.Instance.playSoundEffectOneShotDelayTime(GameSoundEffect.SOUND_REWARDS, 1, 0.1);
                            listPromise.push(self.superUIAnimCustom.ReceivePrizeCoin(null, itemCom.prizeData.value, wPosStart, wPosEnd,
                                null,
                                (numCoinIncrease: number) => {
                                    CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numCoinIncrease);
                                    clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.UI_COIN_UI_EVENT_CHRISTMAS);
                                    clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_COIN_UI_EVENT_CHRISTMAS, null, null, MConfigs.FX_NEW_CUSTOM);
                                }));
                            break;
                        case TYPE_PRIZE.TICKET:
                            wPosEnd = self.nCoin.worldPosition.clone();

                            (async () => {
                                await itemCom.HideVisualNode(0.8);
                                cbPool && cbPool(itemPrize);
                            })();

                            // chạy anim
                            listPromise.push(itemCom.MoveItemToPlaceEnd(wPosEnd.clone(), (nItem: Node) => {
                                cbPool && cbPool(nItem);
                                cbEmitDoneAfterDoneAnim && cbEmitDoneAfterDoneAnim(itemCom.prizeData);
                            }, new Vec3(0.2, 0.2, 0.2)));
                            break;
                        default:
                            if (wPosEnd != null) {
                                // chạy anim
                                listPromise.push(itemCom.MoveItemToPlaceEnd(wPosEnd.clone(), (nItem: Node) => {
                                    cbPool && cbPool(nItem);
                                    cbEmitDoneAfterDoneAnim && cbEmitDoneAfterDoneAnim(itemCom.prizeData);
                                }, new Vec3(0.2, 0.2, 0.2)));
                            } else {
                                listPromise.push(itemCom.HideVisualNode(0.8));
                            }
                            break;
                    }
                }

                await Promise.all(listPromise);
                resolve();
            })
        }

        action.customAnimChest = {
            cbSetPrepareChest: (nChest: Node) => { nChest.getComponent(AnimChestSys).PlayAnim(nameChestClose) },
            cbOpenChest: async (nChest: Node, cbDone: CallableFunction) => {
                const animChest = nChest.getComponent(AnimChestSys);
                animChest.PlayAnim(nameChestOpen, false);
                animChest.AddAnim(nameChestIdle, true, 0);

                await Utils.delay(animChest.GetTimeAnim(nameChestOpen) * 1000 / 2);
                cbDone && cbDone();
            }
        }

        this.PlayReceivePrizeWithClick(action, () => {
            cbDone && cbDone();
            clientEvent.dispatchEvent(EVENT_CHRISTMAS_EVENT.HIDE_NCOIN_TICKET);
        })

        // emit show coin và ticket
        clientEvent.dispatchEvent(EVENT_CHRISTMAS_EVENT.SHOW_NCOIN_TICKET);
    }

    public async AnimReceiveCoin(wPosStart: Vec3, valueCoin: number, cbDone: CallableFunction) {
        // hiển thị coin 3D
        SoundSys.Instance.playSoundEffectOneShotDelayTime(GameSoundEffect.SOUND_REWARDS, 1, 0.1);
        await this.superUIAnimCustom.ReceivePrizeCoin(null, valueCoin, wPosStart, this.nCoin.worldPosition.clone(),
            null,
            (numCoinIncrease: number) => {
                CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numCoinIncrease);
                clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.UI_COIN_UI_EVENT_CHRISTMAS);
                clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_COIN_UI_EVENT_CHRISTMAS, null, null, MConfigs.FX_NEW_CUSTOM);
            });

        cbDone && cbDone();
    }
    // #endregion public
}