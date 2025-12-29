import { _decorator, Component, Node } from 'cc';
import { AutoUpdateTimeSelfToNextDay } from '../../Utils/AutoUpdateTimeSelfToNextDay';
import { DataEventsSys } from '../DataEventsSys';
import { TYPE_EVENT_GAME } from '../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('AutoUpdateTimeLR')
export class AutoUpdateTimeLR extends AutoUpdateTimeSelfToNextDay {
    override UpdateLabel() {
        if (DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LOGIN_REWARD)) return;
        super.UpdateLabel();
    }
}


