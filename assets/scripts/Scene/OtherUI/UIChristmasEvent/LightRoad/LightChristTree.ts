/**
 * 
 * anhngoxitin01
 * Tue Nov 25 2025 09:24:02 GMT+0700 (Indochina Time)
 * LightChristTree
 * db://assets/scripts/Scene/OtherUI/UIChristmasEvent/LightRoad/LightChristTree.ts
*
*/
import { _decorator, Component, Node, Sprite, SpriteFrame, tween, UIOpacity } from 'cc';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('LightChristTree')
export class LightChristTree extends Component {
    @property(Sprite) spLight: Sprite;
    @property(Sprite) spRoot: Sprite;


    //==========================================
    //#region base
    public LoadRoot(): void {
        // only load if it not have spriteFrame
        if (this.spRoot.spriteFrame != null) { return; }
        const pathLightRoot = MConfigResourceUtils.GetPathLightBulb(0, 'root');
        MConfigResourceUtils.GetLightBulbsUntilLoad(pathLightRoot, (path: string, sfImg: SpriteFrame) => {
            if (path == pathLightRoot) {
                this.spRoot.spriteFrame = sfImg;
            }
        })
    }

    public SetImageLight(indexLight: number) {
        const pathImgLight = MConfigResourceUtils.GetPathLightBulb(indexLight, 'color');
        MConfigResourceUtils.GetLightBulbsUntilLoad(pathImgLight, (path: string, sfImg: SpriteFrame) => {
            if (path == pathImgLight) {
                this.spLight.spriteFrame = sfImg;
            }
        })
    }

    public get IsOn() { return this.spLight.node.getComponent(UIOpacity).opacity == 255; }
    //#endregion base

    //==========================================
    //#region anim
    public ShowLight(force: boolean = false, cb: () => void = null, time: number = 0.2, opaEnd: number = 255) {
        const opaCom = this.spLight.node.getComponent(UIOpacity)
        if (force) {
            opaCom.opacity = 255;
            return;
        }

        // hiển thị ánh sáng dần dần
        tween(opaCom)
            .to(time, { opacity: opaEnd })
            .call(() => { cb && cb() })
            .start()
    }

    public HideLight() {
        const opaCom = this.spLight.node.getComponent(UIOpacity)
        opaCom.opacity = 0;
    }
    //#endregion anim
}