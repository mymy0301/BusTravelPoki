import { _decorator, Component, director, EventHandler, instantiate, Node, Pool, Toggle, ToggleContainer, Vec2, Vec3 } from 'cc';
import { IMapBusFrenzy, MConstBuildGame } from '../../MConstBuildGame';
import { ConvertNameTypeUseJsonGroup, JsonGroup } from '../../../Utils/Types';
import { ToggleGroupChoice } from './ToggleGroupChoice';
import { BuildGameSys } from '../../BuildGameSys';
import { MConfigBuildGame } from '../../MConfigBuildGame';
const { ccclass, property } = _decorator;

/**
 * 
 * anhngoxitin01
 * Thu Aug 07 2025 10:10:38 GMT+0700 (Indochina Time)
 * UIPreparePlayBuild
 * db://assets/scripts/BuildGame/UI/UIPlayChoiceGroup/UIPreparePlayBuild.ts
 *
 */

@ccclass('UIPreparePlayBuild')
export class UIPreparePlayBuild extends Component {
    @property(Node) nTemplateToggle: Node;
    @property(ToggleContainer) tgcGroup: ToggleContainer;
    @property(Node) nSaveToggle: Node;
    private poolToggle: Pool<Node> = null;
    private dataMap: IMapBusFrenzy = null;
    private _rememberChoice: number = -1;

    //==========================================
    //#region base
    public LoadFromOtherScript() {
        this.poolToggle = new Pool(() => instantiate(this.nTemplateToggle), 0);
    }

    protected onDisable(): void {
        this.UnRegisterListenToggle();
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    private RegisterListenToggle() {
        // add event check for list checkbox
        this.tgcGroup.toggleItems.forEach((tgc: Toggle, index: number) => {
            const checkEventHandler = new EventHandler();
            checkEventHandler.target = this.node;
            checkEventHandler.component = 'UIPreparePlayBuild';
            checkEventHandler.handler = 'onToggleGroup';
            checkEventHandler.customEventData = index.toString();

            tgc.checkEvents.push(checkEventHandler);
        });
    }

    private UnRegisterListenToggle() {
        this.tgcGroup.toggleItems.forEach((tgc: Toggle, index: number) => {
            tgc.checkEvents = [];
        });
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public Show(newData: IMapBusFrenzy) {
        //unRegisterEvent
        this.UnRegisterListenToggle();

        // save new Data
        this.dataMap = newData;

        // pool tất cả những toggle đang chọn
        this.tgcGroup.toggleItems.forEach(toggleCheck => {
            this.poolToggle.free(toggleCheck.node);
            toggleCheck.node.parent = this.nSaveToggle;
            toggleCheck.node.active = false;
            toggleCheck.isChecked = false;
        })

        // check xem có bao nhiêu lựa chọn
        let listNameChoice: string[] = ["Normal"];
        if (this.dataMap.Group != null && this.dataMap.Group.length > 0) {
            this.dataMap.Group.forEach((group: JsonGroup, index: number) => {
                const nameType: string = ConvertNameTypeUseJsonGroup(group.typeUse);
                listNameChoice.push(`${index}_${nameType}`);
            })
        }

        // init toggle và auto chọn toggle cũ
        listNameChoice.forEach((nameToggle: string, index: number) => {
            const toggle = this.poolToggle.alloc();
            toggle.getComponent(ToggleGroupChoice).SetNameToggle(nameToggle);
            toggle.position = Vec3.ZERO;
            toggle.setParent(this.tgcGroup.node);
            toggle.active = true;

            if (this._rememberChoice >= 0 && this._rememberChoice == index) {
                toggle.getComponent(Toggle).isChecked = true;
            }
        })

        //register event
        this.RegisterListenToggle();

        // show UI
        this.node.active = true;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    private onToggleGroup(event: Event, customEventData: string) {
        if (event["_isChecked"]) {
            try {
                // MConstBuildGame.groupChoice = Number.parseInt(customEventData);
            } catch (e) {
                console.error(e);
            }
        }
    }
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    private btnClose() {
        this.node.active = false;
    }

    private async btnPlay() {
        MConstBuildGame.groupChoice = this.tgcGroup.node.children.findIndex(tg => tg.getComponent(Toggle).isChecked);
        MConstBuildGame.dataMapToPlayTest = this.dataMap;
        MConfigBuildGame.idLineMapChoice = 0;
        // console.log("MConstBuildGame.dataMapToPlayTest", JSON.parse(JSON.stringify(MConstBuildGame.dataMapToPlayTest)));
        director.loadScene(MConstBuildGame.NAME_SCENE.TEST_GAME_SCENE);
    }

    private async btnPlay_2() {
        MConstBuildGame.groupChoice = this.tgcGroup.node.children.findIndex(tg => tg.getComponent(Toggle).isChecked);
        MConstBuildGame.dataMapToPlayTest = this.dataMap;
        MConfigBuildGame.idLineMapChoice = 1;
        // console.log("MConstBuildGame.dataMapToPlayTest", JSON.parse(JSON.stringify(MConstBuildGame.dataMapToPlayTest)));
        director.loadScene(MConstBuildGame.NAME_SCENE.TEST_GAME_SCENE);
    }
    //#endregion btn
    //==========================================
}