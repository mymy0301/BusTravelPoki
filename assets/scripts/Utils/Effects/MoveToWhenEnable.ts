import { _decorator, Button, CCFloat, Component, director, Node, tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MoveToWhenEnable')
export class MoveToWhenEnable extends Component {
    @property(CCFloat) timeMove: number;
    @property(Vec3) posStart: Vec3 = new Vec3();
    private posEnd: Vec3;

    protected onLoad(): void {
        this.posEnd = this.node.position.clone();
    }

    public PrepareMove(){
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

        //move
        this.Move(btnComponent, mOpacity);
    }

    private Move(btnComponent: Button = null, mOpacity: UIOpacity = null) {
        // MConsolLog.Log("call move the node: " + this.node.name);
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

    public SetToPosPrepare(){
        this.node.position = this.posStart;
        const mOpacity = this.node.getComponent(UIOpacity);
        if(mOpacity != null){
            mOpacity.opacity = 0;
        }
    }
}


