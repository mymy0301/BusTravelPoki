/**
 * 
 * anhngoxitin01
 * Mon Dec 22 2025 10:54:23 GMT+0700 (Indochina Time)
 * HotFixCam
 * db://assets/scripts/HotFixCam.ts
*
*/
import { _decorator, Camera, Component, Node, view } from 'cc';
import { MConfigs } from './Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('HotFixCam')
export class HotFixCam extends Component {
    @property(Camera) camera: Camera;
    protected onLoad(): void {
        view.on('design-resolution-changed', this.updateCameraOrthoHeight, this);
    }

    protected start(): void {
        this.updateCameraOrthoHeight();
    }

    protected onDestroy(): void {
        view.off('design-resolution-changed', this.updateCameraOrthoHeight, this);
    }

    updateCameraOrthoHeight(): void {
        // if (!MConfigs.isMobile) {
        //     if (this.camera) {
        //         this.camera.orthoHeight = 640;
        //     }
        // }
    }
}