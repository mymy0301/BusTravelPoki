import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { IShareTournamentData } from '../Types';
import { ResourceUtils } from '../ResourceUtils';
import { MConfigFacebook } from '../../Configs/MConfigFacebook';
import { Utils } from '../Utils';
import { IUIShareBase, UIShareBase } from './UIShareBase';
const { ccclass, property } = _decorator;

@ccclass('UIShareTournament')
export class UIShareTournament extends UIShareBase implements IUIShareBase {
    @property([Node]) private list_nPlayer_top1: Node[] = [];
    @property([Node]) private list_nPlayer_top2: Node[] = [];
    @property([Node]) private list_nPlayer_top3: Node[] = [];
    @property(Sprite) private spAvatar_top1: Sprite;
    @property(Sprite) private spAvatar_top2: Sprite;
    @property(Sprite) private spAvatar_top3: Sprite;
    @property(Sprite) private spAvatar_player: Sprite;
    @property(Label) private lbScore_top1: Label;
    @property(Label) private lbScore_top1_shadow: Label;
    @property(Label) private lbScore_top2: Label;
    @property(Label) private lbScore_top2_shadow: Label;
    @property(Label) private lbScore_top3: Label;
    @property(Label) private lbScore_top3_shadow: Label;
    @property(Label) private lbScore_player: Label;
    @property(Label) private lbScore_player_shadow: Label;
    @property(Label) private lbName_player: Label;
    @property(Label) private lbName_player_shadow: Label;
    @property(Label) private lbTitleTour_shadow: Label;
    @property(Label) private lbTitleTour: Label;

    protected onLoad(): void {
        this.Init(this);
    }

    async SetUp(data: any) {
        const dataShareTour = data as IShareTournamentData;

        this.lbScore_player.string = `${Utils.convertTimeToFormat(-dataShareTour.score)}`;
        this.lbScore_player_shadow.string = `${Utils.convertTimeToFormat(-dataShareTour.score)}`;

        this.lbTitleTour.string = `${dataShareTour.nameTournament}`;
        this.lbTitleTour_shadow.string = `${dataShareTour.nameTournament}`;

        // set player
        switch (true) {
            case dataShareTour.dataTop3.length == 1:
                this.list_nPlayer_top1.forEach(element => element.active = true);
                this.list_nPlayer_top2.forEach(element => element.active = false);
                this.list_nPlayer_top3.forEach(element => element.active = false);
                break;
            case dataShareTour.dataTop3.length == 2:
                this.list_nPlayer_top1.forEach(element => element.active = true);
                this.list_nPlayer_top2.forEach(element => element.active = true);
                this.list_nPlayer_top3.forEach(element => element.active = false);
                break;
            case dataShareTour.dataTop3.length == 3:
                this.list_nPlayer_top1.forEach(element => element.active = true);
                this.list_nPlayer_top2.forEach(element => element.active = true);
                this.list_nPlayer_top3.forEach(element => element.active = true);
                break;
        }
        if (dataShareTour.dataTop3[0]) {
            this.lbScore_top1.string = `${Utils.convertTimeToFormat(-dataShareTour.dataTop3[0].score)}`;
            this.lbScore_top1_shadow.string = `${Utils.convertTimeToFormat(-dataShareTour.dataTop3[0].score)}`;
        }

        if (dataShareTour.dataTop3[1]) {
            this.lbScore_top2.string = `${Utils.convertTimeToFormat(-dataShareTour.dataTop3[1].score)}`;
            this.lbScore_top2_shadow.string = `${Utils.convertTimeToFormat(-dataShareTour.dataTop3[1].score)}`;
        }
        if (dataShareTour.dataTop3[2]) {
            this.lbScore_top3.string = `${Utils.convertTimeToFormat(-dataShareTour.dataTop3[2].score)}`;
            this.lbScore_top3_shadow.string = `${Utils.convertTimeToFormat(-dataShareTour.dataTop3[2].score)}`;
        }

        this.lbName_player.string = `${MConfigFacebook.Instance.playerName}`;
        this.lbName_player_shadow.string = `${MConfigFacebook.Instance.playerName}`;

        this.spAvatar_top1.spriteFrame = dataShareTour.sfAvatarTop[0];
        this.spAvatar_top2.spriteFrame = dataShareTour.sfAvatarTop[1];
        this.spAvatar_top3.spriteFrame = dataShareTour.sfAvatarTop[2];

        await ResourceUtils.TryLoadImage(MConfigFacebook.Instance.playerPhotoURL, (path: string, sf: SpriteFrame) => {
            if (sf != null) {
                this.spAvatar_player.spriteFrame = sf;
            }
        });
    }
}