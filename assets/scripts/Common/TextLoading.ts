import { _decorator, CCString, Component, Label, macro, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TextLoading')
export class TextLoading extends Component {
    @property(Label)
    txtLoading:Label;

    @property(CCString)
    contentText:string = "Loading";
    indexLoading:number = -1;
    start() {

    }

    update(deltaTime: number) {
        
    }

    onEnable(){
        this.schedule(this.showTextLoading,0.2,macro.REPEAT_FOREVER);
    }

    showTextLoading(){
        this.indexLoading ++;
        if(this.indexLoading == 4) this.indexLoading = 0;
        if(this.indexLoading == 0){
            this.txtLoading.string =`${this.contentText}`;
        }else if(this.indexLoading == 1){
            this.txtLoading.string =`${this.contentText}.`;
        }else if(this.indexLoading == 2){
            this.txtLoading.string =`${this.contentText}..`;
        }else if(this.indexLoading == 3){
            this.txtLoading.string =`${this.contentText}...`;
        }
    }
}


