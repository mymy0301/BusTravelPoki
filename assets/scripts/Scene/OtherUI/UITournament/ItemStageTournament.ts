import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemStageTournament')
export class ItemStageTournament extends Component {
    @property(Node) groupProgress:Node;
    @property(Node) progressFinished:Node;
    @property(Node) iconFinished:Node;

    initStage(indexStage:number, countStageFinished:number,isStageLast:boolean){
        if(isStageLast){
            this.groupProgress.active = false;
        }else{
            this.groupProgress.active = true;
        }

        if(indexStage <= countStageFinished){
            this.progressFinished.active = true;
            this.iconFinished.active = true;
        }else{
            this.progressFinished.active = false;
            this.iconFinished.active = false;
        }
    }
}


