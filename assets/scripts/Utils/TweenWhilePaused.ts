import { _decorator, Component, director, tween, TweenSystem, Vec3, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TweenWhilePaused')
export class TweenWhilePaused extends Component {

    @property(Node)
    targetNode: Node | null = null;

    private _isRunning = false;

    onLoad() {
        // Pause toàn bộ game
        director.pause();

        // Bắt đầu tween (dù game đã pause)
        this.startTweenManually();

        // Bắt đầu vòng lặp update tween thủ công
        this._isRunning = true;
        this.schedule(this.manualTweenUpdate, 1 / 60);
    }

    startTweenManually() {
        if (!this.targetNode) return;

        // Tween từ vị trí hiện tại sang x = 300 trong 2 giây
        tween(this.targetNode.position)
            .to(2, new Vec3(300, this.targetNode.position.y, this.targetNode.position.z), {
                onUpdate: (target: Vec3, ratio) => {
                    if (this.targetNode) {
                        this.targetNode.setPosition(target);
                    }
                },
                onComplete: () => {
                    console.log('Tween complete!');
                    this._isRunning = false;
                }
            })
            .start();
    }

    manualTweenUpdate() {
        if (this._isRunning) {
            // console.log("11111");
            TweenSystem.instance.update(1 / 60); // tự cập nhật tween
        }
    }

    onDestroy() {
        this.unschedule(this.manualTweenUpdate);
    }
}