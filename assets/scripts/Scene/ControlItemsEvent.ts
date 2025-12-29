import { _decorator, Component, Node } from 'cc';
import { ItemEventSys } from './LobbyScene/Item/ItemEventSys';
import { DataEventsSys } from './DataEventsSys';
import { TYPE_EVENT_GAME } from '../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('ControlItemsEvent')
export class ControlItemsEvent extends Component {
    public static Instance: ControlItemsEvent = null;
    @property([ItemEventSys]) listItemEventSys: ItemEventSys[] = [];
    private _listEventWorking: ItemEventSys[] = [];

    //=========================================
    //#region base
    protected onLoad(): void {
        //============================ create Instance item ==================
        if (ControlItemsEvent.Instance == null) {
            ControlItemsEvent.Instance = this;
        }

        //============================ check list event in scene lobby ============
        const dataEventsInSeasonNow = DataEventsSys.Instance.GetListEventCanShowThisSeasionAtSceneLobby(true);
        DataEventsSys.Instance.RegisterTimeGroup();

        // ẩn những event cần ẩn
        dataEventsInSeasonNow.listEventsHide.forEach(event => {
            const eventCheck = GetTypeEvent(event);
            const eventHide = this.listItemEventSys.find(itemEvent => itemEvent.typeEvent == eventCheck);
            if (eventHide == null) { console.error("not found item"); }
            eventHide.node.active = false;
        });

        // filter những item nào đang được active và gọi OnCheckOnLoad()
        const listItemEventShow = this.listItemEventSys.filter(itemEvent => itemEvent.node.active);
        listItemEventShow.forEach(itemCheck => itemCheck.CheckSelfEventIsLockOrNot());
        this._listEventWorking = listItemEventShow;
    }

    protected onDisable(): void {
        ControlItemsEvent.Instance = null;
    }

    public GetAllEventsCanShow(): TYPE_EVENT_GAME[] {
        let result: TYPE_EVENT_GAME[] = this._listEventWorking.map(eventCheck => eventCheck.typeEvent);
        let indexEventSS2 = result.findIndex(event => event == TYPE_EVENT_GAME.SEASON_PASS_2);
        if (indexEventSS2 >= 0) {
            result[indexEventSS2] = TYPE_EVENT_GAME.SEASON_PASS;
        }

        return result;
    }

    public GetItemEvent(typeEventGame: TYPE_EVENT_GAME) {
        return this.listItemEventSys.find(eventCheck => eventCheck.typeEvent == typeEventGame);
    }
    //#endregion base
    //=========================================
}

function GetTypeEvent(input: TYPE_EVENT_GAME): TYPE_EVENT_GAME {
    if (input == TYPE_EVENT_GAME.SEASON_PASS) return TYPE_EVENT_GAME.SEASON_PASS_2;
    return input;
}


