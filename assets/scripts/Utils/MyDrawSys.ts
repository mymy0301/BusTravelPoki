import { _decorator, Color, Component, Graphics, Node, Vec2, Vec3 } from 'cc';
import { Utils } from './Utils';
import { CheatingSys } from '../Scene/CheatingSys';
const { ccclass, property, requireComponent } = _decorator;
@ccclass('MyDrawSys')
@requireComponent(Graphics)

export class MyDrawSys extends Component {
    public static Instance: MyDrawSys = null;

    protected onLoad(): void {
        if (MyDrawSys.Instance == null) {
            MyDrawSys.Instance = this;
        }
    }

    protected onDestroy(): void {
        MyDrawSys.Instance = null;
    }

    public ClearDrawWithTime() {
        if (this.getComponent(Graphics) != null) {
            this.getComponent(Graphics).clear();
        }
    }

    public DrawLine(wPosStart: Vec3, listWPosEnd: Vec3[], color: Color): void {
        // cheat draw line
        if (CheatingSys.Instance != null && !CheatingSys.Instance.isCheatDrawLine) { return; }

        const listWPosEndInVec2: Vec2[] = listWPosEnd.map(vec3 => Utils.ConvertVec3ToVec2(vec3));
        Utils.DrawALine(this.getComponent(Graphics), Utils.ConvertVec3ToVec2(wPosStart), listWPosEndInVec2, color);
    }

    public DrawLineWithTimeDisplay(wPosStart: Vec3, listWPosEnd: Vec3[], color: Color = Color.BLACK, time: number = 2): void {
        //cheat draw line
        if (CheatingSys.Instance == null || (CheatingSys.Instance != null && !CheatingSys.Instance.isCheatDrawLine)) { return; }

        const listWPosEndInVec2: Vec2[] = listWPosEnd.map(vec3 => Utils.ConvertVec3ToVec2(vec3));
        Utils.DrawALine(this.getComponent(Graphics), Utils.ConvertVec3ToVec2(wPosStart), listWPosEndInVec2, color);
        (async () => {
            await Utils.delay(time * 1000);
            if (this != null && this != undefined && this.isValid)
                this.ClearDrawWithTime();
        })()
    }
}


