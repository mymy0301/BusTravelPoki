import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { MConfigFacebook } from '../../Configs/MConfigFacebook';
import { ResourceUtils } from '../../Utils/ResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('UILoseTileRaceLobby')
export class UILoseTileRaceLobby extends Component {
    @property(Sprite) spAvatarPlayer: Sprite;
    @property(Label) lbRankPlayer: Label;

    public Show(numRankPlayer: number) {
        const self = this;
        ResourceUtils.TryLoadImageAvatar(MConfigFacebook.Instance.playerPhotoURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
            if (pathAvatar == MConfigFacebook.Instance.playerPhotoURL && self.node != null && self.node.isValid) {
                self.spAvatarPlayer.spriteFrame = spriteFrame;
            }
        })

        this.lbRankPlayer.string = `: ${numRankPlayer + 1}st`;
        this.node.active = true;
    }

    public Hide() {
        this.node.active = false;
    }
}


