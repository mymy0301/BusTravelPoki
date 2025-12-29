import { _decorator, Component, Node, Sprite, UITransform, Vec3 } from 'cc';
import { ReadDataJson } from 'db://assets/scripts/ReadDataJson';
import { ConfigPosPassJsonCar, M_COLOR } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('VisualPickUpPassLeft')
export class VisualPickUpPassLeft extends Component {
    public _listPass: Node[] = [];

    public TryInitPass(numPass: number, colorCar: M_COLOR, dataCustom: Vec3[] = null) {
        if (this._listPass.length > 0) { return; }

        // get dataToGen
        const dataToGen = ReadDataJson.Instance.GetConfigPosPassCar();
        let dataConfig: ConfigPosPassJsonCar = null;
        if (dataConfig == null) {
            switch (colorCar) {
                case M_COLOR.REINDEER_CART:
                    dataConfig = dataToGen.find(item => item.IsReindeerCart);
                    break;
                default:
                    dataConfig = dataToGen.find(item => item.SizeCar == numPass);
                    break;
            }
        }

        // init node
        for (let i = 0; i < numPass; i++) {
            const nPass = this.GetNodePass(i);
            this._listPass.push(nPass);
            this.node.addChild(nPass);
            nPass.position = dataCustom == null ? dataConfig.ListPosPassengerLeft[i] : dataCustom[i];
        }
    }

    private GetNodePass(index: number): Node {
        // creat nPass
        let nPass: Node = new Node;
        nPass.name = `nPass_${index}`;
        nPass.addComponent(UITransform);
        nPass.addComponent(Sprite);

        return nPass
    }
}


