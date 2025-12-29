/**
 * 
 * dinhquangvinhdev
 * Thu Sep 04 2025 11:28:50 GMT+0700 (Indochina Time)
 * PageAreYourSure
 * db://assets/scripts/Scene/OtherUI/UIContinue/PageAreYourSure.ts
*
*/
import { _decorator, Component, Label, Layout, Node, RichText, Sprite, tween, UIOpacity, Vec3 } from 'cc';
import { AnimIconHomeSys } from '../../../AnimsPrefab/AnimIconHomeSys';
import { NameAnimIconHome_Active } from '../../../Utils/TypeAnimChest';
import { DataHatRace_christ } from '../../../DataBase/DataHatRace_christ';
import { CONFIG_HAT_RACE } from '../UIChristmasEvent/HatRace/TypeHatRace';
const { ccclass, property } = _decorator;

@ccclass('PageUIAreYouSureChrist')
export class PageUIAreYouSureChrist extends Component {
    @property(RichText) rt: RichText;
    @property(Layout) layoutHeadIcon: Layout;
    @property(Layout) layoutBody: Layout;
    @property(AnimIconHomeSys) animIconHR: AnimIconHomeSys;
    @property(Label) lbHatRace: Label;
    private readonly DELAY_TIME_LOOP_ANIM = 2;
    //==========================================
    //#region base
    protected onDisable(): void {
        this.animIconHR.StopAnim();
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region public
    public SetUp(setUpAnim: boolean = true) {
        let numEventShowing = 0;

        this.animIconHR.StopAnim();
        numEventShowing += 1;
        setUpAnim && this.animIconHR.PlayAnimLoopWithDelay(NameAnimIconHome_Active.chirstmas, this.DELAY_TIME_LOOP_ANIM, true);
        !setUpAnim && this.animIconHR.PlayAnimAndStopAtFrame(NameAnimIconHome_Active.chirstmas, 0);
        this.lbHatRace.string = `${DataHatRace_christ.Instance.GetIndexMutilply() + 1}/${CONFIG_HAT_RACE.MULTIPLIER.length}`;
    }

    public Hide() { this.node.getComponent(UIOpacity).opacity = 0; }
    public Show(timeShow: number = 1) {
        tween(this.node.getComponent(UIOpacity))
            .to(timeShow, { opacity: 255 })
            .start();
        this.node.getComponent(UIOpacity).opacity = 255;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}