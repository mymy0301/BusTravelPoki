import { _decorator, CCBoolean, CCFloat, CCString, Component, instantiate, Label, Layout, Node, Prefab, Size, Sprite, SpriteFrame, UITransform, Vec2, Vec3 } from 'cc';
import { TYPE_BUBBLE } from './TypeBubble';
import { IPrize } from 'db://assets/scripts/Utils/Types';
import { ItemPrizeLobby } from '../../UIReceivePrize/ItemPrizeLobby';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { AniTweenSys } from 'db://assets/scripts/Utils/AniTweenSys';
const { ccclass, property } = _decorator;

/**
 * thông tin trong customBubble luôn được sắp xếp từ top , bottom , left , right
 */
export interface ICustomBubble {
    ar?: [number, number, number, number],
    bb?: [number, number, number, number],
    text?: [number, number, number, number]
}

@ccclass('BubbleSys')
export class BubbleSys extends Component {
    @property({ group: "Arrow", type: CCFloat }) ar_top: number = 44;
    @property({ group: "Arrow", type: CCFloat }) ar_bottom: number = -39;
    @property({ group: "Arrow", type: CCFloat }) ar_left: number = 0;
    @property({ group: "Arrow", type: CCFloat }) ar_right: number = -62;

    @property({ group: "Buble", type: CCFloat }) bb_top: number = 0;
    @property({ group: "Buble", type: CCFloat }) bb_bottom: number = 0;
    @property({ group: "Buble", type: CCFloat }) bb_left: number = 0;
    @property({ group: "Buble", type: CCFloat }) bb_right: number = 0;

    @property({ group: { name: "Text", id: "Text" }, type: CCFloat }) text_padding_top: number = 10;
    @property({ group: { name: "Text", id: "Text" }, type: CCFloat }) text_padding_bottom: number = 10;
    @property({ group: { name: "Text", id: "Text" }, type: CCFloat }) text_padding_left: number = 10;
    @property({ group: { name: "Text", id: "Text" }, type: CCFloat }) text_padding_right: number = 10;


    @property(CCFloat) timeShutDown: number = 2.5;

    @property(SpriteFrame) sfArrowUp: SpriteFrame;
    @property(SpriteFrame) sfArrowDown: SpriteFrame;
    @property(Sprite) spArrow: Sprite;
    @property(UITransform) UTBg: UITransform;
    @property(Prefab) itemCustomPrize: Prefab;
    @property(Node) nBubble: Node;
    @property(Label) lb: Label;
    @property(Node) nBubbleListenClose: Node;

    @property(CCString) nameEvent_Open = '';
    @property(CCString) nameEvent_ForceClose = '';
    @property(CCString) nameEvent_Open_Text = '';

    @property(CCBoolean) isForcePosRight: boolean = false;

    private _wPosAnchor: Vec3 = new Vec3(0, 0, 0);

    protected onLoad(): void {
        this.nBubble.active = false;
        this.lb.node.active = false;
    }

    protected onEnable(): void {
        if (this.nameEvent_Open != '' && !clientEvent.isOnEvent(this.nameEvent_Open, this.PopUpNotification, this)) {
            clientEvent.on(this.nameEvent_Open, this.PopUpNotification, this);
        }
        if (this.nameEvent_ForceClose != '' && !clientEvent.isOnEvent(this.nameEvent_ForceClose, this.ForceClose, this)) {
            clientEvent.on(this.nameEvent_ForceClose, this.ForceClose, this);
        }
        if (this.nameEvent_Open_Text != '' && !clientEvent.isOnEvent(this.nameEvent_Open_Text, this.PopUpNotification_text, this)) {
            clientEvent.on(this.nameEvent_Open_Text, this.PopUpNotification_text, this);
        }
    }

    protected onDisable(): void {
        if (this.nameEvent_Open != '') {
            clientEvent.off(this.nameEvent_Open, this.PopUpNotification, this);
        }
        if (this.nameEvent_ForceClose != '') {
            clientEvent.off(this.nameEvent_ForceClose, this.ForceClose, this);
        }
        if (this.nameEvent_Open_Text != '') {
            clientEvent.off(this.nameEvent_Open_Text, this.PopUpNotification_text, this);
        }

        this.UnRegisterBubble();
    }

    private _listItem: Node[] = [];

    private readonly sizeDefaultCacul = new Size(80, 92);
    private readonly sizeDefaultItem = new Size(90, 90);
    private readonly distanceAddWidthForItem = 110;
    private readonly distanceAddHeightForEachLineItem = 115;

    private RegisterBubble() {
        if (this.nBubbleListenClose != null) {
            this.nBubbleListenClose.on(Node.EventType.TOUCH_START, this.CloseBubble, this, true);
        }
    }

    private UnRegisterBubble() {
        // Need try catch in here because the node is not depend on this node class. So you need try catch if it wrong
        try {
            if (this.nBubbleListenClose != null) {
                this.nBubbleListenClose.off(Node.EventType.TOUCH_START, this.CloseBubble, this, true);
            }
        } catch (e) {

        }
    }

    private CloseBubble() {
        this.callbackScheduleTimeShutDown(0);
    }

    public PopUpNotification(listPrize: IPrize[], type: TYPE_BUBBLE, wPos: Vec3, isAutoChoice: boolean = false,
        nParent: Node = null, iCustomBubble: ICustomBubble = null, distanceAddForItem: Vec2 = null) {
        if (distanceAddForItem == null) {
            distanceAddForItem = new Vec2(this.distanceAddWidthForItem, this.distanceAddHeightForEachLineItem);
        }

        if (nParent != null) {
            this.nBubble.parent = nParent;
        }

        // hide text
        this.lb.node.active = false;

        // check autoChoice
        if (isAutoChoice) {
            type = this.AutoChoiceTypeBubble(wPos, type);
        }

        // tính toán size
        let newX = listPrize.length * this.sizeDefaultItem.width + distanceAddForItem.x;
        let newY = distanceAddForItem.y;
        let newSize = new Size(newX, newY);

        // set prize + size
        this.SetPrize(listPrize);
        const customAr = iCustomBubble != null && iCustomBubble.ar != null ? iCustomBubble.ar : null;
        this.SetSizeReceivePrize(newSize, type, customAr);

        // set world position
        this.nBubble.active = true;
        this.nBubble.worldPosition = wPos.clone();

        const posArrow: Vec3 = this.spArrow.node.position.clone();
        const contentSizeArrow: Size = this.spArrow.node.getComponent(UITransform).contentSize.clone();
        let wPosRight: Vec3 = new Vec3();
        switch (type) {
            case TYPE_BUBBLE.BOTTOM_MID: case TYPE_BUBBLE.BOTTOM_LEFT: case TYPE_BUBBLE.BOTTOM_RIGHT:
                wPosRight = wPos.clone().add3f(0, posArrow.y, 0).add3f(0, contentSizeArrow.height / 2, 0);
                break;
            case TYPE_BUBBLE.TOP_LEFT: case TYPE_BUBBLE.TOP_MID: case TYPE_BUBBLE.TOP_RIGHT:
                wPosRight = wPos.clone().add3f(0, -posArrow.y, 0).add3f(0, -contentSizeArrow.height / 2, 0);
                break;
        }

        // add distance to bubble

        //NOTE
        /**
         * Cần phải sửa lại nội dung trong phần switch case này, hãy tham khảo nội dung sửa trong case TOP_RIGHT để bt thêm chi tiết chính xác vấn đề mà các case khác đang nhầm lẫn
         */
        switch (type) {
            case TYPE_BUBBLE.TOP_LEFT:
                wPosRight = wPosRight.add3f(this.bb_left, this.bb_top, 0);
                break;
            case TYPE_BUBBLE.TOP_MID:
                wPosRight = wPosRight.add3f(0, this.bb_top, 0);
                break;
            case TYPE_BUBBLE.TOP_RIGHT:
                if (this.isForcePosRight) {
                    wPosRight = wPosRight.add3f(-newSize.x / 2 + distanceAddForItem.x / 2, this.bb_top, 0);
                } else {
                    wPosRight = wPosRight.add3f(this.bb_right, this.bb_top, 0);
                }
                break;
            case TYPE_BUBBLE.BOTTOM_LEFT:
                wPosRight = wPosRight.add3f(this.bb_left, this.bb_bottom, 0);
                break;
            case TYPE_BUBBLE.BOTTOM_MID:
                wPosRight = wPosRight.add3f(0, this.bb_bottom, 0);
                break;
            case TYPE_BUBBLE.BOTTOM_RIGHT:
                wPosRight = wPosRight.add3f(this.bb_right, this.bb_bottom, 0);
                break;
        }

        this.nBubble.worldPosition = wPosRight;

        // anim show
        this.ShowAnimNotification(this.nBubble);

        this.RegisterBubble();
    }

    public PopUpNotification_text(textNoti: string, type: TYPE_BUBBLE, wPos: Vec3, isAutoChoice: boolean = false, nParent: Node = null, iCustomBubble: ICustomBubble = null) {
        if (nParent != null) {
            this.nBubble.parent = nParent;
        }

        // reUse All prize
        this.ReUseAllPrize();

        // check autoChoice
        if (isAutoChoice) {
            type = this.AutoChoiceTypeBubble(wPos, type);
        }

        // update text
        this.lb.string = textNoti;
        this.lb.node.active = true;
        this.lb.updateRenderData(true);
        const sizeLb = this.lb.node.getComponent(UITransform).contentSize.clone();

        // NOTE phần cộng size ở đoạn này chưa hợp lý, nếu bạn rảnh thì xin hãy sửa lại dùm
        let newSize = new Size(
            sizeLb.x + this.text_padding_left + this.text_padding_right,
            sizeLb.y + this.text_padding_top + this.text_padding_bottom
        );

        // console.log("iCustomBubble", iCustomBubble);

        // set prize + size 
        this.SetSizeReceivePrize(newSize, type, iCustomBubble != null ? iCustomBubble.ar : null);

        // set world position
        this.nBubble.active = true;
        this.nBubble.worldPosition = wPos.clone();

        const posArrow: Vec3 = this.spArrow.node.position.clone();
        const contentSizeArrow: Size = this.spArrow.node.getComponent(UITransform).contentSize.clone();
        let wPosRight: Vec3 = new Vec3();
        switch (type) {
            case TYPE_BUBBLE.BOTTOM_MID: case TYPE_BUBBLE.BOTTOM_LEFT: case TYPE_BUBBLE.BOTTOM_RIGHT:
                wPosRight = wPos.clone().add3f(0, posArrow.y, 0).add3f(0, contentSizeArrow.height / 2, 0);
                break;
            case TYPE_BUBBLE.TOP_LEFT: case TYPE_BUBBLE.TOP_MID: case TYPE_BUBBLE.TOP_RIGHT:
                wPosRight = wPos.clone().add3f(0, -posArrow.y, 0).add3f(0, -contentSizeArrow.height / 2, 0);
                break;
        }

        // add distance to bubble
        const iCustomBB = iCustomBubble != null && iCustomBubble.bb != null ? iCustomBubble.bb : null;
        switch (type) {
            case TYPE_BUBBLE.TOP_LEFT:
                wPosRight = wPosRight.add3f(this.bb_left, this.bb_top, 0);
                if (iCustomBB != null) {
                    wPosRight = wPosRight.add3f(iCustomBB[2] != null ? iCustomBB[2] : 0, iCustomBB[0] != null ? iCustomBB[0] : 0, 0);
                }
                break;
            case TYPE_BUBBLE.TOP_MID:
                wPosRight = wPosRight.add3f(0, this.bb_top, 0);
                if (iCustomBB != null) {
                    wPosRight = wPosRight.add3f(0, iCustomBB[0] != null ? iCustomBB[0] : 0, 0);
                }
                break;
            case TYPE_BUBBLE.TOP_RIGHT:
                wPosRight = wPosRight.add3f(this.bb_right, this.bb_top, 0);
                if (iCustomBB != null) {
                    wPosRight = wPosRight.add3f(iCustomBB[3] != null ? iCustomBB[3] : 0, iCustomBB[0] != null ? iCustomBB[0] : 0, 0);
                }
                break;
            case TYPE_BUBBLE.BOTTOM_LEFT:
                wPosRight = wPosRight.add3f(this.bb_left, this.bb_bottom, 0);
                if (iCustomBB != null) {
                    wPosRight = wPosRight.add3f(iCustomBB[2] != null ? iCustomBB[2] : 0, iCustomBB[1] != null ? iCustomBB[1] : 0, 0);
                }
                break;
            case TYPE_BUBBLE.BOTTOM_MID:
                wPosRight = wPosRight.add3f(0, this.bb_bottom, 0);
                if (iCustomBB != null) {
                    wPosRight = wPosRight.add3f(0, iCustomBB[1] != null ? iCustomBB[1] : 0, 0);
                }
                break;
            case TYPE_BUBBLE.BOTTOM_RIGHT:
                wPosRight = wPosRight.add3f(this.bb_right, this.bb_bottom, 0);
                if (iCustomBB != null) {
                    wPosRight = wPosRight.add3f(iCustomBB[3] != null ? iCustomBB[3] : 0, iCustomBB[1] != null ? iCustomBB[1] : 0, 0);
                }
                break;
        }

        this.nBubble.worldPosition = wPosRight;

        // anim show
        this.ShowAnimNotification(this.nBubble);

        this.RegisterBubble();
    }

    private ReUseAllPrize() {
        // ReUse All Item
        this._listItem.forEach(item => {
            this.ReUsePrize(item);
        })
    }

    private SetPrize(listIPrize: IPrize[]) {
        this.ReUseAllPrize();

        // reset data save
        this._listItem = [];

        // init new prize
        for (let i = 0; i < listIPrize.length; i++) {
            let item = this.InitPrize();
            item.getComponent(ItemPrizeLobby).SetUp(listIPrize[i], Vec3.ZERO, 1);
            item.setParent(this.layoutPrize.node);
            item.active = true;
            this._listItem.push(item);
        }
    }

    private SetSizeReceivePrize(size: Size, type: TYPE_BUBBLE, customAr: number[] = null) {
        this.UTBg.setContentSize(size);

        // console.log(size);


        // sf arrow
        switch (type) {
            case TYPE_BUBBLE.TOP_LEFT: case TYPE_BUBBLE.TOP_MID: case TYPE_BUBBLE.TOP_RIGHT:
                this.spArrow.spriteFrame = this.sfArrowUp;
                break;
            case TYPE_BUBBLE.BOTTOM_LEFT: case TYPE_BUBBLE.BOTTOM_MID: case TYPE_BUBBLE.BOTTOM_RIGHT:
                this.spArrow.spriteFrame = this.sfArrowDown;
                break;
        }

        // console.log("custom Arr", customAr);

        // pos
        let x, y;
        switch (type) {
            case TYPE_BUBBLE.TOP_LEFT:
                x = size.width / 2 - this.sizeDefaultCacul.width / 2 + this.ar_left;
                y = size.height / 2 - this.sizeDefaultCacul.height / 2 + this.ar_top;
                if (customAr != null) {
                    x += customAr[2] != null && customAr[2] >= 0 ? customAr[2] : 0;
                    y += customAr[0] != null && customAr[0] >= 0 ? customAr[0] : 0;
                }
                break;
            case TYPE_BUBBLE.TOP_MID:
                x = 0;
                y = size.height / 2 - this.sizeDefaultCacul.height / 2 + this.ar_top;
                if (customAr != null) {
                    y += customAr[0] != null && customAr[0] >= 0 ? customAr[0] : 0;
                }
                break;
            case TYPE_BUBBLE.TOP_RIGHT:
                x = size.width / 2 - this.sizeDefaultCacul.width / 2 + this.ar_right;
                y = size.height / 2 - this.sizeDefaultCacul.height / 2 + this.ar_top;
                if (customAr != null) {
                    x += customAr[3] != null && customAr[3] >= 0 ? customAr[3] : 0;
                    y += customAr[0] != null && customAr[0] >= 0 ? customAr[0] : 0;
                }
                break;
            case TYPE_BUBBLE.BOTTOM_LEFT:
                x = size.width / 2 - this.sizeDefaultCacul.width / 2 + this.ar_left;
                y = -size.height / 2 + this.sizeDefaultCacul.height / 2 + this.ar_bottom;
                if (customAr != null) {
                    x += customAr[2] != null && customAr[2] >= 0 ? customAr[2] : 0;
                    y += customAr[1] != null && customAr[1] >= 0 ? customAr[1] : 0;
                }
                break;
            case TYPE_BUBBLE.BOTTOM_MID:
                x = 0;
                y = -size.height / 2 + this.sizeDefaultCacul.height / 2 + this.ar_bottom;
                if (customAr != null) {
                    y += customAr[1] != null && customAr[1] >= 0 ? customAr[1] : 0;
                }
                break;
            case TYPE_BUBBLE.BOTTOM_RIGHT:
                x = size.width / 2 - this.sizeDefaultCacul.width / 2 + this.ar_right;
                y = -size.height / 2 + this.sizeDefaultCacul.height / 2 + this.ar_bottom;
                if (customAr != null) {
                    x += customAr[3] != null && customAr[3] >= 0 ? customAr[3] : 0;
                    y += customAr[1] != null && customAr[1] >= 0 ? customAr[1] : 0;
                }
                break;
        }

        this.spArrow.node.setPosition(x, y);
    }

    //#region Auto Choice type Bubble
    /**
     * Bắt buộc phải gọi hàm này trước khi sử dụng bất kỳ phương thức trên
     * trong trường hợp bạn sử dụng tính năng autoTypeBubble
     * @param wPosAnchor 
     */
    public SetAnchorView(wPosAnchor: Vec3) { this._wPosAnchor = wPosAnchor; }

    /**
     * Hàm này sẽ tự động tính toán để chọn xem là Bottom hay Top
     * @param wPos 
     * @param typeHope sẽ lấy 3 trường hợp đó là left | mid | right 
     */
    public AutoChoiceTypeBubble(wPos: Vec3, typeHope: TYPE_BUBBLE): TYPE_BUBBLE {
        const isUp = wPos.y >= this._wPosAnchor.y;
        // nếu như chỗ hiển thị nằm ở trên anchor thì chúng ta sẽ hiển thị Bottom để có nhiều chỗ hiển thị notification nhất có thể
        if (!isUp) {
            switch (typeHope) {
                case TYPE_BUBBLE.BOTTOM_LEFT: case TYPE_BUBBLE.TOP_LEFT: return TYPE_BUBBLE.BOTTOM_LEFT;
                case TYPE_BUBBLE.BOTTOM_MID: case TYPE_BUBBLE.TOP_MID: return TYPE_BUBBLE.BOTTOM_MID;
                case TYPE_BUBBLE.BOTTOM_RIGHT: case TYPE_BUBBLE.TOP_RIGHT: return TYPE_BUBBLE.BOTTOM_RIGHT;
            }
        } else {
            switch (typeHope) {
                case TYPE_BUBBLE.BOTTOM_LEFT: case TYPE_BUBBLE.TOP_LEFT: return TYPE_BUBBLE.TOP_LEFT;
                case TYPE_BUBBLE.BOTTOM_MID: case TYPE_BUBBLE.TOP_MID: return TYPE_BUBBLE.TOP_MID;
                case TYPE_BUBBLE.BOTTOM_RIGHT: case TYPE_BUBBLE.TOP_RIGHT: return TYPE_BUBBLE.TOP_RIGHT;
            }
        }
    }
    //#endregion AutoChoice type Bubble

    //#region pool prize
    @property(Layout) layoutPrize: Layout;
    @property(Node) nTempPrize: Node;
    private InitPrize() {
        if (this.nTempPrize.children.length > 0) {
            return this.nTempPrize.children[0];
        } else {
            let item = instantiate(this.itemCustomPrize);
            item.parent = this.nTempPrize;
            return item;
        }
    }

    private ReUsePrize(item: Node) {
        item.active = false;
        item.setParent(this.nTempPrize);
    }

    //#endregion pool prize

    //#region time
    private ShowAnimNotification(nUINotification: Node) {
        const baseScale = Vec3.ONE;
        nUINotification.scale = Vec3.ZERO;
        AniTweenSys.Scale(nUINotification, baseScale, 0.5, 'backOut');
        nUINotification.active = true;

        // schedule to shutdown
        this.caculToShutDown();
    }

    private caculToShutDown() {
        this.unschedule(this.callbackScheduleTimeShutDown);
        this.scheduleOnce(this.callbackScheduleTimeShutDown, this.timeShutDown);
    }

    private async callbackScheduleTimeShutDown(dt: number, isForce: boolean = false) {

        // ở đây xử dụng try catch bởi vì rất có thể bubble sẽ bị gọi khi node đang được hủy => cần cẩn trọng với đoạn code ở đây
        try {
            // console.log("1111", isForce);
            this.UnRegisterBubble();

            if (!isForce) {

                await AniTweenSys.Scale(this.nBubble, Vec3.ZERO, 0.5, 'smooth');
            } else {
                this.nBubble.scale = Vec3.ZERO;
            }

            // lý do cho dòng code ở dưới đó là trong trường hợp bubble được gán cho một item khác
            // => khi đóng UI chúng ta đã có thể call force close cho bubble và destroy cha của item kia => chúng ta cần phải gán lại cha cho thằng bubble
            if (this.nBubble.parent != this.node) {
                this.nBubble.parent = this.node;
            }
        } catch (error) {

        }
    }

    public ForceClose() {
        this.unschedule(this.callbackScheduleTimeShutDown);
        this.callbackScheduleTimeShutDown(0, true);
    }
    //#endregion time
}


