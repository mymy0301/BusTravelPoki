import { _decorator, Component, Node } from 'cc';
import { GameManager } from '../GameManager';
import { DataEventsSys } from '../DataEventsSys';
const { ccclass, property } = _decorator;

@ccclass('LobbySys')
export class LobbySys extends Component {
    public static Instance: LobbySys = null;


    protected onLoad(): void {
        if (LobbySys.Instance == null) {
            LobbySys.Instance = this;
        }
    }

    protected onDestroy(): void {
        LobbySys.Instance = null;
    }

    protected onDisable(): void {
        DataEventsSys.Instance.UnRegisterTimeGroup();
    }

    private onBtnPlay() {
        if (GameManager.Instance.levelPlayerNow == -1) {
            GameManager.Instance.PreparePlayTutorial();
        } else if (GameManager.Instance.levelPlayerNow >= 0) {
            GameManager.Instance.PreparePlayNormal(GameManager.Instance.levelPlayerNow, 0, []);
        }
    }
}


