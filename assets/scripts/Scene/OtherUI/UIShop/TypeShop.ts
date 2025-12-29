import { _decorator, Component, Node } from 'cc';
import { TYPE_UI } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

export const MConfig_TypeShop = {
    TIME_SCROLL_INDICATOR: 0.3,
    TIME_WAIT_INIT_SHOP_FIRST_TIME: 0.5
}

export interface DataCustomUIShop {
    isActiveClose: boolean;
    openUIAfterClose: TYPE_UI;
    pageViewShop_ScrollTo: number;
    canAutoResumeGame?: boolean;
    dataCustom?: any;
}

export enum PAGE_VIEW_SHOP {
    PACKAGE,
    COIN,
    DAILY_QUEST,
    SKIP_ITS
}

export function instanceOfDataPageViewShop(object: any): object is PAGE_VIEW_SHOP {
    return object != null && Object.keys(PAGE_VIEW_SHOP).includes(object);
}

export enum PAGE_VIEW_SHOP_2 {
    DAILY_QUEST,
    COIN
}

export function instanceOfDataCustomUIShop(object: any): object is DataCustomUIShop {
    return object != null && 'isActiveClose' in object && 'openUIAfterClose' in object && 'pageViewShop_ScrollTo' in object;
}


