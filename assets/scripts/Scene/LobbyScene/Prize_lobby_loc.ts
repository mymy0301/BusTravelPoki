import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Prize_lobby_loc')
export class Prize_lobby_loc extends Component {
    @property([Node]) listNPos: Node[] = [];

    public getListWPos(numPrize: number): Vec3[] {
        return this.listNPos[numPrize - 1].children.map((node: Node) => node.worldPosition.clone());
    }

    public getListPos(numPrize): Vec3[] {
        return this.listNPos[numPrize - 1].children.map((node: Node) => node.position.clone());
    }
}


