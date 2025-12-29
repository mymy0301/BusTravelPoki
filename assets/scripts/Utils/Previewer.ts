import { _decorator, CCObject, Component, Enum, Node, tween, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

enum Mode { t1, t2 }
Enum(Mode)
@ccclass('Previewer')
@executeInEditMode
export class Previewer extends Component {
    @property({ type: Mode, displayName: "tttttt" }) private mode = Mode.t1;

    protected onLoad() {
        if (EDITOR) {
            this.node.name = "aaaaaa";
            // this.node['_objFlags'] |= CCObject['Flags'].LockedInEditor;
            this.LoopTween();
            return;
        }
        if (this.mode === Mode.t1) {
            this.node.removeFromParent();
            this.node.destroy();
        } else {
            this.node.removeAllChildren();
            this.node.destroyAllChildren();
            this.destroy();
        }
    }

    protected onDestroy() {
        if (EDITOR) {
            // this.node['_objFlags'] &= CCObject['Flags'].LockedInEditor;
        }
    }

    protected update(dt: number): void {
        if(EDITOR){
            
        }
    }

    private LoopTween() {
        console.log("@22222");
        this.node.position = new Vec3(0, 0, 0);
        tween(this.node)
            .to(0.5, { position: new Vec3(-50, 0, 0) })
            .to(0.5, { position: new Vec3(50, 0, 0) })
            .union()
            .repeatForever()
            .start();
    }
}


