import { _decorator, Color, Component, director, EditBox, Label, Layers, Node, randomRangeInt, resources, Skeleton, sp, tween, Tween, Vec3 } from 'cc';
import { MConst } from '../../Const/MConst';
import { PlayerData } from '../../Utils/PlayerData';
import { setTimeOffset } from '../../Utils/Time/time-offset';
const { ccclass, property } = _decorator;

@ccclass('preloadSceen')
export class preloadSceen extends Component {
    @property(Label) lbTime: Label;
    private timeTrigger: number = 0;
    private readonly MAX_TIME_TRIGGER = 1;

    protected update(dt: number): void {
        this.timeTrigger += dt;
        if (this.timeTrigger > this.MAX_TIME_TRIGGER) {
            this.timeTrigger = 0;
            this.UpdateTime();
        }
    }

    async OnBtnLogin() {
        director.loadScene(MConst.NAME_SCENE.LOAD, () => {

        });
    }

    @property(EditBox) edtTime: EditBox;
    async onBtnChangeTimeLocal() {
        try {
            const time1 = Number.parseInt(this.edtTime.string);
            setTimeOffset(time1 * 1000);
        } catch (e) {
            console.error(e);
        }
    }

    async onBtnResetDataGame() {
        new PlayerData();
        PlayerData.Instance.ResetData();
    }

    //==========================================
    //#region time
    private UpdateTime() {
        let _dateNow = new Date();
        this.lbTime.string = `${_dateNow.toDateString()}_${_dateNow.toTimeString()}`;
    }
    //#endregion time
    //==========================================
}


