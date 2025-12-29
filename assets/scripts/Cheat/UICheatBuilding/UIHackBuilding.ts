import { _decorator, Component, EditBox, EventKeyboard, Label, Node, tween } from 'cc';
import { PlayerData } from '../../Utils/PlayerData';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { Utils } from '../../Utils/Utils';
import { CurrencySys } from '../../Scene/CurrencySys';
const { ccclass, property } = _decorator;

@ccclass('UIHackBuilding')
export class UIHackBuilding extends Component {
    @property(Label) lbNotification: Label;
    @property(EditBox) edtNumResource: EditBox;
    @property(EditBox) edtNumMap: EditBox;
    @property(EditBox) edtNumConstructorUnlocked: EditBox;
    @property(EditBox) edtLevelSave: EditBox;

    @property(Node) nVisual: Node;

    protected onLoad(): void {
        this.node.active = false;
        this.ShowNotification('');
        clientEvent.on(MConst.EVENT_CHEAT.SHOW_UI_CHEAT_BUILDING, this.ShowSelf, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_CHEAT.SHOW_UI_CHEAT_BUILDING, this.ShowSelf, this);
    }

    // #region self
    private ShowSelf() {
        this.node.active = true;
    }

    private ShowNotification(content: string) {
        this.lbNotification.string = content;
    }

    private ReloadPage() {
        location.reload();
    }
    //#endregion self

    //#region btn
    private onBtnSubmit() {
        // hack resources
        const input = this.edtNumResource.string;
        try {
            const numberParse = Number.parseInt(input);

            switch (true) {
                case Number.isNaN(numberParse):
                    this.ShowNotification("input chỉ có thể là số");
                    return;
                case numberParse < 0:
                    this.ShowNotification("số item không được nhỏ hơn 0");
                    return;
            }

            // save data
            PlayerData.Instance._building_numItemBuildingHave = numberParse;
            PlayerData.Instance.Save();
            this.ShowNotification("Done");
        } catch (e) {
            this.ShowNotification("Something wrong");
            console.error(e);
        }
    }

    private async onBtnChangeMap() {
        const inputIndexMap = this.edtNumMap.string;
        const inputIndexConstructor = this.edtNumConstructorUnlocked.string;
        try {
            const indexMap = Number.parseInt(inputIndexMap);
            const indexConstructor = Number.parseInt(inputIndexConstructor);

            switch (true) {
                case Number.isNaN(indexMap) || Number.isNaN(indexConstructor):
                    this.ShowNotification("input chỉ có thể là số");
                    return;
                case indexMap <= 0 || indexMap > 5:
                    this.ShowNotification("chỉ có map 1 |2 |3 |4 |5");
                    return;
                case indexConstructor < 0 || indexConstructor >= 5:
                    this.ShowNotification("số công trình đã hoàn thành chỉ có thể từ 0-4");
                    return;
            }

            // save data
            PlayerData.Instance._buidling_numConstructorUnlock = indexConstructor;
            PlayerData.Instance._building_indexMap = indexMap;
            PlayerData.Instance._building_isReceivedPrizeTotal = false;
            PlayerData.Instance.Save();

            this.ShowNotification("Waitting 1s...");
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
            await Utils.delay(1000);
            // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);

            // reload lại trang
            this.ReloadPage();
        } catch (e) {
            this.ShowNotification("Something wrong");
            console.error(e);
        }
    }

    public async OnBtnUpdateLevelPlayer() {
        try {
            let level = Number.parseInt(this.edtLevelSave.string);

            switch (true) {
                case Number.isNaN(level):
                    this.ShowNotification("input là số");
                    return;
                case level <= 0:
                    this.ShowNotification("level phải lớn hơn 0");
                    return;
            }

            PlayerData.Instance._levelPlayer = level;
            PlayerData.Instance.Save();
            this.ShowNotification("Waitting 1s...");
            await Utils.delay(1000);

            // reload lại trang
            this.ReloadPage();
        } catch (e) {
            this.ShowNotification("Something wrong");
            console.log(e);
        }
    }

    public onBtnClose() {
        this.node.active = false;
    }

    public async onResetData() {
        PlayerData.Instance.ResetData();
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        this.ShowNotification("Waitting 1s...");
        await Utils.delay(1000);
        this.ReloadPage();
    }

    private async OnBtnEndEndless() {
        PlayerData.Instance.ET_timeResetPack = Utils.getCurrTime();
        PlayerData.Instance.SaveEvent_EndlessTreasure();
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        this.ShowNotification("Waitting 1s...");
        await Utils.delay(1000);
        this.ReloadPage();
    }
    private async OnBtnEndSpeedRace() {
        PlayerData.Instance.SR_timeEnd = Utils.getCurrTime();
        PlayerData.Instance.SaveEvent_SpeedRace();
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        this.ShowNotification("Waitting 1s...");
        await Utils.delay(1000);
        this.ReloadPage();

    }
    private async OnBtnEndLevelProgress() {
        PlayerData.Instance.LPr_timeEnd = Utils.getCurrTime();
        PlayerData.Instance.SaveEvent_LevelProgression();
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        this.ShowNotification("Waitting 1s...");
        await Utils.delay(1000);
        this.ReloadPage();
    }

    private onBtnAddCoin() {
        CurrencySys.Instance.AddMoney(999999999, "cheat game for tester", true, true, false);
    }
    //#endregion btn
}


