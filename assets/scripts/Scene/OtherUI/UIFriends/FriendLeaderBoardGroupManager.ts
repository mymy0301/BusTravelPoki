import { _decorator, CCInteger, Component, instantiate, Node, Prefab, ScrollView, Size, UITransform, Vec3 } from 'cc';
import { IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { ItemRankFriend } from './ItemRankFriend';
import { MConst } from '../../../Const/MConst';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
const { ccclass, property } = _decorator;

@ccclass('FriendLeaderBoardGroupManager')
export class FriendLeaderBoardGroupManager extends Component {
    arrIDataPlayer_LEADERBOARDs:IDataPlayer_LEADERBOARD[] = [];
    @property(Node)
    contentGroup:Node;
    
    @property(Prefab)
    itemLeaderBoardPrefab:Prefab;

    @property(CCInteger)
    countShowItem:number = 10;

    @property(CCInteger)
    KC_Y:number = 0;

    @property(CCInteger)
    SIZE_ITEM:number = 110;

    @property(CCInteger)
    CONTENT_HIGHT:number = 816;

    @property(CCInteger)
    posYStart:number = 408;


    arrPoolItems:ItemRankFriend[] = [];
    mapItemBoards:Map<number,ItemRankFriend> = new Map();

    @property(ScrollView)
    scrollView:ScrollView;

    @property(ItemRankFriend)
    myItemLeaderBoard:ItemRankFriend;

    protected onEnable(): void {
        this.scrollView.node.on(ScrollView.EventType.SCROLLING,this.setScrollEvent,this);
    }

    protected onDisable(): void {
        this.scrollView.node.off(ScrollView.EventType.SCROLLING,this.setScrollEvent,this);
    }

    initRankGroup(){
        if(this.myItemLeaderBoard){
            this.myItemLeaderBoard.node.active = false;
        }
        this.arrIDataPlayer_LEADERBOARDs = Array.from(DataLeaderboardSys.Instance.GetLeaderboard(MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND));
        let indexMyPlayer:number = -1;
        for(let i = 0; i < this.arrIDataPlayer_LEADERBOARDs.length;i++){
            if(this.arrIDataPlayer_LEADERBOARDs[i] && this.arrIDataPlayer_LEADERBOARDs[i].playerId == FBInstantManager.Instance.getID()){
                indexMyPlayer = i;
            }
        }
        if(indexMyPlayer >= 0){
            this.arrIDataPlayer_LEADERBOARDs.splice(indexMyPlayer,1);
        }

        for(let i = 0; i < this.arrIDataPlayer_LEADERBOARDs.length; i++){
            this.arrIDataPlayer_LEADERBOARDs[i].rank = i+1;
        }
        let countFriends:number = this.arrIDataPlayer_LEADERBOARDs.length;
        if(countFriends < 6){
            for(let i = 0; i < 6 - countFriends; i++){
                this.arrIDataPlayer_LEADERBOARDs.push(null);
            }
        }
        let maxY:number = (this.SIZE_ITEM + this.KC_Y) * this.arrIDataPlayer_LEADERBOARDs.length + 200; 
        this.contentGroup.getComponent(UITransform).setContentSize(new Size(this.CONTENT_HIGHT,maxY));
        this.contentGroup.destroyAllChildren();
        this.contentGroup.setPosition(new Vec3(0,this.posYStart,0));
        this.arrPoolItems = [];
        this.mapItemBoards.clear();
        this.showInitRank();
    }

    resetRankGroup(){
        if(this.myItemLeaderBoard){
            this.myItemLeaderBoard.node.active = false;
        }
        
        this.contentGroup.destroyAllChildren();
        this.arrPoolItems = [];
        this.mapItemBoards.clear();
    }


    getPos_byIndex(_index:number){
        let posY:number = -this.SIZE_ITEM/2 - _index * (this.SIZE_ITEM + this.KC_Y);
        return new Vec3(0,posY,0);
    }

    showInitRank(){
        for(let i=0; i< this.countShowItem;i++){
            if(i < this.arrIDataPlayer_LEADERBOARDs.length){
                let item = instantiate(this.itemLeaderBoardPrefab);
                item.setParent(this.contentGroup);
                item.setPosition(this.getPos_byIndex(i));
                let itemEventLeaderBoard:ItemRankFriend = item.getComponent(ItemRankFriend);
                itemEventLeaderBoard.initItem(this.arrIDataPlayer_LEADERBOARDs[i],0.1 * i);
                itemEventLeaderBoard.setIndexPos(i);
                this.arrPoolItems.push(itemEventLeaderBoard);
                this.mapItemBoards.set(i,itemEventLeaderBoard);
            }
        }

        for(let i=0; i< this.arrIDataPlayer_LEADERBOARDs.length;i++){
            if(this.arrIDataPlayer_LEADERBOARDs[i] && this.arrIDataPlayer_LEADERBOARDs[i].playerId == FBInstantManager.Instance.getID()){
                if(this.myItemLeaderBoard){
                    this.myItemLeaderBoard.initItem(this.arrIDataPlayer_LEADERBOARDs[i]);
                    this.myItemLeaderBoard.node.active = true;
                }
            }
        }
    }

    updateItemRank(itemLeaderBoard:ItemRankFriend,indexPos:number){
        if(indexPos < this.arrIDataPlayer_LEADERBOARDs.length){
            itemLeaderBoard.node.setPosition(this.getPos_byIndex(indexPos));
            itemLeaderBoard.initItem(this.arrIDataPlayer_LEADERBOARDs[indexPos]);
            itemLeaderBoard.setIndexPos(indexPos);
            this.mapItemBoards.set(indexPos,itemLeaderBoard);
            itemLeaderBoard.node.active = true;
        }
    }

    lastIndexPosCenter:number = -1;
    setScrollEvent(){
        // console.log(this.contentGroup.position.y);
        let indexPosCenter:number = Math.floor((this.contentGroup.position.y - this.posYStart + this.CONTENT_HIGHT / 2) /(this.SIZE_ITEM + this.KC_Y));
        if(this.lastIndexPosCenter == indexPosCenter) return;
        this.lastIndexPosCenter = indexPosCenter;
        // console.log("indexPosCenter:----------------------"+indexPosCenter+"----------------------------");
        for(let i= 0; i< this.arrPoolItems.length;i++){
            let itemLeaderBoard:ItemRankFriend = this.arrPoolItems[i];
            if(itemLeaderBoard.node.active){
                if(itemLeaderBoard.indexPos < indexPosCenter - this.countShowItem/2 || itemLeaderBoard.indexPos > indexPosCenter + this.countShowItem/2){
                    // console.log("HIDE ITEM:"+itemLeaderBoard.indexPos);
                    itemLeaderBoard.node.active = false;
                }
            }
        }

        for(let i = -6; i < 7; i++){
            let indexPos:number = i + indexPosCenter;
            // console.log("Check : i="+i+"    indexPos="+indexPos);
            if(indexPos >=0 && indexPos < this.arrIDataPlayer_LEADERBOARDs.length){
                if(this.mapItemBoards.has(indexPos)){
                    let itemBoard:ItemRankFriend = this.mapItemBoards.get(indexPos);
                    if(!itemBoard.node.active){
                        itemBoard.node.active = true;
                    }
                }else{
                    let itemRecycle:ItemRankFriend = this.getItemLeaderBoard_Recycle_FromPools();
                    this.mapItemBoards.delete(itemRecycle.indexPos);
                    this.updateItemRank(itemRecycle,indexPos);
                }
            }
        }
    }


    getItemLeaderBoard_Recycle_FromPools(){
        for(let i=0; i< this.arrPoolItems.length;i++){
            if(!this.arrPoolItems[i].node.active){
                return this.arrPoolItems[i];
            }
        }
        // console.error("-------------------------------------------------------------");
        let item = instantiate(this.itemLeaderBoardPrefab);
        let itemLeaderBoard:ItemRankFriend = item.getComponent(ItemRankFriend);
        return itemLeaderBoard;
    }
}


