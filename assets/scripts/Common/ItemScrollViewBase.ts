import { _decorator, Component, Node, UIOpacity, UIOpacityComponent } from 'cc';
import { MConst } from '../Const/MConst';
const { ccclass,requireComponent,disallowMultiple, property } = _decorator;

export const EVENT_ITEM_SCROLL_VIEW_BASE = {
    SHOW: "SHOW_EVENT_ITEM_SCROLL_VIEW_BASE",
    HIDE: "HIDE_EVENT_ITEM_SCROLL_VIEW_BASE"
};
@ccclass('ItemScrollViewBase')
@disallowMultiple
@requireComponent(UIOpacity)
export class ItemScrollViewBase extends Component {
    private _uiOpacityComponent: UIOpacityComponent = null;

    Hide() {
        if(!this.node.active){ return;}

        if (this._uiOpacityComponent == null)
            this._uiOpacityComponent = this.getComponent(UIOpacityComponent);
        this._uiOpacityComponent.opacity = 0;

        this.node.emit(EVENT_ITEM_SCROLL_VIEW_BASE.HIDE);
    }

    Show() {
        if(!this.node.active){ return;}

        if (this._uiOpacityComponent == null)
            this._uiOpacityComponent = this.getComponent(UIOpacityComponent);

        this._uiOpacityComponent.opacity = 255;

        this.node.emit(EVENT_ITEM_SCROLL_VIEW_BASE.SHOW);
    }
}


