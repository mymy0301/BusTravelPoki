import { _decorator, Component, Node } from 'cc';
import { UITargetFirstGame } from './UITargetFirstGame';
import { UIWarningHardLevel } from './UIWarningHardLevel';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('UIOpeningGame')
export class UIOpeningGame extends Component {
    @property(UITargetFirstGame) uiTargetFirstGame: UITargetFirstGame;
    @property(UIWarningHardLevel) uiWarningHardLevel: UIWarningHardLevel;
    @property(Node) nBlockUI: Node;

    private readonly timeWaitShowTarget = 1;

    protected onEnable(): void {
        this.nBlockUI.active = false;
    }

    //============================================
    //#region target first game
    public Prepare_TargetFirstGame() {
        this.uiTargetFirstGame.Idle();
    }

    public SetUpPrepare_Anim_TargetFirstGame(numPass: number, targetSF: 'normal' | 'christ' = 'normal') {
        this.uiTargetFirstGame.PrepareAnim(numPass, targetSF);
    }

    public async PlayAnim_TargetFirstGame() {
        try {
            this.nBlockUI.active = true;
            await this.uiTargetFirstGame.Anim();
            this.nBlockUI.active = false;
        } catch (e) {

        }
    }

    public GetTimeAnim_TargetFirstGame(): number {
        return this.uiTargetFirstGame.GetTimeAnim();
    }
    public GetTimeWaitShowOpening(): number {
        return this.timeWaitShowTarget;
    }
    //#endregion target first game
    //============================================

    //============================================
    //#region warning hard level
    public Prepare_WarningHardLevel() {
        this.uiWarningHardLevel.Idle();
    }

    public async PlayAnim_WarningHardLevel() {
        this.nBlockUI.active = true;
        await this.uiWarningHardLevel.Anim();
        this.nBlockUI.active = false;
    }
    //#endregion warning hard level
    //============================================
}


