import { _decorator, Color, Component, EventHandler, Node, Sprite, Toggle, ToggleContainer } from 'cc';
import { COLOR_KEY_LOCK, convertColorKeyLockToNumber, convertNumberToColorKeyLock } from '../../../Utils/Types';
import { BuildGameSys } from '../../BuildGameSys';
import { BuildCar } from '../../Car/BuildCar';
const { ccclass, property } = _decorator;

@ccclass('UIChangeColorLockAndKey')
export class UIChangeColorLockAndKey extends Component {
    @property(Sprite) spColorKeyLock: Sprite;
    @property({ type: ToggleContainer }) tgcChangeColorKeyLock: ToggleContainer;
    @property(Node) nClickToHideUI: Node;

    protected onLoad(): void {
        if (this.nClickToHideUI != null) {
            this.nClickToHideUI.on(Node.EventType.TOUCH_START, this.HideUI, this, true);
        }
    }

    public RegisterClick() {
        // add event check for list checkbox
        this.tgcChangeColorKeyLock.toggleItems.forEach((tgc: Toggle, index: number) => {
            const checkEventHandler = new EventHandler();
            checkEventHandler.target = this.node;
            checkEventHandler.component = 'UIChangeColorLockAndKey';
            checkEventHandler.handler = 'onToggleChangeColor';
            checkEventHandler.customEventData = index.toString();

            tgc.checkEvents.push(checkEventHandler);
        });
    }

    public UnRegisterClick() {
        this.tgcChangeColorKeyLock.toggleItems.forEach((tgc: Toggle, index: number) => {
            tgc.checkEvents = [];
        })
    }

    private onToggleChangeColor(event: Event, customEventData: string) {
        if (event["_isChecked"]) {
            let nCarChoice: Node = BuildGameSys.Instance.getNCarChoicing();
            const comCarBuild: BuildCar = nCarChoice.getComponent(BuildCar);
            const colorKeyChoice = Number.parseInt(customEventData);
            const colorKeyAndLock = convertNumberToColorKeyLock(colorKeyChoice);
            comCarBuild.SetColorKeyLock(colorKeyAndLock);

            // update with car lock or car key
            const idCarKey = comCarBuild.idCarKeyOfCarLock;
            const idCarLock = comCarBuild.idCarLockOfCarKey;

            // get the car lock and key and update the key and lock
            if (idCarLock > -1) {
                const nCarLock = BuildGameSys.Instance.GetCarById(idCarKey);
                nCarLock.getComponent(BuildCar).SetColorKeyLock(colorKeyAndLock);
            } else if (idCarKey > -1) {
                const nCarKey = BuildGameSys.Instance.GetCarById(idCarKey);
                nCarKey.getComponent(BuildCar).SetColorKeyLock(colorKeyAndLock);
            }

            // update sp color choice
            this.UpdateColorChoice();
        }
    }

    public ChoiceColorForce(colorKeyLock: COLOR_KEY_LOCK) {
        // unRegister
        this.UnRegisterClick();

        const indexColorKeyLock: number = convertColorKeyLockToNumber(colorKeyLock)
        const toggleChoice = this.tgcChangeColorKeyLock.node.children[indexColorKeyLock];
        toggleChoice.getComponent(Toggle).isChecked = true;
        this.UpdateColorChoice();

        //registerClick
        this.RegisterClick();
    }

    public GetColorKeyLockNow(): COLOR_KEY_LOCK {
        let indexColorChoice: number = this.tgcChangeColorKeyLock.node.children.findIndex(nTg => nTg.getComponent(Toggle).isChecked);
        return convertNumberToColorKeyLock(indexColorChoice);
    }

    private GetColorChocing(): Color {
        // get the node choicing
        let nToggleChoice: Node = this.tgcChangeColorKeyLock.node.children.find(nTg => nTg.getComponent(Toggle).isChecked);
        const colorChoice = nToggleChoice.getComponent(Sprite).color.clone();
        return colorChoice;
    }

    private UpdateColorChoice() {
        const colorChoicing = this.GetColorChocing();
        this.spColorKeyLock.color = colorChoicing;
    }

    private HideUI() {
        this.node.active = false;
    }
}


