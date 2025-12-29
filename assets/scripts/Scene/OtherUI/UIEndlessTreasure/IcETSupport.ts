import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_ENDLESS_TREASURE } from './TypeEventEndlessTreasure';
import { DataEndlessTreasureSys } from '../../../DataBase/DataEndlessTreasureSys';
const { ccclass, property } = _decorator;

@ccclass('IcETSupport')
export class IcETSupport extends Component {
    protected onEnable(): void {
        clientEvent.on(EVENT_ENDLESS_TREASURE.UPDATE_UI_INCREASE_ENDLESS_TREASURE, this.HideIcon, this);
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_ENDLESS_TREASURE.UPDATE_UI_INCREASE_ENDLESS_TREASURE, this.HideIcon, this);
    }

    private HideIcon() {
        const indexPackNotBought = DataEndlessTreasureSys.Instance.GetDataPack().findIndex(pack => !pack.isBought);
        if (indexPackNotBought == -1) {
            this.node.active = false;
        }
    }
}


