import { _decorator, Component, instantiate, Label, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { AnimBoat_map_1 } from '../../../Map_Lobby/AnimBoat_map_1';
const { ccclass, property } = _decorator;

@ccclass('Constructor_visualPrepareBuild')
export class Constructor_visualPrepareBuild extends Component {
    @property(Node) nVisual: Node;
    @property(Node) nNoti: Node;
    @property(Node) nVisualBox: Node

    @property(SpriteFrame) imagePre_1: SpriteFrame;
    @property(SpriteFrame) imagePre_2: SpriteFrame;
    @property({ tooltip: "right_normal" }) posNoti_1: Vec3 = new Vec3();  // right_normal
    @property({ tooltip: "right_thuyen" }) posNoti_2: Vec3 = new Vec3();  // right_thuyen
    @property({ tooltip: "left_normal" }) posNoti_3: Vec3 = new Vec3();  // left_normal
    @property(Label) lbInfo: Label;
    @property(Label) lbInfo_shadow: Label;

    SetVisualPrepareBuild(nameObject: string, pos: Vec3, scale: Vec3, type: number = 0 | 1 | 2, requirement: number = 0) {
        this.node.setPosition(pos);
        if (scale != null) {
            this.node.setScale(scale);
        }

        // try check in case special first
        if (this.SetVisualPrepareBuild_Spe(pos, scale, nameObject)) { return; }

        switch (type) {
            case 0:
                this.nVisual.getComponent(Sprite).spriteFrame = this.imagePre_1;
                this.nNoti.setPosition(this.posNoti_1);
                this.nVisualBox.scale = new Vec3(1, 1, 1);
                break;
            case 1: this.nVisual.getComponent(Sprite).spriteFrame = this.imagePre_2;
                this.nNoti.setPosition(this.posNoti_1);
                this.nVisualBox.scale = new Vec3(1, 1, 1);
                break;
            case 2:
                this.nVisual.getComponent(Sprite).spriteFrame = this.imagePre_1;
                this.nNoti.setPosition(this.posNoti_3);
                this.nVisualBox.scale = new Vec3(-1, 1, 1);
                this.nVisualBox.setPosition(new Vec3(4, 0, 0));
                break;
        }

        this.lbInfo.string = `x${requirement}`;
        this.lbInfo_shadow.string = `x${requirement}`;
    }

    private SetVisualPrepareBuild_Spe(pos: Vec3, scale: Vec3, name: string) {
        this.node.setPosition(pos);
        if (scale != null) {
            this.node.setScale(scale);
        }

        switch (name) {
            // constructor in map 1
            case `Golden Gate Bridge`:
                // init a prefab and add it to the VisualPrepareBuild
                let pfAnim = instantiate(MConfigResourceUtils.map_pf_subs_map_lobby.get(`pf_boat_map_1`));
                if (pfAnim == null) { return; }
                let AnimPrepareBuild = instantiate(pfAnim);
                AnimPrepareBuild.setParent(this.node);
                const animCom = AnimPrepareBuild.getComponent(AnimBoat_map_1);
                animCom != null &&  animCom.PlayAnimIdle();
                return true;
        }

        return false;
    }
}


