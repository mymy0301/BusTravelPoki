/**
 * 
 * anhngoxitin01
 * Wed Sep 03 2025 09:19:02 GMT+0700 (Indochina Time)
 * UISupSkyLift
 * db://assets/scripts/Scene/OtherUI/SupSkyLift/UISupSkyLift.ts
*
*/
import { _decorator, Component, Label, Node, tween, UIOpacity, UITransform, Vec2, Vec3, Widget } from 'cc';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK } from '../../../Const/MConst';
import { Utils } from '../../../Utils/Utils';
import { ListProgressSupSkyLift } from './ListProgressSupSkyLift';
import { NotiSkyLiftSys } from '../UISkyLift/NotiSkyLiftSys';
import { CarSupSkyLift } from './CarSupSkyLift';
const { ccclass, property } = _decorator;

@ccclass('UISupSkyLift')
export class UISupSkyLift extends Component {
    @property(Node) nBlockUI: Node;
    @property(Label) lbTime: Label;
    @property(ListProgressSupSkyLift) listProgressSubSL: ListProgressSupSkyLift;
    @property(NotiSkyLiftSys) notiSkyLift: NotiSkyLiftSys;
    @property(CarSupSkyLift) carSupSkyLift: CarSupSkyLift;
    //==========================================
    //#region base
    protected onDisable(): void {
        //unRegister time
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    public Init(): void {
        // init progress
        this.listProgressSubSL.SetUp(DataSkyLiftSys.Instance.GetDataJson);
    }

    private PreShow(newProgress: number) {
        // set progress
        this.listProgressSubSL.SetUpProgress(DataSkyLiftSys.Instance.ProgressOld);

        // set time
        this.RegisterTime();

        // hide noti
        this.notiSkyLift.HideNoti();

        this.nBlockUI.active = false;
    }

    public async Show() {

        try {
            this.nBlockUI.active = true;
            const newProgress = DataSkyLiftSys.Instance.ProgressNow;
            this.PreShow(newProgress);

            await Promise.all([
                this.ShowUI(),
                await Utils.delay(this.TIME_SHOW / 3 * 1000),
                this.listProgressSubSL.ScrollToProgress(newProgress, true),
                (() => {
                    // set car
                    const posCar: Vec3 = this.listProgressSubSL.GetPosCar(DataSkyLiftSys.Instance.ProgressOld);
                    this.carSupSkyLift.SetUpPos(posCar);
                })()
            ]);
            // force scroll to progress need
            const posCar: Vec3 = this.listProgressSubSL.GetPosCar(newProgress);
            this.carSupSkyLift.MoveTo(posCar);
            await this.listProgressSubSL.AnimProgress(newProgress);
            this.nBlockUI.active = false;
        } catch (e) {
            console.log(e);
        }
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private readonly TIME_SHOW: number = 0.2;
    private ShowUI() {
        const widgetCom = this.node.getComponent(Widget);
        widgetCom.enabled = true;
        widgetCom.updateAlignment();
        this.node.active = true;
        const opaCom = this.node.getComponent(UIOpacity);
        widgetCom.enabled = false;
        const posEnd: Vec3 = this.node.position.clone();
        const posStart: Vec3 = posEnd.clone().subtract3f(0, widgetCom.bottom, 0);
        this.node.position = posStart;
        opaCom.opacity = 0;
        return new Promise<void>(resolve => {
            tween(this.node)
                .to(this.TIME_SHOW, { position: posEnd }, {
                    onUpdate(target, ratio) {
                        opaCom.opacity = ratio * 255;
                    },
                })
                .call(() => { resolve() })
                .start()
        });
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public HideUI() {
        this.node.active = false;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region time
    private RegisterTime() {
        this.UpdateTime();
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        }
    }

    private UpdateTime() {
        const timeDisplay = DataSkyLiftSys.Instance.GetTimeDisplay();
        if (timeDisplay < 0) {
            this.lbTime.string = "FINISH";
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        } else {
            this.lbTime.string = Utils.convertTimeLengthToFormat_ForEvent(timeDisplay);
        }
    }
    //#endregion time
    //==========================================
}