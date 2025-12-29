import { _decorator, Component, Node, Size, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('ChangeTransformCustom')
@requireComponent(Sprite)
export class ChangeTransformCustom extends Component {
    private _baseTransform: Size = new Size();

    protected onLoad(): void {
        this.SaveBaseUITransform();
    }

    private SaveBaseUITransform() {
        this._baseTransform = this.node.getComponent(UITransform).contentSize.clone();
    }

    public UpdateUITransform(sf: SpriteFrame) {
        let ratioWToH = sf.width / sf.height;
        // console.log("ratioWToH", ratioWToH, sf.width, sf.height);
        const wBase = this._baseTransform.width;
        const hNew = wBase / ratioWToH;

        this.node.getComponent(UITransform).contentSize = new Size(wBase, hNew);
    }
}


