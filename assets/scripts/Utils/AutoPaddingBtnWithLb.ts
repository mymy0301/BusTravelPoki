import { _decorator, CCBoolean, CCFloat, Component, Label, Node, Size, UITransform } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Hiện tại func này chỉ padding 
 */

@ccclass('AutoPaddingBtnWithLb')
export class AutoPaddingBtnWithLb extends Component {
    @property(Label) lbFocus: Label;
    @property(Node) nAutoPadding: Node;
    @property(CCFloat) paddingTop: number = 0;
    @property(CCFloat) paddingDown: number = 0;
    @property(CCFloat) paddingLeft: number = 0;
    @property(CCFloat) paddingRight: number = 0;
    @property(CCBoolean) isAutoPadding: boolean = false;

    protected onEnable(): void {
        // lắng nghe sự kiện thay đổi UITransform của label
        if (!this.lbFocus.node.hasEventListener(Node.EventType.SIZE_CHANGED)) {
            this.lbFocus.node.on(Node.EventType.SIZE_CHANGED, this.UpdateUITransform, this);
        }
        this.UpdateUITransform();
    }

    protected onDisable(): void {
        // tắt sự kiện thay đổi UITransform của label
        this.lbFocus.node.off(Node.EventType.SIZE_CHANGED, this.UpdateUITransform, this);
    }

    public UpdateUITransform() {
        if (this.lbFocus == null || this.nAutoPadding == null) { return; }

        this.lbFocus.updateRenderData(true);
        const contentSizeLb = this.lbFocus.node.getComponent(UITransform).contentSize.clone();
        let newContentSize: Size = new Size(contentSizeLb.width + this.paddingLeft + this.paddingRight, contentSizeLb.height + this.paddingTop + this.paddingDown);
        this.nAutoPadding.getComponent(UITransform).setContentSize(newContentSize);
        this.nAutoPadding.updateWorldTransform();
    }
}


