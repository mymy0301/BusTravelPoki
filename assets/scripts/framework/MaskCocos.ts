import { _decorator, Component, Graphics, Node, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MaskCocos')
export class MaskCocos extends Component {

    @property([Vec2]) listPointPolygon: Vec2[] = [];

    start() {
        const g = this.node.getComponent(Graphics);
        //const g = this.mask.graphics;
        g.lineWidth = 10;
        g.fillColor.fromHEX('#ff0000');
        this.listPointPolygon.forEach((point: Vec2 , index: number)=>{
            if (index == 0) {
                g.moveTo(point.x, point.y);
            } else {
                g.lineTo(point.x, point.y);
            }
        });
        g.close();
        g.stroke();
        g.fill();
    }
}


