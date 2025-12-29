import { _decorator, Color, Component, Label, Node, RigidBody2D, Sprite, SpriteFrame, Vec3 } from 'cc';
import { DIRECT_CAR, GetColorForSpriteFromMColor, GetMColorByNumber, JsonCar, JsonGarage } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('VisualGarageSys')
export class VisualGarageSys {
    @property({ type: Sprite }) spVisualGarage: Sprite;
    @property({ type: Sprite }) spShadowGarage: Sprite;
    // @property({ type: Sprite }) spSignWhite: Sprite;
    // @property(Sprite) iconSignCar: Sprite;
    @property({ type: Label }) numCarRemaining: Label;
    @property({ type: Node }) nGenCar: Node;
    @property(Node) nCollider: Node;
    @property(Node) nCollider_TL: Node;

    @property({ group: { id: "Shadow", name: "Shadow" }, type: SpriteFrame }) sfShadowTop: SpriteFrame;
    @property({ group: { id: "Shadow", name: "Shadow" }, type: SpriteFrame }) sfShadowTopRight: SpriteFrame;
    @property({ group: { id: "Shadow", name: "Shadow" }, type: SpriteFrame }) sfShadowRight: SpriteFrame;
    @property({ group: { id: "Shadow", name: "Shadow" }, type: SpriteFrame }) sfShadowBottomRight: SpriteFrame;
    @property({ group: { id: "Shadow", name: "Shadow" }, type: SpriteFrame }) sfShadowBottom: SpriteFrame;
    @property({ group: { id: "Shadow", name: "Shadow" }, type: SpriteFrame }) sfShadowBottomLeft: SpriteFrame;
    @property({ group: { id: "Shadow", name: "Shadow" }, type: SpriteFrame }) sfShadowLeft: SpriteFrame;
    @property({ group: { id: "Shadow", name: "Shadow" }, type: SpriteFrame }) sfShadowTopLeft: SpriteFrame

    @property({ group: { id: "Shadow", name: "Shadow" } }) posShadowTop: Vec3 = new Vec3();
    @property({ group: { id: "Shadow", name: "Shadow" } }) posShadowTopRight: Vec3 = new Vec3();
    @property({ group: { id: "Shadow", name: "Shadow" } }) posShadowRight: Vec3 = new Vec3();
    @property({ group: { id: "Shadow", name: "Shadow" } }) posShadowBottomRight: Vec3 = new Vec3();
    @property({ group: { id: "Shadow", name: "Shadow" } }) posShadowBottom: Vec3 = new Vec3();
    @property({ group: { id: "Shadow", name: "Shadow" } }) posShadowBottomLeft: Vec3 = new Vec3();
    @property({ group: { id: "Shadow", name: "Shadow" } }) posShadowLeft: Vec3 = new Vec3();
    @property({ group: { id: "Shadow", name: "Shadow" } }) posShadowTopLeft: Vec3 = new Vec3();

    @property({ group: "Pos Visual Garage", type: SpriteFrame }) sfTop: SpriteFrame;
    @property({ group: "Pos Visual Garage", type: SpriteFrame }) sfTopRight: SpriteFrame;
    @property({ group: "Pos Visual Garage", type: SpriteFrame }) sfRight: SpriteFrame;
    @property({ group: "Pos Visual Garage", type: SpriteFrame }) sfBottomRight: SpriteFrame;
    @property({ group: "Pos Visual Garage", type: SpriteFrame }) sfBottom: SpriteFrame;
    @property({ group: "Pos Visual Garage", type: SpriteFrame }) sfBottomLeft: SpriteFrame;
    @property({ group: "Pos Visual Garage", type: SpriteFrame }) sfLeft: SpriteFrame;
    @property({ group: "Pos Visual Garage", type: SpriteFrame }) sfTopLeft: SpriteFrame

    @property({ group: "Pos Visual Garage" }) posTop: Vec3 = new Vec3();
    @property({ group: "Pos Visual Garage" }) posTopRight: Vec3 = new Vec3();
    @property({ group: "Pos Visual Garage" }) posRight: Vec3 = new Vec3();
    @property({ group: "Pos Visual Garage" }) posBottomRight: Vec3 = new Vec3();
    @property({ group: "Pos Visual Garage" }) posBottom: Vec3 = new Vec3();
    @property({ group: "Pos Visual Garage" }) posBottomLeft: Vec3 = new Vec3();
    @property({ group: "Pos Visual Garage" }) posLeft: Vec3 = new Vec3();
    @property({ group: "Pos Visual Garage" }) posTopLeft: Vec3 = new Vec3();

    @property({ group: "Pos Text" }) posTextTop: Vec3 = new Vec3();
    @property({ group: "Pos Text" }) posTextTopRight: Vec3 = new Vec3();
    @property({ group: "Pos Text" }) posTextRight: Vec3 = new Vec3();
    @property({ group: "Pos Text" }) posTextBottomRight: Vec3 = new Vec3();
    @property({ group: "Pos Text" }) posTextBottom: Vec3 = new Vec3();
    @property({ group: "Pos Text" }) posTextBottomLeft: Vec3 = new Vec3();
    @property({ group: "Pos Text" }) posTextLeft: Vec3 = new Vec3();
    @property({ group: "Pos Text" }) posTextTopLeft: Vec3 = new Vec3();

    public Init(infoGarage: JsonGarage) {
        this.UpdateSign(infoGarage[infoGarage.cars.length - 1], infoGarage.cars.length, infoGarage.direction);
        this.UpdateColliderDirection(infoGarage.direction);
        this.UpdateShadow(infoGarage.direction);
        this.UpdateVisual(infoGarage.direction);
    }

    private UpdateShadow(directionGarage: DIRECT_CAR) {
        let isShowShadow: boolean = false;
        this.spShadowGarage.node.scale = Vec3.ONE;

        switch (directionGarage) {
            case DIRECT_CAR.TOP:
                isShowShadow = this.sfShadowTop != null;

                this.spShadowGarage.node.active = isShowShadow;

                if (isShowShadow) {
                    this.spShadowGarage.spriteFrame = this.sfShadowTop;
                    this.spShadowGarage.node.position = this.posShadowTop;
                }
                break;
            case DIRECT_CAR.TOP_RIGHT:
                isShowShadow = this.sfShadowTopRight != null;

                this.spShadowGarage.node.active = isShowShadow;

                if (this.sfShadowTopRight != null) {
                    this.spShadowGarage.spriteFrame = this.sfShadowTopRight;
                    this.spShadowGarage.node.position = this.posShadowTopRight;
                }
                break;
            case DIRECT_CAR.RIGHT:
                isShowShadow = this.sfShadowRight != null;

                this.spShadowGarage.node.active = isShowShadow;

                if (this.sfShadowRight != null) {
                    this.spShadowGarage.spriteFrame = this.sfShadowRight;
                    this.spShadowGarage.node.position = this.posShadowRight;
                }
                break;
            case DIRECT_CAR.BOTTOM_RIGHT:
                isShowShadow = this.sfShadowBottomRight != null;

                this.spShadowGarage.node.active = isShowShadow;

                if (this.sfShadowBottomRight != null) {
                    this.spShadowGarage.spriteFrame = this.sfShadowBottomRight;
                    this.spShadowGarage.node.position = this.posShadowBottomRight;
                }
                break;
            case DIRECT_CAR.BOTTOM:
                isShowShadow = this.sfShadowBottom != null;

                this.spShadowGarage.node.active = isShowShadow;

                if (this.sfShadowBottom != null) {
                    this.spShadowGarage.spriteFrame = this.sfShadowBottom;
                    this.spShadowGarage.node.position = this.posShadowBottom;
                }
                break;
            case DIRECT_CAR.BOTTOM_LEFT:
                isShowShadow = this.sfShadowBottomLeft != null;

                this.spShadowGarage.node.active = isShowShadow;

                if (this.sfShadowBottomLeft != null) {
                    this.spShadowGarage.spriteFrame = this.sfShadowBottomLeft;
                    this.spShadowGarage.node.position = this.posShadowBottomLeft;
                    this.spShadowGarage.node.scale = new Vec3(-1, 1, 1);
                }
                break;
            case DIRECT_CAR.LEFT:
                isShowShadow = this.sfShadowLeft != null;

                this.spShadowGarage.node.active = isShowShadow;

                if (this.sfShadowLeft != null) {
                    this.spShadowGarage.spriteFrame = this.sfShadowLeft;
                    this.spShadowGarage.node.position = this.posShadowLeft;
                    this.spShadowGarage.node.scale = new Vec3(-1, 1, 1);
                }
                break;
            case DIRECT_CAR.TOP_LEFT:
                isShowShadow = this.sfShadowTopLeft != null;

                this.spShadowGarage.node.active = isShowShadow;

                if (this.sfShadowTopLeft != null) {
                    this.spShadowGarage.spriteFrame = this.sfShadowTopLeft;
                    this.spShadowGarage.node.position = this.posShadowTopLeft;
                }
                break;
        }
    }

    private UpdateVisual(directionGarage: DIRECT_CAR) {

        switch (directionGarage) {
            case DIRECT_CAR.TOP:
                this.spVisualGarage.spriteFrame = this.sfTop;
                this.spVisualGarage.node.position = this.posTop;
                this.spVisualGarage.node.scale = new Vec3(1, 1, 1);
                break;
            case DIRECT_CAR.TOP_RIGHT:
                this.spVisualGarage.spriteFrame = this.sfTopRight;
                this.spVisualGarage.node.position = this.posTopRight;
                this.spVisualGarage.node.scale = new Vec3(1, 1, 1);
                break;
            case DIRECT_CAR.RIGHT:
                this.spVisualGarage.spriteFrame = this.sfRight;
                this.spVisualGarage.node.position = this.posRight;
                this.spVisualGarage.node.scale = new Vec3(1, 1, 1);
                break;
            case DIRECT_CAR.BOTTOM_RIGHT:
                this.spVisualGarage.spriteFrame = this.sfBottomRight;
                this.spVisualGarage.node.position = this.posBottomRight;
                this.spVisualGarage.node.scale = new Vec3(-1, 1, 1);
                break;
            case DIRECT_CAR.BOTTOM:
                this.spVisualGarage.spriteFrame = this.sfBottom;
                this.spVisualGarage.node.position = this.posBottom;
                this.spVisualGarage.node.scale = new Vec3(1, 1, 1);
                break;
            case DIRECT_CAR.BOTTOM_LEFT:
                this.spVisualGarage.spriteFrame = this.sfBottomLeft;
                this.spVisualGarage.node.position = this.posBottomLeft;
                this.spVisualGarage.node.scale = new Vec3(1, 1, 1);
                break;
            case DIRECT_CAR.LEFT:
                this.spVisualGarage.spriteFrame = this.sfLeft;
                this.spVisualGarage.node.position = this.posLeft;
                this.spVisualGarage.node.scale = new Vec3(-1, 1, 1);
                break;
            case DIRECT_CAR.TOP_LEFT:
                this.spVisualGarage.spriteFrame = this.sfTopLeft;
                this.spVisualGarage.node.position = this.posTopLeft;
                this.spVisualGarage.node.scale = new Vec3(-1, 1, 1);
                break;
        }
    }

    public UpdateSign(infoCarNext: JsonCar, numCarRemaining: number, direction: DIRECT_CAR) {
        // if (infoCarNext != null) {
        //     this.spSignWhite.color = GetColorForSpriteFromMColor(GetMColorByNumber(infoCarNext.carColor));
        // } else {
        //     this.spSignWhite.color = Color.WHITE;
        // }
        this.numCarRemaining.string = numCarRemaining.toString();

        switch (direction) {
            case DIRECT_CAR.TOP:
                this.numCarRemaining.node.position = this.posTextTop.clone().add(this.posTop);
                break;
            case DIRECT_CAR.TOP_RIGHT:
                this.numCarRemaining.node.position = this.posTextTopRight.clone().add(this.posTopRight);
                break;
            case DIRECT_CAR.RIGHT:
                this.numCarRemaining.node.position = this.posTextRight.clone().add(this.posRight);
                break;
            case DIRECT_CAR.BOTTOM_RIGHT:
                this.numCarRemaining.node.position = this.posTextBottomRight.clone().add(this.posBottomRight);
                break;
            case DIRECT_CAR.BOTTOM:
                this.numCarRemaining.node.position = this.posTextBottom.clone().add(this.posBottom);
                break;
            case DIRECT_CAR.BOTTOM_LEFT:
                this.numCarRemaining.node.position = this.posTextBottomLeft.clone().add(this.posBottomLeft);
                break;
            case DIRECT_CAR.LEFT:
                this.numCarRemaining.node.position = this.posTextLeft.clone().add(this.posLeft);
                break;
            case DIRECT_CAR.TOP_LEFT:
                this.numCarRemaining.node.position = this.posTextTopLeft.clone().add(this.posTopLeft);
                break;
        }
    }

    private UpdateColliderDirection(directionGarage: DIRECT_CAR) {
        let angleChoice: number = 0;
        let colliderChoice: Node = null;

        switch (directionGarage) {
            case DIRECT_CAR.TOP_RIGHT: case DIRECT_CAR.BOTTOM_LEFT:
                angleChoice = -45;
                colliderChoice = this.nCollider_TL; this.nCollider_TL.active = true; this.nCollider.active = false;
                break;
            case DIRECT_CAR.TOP: case DIRECT_CAR.BOTTOM:
                angleChoice = 0;
                colliderChoice = this.nCollider; this.nCollider_TL.active = false; this.nCollider.active = true;
                break;
            case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.BOTTOM_RIGHT:
                angleChoice = 45;
                colliderChoice = this.nCollider_TL; this.nCollider_TL.active = true; this.nCollider.active = false;
                break;
            case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT:
                angleChoice = 90;
                colliderChoice = this.nCollider; this.nCollider_TL.active = false; this.nCollider.active = true;
                break;
        }

        colliderChoice.angle = angleChoice;
    }
}


