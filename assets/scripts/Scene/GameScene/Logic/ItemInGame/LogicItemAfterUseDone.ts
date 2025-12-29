import { _decorator, Component, Node } from 'cc';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('LogicItemAfterUseDone')
export class LogicItemAfterUseDone {
    public async ItemVipSlot() {
        clientEvent.dispatchEvent(MConst.EVENT_SHADOW_IN_GAME.HIDE);
        clientEvent.dispatchEvent(MConst.EVENT_SHADOW_IN_GAME.HIDE_POP_UP_VIP_SPACE);
        clientEvent.dispatchEvent(MConst.EVENT_SHADOW_IN_GAME.SHOW_UI_GAME);
        clientEvent.dispatchEvent(MConst.EVENT.UPDATE_VISUAL_ALL_VIP_PARKING);
        // move all car to the right place
        clientEvent.dispatchEvent(MConst.EVENT.MOVE_ALL_CAR_SAVE_TO_BACKGROUND);
        // turn off shadow
        await Utils.delay(MConst.EVENT_SHADOW_IN_GAME.TIME_SHADOW * 1000);
    }

    public async ItemShuffle() {
        // throw new Error('Method not implemented.');
    }

    public async ItemSort() {
        // throw new Error('Method not implemented.');
    }
}


