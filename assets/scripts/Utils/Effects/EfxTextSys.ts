import { _decorator, AnimationComponent, Component, Label, Node, SpriteComponent, SpriteFrame, tween, Vec2, Vec3 } from 'cc';
import { AniTweenSys } from '../AniTweenSys';
const { ccclass, property } = _decorator;

export enum EfxTextType {
    GOOD,
    GREAT,
    AMAZING,
    UNSTOPPABLE,
}

@ccclass('EfxTextSys')
export class EfxTextSys extends Component {
    @property({ group: "Score", type: Label }) lbScore: Label;

    @property(Node) nTextScore: Node;

    public static Instance: EfxTextSys;

    protected onLoad(): void {
        if (EfxTextSys.Instance == null) {
            EfxTextSys.Instance = this;
        }
    }

    protected onDestroy(): void {
        EfxTextSys.Instance = null;
    }

    public async ShowTextScore(wPos: Vec3, score: number) {
        // MConsolLog.Log("Score: " + score);
        this.lbScore.string = '+' + score.toString();

        // this func will auto active node and auto false when it done
        await AniTweenSys.TweenScoreApearAndFlyUp(this.nTextScore, wPos);
    }
}


