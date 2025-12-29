import { _decorator, CCBoolean, CCInteger, Component, Node, Vec3 } from 'cc';
import { STATE_VISUAL_PASSENGER } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('InfoPassStand')
export class InfoPassStand {
    @property(CCInteger) idFlow: number = -1;
    @property({ type: STATE_VISUAL_PASSENGER }) stateVisualPassengerBeforeMove: STATE_VISUAL_PASSENGER = STATE_VISUAL_PASSENGER.IDLE_DOWN;
    @property({ type: STATE_VISUAL_PASSENGER }) stateVisualPassengerAfterMove: STATE_VISUAL_PASSENGER = STATE_VISUAL_PASSENGER.IDLE_DOWN;
    @property(Node) nPlaceBefore: Node = null;
    @property(Node) nPlaceNext: Node = null;
}
@ccclass('PlaceStandSys')
export class PlaceStandSys extends Component {
    @property(CCBoolean) triggerChangeFlow: boolean = false;
    @property(InfoPassStand) listInfo: InfoPassStand[] = [];
    @property(CCInteger) idPlace: number = -1;

    public GetWPosPlaceStand(): Vec3 { return this.node.worldPosition.clone(); }
    public StateVisualPassengerBeforeMove(index: number) {
        const infoSuit = this.listInfo.find(info => info.idFlow == -1 || info.idFlow == index);
        return infoSuit?.stateVisualPassengerBeforeMove;
    }
    public StateVisualPassengerAfterMove(index: number) {
        const infoSuit = this.listInfo.find(info => info.idFlow == -1 || info.idFlow == index);
        return infoSuit?.stateVisualPassengerAfterMove;
    }
    public GetPlaceNext(index: number) {
        const infoSuit = this.listInfo.find(info => info.idFlow == -1 || info.idFlow == index);
        return infoSuit?.nPlaceNext;
    }
    public GetPlaceBefore(index: number) {
        const infoSuit = this.listInfo.find(info => info.idFlow == -1 || info.idFlow == index);
        return infoSuit?.nPlaceBefore;
    }
}


