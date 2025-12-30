import { _decorator, CCFloat, CCInteger, Component, Layout, Node, Size, UITransform, Widget } from 'cc';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('LayoutLeftManager')
export class LayoutLeftManager extends Component {
    @property(Widget) widget: Widget = null!;
    @property(CCInteger) defaultLeft: number = 30;
    @property(Layout) layoutCheck: Layout;
    @property(CCFloat) scale: number = 0.9;
    start() {
        // let scaleWindow = Utils.getScaleWindow();
        // let isFitHight: boolean = Utils.isFitHeight();
        // if (isFitHight) {
        //     this.widget.left = this.defaultLeft - (scaleWindow - 1) * 720 / 2;
        // }

        // update scale item 
        this.ScaleAllIconForSuitHeight();
    }

    private ScaleAllIconForSuitHeight() {
        const baseWidgetDown_1280 = 260;
        const scaleWithHeight = Utils.getRightScaleSizeWindow();
        const baseSize_1280 = (1280 - baseWidgetDown_1280) / this.scale;
        const baseSize_now = 1280 * scaleWithHeight - baseWidgetDown_1280 * scaleWithHeight;

        if (baseSize_1280 > baseSize_now) {
            const ratioSize = baseSize_now / baseSize_1280;
            this.node.children.forEach(item => {
                item.scale = item.scale.clone().multiplyScalar(ratioSize);
                const baseSizeItem = item.getComponent(UITransform).contentSize.clone();
                item.getComponent(UITransform).contentSize = new Size(baseSizeItem.x * ratioSize, baseSizeItem.y * ratioSize);
            })

            // if (this.layoutCheck) {
            //     this.layoutCheck.spacingY *= ratioSize;
            //     this.layoutCheck.updateLayout(true);
            // }
        }
    }
}


