import { _decorator, Animation, AnimationComponent, Component, Node, Sprite, SpriteFrame, loader, director } from 'cc';
import { MConst } from '../../Const/MConst';
import { clientEvent } from '../../framework/clientEvent';
const { ccclass, property } = _decorator;

@ccclass('UILoadingSys')
export class UILoadingSys extends Component {
    protected onEnable(): void {
        director.on(MConst.EVENT.BLOCK_UI.SHOW_UI_LOADING, this.Show, this);
        clientEvent.on(MConst.SHOW_LOADING_AD_POPUP, this.Show, this);
        director.on(MConst.EVENT.BLOCK_UI.HIDE_UI_LOADING, this.Close, this);
        clientEvent.on(MConst.HIDE_LOADING_AD_POPUP, this.Close, this);
    }

    protected onDisable(): void {
        director.off(MConst.EVENT.BLOCK_UI.SHOW_UI_LOADING, this.Show, this);
        clientEvent.off(MConst.SHOW_LOADING_AD_POPUP, this.Show, this);
        director.off(MConst.EVENT.BLOCK_UI.HIDE_UI_LOADING, this.Close, this);
        clientEvent.off(MConst.HIDE_LOADING_AD_POPUP, this.Close, this);
    }

    protected start(): void {
        this.Close();
    }
    public Show() {
        // MConsolLog.Log("receive call in here show");
        // this.node.active = true;
        this.node.children.forEach(child => child.active = true);
    }

    public Close() {
        // MConsolLog.Log("receive call in here close");
        this.node.children.forEach(child => child.active = false);
        // this.node.active = false;
    }
}


