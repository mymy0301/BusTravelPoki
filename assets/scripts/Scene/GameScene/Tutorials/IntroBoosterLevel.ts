import { _decorator, Component, Enum, Node } from 'cc';
import { PlayerData } from '../../../Utils/PlayerData';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { IDataCustomTutorialInGame, LEVEL_TUT_IN_GAME } from '../../OtherUI/UITutorialInGame/TypeTutorialInGame';
import { Utils } from '../../../Utils/Utils';
import { TYPE_ITEM } from '../../../Utils/Types';
import { DataItemSys } from '../../DataItemSys';
import { VisualItemInGame } from '../Logic/ItemInGame/VisualItemInGame';
import { MConfigs } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('IntroBoosterLevel')
export class IntroBoosterLevel extends Component {
    @property(Node) listNHideTut: Node[] = [];
    @property(Node) nSort: Node;
    @property(Node) nShuffle: Node;
    @property(Node) nVipSlot: Node;
    @property(Node) nReplay: Node;
    @property(Node) nSetting: Node;
    @property(Node) nUIGame3: Node;
    // @property(Node) nNoAds: Node;

    public static CheckCanShowPopUpTut(levelPlayerNow: number, infoMapCheckTut: { hasCarLock: boolean, hasCarTwoWay: boolean, hasAmbulance: boolean, hasFireTruck: boolean, hasPolice: boolean, hasMilitary: boolean }): { typeTutPopUp: number, indexTutInData: number, typeItemReceive: number } {

        const indexTutKey_InData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.KEY_LOCK);
        const isPlayTutKey = PlayerData.Instance._isReceiveItemTut[indexTutKey_InData];
        const indexTutAmbulance_InData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.AMBULANCE);
        const isPlayTutAmbulance = PlayerData.Instance._isReceiveItemTut[indexTutAmbulance_InData];
        const indexTutFireTruck_InData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.FIRE_TRUCK);
        const isPlayTutFireTruck = PlayerData.Instance._isReceiveItemTut[indexTutFireTruck_InData];
        const indexTutTwoWay_InData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.CAR_TWO_WAY);
        const isPlayTutTwoWay = PlayerData.Instance._isReceiveItemTut[indexTutTwoWay_InData];
        const indexTutPolice_InData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.POLICE);
        const isPlayTutPolice = PlayerData.Instance._isReceiveItemTut[indexTutPolice_InData];
        const indexTutMilitary_InData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.MILITARY);
        const isPlayTutMilitary = PlayerData.Instance._isReceiveItemTut[indexTutMilitary_InData];

        switch (true) {
            case levelPlayerNow == LEVEL_TUT_IN_GAME.SORT: {
                const indexTutInData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.SORT);
                if (!PlayerData.Instance._isReceiveItemTut[indexTutInData]) {
                    return {
                        typeTutPopUp: LEVEL_TUT_IN_GAME.SORT,
                        indexTutInData: indexTutInData,
                        typeItemReceive: TYPE_ITEM.SORT
                    };
                }
                break;
            }
            case levelPlayerNow == LEVEL_TUT_IN_GAME.MYSTERY_CAR: {
                const indexTutInData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.MYSTERY_CAR);
                if (!PlayerData.Instance._isReceiveItemTut[indexTutInData]) {
                    return {
                        typeTutPopUp: LEVEL_TUT_IN_GAME.MYSTERY_CAR,
                        indexTutInData: indexTutInData,
                        typeItemReceive: null
                    };
                }
                break;
            }
            case levelPlayerNow == LEVEL_TUT_IN_GAME.SHUFFLE: {
                const indexTutInData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.SHUFFLE);
                if (!PlayerData.Instance._isReceiveItemTut[indexTutInData]) {
                    return {
                        typeTutPopUp: LEVEL_TUT_IN_GAME.SHUFFLE,
                        indexTutInData: indexTutInData,
                        typeItemReceive: TYPE_ITEM.SHUFFLE
                    };
                }
                break;
            }
            case levelPlayerNow == LEVEL_TUT_IN_GAME.VIP_SLOT: {
                const indexTutInData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.VIP_SLOT);
                if (!PlayerData.Instance._isReceiveItemTut[indexTutInData]) {
                    return {
                        typeTutPopUp: LEVEL_TUT_IN_GAME.VIP_SLOT,
                        indexTutInData: indexTutInData,
                        typeItemReceive: TYPE_ITEM.VIP_SLOT
                    };
                }
                break;
            }
            case levelPlayerNow == LEVEL_TUT_IN_GAME.GARAGE: {
                const indexTutInData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.GARAGE);
                if (!PlayerData.Instance._isReceiveItemTut[indexTutInData]) {
                    return {
                        typeTutPopUp: LEVEL_TUT_IN_GAME.GARAGE,
                        indexTutInData: indexTutInData,
                        typeItemReceive: null
                    };
                }
                break;
            }
            case levelPlayerNow == LEVEL_TUT_IN_GAME.CONVEYOR_BELT: {
                const indexTutInData = Utils.getIndexOfEnum(LEVEL_TUT_IN_GAME, LEVEL_TUT_IN_GAME.CONVEYOR_BELT);
                if (!PlayerData.Instance._isReceiveItemTut[indexTutInData]) {
                    return {
                        typeTutPopUp: LEVEL_TUT_IN_GAME.CONVEYOR_BELT,
                        indexTutInData: indexTutInData,
                        typeItemReceive: null
                    };
                }
                break;
            }
            case !isPlayTutTwoWay && infoMapCheckTut.hasCarTwoWay && levelPlayerNow >= LEVEL_TUT_IN_GAME.CAR_TWO_WAY:
                return {
                    typeTutPopUp: LEVEL_TUT_IN_GAME.CAR_TWO_WAY,
                    indexTutInData: indexTutTwoWay_InData,
                    typeItemReceive: null
                }
            case !isPlayTutKey && infoMapCheckTut.hasCarLock && levelPlayerNow >= LEVEL_TUT_IN_GAME.KEY_LOCK:
                return {
                    typeTutPopUp: LEVEL_TUT_IN_GAME.KEY_LOCK,
                    indexTutInData: indexTutKey_InData,
                    typeItemReceive: null
                }
            case !isPlayTutAmbulance && infoMapCheckTut.hasAmbulance && levelPlayerNow >= LEVEL_TUT_IN_GAME.AMBULANCE:
                return {
                    typeTutPopUp: LEVEL_TUT_IN_GAME.AMBULANCE,
                    indexTutInData: indexTutAmbulance_InData,
                    typeItemReceive: null
                }
            case !isPlayTutFireTruck && infoMapCheckTut.hasFireTruck && levelPlayerNow >= LEVEL_TUT_IN_GAME.FIRE_TRUCK:
                return {
                    typeTutPopUp: LEVEL_TUT_IN_GAME.FIRE_TRUCK,
                    indexTutInData: indexTutFireTruck_InData,
                    typeItemReceive: null
                }
            case !isPlayTutPolice && infoMapCheckTut.hasPolice && levelPlayerNow >= LEVEL_TUT_IN_GAME.POLICE:
                return {
                    typeTutPopUp: LEVEL_TUT_IN_GAME.POLICE,
                    indexTutInData: indexTutPolice_InData,
                    typeItemReceive: null
                }
            case !isPlayTutMilitary && infoMapCheckTut.hasMilitary && levelPlayerNow >= LEVEL_TUT_IN_GAME.MILITARY:
                return {
                    typeTutPopUp: LEVEL_TUT_IN_GAME.MILITARY,
                    indexTutInData: indexTutMilitary_InData,
                    typeItemReceive: null
                }
        }

        return null;
    }

    public TryShowPopUpTut(levelPlayerNow: number, infoMapForCheckTut: { hasCarLock: boolean, hasCarTwoWay: boolean, hasAmbulance: boolean, hasFireTruck: boolean, hasPolice: boolean, hasMilitary: boolean }, cbCloseUI: CallableFunction): boolean {
        // check level can show tut , and data player is show tut
        let dataCheck = IntroBoosterLevel.CheckCanShowPopUpTut(levelPlayerNow, infoMapForCheckTut);
        if (dataCheck == null) { return false; }


        // if have tut pop up => call pop up tut
        if (dataCheck.typeTutPopUp != -1 && dataCheck.indexTutInData >= 0) {
            PlayerData.Instance._isReceiveItemTut[dataCheck.indexTutInData] = true;

            if (dataCheck.typeItemReceive != null) {
                PlayerData.Instance.SaveTut(false);
                DataItemSys.Instance.AddItem([dataCheck.typeItemReceive], [MConfigs.NUM_ITEM_TUT_RECEIVE], "Tutorial", false)
            } else {
                PlayerData.Instance.SaveTut();
            }

            let dataCustom: IDataCustomTutorialInGame = {
                typeTutPopUp: dataCheck.typeTutPopUp,
                cbCloseUI: cbCloseUI
            }

            // call pop up tut
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TUTORIAL_IN_GAME, 2, true, dataCustom);
            return true;
        }

        return false;
    }

    public TryShowPopUpTutChrist(cbCloseUI: CallableFunction): boolean {
        if (PlayerData.Instance.XMAX_LR_isPlayTut_level) {
            let dataCustom: any = {
                cbCloseUI: cbCloseUI
            }

            //call popUp tut christ
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TUTORIAL_LEVEL_CHRIST, 2, true, dataCustom);

            return true;
        }
        return false;
    }

    public ShowUI_before_intro(levelPlayerNow: number) {
        this.nUIGame3.active = false;  // only for tutotial

        switch (true) {
            case levelPlayerNow == 0:
                this.listNHideTut.forEach(n => n.active = false);
                this.nUIGame3.active = true;
                this.nSetting.active = false;
                this.nReplay.active = false;
                break;
            case levelPlayerNow == 2:
                this.nUIGame3.active = true;  // only for tutotial
                this.nSetting.active = false;
                this.nReplay.active = false;
                // this.nNoAds.active = false;
                this.nSort.getComponent(VisualItemInGame).ChangeStateLock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateLock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow <= MConfigs.LEVEL_CAN_SHOW_UI:
                // this.nNoAds.active = false;
                this.nSort.getComponent(VisualItemInGame).ChangeStateLock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateLock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.SORT:
                this.nSort.getComponent(VisualItemInGame).ChangeStatePreUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateLock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.MYSTERY_CAR:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateLock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.SHUFFLE:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStatePreUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.VIP_SLOT:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStatePreUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.GARAGE:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.CONVEYOR_BELT:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.CAR_TWO_WAY:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.KEY_LOCK:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.AMBULANCE:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.FIRE_TRUCK:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
        }
    }

    public ShowUI_after_intro(levelPlayerNow: number) {
        if (levelPlayerNow > 2) {
            this.nUIGame3.active = false;
        }

        switch (true) {
            case levelPlayerNow == 0:
                this.listNHideTut.forEach(n => n.active = false);
                this.nSetting.active = false;
                this.nReplay.active = false;
                break;
            case levelPlayerNow == 2:
                this.nUIGame3.active = true;  // only for tutotial
                this.nSetting.active = false;
                this.nReplay.active = false;
                // this.nNoAds.active = false;
                this.nSort.getComponent(VisualItemInGame).ChangeStateLock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateLock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow <= MConfigs.LEVEL_CAN_SHOW_UI:
                // this.nNoAds.active = false;
                this.nSort.getComponent(VisualItemInGame).ChangeStateLock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateLock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.SORT:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateLock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.MYSTERY_CAR:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateLock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow < LEVEL_TUT_IN_GAME.SHUFFLE:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateLock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow == LEVEL_TUT_IN_GAME.SHUFFLE:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow < LEVEL_TUT_IN_GAME.VIP_SLOT:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateLock();
                break;
            case levelPlayerNow == LEVEL_TUT_IN_GAME.VIP_SLOT:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.GARAGE:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.CONVEYOR_BELT:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.CAR_TWO_WAY:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.KEY_LOCK:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.AMBULANCE:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            case levelPlayerNow <= LEVEL_TUT_IN_GAME.FIRE_TRUCK:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
            default:
                this.nSort.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nShuffle.getComponent(VisualItemInGame).ChangeStateUnlock();
                this.nVipSlot.getComponent(VisualItemInGame).ChangeStateUnlock();
                break;
        }
    }
}