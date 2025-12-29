import { _decorator, Component, Label, Node, RichText, Sprite, SpriteFrame } from 'cc';
import { IUIShareBase, UIShareBase } from './UIShareBase';
import { MConfigFacebook } from '../../Configs/MConfigFacebook';
import { ResourceUtils } from '../ResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('UIShareNormal')
export class UIShareNormal extends UIShareBase implements IUIShareBase {

    @property(Sprite) private spAvatar: Sprite;
    @property(Label) private lbLevel: Label;
    @property(Label) private lbLevel_shadow: Label;
    @property(RichText) private rtContent: RichText;
    @property(RichText) private rtContent_bg1: RichText;
    @property(RichText) private rtContent_bg2: RichText;
    @property(RichText) private rtContent_1: RichText;
    @property(RichText) private rtContent_bg1_1: RichText;
    @property(RichText) private rtContent_bg2_1: RichText;

    protected onLoad(): void {
        this.Init(this);
    }

    async SetUp(data: any): Promise<void> {
        const namePlayer = `${MConfigFacebook.Instance.playerName}`;
        const self = this;

        // load avatar
        try {
            await ResourceUtils.TryLoadImage(MConfigFacebook.Instance.playerPhotoURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
                if (pathAvatar == MConfigFacebook.Instance.playerPhotoURL && self.node != null && self.node.isValid) {
                    self.spAvatar.spriteFrame = spriteFrame;
                }
            });
        } catch (e) {

        }

        this.lbLevel.string = `Lv.${data.level}`;
        this.lbLevel_shadow.string = `Lv.${data.level}`;
        this.rtContent_bg1.string = `<color=#182f86>CAN YOU BEAT <size=48><color=#182f8600>${namePlayer}'s</color></size> LEVEL?</color>`;
        this.rtContent_bg2.string = `<color=#ffffff00>CAN YOU BEAT <size=48><color=#fffd4c00>${namePlayer}'s</color></size> LEVEL?</color>`;
        this.rtContent.string = `<color=#ffffff>CAN YOU BEAT <size=48><color=#6af94900>${namePlayer}'s</color></size> LEVEL?</color>`;
        this.rtContent_bg1_1.string = `<color=#182f8600>CAN YOU BEAT <size=48><color=#182f86>${namePlayer}'s</color></size> LEVEL?</color>`;
        this.rtContent_bg2_1.string = `<color=#ffffff00>CAN YOU BEAT <size=48><color=#fffd4c>${namePlayer}'s</color></size> LEVEL?</color>`;
        this.rtContent_1.string = `<color=#ffffff00>CAN YOU BEAT <size=48><color=#6af949>${namePlayer}'s</color></size> LEVEL?</color>`;
    }
}


