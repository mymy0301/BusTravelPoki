import { _decorator, Component, Node, UIOpacityComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemScrollViewBase2')
export class ItemScrollViewBase2 extends Component {
    public indexPos : number = 0;

    private readonly EVENT = {
        SHOW: "SHOW_EVENT_ITEM_SCROLL_VIEW_BASE",
        HIDE: "HIDE_EVENT_ITEM_SCROLL_VIEW_BASE"
    }

    Hide() {
        this.node.active = false;
        this.node.emit(this.EVENT.HIDE);
    }

    Show() {
        this.node.active = true;
        this.node.emit(this.EVENT.SHOW);
    }
}


