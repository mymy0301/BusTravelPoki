import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;


export const EVENT_FX_BUILDING_PLAY = "EVENT_FX_BUILDING_PLAY";
export const EVENT_FX_BUILDING_STOP_FORCE = "EVENT_FX_BUILDING_STOP_FORCE";

export const URL_FX_BUILDING = "/Prefabs/FX/fx_building";
export const URL_FX_BUILDING_2 = "/Prefabs/FX/fx_building_2";

/**
 * Xin hãy chỉ bổ sung vị trí mới hoặc đổi tên vị trí cũ< sao cho ko trùng> 
 * Xin đừng xóa nội dung cũ đi vì như thế sẽ có thể gây sai lệch cho những nội dung đã sử dụng
 */

export enum Type_FxBuilding {
    UI_COIN_SHOP,
    UI_TICKET_SHOP,
    UI_COIN_PAGE_HOME,
    UI_TICKET_PAGE_HOME,
    UI_BTN_BUILD_PAGE_HOME,
    UI_BTN_PLAY_PAGE_HOME,
    UI_ICON_TAB_HOME_LOBBY,
    UI_CONTRUCTOR,
    UI_BOOSTER_SORT,
    UI_BOOSTER_SHUFFLE,
    UI_BOOSTER_VIP_SLOT,
    UI_COIN_UI_EVENT_CHRISTMAS,
    UI_TICKET_UI_EVENT_CHRISTMAS
}

Enum(Type_FxBuilding);


