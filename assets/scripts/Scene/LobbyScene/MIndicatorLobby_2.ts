import { _decorator, CCInteger, Component, instantiate, Label, Layout, Node, Prefab, screen, Size, Sprite, SpriteFrame, Tween, tween, UITransform, Vec3 } from 'cc';
import { ChildIndicatorLobby_2 } from './ChildIndicatorLobby_2';
import { MConfig_TypeMIndicator2, STATE_INDICATOR } from './TypeMIndicator2';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { DataDailyQuestSys } from '../../DataBase/DataDailyQuestSys';
import { DataShopSys } from '../DataShopSys';
import { MConfigs } from '../../Configs/MConfigs';
import { Utils } from '../../Utils/Utils';
import { AnimIconHomeSys } from '../../AnimsPrefab/AnimIconHomeSys';
import { NAME_ANIM_STAR, NameAnimChest_Streak_open } from '../../Utils/TypeAnimChest';
import { PAGE_VIEW_LOBBY_NAME } from '../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('MIndicatorLobby_2')
export class MIndicatorLobby_2 extends Component {
    @property(Node) nParentAnim: Node;
    @property(Prefab) pfIconHome: Prefab;
    @property([ChildIndicatorLobby_2]) listChildIndi: ChildIndicatorLobby_2[] = [];
    @property(SpriteFrame) sfUnChoice: SpriteFrame;
    @property(SpriteFrame) sfChoice: SpriteFrame;
    @property(Node) nIconNotiShop: Node;
    private _indexChoiceNow: number = -1;
    private _nIconStar: Node = null;

    protected onLoad(): void {
        // cacul the width to set the width suitable with indicator
        if(MConfigs.isMobile){
            MConfig_TypeMIndicator2.width_bg_unChoice = this.node.parent.getComponent(UITransform).width / (MConfig_TypeMIndicator2.ratioChoiceAndUnChoice + 4);
        }else{
            MConfig_TypeMIndicator2.width_bg_unChoice = MConst.DEFAULT_DESKTOP_WIDTH / (MConfig_TypeMIndicator2.ratioChoiceAndUnChoice + 4);
        }
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_SHOP.SHOW_NOTI, this.ShowNotiShop, this);
        clientEvent.on(MConst.EVENT_SHOP.HIDE_NOTI, this.HideNotiShop, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_SHOP.SHOW_NOTI, this.ShowNotiShop, this);
        clientEvent.off(MConst.EVENT_SHOP.HIDE_NOTI, this.HideNotiShop, this);
    }

    protected start(): void {
        // register 
        this.RegisterClickTab();
    }

    private RegisterClickTab() {
        this.listChildIndi.forEach((element, index) => {
            element.RegisterClick(this.ChoiceTab.bind(this), this.sfChoice, this.sfUnChoice);
        })
    }

    private UnRegisterClickTab() {
        this.listChildIndi.forEach((element, index) => {
            element.UnRegisterClick();
        })
    }

    //#region noti
    private ShowNotiShop() {
        this.nIconNotiShop.active = true;
    }

    /**
     * func này dc gọi trong 2 trường hợp
     * TH1: khi user nhận thưởng quest daily
     * TH2: khi user nhận thưởng coin ads
     * @returns 
     */
    private HideNotiShop() {
        // check no daily Quest to claim
        if (DataDailyQuestSys.Instance.HasAnyQuestCanClaim()) { return; }
        // check no ads coin can receive or not in can receive
        if (DataShopSys.Instance.GetNumShopFreeToPlay() >= MConfigs.LIMIT_COIN_ADS_FREE_EACH_DAY || Utils.getSecondNow() >= DataShopSys.Instance.GetShopFreeLastTime() + MConfigs.TIME_COOLDOWN_COIN_ADS) { return }
        if (!DataShopSys.Instance.IsReceiveCoinFreeToday()) { return; }
        this.nIconNotiShop.active = false;
    }
    //#endregion noti


    public ChoiceTabForce(indexChoice) {
        this._indexChoiceNow = indexChoice;
        this.listChildIndi[this._indexChoiceNow].ChangeState(STATE_INDICATOR.Choice, true);
        this.listChildIndi.forEach((element, index) => {
            if (index != this._indexChoiceNow) {
                element.ChangeState(STATE_INDICATOR.Unchoice, true);
            }
        })
    }

    public ChoiceTab(indexChoice) {
        if (this._indexChoiceNow == indexChoice) { return; }
        this.listChildIndi[indexChoice].ChangeState(STATE_INDICATOR.Choice);
        this.listChildIndi[this._indexChoiceNow].ChangeState(STATE_INDICATOR.Unchoice);
        this._indexChoiceNow = indexChoice;
    }

    public async PlayAnimStar() {
        if (this.nParentAnim.children.length == 0) {
            // init prefab
            this._nIconStar = instantiate(this.pfIconHome);
            const animCom = this._nIconStar.getComponent(AnimIconHomeSys);
            animCom.HideAnim();
            this._nIconStar.parent = this.nParentAnim;
            const wPosIconRank = this.listChildIndi[PAGE_VIEW_LOBBY_NAME.RANK].nIcon.worldPosition.clone();
            this._nIconStar.setWorldPosition(wPosIconRank);
            animCom.ShowAnim();
            animCom.PlayAnim(NAME_ANIM_STAR);
            await Utils.delay(animCom.GetTimeAnim(NAME_ANIM_STAR) * 1000);
            animCom.HideAnim();
        }
    }
}


