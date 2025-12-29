import { _decorator, Color, Component, Label, Node, Sprite, SpriteFrame, tween, Tween, TweenSystem, Vec3 } from 'cc';
import { GameManager } from '../GameManager';
import { TYPE_LEVEL_NORMAL } from '../../Utils/Types';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { AniTweenSys } from '../../Utils/AniTweenSys';
import { MConfigs } from '../../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('UIBtnPlayLobbySys')
export class UIBtnPlayLobbySys extends Component {
    @property(Label) lbLevelBtn: Label;
    @property(Label) lbLevelShadowBtn: Label;
    @property(Label) lbSubLevelBtn: Label;
    @property(Label) lbSubLevelShadowBtn: Label;
    @property(Node) nTextLevel: Node;
    @property(Node) nSub: Node;
    @property(Sprite) spBtnPlay: Sprite;
    @property([SpriteFrame]) listSfBtnPlay: SpriteFrame[] = []; // green , purple, red
    @property(Color) colorTextNormal: Color = new Color(0, 0, 0);
    @property(Color) shadowColorTextNormal: Color = new Color(0, 0, 0);
    @property(Color) colorTextHard: Color = new Color(0, 0, 0);
    @property(Color) shadowColorTextHard: Color = new Color(0, 0, 0);
    @property(Color) colorTextSuperHard: Color = new Color(0, 0, 0);
    @property(Color) shadowColorTextSuperHard: Color = new Color(0, 0, 0);

    private readonly sizeFont_subText_normal: number = 32;
    private readonly sizeFont_subText_hard: number = 32;
    private readonly sizeFont_subText_superHard: number = 29;

    private readonly posTextLevel_1: Vec3 = new Vec3(0, -10, 0);
    private readonly posTextLevel_2: Vec3 = new Vec3(0, 0, 0);

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.IMPRESS_BTN_PLAY, this.ScaleImpressBtnPlay, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.IMPRESS_BTN_PLAY, this.ScaleImpressBtnPlay, this);
    }

    protected start(): void {
        this.SetLevel();
    }

    public SetLevel() {
        const levelPlayerNow = GameManager.Instance.GetLevelPlayerNow();
        this.lbLevelBtn.string = `Level ${levelPlayerNow}`;
        this.lbLevelShadowBtn.string = `Level ${levelPlayerNow}`;

        const typeGameLevelNext = MConfigs.GetTypeLevel(levelPlayerNow);
        // console.log("typeLevel", typeGameLevelNext);

        // kiểm tra loại level chuẩn bị chơi tiếp theo 
        // cập nhật lại vị trí label, và tùy vào loại level nào mà hiển thị subLabel cho hợp lý
        switch (typeGameLevelNext) {
            case TYPE_LEVEL_NORMAL.NORMAL:
                this.nTextLevel.position = this.posTextLevel_1;
                this.nSub.active = false;
                this.SetColorForText(this.listSfBtnPlay[0], this.colorTextNormal, this.shadowColorTextNormal);
                break;
            case TYPE_LEVEL_NORMAL.SUPER_HARD:
            case TYPE_LEVEL_NORMAL.HARD:
                this.nTextLevel.position = this.posTextLevel_2;
                this.nSub.active = true;
                this.lbSubLevelBtn.fontSize = this.sizeFont_subText_hard;
                this.lbSubLevelShadowBtn.fontSize = this.sizeFont_subText_hard;
                this.lbSubLevelBtn.string = 'Hard Level';
                this.lbSubLevelShadowBtn.string = 'Hard Level';
                this.SetColorForText(this.listSfBtnPlay[1], this.colorTextHard, this.shadowColorTextHard);
                break;
            // case TYPE_LEVEL_NORMAL.SUPER_HARD:
            //     this.nTextLevel.position = this.posTextLevel_2;
            //     this.nSub.active = true;
            //     this.lbSubLevelBtn.fontSize = this.sizeFont_subText_superHard;
            //     this.lbSubLevelShadowBtn.fontSize = this.sizeFont_subText_superHard;
            //     this.lbSubLevelBtn.string = 'Super Hard Level';
            //     this.lbSubLevelShadowBtn.string = 'Super Hard Level';
            //     this.SetColorForText(this.listSfBtnPlay[2], this.colorTextSuperHard, this.shadowColorTextSuperHard);
            //     break;
        }
    }

    private ScaleImpressBtnPlay() {
        if (!this.node.isValid) return;
        let checkAction = TweenSystem.instance.ActionManager.getNumberOfRunningActionsInTarget(this.node);
        if (checkAction > 0) {
            return;
        }
        AniTweenSys.doubleScale(this.node, new Vec3(1.05, 1.05, 1.05), 0.3);
    }

    private SetColorForText(sfButton: SpriteFrame, outlineTextColor: Color, shadowTextColor: Color) {
        this.spBtnPlay.spriteFrame = sfButton;
        this.lbLevelBtn.outlineColor = outlineTextColor;
        this.lbLevelShadowBtn.outlineColor = shadowTextColor;
        this.lbLevelShadowBtn.color = shadowTextColor;
        this.lbSubLevelBtn.outlineColor = outlineTextColor;
        this.lbSubLevelShadowBtn.color = shadowTextColor;
        this.lbSubLevelShadowBtn.outlineColor = shadowTextColor;
    }
}


