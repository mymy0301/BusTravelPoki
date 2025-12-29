import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('BlockUITransparent')
export class BlockUITransparent extends Component {
    @property(Node) nVisual: Node;
    protected onLoad(): void {
        // this.nVisual.active = false;
    }
    
    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME, this.Show, this);
        clientEvent.on(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY, this.Show, this);
        clientEvent.on(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME, this.Hide, this);
        clientEvent.on(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY, this.Hide, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME, this.Show, this);
        clientEvent.off(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY, this.Show, this);
        clientEvent.off(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME, this.Hide, this);
        clientEvent.off(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY, this.Hide, this);
    }

    public Show() {
        this.nVisual.active = true;
    }

    public Hide() {
        this.nVisual.active = false;
    }
}


