import { _decorator, Component, Node, Sprite, UIOpacity, UITransform, Vec3 } from 'cc';
import { SplashPassenger } from '../../OtherUI/SplashPass/SplashPassenger';
import { ReadDataJson } from 'db://assets/scripts/ReadDataJson';
import { ConfigPosPassJsonCar, M_COLOR } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('VisualPickUpPass')
export class VisualPickUpPass extends Component {
    public _listPass: Node[] = [];
    public _listFlash: Node[] = [];

    public TryInitPass(numPass: number, colorCar: M_COLOR, dataPassCustom: Vec3[] = null) {
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
            const nPassAndFlash = this.GetNodePass(i);
            this._listPass.push(nPassAndFlash.nPass);
            this._listFlash.push(nPassAndFlash.nFlash);
        }

        // add to child 
        for (let i = 0; i < this._listPass.length; i++) {
            const pass = this._listPass[i];
            this.node.addChild(this._listPass[i]);
            pass.position = dataPassCustom == null ? dataConfig.ListPosPassenger[i] : dataPassCustom[i];
        }
        for (let i = 0; i < this._listPass.length; i++) {
            const flash = this._listFlash[i];
            this.node.addChild(flash);
            flash.position = dataConfig.ListPosPassenger[i];
        }

    }

    private GetNodePass(index: number): { nPass: Node, nFlash: Node } {
        // create nFlash
        let nFlash: Node = new Node();
        nFlash.name = `nFlash_${index}`;
        nFlash.addComponent(UITransform);
        nFlash.addComponent(Sprite);
        nFlash.addComponent(UIOpacity);

        // creat nPass
        let nPass: Node = new Node;
        nPass.name = `nPass_${index}`;
        nPass.addComponent(UITransform);
        nPass.addComponent(Sprite);
        const comFlashPass = nPass.addComponent(SplashPassenger);
        comFlashPass.spVisual = nFlash.getComponent(Sprite);

        return {
            nPass: nPass,
            nFlash: nFlash
        }

    }
}


