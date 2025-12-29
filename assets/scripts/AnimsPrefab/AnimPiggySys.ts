import { _decorator, Component, Node } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('AnimPiggySys')
export class AnimPiggySys extends AnimPrefabsBase {

    public async PlayQueueAnimOpen(status: "normal" | "receive_coin" | "full") {
        switch (status) {
            case "normal":
                this.PlayAnim("piggy_appear");
                break;
            case "receive_coin":
                this.PlayAnim("piggy_appear", false);
                this.AddAnim("piggy_bank_idle", false);
                break;
            case "full":
                this.PlayAnim("piggy_boom");
                break;
        }
    }

    public GetTimeAnimPiggy(nameAnim: "piggy_appear" | "piggy_bank_idle" | "piggy_boom"): number {
        switch (nameAnim) {
            case "piggy_appear":
                return this.GetTimeAnim("piggy_appear");
            case "piggy_bank_idle":
                return this.GetTimeAnim("piggy_bank_idle");
            case "piggy_boom":
                return this.GetTimeAnim("piggy_boom");
        }
    }
}


