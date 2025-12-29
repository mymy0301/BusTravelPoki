import { _decorator, Component, Node, ParticleSystem, Vec3 } from 'cc';
import { MConfigResourceUtils } from '../../Utils/MConfigResourceUtils';
import { MConst } from '../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('BlinkUI')
export class BlinkUI extends Component {
    @property(Vec3) posSet: Vec3;
    @property(Node) nParent: Node;

    public InitParticle() {
    }

}


