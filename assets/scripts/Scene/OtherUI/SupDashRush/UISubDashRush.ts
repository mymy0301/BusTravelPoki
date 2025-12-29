import { _decorator, Component, Label, Node, SpriteFrame, tween, UIOpacity, Vec3, Widget } from 'cc';
import { DataDashRush } from '../../DataDashRush';
import { DataEventsSys } from '../../DataEventsSys';
import { InfoBot_DashRush, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { SubDashRush_UIDetail } from './SubDashRush_UIDetail';
import { SubDashRush_noPlayer } from './SubDashRush_noPlayer';
const { ccclass, property } = _decorator;

@ccclass('UISubDashRush')
export class UISubDashRush extends Component {
    @property(Node) nBlockUI: Node;
    @property(SubDashRush_UIDetail) subDashRush_UIDetail: SubDashRush_UIDetail;
    @property(SubDashRush_noPlayer) subDashRush_noPlayer: SubDashRush_noPlayer;

    protected onLoad(): void {
        // hide block
        this.nBlockUI.active = false;

        // init cb
        this.subDashRush_noPlayer.InitCb(
            this.ShowUIDetail.bind(this),
            this.ShowBlockUI.bind(this),
            this.HideBlockUI.bind(this),
            this.JoindDashRush.bind(this)
        );
        this.subDashRush_UIDetail.InitCb(
            this.ShowBlockUI.bind(this),
            this.HideBlockUI.bind(this)
        );
    }

    //================================
    //#region self
    private ShowBlockUI() { this.nBlockUI.active = true; }
    private HideBlockUI() { this.nBlockUI.active = true; }
    private ShowUIDetail() { this.subDashRush_UIDetail.ShowUI(); }

    private JoindDashRush() {
        DataDashRush.Instance.InitNewRound(true);
        this.subDashRush_UIDetail.SetUpData(DataDashRush.Instance.GetOldDataCache());
    }
    //#endregion self
    //================================

    //================================
    //#region public func

    public CanShowDashRushWinLose() {
        const isUnlockDashRush = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.DASH_RUSH);
        const isJoinDashRush = DataDashRush.Instance.IsJoiningDashRush();
        return isUnlockDashRush && isJoinDashRush;
    }

    public async ShowUI_when_joinning(oldDataDashRush: InfoBot_DashRush[]) {
        try {
            this.subDashRush_UIDetail.listSubDashRush.Init();
            this.Show();
            // in this case only pass user is joining dashRush
            this.subDashRush_noPlayer.HideUI(false);
            this.subDashRush_UIDetail.SetUpData(oldDataDashRush);
            await this.subDashRush_UIDetail.ShowUI_WithAnim();
            await this.subDashRush_UIDetail.AnimIncreaseScore();
        } catch (e) {
            console.error("wrong to show subDashRush");
        }
    }

    public async TryShowUIInWinLose(oldDataDashRush: InfoBot_DashRush[]) {
        try {
            if (!this.CanShowDashRushWinLose()) {
                this.Hide();
                return;
            } else {
                this.subDashRush_UIDetail.listSubDashRush.Init();
            }

            this.Show();
            // in this case only pass user is joining dashRush
            this.subDashRush_noPlayer.HideUI(false);
            this.subDashRush_UIDetail.SetUpData(oldDataDashRush);
            await this.subDashRush_UIDetail.ShowUI_WithAnim();
            await this.subDashRush_UIDetail.AnimIncreaseScore();
        } catch (e) {
            console.error("wrong to show subDashRush");
        }
    }

    public Hide() {
        this.node.active = false;
    }


    private readonly TIME_SHOW: number = 0.2;
    public Show() {
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
        tween(this.node)
            .to(this.TIME_SHOW, { position: posEnd }, {
                onUpdate(target, ratio) {
                    opaCom.opacity = ratio * 255;
                },
            })
            .start()
    }

    public AnimClose() {
        const mOpacity = this.node.getComponent(UIOpacity);
        this.node.getComponent(Widget).enabled = false;
        let posStart = this.node.position.clone()
        // const distanceDown: number = -Utils.getSizeWindow().height;
        const distanceDown: number = -200;

        const posEnd = posStart.clone().add3f(0, distanceDown, 0);
        tween(this.node)
            .to(0.2, { position: posEnd }, {
                onUpdate(target, ratio) {
                    mOpacity.opacity = 255 * (1 - ratio);
                },
            })
            .call(() => { this.node.active = false; })
            .start();
    }
    //#endregion public func
    //================================
}


