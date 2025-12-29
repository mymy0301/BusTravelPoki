import { _decorator, Component, EventHandler, instantiate, Layout, Node, Prefab, Toggle } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('ListToggleSys')
@requireComponent(Layout)
export class ListToggleSys extends Component {
    @property(Prefab) pfToggle: Prefab;
    public _listToggle: Node[] = [];

    public InitToggle(num: number) {
        if (this._listToggle.length >= num) { return; }
        for (let i = 0; i < num; i++) {
            let toggleChoice = instantiate(this.pfToggle);
            this._listToggle.push(toggleChoice);
            toggleChoice.setParent(this.node);
        }
    }

    public registerCbEachToggle(indexToggle: number, containerEventHandler: EventHandler) {
        const container = this._listToggle[indexToggle]?.getComponent(Toggle);
        container?.checkEvents.push(containerEventHandler);
    }

    public unRegisterCbToggle(indexToggle: number) {
        const container = this._listToggle[indexToggle]?.getComponent(Toggle);
        container.checkEvents = [];
    }

    public ChoiceToggle(index: number, withoutNotification: boolean = true) {
        if (index < 0 || index >= this._listToggle.length) { return; }
        if (this._listToggle[index] == null) { return; }
        // console.log("111111", index);
        this._listToggle[index].getComponent(Toggle).setIsCheckedWithoutNotify(withoutNotification);
    }

    public RemoveToggle(index: number) {
        this._listToggle[index].destroy();
        this._listToggle.splice(index, 1);
    }
}


