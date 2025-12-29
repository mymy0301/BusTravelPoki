import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

export const AUTO_SCALE_CUSTOM = "AUTO_SCALE_CUSTOM";

/** 
 * Xin hãy lưu ý tuyệt đối đừng xóa bật kỳ một đối tượng nào trong enum này
 * bởi vì nó sẽ ảnh hưởng đến index => set up đã sử dụng
 * hãy chỉ thêm thuộc tính
 * */
export enum TYPE_AUTO_SCALE {
    BTN_BUILDING_LOBBY,
    BTN_PLAY_LOBBY,
    UI_COIN_PAGE_HOME,
    UI_TICKET_PAGE_HOME,
    UI_COIN_SHOP,
    UI_TICKET_SHOP,
    UI_COIN_UI_EVENT_CHRISTMAS,
    UI_TICKET_UI_EVENT_CHRISTMAS
}
Enum(TYPE_AUTO_SCALE);

/** 
 * Xin hãy lưu ý tuyệt đối đừng xóa bật kỳ một đối tượng nào trong enum này
 * bởi vì nó sẽ ảnh hưởng đến index => set up đã sử dụng
 * hãy chỉ thêm thuộc tính
 * */
export enum TYPE_ANIM_AUTO_SCALE {
    KEEP_SCALE,
    BASIC,
}
Enum(TYPE_ANIM_AUTO_SCALE);


