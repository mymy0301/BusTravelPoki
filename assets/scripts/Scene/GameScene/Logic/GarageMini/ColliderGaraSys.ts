import { _decorator, Component, Node } from 'cc';
import { GarageSys } from './GarageSys';
const { ccclass, property } = _decorator;

@ccclass('ColliderGaraSys')
export class ColliderGaraSys extends Component {
    public GetGaraSys(): GarageSys {
        return this.node.parent.getComponent(GarageSys);
    }
}


