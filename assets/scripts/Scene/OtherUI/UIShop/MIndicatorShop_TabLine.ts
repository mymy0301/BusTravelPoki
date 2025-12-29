import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


/**
 * Lý do mình tách tính năng này thành một class riêng vì tính năng này sau này có thể sẽ phải thay đổi cho phù hợp trong những trường hợp khác
 */

@ccclass('MIndicatorShop_TabLine')
export class MIndicatorShop_TabLine extends Component {
    @property(Node) listNTab: Node[] = [];

    public AutoUpdateNTab_After_WithIndexPageChoice(indexPageChoice: number) {
        if (indexPageChoice >= this.listNTab.length || indexPageChoice < 0) { return; }

        // return;
        switch (indexPageChoice) {
            case 0:
                this.TurnOffTab([0]);
                this.TurnOnTab([1, 2]);
                break;
            case 3:
                this.TurnOffTab([2]);
                this.TurnOnTab([0, 1]);
                break;
            case 1:
                this.TurnOffTab([0, 1]);
                this.TurnOnTab([2]);
                break;
            case 2:
                this.TurnOffTab([1, 2]);
                this.TurnOnTab([0]);
                break;
        }
    }

    public AutoUpdateNTab_Before_WithIndexPageChoice(indexPageChoice: number) {
        switch (indexPageChoice) {
            case 0:
                // this.TurnOffTab([0]);
                this.TurnOnTab([1, 2]);
                break;
            case 3:
                // this.TurnOffTab([2]);
                this.TurnOnTab([0, 1]);
                break;
            case 1:
                // this.TurnOffTab([0, 1]);
                this.TurnOnTab([2]);
                break;
            case 2:
                // this.TurnOffTab([1, 2]);
                this.TurnOnTab([0]);
                break;
        }
    }

    public TurnOnTab(listIndex: number[]) {
        const numTab: number = this.listNTab.length;
        if (listIndex.every(index => index >= numTab)) { return; }

        listIndex.forEach(index => this.listNTab[index].active = true);
    }

    public TurnOffTab(listIndex: number[]) {
        const numTab: number = this.listNTab.length;
        if (listIndex.every(index => index >= numTab)) { return; }

        listIndex.forEach(index => this.listNTab[index].active = false);
    }
}


