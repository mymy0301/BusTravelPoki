import { _decorator, CCBoolean, CCInteger, Component, EventTouch, Node, Size, tween, Tween, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('btnChosenOne')
export class btnChosenOne extends Component {
    @property(CCBoolean) autoRegisterWhenEnable = true;
    @property(CCInteger) typeEffectPlay: number = 0;

    protected onEnable(): void {
        if (this.autoRegisterWhenEnable) this.Register();
    }

    protected onDisable(): void {
        this.UnRegister();
    }

    public Register() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    public UnRegister() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }


    //#region func base
    private isMoveOut = false;
    private CheckIsMoveOutNode(locTouchStart: Vec2, locTouchNow: Vec2) {
        const sizeNodeNow: Size = this.node.getComponent(UITransform).contentSize.clone();
        if (locTouchNow.x < locTouchStart.x - sizeNodeNow.width / 2 || locTouchNow.x > locTouchStart.x + sizeNodeNow.width / 2) {
            this.isMoveOut = true;
            return;
        }
        if (locTouchNow.y < locTouchStart.y - sizeNodeNow.height / 2 || locTouchNow.y > locTouchStart.y + sizeNodeNow.height / 2) {
            this.isMoveOut = true;
            return;
        }
    }

    private PlayEffectButton_end() {
        Tween.stopAllByTarget(this.node);

        switch (this.typeEffectPlay) {
            case 0:
                tween(this.node)
                    .to(0.1, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: 'smooth' })
                    .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: 'smooth' })
                    .start();
                break;
        }
    }

    private PlayEffectButton_start() {
        Tween.stopAllByTarget(this.node)

        switch (this.typeEffectPlay) {
            case 0:
                tween(this.node)
                    .to(0.1, { scale: new Vec3(0.8, 0.8, 0.8) }, { easing: 'smooth' })
                    .start();
                break;
        }
    }

    protected onTouchStart(event: EventTouch) {
        this.isMoveOut = false;
        this.PlayEffectButton_start();
    }

    protected onTouchEnd(event: EventTouch) {
        if (!this.isMoveOut) {
            this.PlayEffectButton_end();
        }
    }

    protected onTouchMove(event: EventTouch) {
        if (!this.isMoveOut) {
            const locTouchStart: Vec2 = event.getUIStartLocation().clone();
            const locTouchNow: Vec2 = event.getUILocation().clone();

            this.CheckIsMoveOutNode(locTouchStart, locTouchNow);
            if (this.isMoveOut) {
                this.PlayEffectButton_end();
            }
        }
    }
    //#endregion func base
}


