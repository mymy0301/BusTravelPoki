import { _decorator, Component, Label, Node, RichText, Sprite, SpriteFrame } from 'cc';
import { MConfigFacebook } from '../../Configs/MConfigFacebook';
import { IUIShareBase, UIShareBase } from './UIShareBase';
import { ResourceUtils } from '../ResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('UIShareFriend')
export class UIShareFriend extends UIShareBase implements IUIShareBase {
    @property(Sprite) private Nor_spAvatar: Sprite;
    @property(Label) private Nor_lbScore: Label;
    @property(Label) private Nor_lbScoreBg: Label;
    @property(RichText) private Nor_rtContent: RichText;
    @property(RichText) private Nor_rtContent_bg1: RichText;
    @property(RichText) private Nor_rtContent_bg2: RichText;
    @property(RichText) private Nor_rtContent_1: RichText;
    @property(RichText) private Nor_rtContent_bg1_1: RichText;
    @property(RichText) private Nor_rtContent_bg2_1: RichText;

    protected onLoad(): void {
        this.Init(this);
    }

    async SetUp(data: any) {
        const namePlayer = `${MConfigFacebook.Instance.playerName}`;
        const self = this;

        // load avatar
        try {
            await ResourceUtils.TryLoadImage(MConfigFacebook.Instance.playerPhotoURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                if (pathAvatar == MConfigFacebook.Instance.playerPhotoURL && self.node != null && self.node.isValid) {
                    self.Nor_spAvatar.spriteFrame = spriteFrame;
                }
            });
        } catch (e) {

        }

        this.Nor_lbScore.string = `Lv.${data.level}`;
        this.Nor_lbScoreBg.string = `Lv.${data.level}`;
        this.Nor_rtContent_bg1.string = `<color=#182f86>CAN YOU BEAT <size=65><color=#182f8600>${namePlayer}'s</color></size> LEVEL?</color>`;
        this.Nor_rtContent_bg2.string = `<color=#ffffff00>CAN YOU BEAT <size=65><color=#fffd4c00>${namePlayer}'s</color></size> LEVEL?</color>`;
        this.Nor_rtContent.string = `<color=#ffffff>CAN YOU BEAT <size=65><color=#6af94900>${namePlayer}'s</color></size> LEVEL?</color>`;
        this.Nor_rtContent_bg1_1.string = `<color=#182f8600>CAN YOU BEAT <size=65><color=#182f86>${namePlayer}'s</color></size> LEVEL?</color>`;
        this.Nor_rtContent_bg2_1.string = `<color=#ffffff00>CAN YOU BEAT <size=65><color=#fffd4c>${namePlayer}'s</color></size> LEVEL?</color>`;
        this.Nor_rtContent_1.string = `<color=#ffffff00>CAN YOU BEAT <size=65><color=#6af949>${namePlayer}'s</color></size> LEVEL?</color>`;
    }
}


