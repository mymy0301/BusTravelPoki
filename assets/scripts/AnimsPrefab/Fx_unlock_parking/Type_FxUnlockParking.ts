import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

export const EVENT_FX_UNLOCK_PARKING_PLAY = "EVENT_FX_UNLOCK_PARKING_PLAY";
export const EVENT_FX_UNLOCK_PARKING_STOP_FORCE = "EVENT_FX_UNLOCK_PARKING_STOP_FORCE";

export const URL_FX_UNLOCK_PARKING = "/Prefabs/FX/fx_unlock_parking";
export const URL_FX_UNLOCK_PARKING_2 = "/Prefabs/FX/fx_unlock_parking_2";

/**
 * Xin hãy chỉ bổ sung vị trí mới hoặc đổi tên vị trí cũ< sao cho ko trùng> 
 * Xin đừng xóa nội dung cũ đi vì như thế sẽ có thể gây sai lệch cho những nội dung đã sử dụng
 */
export enum Type_FxUnlockParking {
    UI_PARKING
}
Enum(Type_FxUnlockParking);



