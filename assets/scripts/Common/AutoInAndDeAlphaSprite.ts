import { _decorator, CCFloat, CCInteger, Color, Component, Node, Sprite, Tween, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AutoInAndDeAlphaSprite')
export class AutoInAndDeAlphaSprite extends Component {
    @property(CCFloat) timeIncrease: number = 1;
    @property(CCFloat) timeDecrease: number = 1;

    private _uiOpacity: UIOpacity = null;
    protected onLoad(): void {
        this._uiOpacity = this.node.getComponent(UIOpacity);
    }

    protected onEnable(): void {
        this._uiOpacity.opacity = 0;
        tween(this._uiOpacity)
            .to(this.timeIncrease, { opacity: 255 })
            .to(this.timeDecrease, { opacity: 0 })
            .union()
            .repeatForever()
            .start();
    }

    protected onDisable(): void {
        Tween.stopAllByTarget(this._uiOpacity);
    }
}


