import { _decorator, Animation, AnimationComponent, Component, Node, Sprite, SpriteFrame, loader, director, tween, Tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UILoadingSys_2')
export class UILoadingSys_2 extends Component {
    private listTween: Tween<UIOpacity>[] = []
    private readonly timeShowUI: number = 0.5;

    public Show() {
        // MConsolLog.Log("receive call in here show");
        // show slow
        this.node.active = true;

        this.node.children.forEach(child => {
            child.active = true;
            const tweenChild = tween(child.getComponent(UIOpacity))
                .to(this.timeShowUI, { opacity: 255 })
                .start();
            this.listTween.push(tweenChild);
        })
    }

    public Close() {
        // stop all tweenF
        this.listTween.forEach(tweenCheck => tweenCheck.stop())
        this.listTween = [];

        // MConsolLog.Log("receive call in here close");
        this.node.children.forEach(child => {
            child.active = false;
            child.getComponent(UIOpacity).opacity = 0;
        });
        this.node.active = false;
    }
}


