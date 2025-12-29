import { _decorator, Component, instantiate, Node, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { ShowAndHideUIPageHome } from '../ShowAndHideUIPageHome';
import { Utils } from '../../../Utils/Utils';
import { SuperUIAnimCustom } from '../../OtherUI/SuperUIAnimCustom';
import { CurrencySys } from '../../CurrencySys';
import { IPrize, TYPE_CURRENCY, TYPE_PRIZE, TYPE_RECEIVE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../../OtherUI/Others/AutoScale/TypeAutoScale';
import { Anim_di_chuyen_vong_cung_khong_SpawnItem } from '../../OtherUI/SuperAnimCustom';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { MConfigs } from '../../../Configs/MConfigs';
import { UIReceivePrizeLobby } from '../UIReceivePrizeLobby';
import { IReceiveChestFromWPos } from '../UIReceivePrizeLobby/TypeUIReceivePrizeLobby';
const { ccclass, property } = _decorator;

@ccclass('AnimReceiveFinishBuilding')
export class AnimReceiveFinishBuilding {

    /**
     * Hàm này không bao gồm lưu dữ liệu người chơi
     * Do đó nếu sử dụng hàm này xin hãy đừng update UI trước khi chạy anim
     * @param param 
     */
    public async runAnim(param: param_AnimReceiveFinishBuilding) {
        let isContinueLogic: boolean = true
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        // anim sẽ trượt UI Coin xuống
        // anim trượt PageHome lên trên
        isContinueLogic = false;
        clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_showAndHideUIPageHome, async (showAndHideUIPageHome: ShowAndHideUIPageHome) => {
            let listPromise: Promise<any>[] = [];

            if (param.numCoin > 0) {
                listPromise.push(showAndHideUIPageHome.ShowUIChoice('coin'));
            }

            if (param.numTicket > 0) {
                listPromise.push(showAndHideUIPageHome.ShowUIChoice('ticket'));
            }

            if (param.listNOtherItems.length > 0) {
                listPromise.push(showAndHideUIPageHome.ShowUIChoice('tab'));
            }

            // await all promise
            await Promise.all(listPromise);
            isContinueLogic = true;
        })

        await Utils.WaitReceivingDone(() => { return isContinueLogic });

        // await Utils.delay(1000 * 10);

        // ================  anim move item need to the place they suit ===================
        let wEndCoin: Vec3 = Vec3.ZERO;
        if (param.numCoin > 0) {
            isContinueLogic = false;
            clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_COIN, (wPosUICoin: Vec3) => {
                wEndCoin = wPosUICoin;
                isContinueLogic = true;
            });
            await Utils.WaitReceivingDone(() => { return isContinueLogic });
        }

        let wEndTicket: Vec3 = Vec3.ZERO;
        if (param.numCoin > 0) {
            isContinueLogic = false;
            clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_TICKET, (wPosUITicket: Vec3) => {
                wEndTicket = wPosUITicket;
                isContinueLogic = true;
            });
            await Utils.WaitReceivingDone(() => { return isContinueLogic });
        }

        isContinueLogic = false;
        let wEndItem: Vec3 = Vec3.ZERO;
        clientEvent.dispatchEvent(MConst.EVENT_LOBBY.GET_WPOS_TAB_HOME, (wPosTabHome: Vec3) => {
            wEndItem = wPosTabHome;
            isContinueLogic = true;
        })
        await Utils.WaitReceivingDone(() => { return isContinueLogic });

        //=================== anim receive coin + prize===================
        let listPromise: Promise<any>[] = [];

        if (param.numCoin > 0) {
            listPromise.push(
                param.superUIAnimCustom.ReceivePrizeCoin(null, param.numCoin, param.wPosCoin, wEndCoin,
                    null,
                    (numCoinIncrease: number) => {
                        CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numCoinIncrease);
                        clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.UI_COIN_PAGE_HOME);
                        clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_COIN_PAGE_HOME, null, null, MConfigs.FX_NEW_CUSTOM);
                    })
            )
        }

        if (param.numTicket > 0) {
            const wPosStart: Vec3 = param.wPosTicket.clone();
            listPromise.push(
                Anim_di_chuyen_vong_cung_khong_SpawnItem(
                    wPosStart,
                    wEndTicket.clone(),
                    () => {
                        let nTicket: Node = instantiate(param.nTicket);
                        nTicket.active = true;
                        return nTicket;
                    },
                    null
                )
            )
        }

        listPromise.push(
            ...param.listNOtherItems.map(async (item: Node) => {
                const wPosStart: Vec3 = item.worldPosition.clone();
                await Anim_di_chuyen_vong_cung_khong_SpawnItem(
                    wPosStart,
                    wEndItem.clone(),
                    () => {
                        let nItem: Node = instantiate(item);
                        nItem.active = true;
                        return nItem;
                    },
                    null
                );
            }))

        // wait all promise
        await Promise.all(listPromise);

        // hide ui
        clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_showAndHideUIPageHome, async (showAndHideUIPageHome: ShowAndHideUIPageHome) => {

            if (param.numCoin > 0) {
                showAndHideUIPageHome.HideUIChoice('coin');
            }

            if (param.numTicket > 0) {
                showAndHideUIPageHome.ShowUIChoice('ticket');
            }

            if (param.listNOtherItems.length > 0) {
                showAndHideUIPageHome.ShowUIChoice('tab');
            }
        })

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }

    public async runAnim2(param: param_AnimReceiveFinishBuilding, wPosStartChest: Vec3, scaleChestStart: Vec3) {
        let isContinueLogic: boolean = true
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        // anim sẽ trượt UI Coin xuống
        // anim trượt PageHome lên trên
        isContinueLogic = false;
        clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_showAndHideUIPageHome, async (showAndHideUIPageHome: ShowAndHideUIPageHome) => {
            let listPromise: Promise<any>[] = [];

            if (param.numCoin > 0) {
                listPromise.push(showAndHideUIPageHome.ShowUIChoice('coin'));
            }

            if (param.numTicket > 0) {
                listPromise.push(showAndHideUIPageHome.ShowUIChoice('ticket'));
            }

            if (param.listNOtherItems.length > 0) {
                listPromise.push(showAndHideUIPageHome.ShowUIChoice('tab'));
            }

            // await all promise
            await Promise.all(listPromise);
            isContinueLogic = true;
        })

        await Utils.WaitReceivingDone(() => { return isContinueLogic });

        // anim nhận thưởng quà
        let listPrize: IPrize[] = [];
        if (param.numCoin > 0) { listPrize.push(new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, param.numCoin)); }
        if (param.numTicket > 0) { listPrize.push(new IPrize(TYPE_PRIZE.TICKET, TYPE_RECEIVE.NUMBER, param.numTicket)) }
        const iReceiveFromWPos: IReceiveChestFromWPos = {
            fromWPos: wPosStartChest,
            scaleStart: scaleChestStart
        }
        //turn off block before receive anim then show block again when receive done
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.FINISH_BUILDING_CONSTRUCTOR_LOBBY, listPrize, "finish constructor", 0, [iReceiveFromWPos], param.nameConstructor);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        // hide ui
        clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_showAndHideUIPageHome, async (showAndHideUIPageHome: ShowAndHideUIPageHome) => {

            if (param.numCoin > 0) {
                showAndHideUIPageHome.HideUIChoice('coin');
            }

            if (param.numTicket > 0) {
                showAndHideUIPageHome.ShowUIChoice('ticket');
            }

            if (param.listNOtherItems.length > 0) {
                showAndHideUIPageHome.ShowUIChoice('tab');
            }
        })

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }
}

export interface param_AnimReceiveFinishBuilding {
    numCoin: number,
    wPosCoin: Vec3,
    numTicket: number,
    wPosTicket: Vec3,
    nTicket: Node,
    listNOtherItems: Node[],
    nameConstructor: string,
    superUIAnimCustom: SuperUIAnimCustom
}


