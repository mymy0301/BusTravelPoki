import { _decorator, CCBoolean, Component, EventHandler, instantiate, macro, Node, PageView, Prefab, ToggleContainer } from 'cc';
import { DataPackSys } from '../../../DataBase/DataPackSys';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { ConvertStringToEnumNamePack, EnumNamePack, EnumReasonEndPack } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { UIContinue_ItemPack } from './UIContinue_ItemPack';
import { ListToggleSys } from '../../../Common/Toggle/ListToggleSys';
import { Utils } from '../../../Utils/Utils';
import { GameManager } from '../../GameManager';
import { MConfigs } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('UIContinue_PagePack')
export class UIContinue_PagePack extends Component {
    @property(Prefab) pfItemPack: Prefab = null;
    @property(Node) nLayout: Node;
    @property(PageView) pv: PageView;
    @property(ListToggleSys) listToggleSys: ListToggleSys;
    private _listPacks: Node[] = [];

    private _cbUpdateUIContinue: CallableFunction = null;

    protected onEnable(): void {
        this.pv.node.on(PageView.EventType.SCROLL_ENDED, this.OnScrollEnd, this);
        this.pv.node.on(PageView.EventType.SCROLL_BEGAN, this.OnPageBeganScroll, this);
        this.pv.node.on(PageView.EventType.SCROLL_ENDED, this.OnPageEndScroll, this);

        // trong trường hợp pack hêt hạn thì phải tắt pack đi nếu cần thiết
        clientEvent.on(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this);
        this.PrepareAutoScrollNextPage();
    }

    protected onDisable(): void {
        this.pv.node.off(PageView.EventType.SCROLL_ENDED, this.OnScrollEnd, this);
        this.pv.node.off(PageView.EventType.SCROLL_BEGAN, this.OnPageBeganScroll, this);
        this.pv.node.off(PageView.EventType.SCROLL_ENDED, this.OnPageEndScroll, this);

        clientEvent.off(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this);
        // check interval auto scroll next page or not
        if (this != null && this.node != null && this.node.isValid && this.idInterval != null && this.idInterval != -1) {
            clearInterval(this.idInterval);
        }
    }

    public SetCB(cbUpdateUIContinue: CallableFunction) {
        this._cbUpdateUIContinue = cbUpdateUIContinue;
    }

    public TryInitPack() {
        // chỉ được phép show pack nếu như người chơi đang có pack hoạt động
        let listPackLose = DataPackSys.Instance.GetAllPackLose(MConfigs.GetTypeLevel(GameManager.Instance.levelPlayerNow));

        // filter pack available
        listPackLose = listPackLose.filter(pack => !DataPackSys.Instance.CheckTimePack(pack) && pack.numAvaliable > 0);

        for (let i = 0; i < listPackLose.length; i++) {
            const dataItemPack = listPackLose[i];

            //check pack was inited 
            if (this._listPacks.find(nItem => nItem.getComponent(UIContinue_ItemPack).GetIdPack() == dataItemPack.namePack) != null) {
                // console.log("can not pass this case 1");
                continue;
            }

            // === init item ===
            let nItemPack: Node = instantiate(this.pfItemPack) as Node;
            nItemPack.parent = this.nLayout;
            nItemPack.getComponent(UIContinue_ItemPack).InitItemPack(dataItemPack, this.RemovePack.bind(this), this._cbUpdateUIContinue);
            this._listPacks.push(nItemPack);
            // add page view pack
            this.pv.addPage(nItemPack);
        }

        // init toggle
        this.listToggleSys.InitToggle(listPackLose.length);
        for (let i = 0; i < listPackLose.length; i++) {
            this.RegisterToggle(i);
        }
        (async () => {
            await Utils.delay(0.5 * 1000);
            this.listToggleSys.ChoiceToggle(0);
        })()

        // ==============================================
        // if not init any pack => turn off this node
        //===============================================
        this.TryHideNode();
    }

    public IsHasAnyPackCanInit(): boolean {
        // chỉ được phép show pack nếu như người chơi đang có pack hoạt động
        let listPackLose = DataPackSys.Instance.GetAllPackLose(MConfigs.GetTypeLevel(GameManager.Instance.levelPlayerNow));

        // filter pack available
        listPackLose = listPackLose.filter(pack => !DataPackSys.Instance.CheckTimePack(pack) && pack.numAvaliable > 0);

        return listPackLose.length > 0;
    }

    private RegisterToggle(index: number) {
        const eventHandle = new EventHandler();
        eventHandle.component = 'UIContinue_PagePack';
        eventHandle.target = this.node;
        eventHandle.customEventData = `${index}`;
        eventHandle.handler = 'ScrollToPage';
        this.listToggleSys.registerCbEachToggle(index, eventHandle);
    }

    private TryHideNode() {
        if (Array.from(this._listPacks).filter(item => item.active).length == 0) {
            this.node.active = false;
        }
    }

    //#region func listen
    private RemovePack(enumReasonEndPack: EnumReasonEndPack, namePack: string) {

        // loop the list pack to find out and turn it off
        let idPack = this._listPacks.findIndex(nPack => nPack.getComponent(UIContinue_ItemPack).GetIdPack() == namePack);
        if (idPack < 0) return;

        // ẩn pack đi
        let nPack = this._listPacks.splice(idPack, 1);
        this.pv.removePage(nPack[0]);

        // update lại toggle
        this.listToggleSys.RemoveToggle(idPack);
        for (let i = 0; i < this.listToggleSys._listToggle.length; i++) {
            this.listToggleSys.unRegisterCbToggle(i);
            this.RegisterToggle(i);
        }

        this.TryHideNode();

        // callback 
        this._cbUpdateUIContinue && this._cbUpdateUIContinue(true);
    }

    private OnScrollEnd() {
        this.timeCacul = 0;
    }

    private OnPageBeganScroll() {
        this.ResetData();
    }

    private OnPageEndScroll() {
        // get the page now
        let indexPageChoice = this.pv.getCurrentPageIndex();
        this.listToggleSys.ChoiceToggle(indexPageChoice);
    }
    //#endregion func listen

    //#region auto scroll next page
    private idInterval: number = -1;
    private timeCacul: number = 0;
    private readonly timeMax: number = 5;

    private ResetData() {
        if (this.idInterval != -1) {
            clearInterval(this.idInterval);
        }
        this.timeCacul = 0;
    }

    private PrepareAutoScrollNextPage() {
        this.ResetData();
        this.idInterval = setInterval(() => {
            try {
                if (this == null || this == undefined || this.node == null || !this.node.isValid) return;
                // check if is scrolling => return
                if (this.pv.isScrolling()) return;
                this.timeCacul += 1;
                if (this.timeCacul >= this.timeMax) {
                    this.ScrollNextPage();
                }
            } catch (e) {
                clearInterval(this.idInterval);
            }
        }, 1000, macro.REPEAT_FOREVER, 0);
    }

    private ScrollNextPage() {
        let maxPage: number = this.pv.getPages().length;
        if (maxPage == 0 || maxPage == 1) return;

        let indexNextPage: number = this.pv.getCurrentPageIndex() + 1;
        if (indexNextPage >= maxPage) { indexNextPage = 0; };
        this.pv.scrollToPage(indexNextPage);
    }

    private ScrollToPage(event: Event, customEventData: string) {
        try {
            const indexPage = Number(customEventData);
            let maxPage: number = this.pv.getPages().length;
            if (maxPage == 0 || maxPage == 1) return;
            if (indexPage < 0 || indexPage >= maxPage) return;

            this.pv.scrollToPage(indexPage);
        } catch (e) {

        }
    }
    //#endregion auto scroll next page
}


