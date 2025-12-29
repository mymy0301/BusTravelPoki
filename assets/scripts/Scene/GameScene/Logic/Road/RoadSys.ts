import { _decorator, CCBoolean, CCInteger, Component, Node, Vec3 } from 'cc';
import { DIRECT_CAR } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('RoadSys')
export class RoadSys extends Component {
    @property(CCBoolean) isTop: boolean = false;
    @property(CCBoolean) isBottom: boolean = false;
    @property(CCBoolean) isRight: boolean = false;
    @property(CCBoolean) isLeft: boolean = false;
    @property({ tooltip: "lower is better", type: CCInteger }) priorityRoad = 0;

    public GetDirectionCarMoveIn(wPosCollider: Vec3): DIRECT_CAR {
        if (this.isLeft || this.isRight) { return DIRECT_CAR.TOP }
        else if (this.isBottom) {
            if (wPosCollider.x <= this.node.worldPosition.x) {
                return DIRECT_CAR.LEFT;
            } else {
                return DIRECT_CAR.RIGHT;
            }
        } else {
            return null;
        }
    }

    public GetDirectionRoad(): DIRECT_CAR {
        switch (true) {
            case this.isTop: return DIRECT_CAR.TOP;
            case this.isBottom: return DIRECT_CAR.BOTTOM;
            case this.isLeft: return DIRECT_CAR.LEFT;
            case this.isRight: return DIRECT_CAR.RIGHT;
        }
    }
}