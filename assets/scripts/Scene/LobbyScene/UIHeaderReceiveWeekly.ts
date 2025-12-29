import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { ResourceUtils } from '../../Utils/ResourceUtils';
import { MConfigFacebook } from '../../Configs/MConfigFacebook';
import { MoveToByCode_2 } from '../../Utils/Effects/MoveToByCode_2';
const { ccclass, property } = _decorator;

@ccclass('UIHeaderReceiveWeekly')
export class UIHeaderReceiveWeekly extends Component {
    @property(Sprite) spAvatarPlayer: Sprite;
    @property(Label) lbRankPlayer: Label;
    @property(Node) nVisual: Node;

    public SetUpPreparePlayer(rank: number) {
        this.lbRankPlayer.string = `Rank #${rank}`;
        this.LoadImagePlayer();
        this.nVisual.getComponent(MoveToByCode_2).SetToPosPrepare_MoveIn();
    }

    private LoadImagePlayer() {
        const self = this;
        ResourceUtils.TryLoadImage(MConfigFacebook.Instance.playerPhotoURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
            if (pathAvatar == MConfigFacebook.Instance.playerPhotoURL && self.node != null && self.node.isValid) {
                self.spAvatarPlayer.spriteFrame = spriteFrame;
            }
        });
    }

    public Show() {
        this.node.active = true;
        this.nVisual.getComponent(MoveToByCode_2).MoveIn();
    }

    public async Hide(force: boolean) {
        if (force) {
            this.nVisual.getComponent(MoveToByCode_2).SetToPosPrepare_MoveIn();
            this.node.active = false;
        } else {
            await this.nVisual.getComponent(MoveToByCode_2).MoveOut();
            this.node.active = false;
        }
    }
}


