import { _decorator, Button, CCFloat, Component, director, Node, tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MoveTo')
export class MoveTo extends Component {
    @property(CCFloat) timeMove: number;
    @property(Vec3) posStart: Vec3 = new Vec3();
    private posEnd: Vec3;

    protected start(): void {
        this.PrepareMove();
    }

    public PrepareMove(isMove: boolean = true){
        this.posEnd = this.node.position.clone();
        this.node.position = this.posStart.clone();

        // check data
        let btnComponent = this.node.getComponent(Button);
        if (btnComponent != null) {
            btnComponent.interactable = false;
        }

        let mOpacity = this.node.getComponent(UIOpacity);
        if (mOpacity != null) {
            mOpacity.opacity = 0;
        }

        if(isMove){
            //move
            this.Move();
        }
    }

    public Move() {
        // MConsolLog.Log("call move the node: " + this.node.name);
        const btnComponent = this.node.getComponent(Button);
        const mOpacity = this.node.getComponent(UIOpacity);
        tween(this.node)
            .to(this.timeMove, { position: this.posEnd }, {onUpdate(target, ratio) {
                if(mOpacity != null){
                    mOpacity.opacity = 255 * ratio;
                }
            },})
            .call(() => {
                if (btnComponent != null) { btnComponent.interactable = true; }
                this.node.emit("MOVE_CUSTOM_DONE");
            })
            .start();
    }
}


