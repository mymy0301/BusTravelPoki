import { _decorator, Component, MotionStreak, Node, tween } from 'cc';
import { DataTrailsSys } from '../../../DataBase/DataTrailsSys';
const { ccclass, property } = _decorator;

@ccclass('TrailCarSys')
export class TrailCarSys extends Component {
    @property(Node) nTrail: Node;

    protected onLoad(): void {
        this.nTrail.active = false;
    }

    public TurnOnTrail(idTrail: string = "0") {
        // không bật trail đối với idTrail 0
        if (idTrail == "0") { return; }
        this.nTrail.active = true;
        this.nTrail.getComponent(MotionStreak).color = DataTrailsSys.Instance.GetColorTrailByData(idTrail);
    }
}


