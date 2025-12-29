import { _decorator, CCFloat, Component, Node, tween, Vec3 } from 'cc';
import { MConfigs } from '../../../Configs/MConfigs';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ZoomMapLobbySys')
export class ZoomMapLobbySys extends Component {
    @property(Node) nObj: Node;
    @property(CCFloat) speedZoomIn: number = 1;
    @property(CCFloat) speedZoomOut: number = 1;

    public FocusOnObj(target: Node, scaleConsNext: number, distanceVecSetMap: Vec3 = MConfigs.DISTANCE_HIGHER_CAM_WHEN_BUILD) {

        // noti hide noti cons
        clientEvent.dispatchEvent(MConst.EVENT_BUILDING.SHOW_NOTI_REMAIN_CONS_NOW);

        const scaleFocus: Vec3 = Vec3.ONE.clone().multiplyScalar(scaleConsNext);
        const wPosTarget: Vec3 = target.worldPosition.clone();
        const offSet: Vec3 = this.node.worldPosition.clone().subtract(wPosTarget);
        let offSetByScale: Vec3 = offSet.clone().add(distanceVecSetMap);

        // we need multiply with scale when zoom to cacul right offset
        const scaleXNow = this.node.scale.x;
        offSetByScale.multiplyScalar(1 / scaleXNow * scaleFocus.x);

        return new Promise<void>(resolve => {
            tween(this.node)
                .to(this.speedZoomIn, { scale: scaleFocus, position: offSetByScale })
                .call(() => { resolve(); })
                .start();
        })
    }

    public ZoomToBase() {

        // noti hide noti cons
        clientEvent.dispatchEvent(MConst.EVENT_BUILDING.HIDE_NOTI_REMAIN_CONS_NOW);

        return new Promise<void>(resolve => {
            tween(this.node)
                .to(this.speedZoomOut, { scale: Vec3.ONE, position: Vec3.ZERO })
                .call(() => { resolve(); })
                .start();
        })
    }
}


