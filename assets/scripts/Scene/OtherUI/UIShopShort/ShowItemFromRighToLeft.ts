/**
 * 
 * anhngoxitin01
 * Thu Oct 30 2025 17:32:10 GMT+0700 (Indochina Time)
 * ShowItemFromRighToLeft
 * db://assets/scripts/Scene/OtherUI/UIShopShort/ShowItemFromRighToLeft.ts
*
*/
import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShowItemFromRighToLeft')
export class ShowItemFromRighToLeft extends Component {
    public Prepare() {
        const opaCom = this.node.getComponent(UIOpacity);
        opaCom.opacity = 0;
    }

    // dịch chuyển đối tượng từ phải qua trái
    public Play() {
        const timeShow = 0.5;
        const diffX = 200;
        const rootOpa = 50;
        const opaCom = this.node.getComponent(UIOpacity);
        const rootPosX = this.node.position.clone().x;


        const startPosX = rootPosX + diffX;
        this.node.position = new Vec3(startPosX, this.node.position.y);
        opaCom.opacity = rootOpa;
        const xO = { x: this.node.position.x };
        tween(xO)
            .to(timeShow, { x: 0 }, {
                easing: 'backOut', onUpdate: (target, ratio) => {
                    const pos = this.node.getPosition();
                    pos.x = xO.x;
                    this.node.position = pos;
                    opaCom.opacity = rootOpa + (255 - rootOpa) * ratio;
                }
            })
            .start();
    }
}