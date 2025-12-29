import { _decorator, Camera, CCFloat, Component, Node, tween, UITransform, Vec3 } from 'cc';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('MCameraSys')
export class MCameraSys extends Component {
    public static Instance: MCameraSys = null
    @property(CCFloat) maxOrthoHeightCam: number = 640;
    @property(Camera) camera: Camera = null;

    protected onLoad(): void {
        if (MCameraSys.Instance == null) {
            MCameraSys.Instance = this;
        }
    }

    protected onDestroy(): void {
        MCameraSys.Instance = null
    }

    //#region spe Features
    public ZoomCameraFocusOnTarget(target: Node, distanceRatioForZoom: number = 0, timeZoomIn: number = 1.5): Promise<void> {
        const self = this;
        // get the size of Object to view suit with camera
        let sizeObj = target.getComponent(UITransform).contentSize.clone();
        let screenSize = Utils.getSizeWindow();

        // caculate zoom ortho of camera
        let scaleSuitToZoom = (sizeObj.x >= sizeObj.y) ? sizeObj.x / screenSize.width : sizeObj.y / screenSize.height;

        console.log("222", scaleSuitToZoom);

        // zoom camera
        const orthoZoomInTo = this.maxOrthoHeightCam * (scaleSuitToZoom) + distanceRatioForZoom;
        const posCamMoveTo = new Vec3(target.position.x, target.position.y, 1000);
        const orthoNow = this.camera.orthoHeight;
        const distanceOrtho = orthoNow - orthoZoomInTo;

        // tween
        return new Promise<void>(resolve => {
            tween(this.camera.node)
                .to(timeZoomIn, { position: posCamMoveTo }, {
                    onUpdate(target, ratio) {
                        self.camera.orthoHeight = orthoNow - distanceOrtho * ratio;
                    },
                })
                .call(() => { resolve(); })
                .start();
        })
    }

    public ZoomCameraToDefault(time: number = 1) {
        const self = this;

        const posCamMoveTo = new Vec3(0, 0, 1000);
        const orthoNow = this.camera.orthoHeight;
        const distanceOrtho = this.maxOrthoHeightCam - orthoNow;

        return new Promise<void>(resolve => {
            tween(this.camera.node)
                .to(time, { position: posCamMoveTo }, {
                    onUpdate(target, ratio) {
                        self.camera.orthoHeight = orthoNow + distanceOrtho * ratio;
                    },
                })
                .call(() => { resolve(); })
                .start();
        })
    }

    //#endregion spe Features
}


