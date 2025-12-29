import { _decorator, Color, Component, js, Label, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
import { DIRECT_CAR, JsonCar, M_COLOR, TYPE_CAR_SIZE, GetMColorByNumber, GetNumberByMColor, ConvertSizeCarFromJson } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { BuildGameSys } from '../../BuildGameSys';
import { BuildConveyorBelt } from '../../ConveyorBelt/BuildConveyorBelt';
const { ccclass, property } = _decorator;

@ccclass('ItemCarOfConveyorBelt')
export class ItemCarOfConveyorBelt extends Component {
    @property(Sprite) spCar: Sprite;
    @property(Sprite) spBg: Sprite;
    @property(Label) lbId: Label;
    private jsonCar: JsonCar = {
        idCar: 0,
        carColor: 1,
        carSize: TYPE_CAR_SIZE['4_CHO'],
        carPosition: Vec3.ONE,
        carDirection: DIRECT_CAR.TOP,
        isMysteryCar: false
    }
    private _idCar: number = 0; public get GetIdCar(): number { return this._idCar; }
    private _cbTouchingNode: CallableFunction = null;

    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_START, this.OnTouchStart, this);
    }

    public GetInfo(): JsonCar {
        return this.jsonCar;
    }

    public GetNumColorCar(): number {
        return this.jsonCar.carColor;
    }

    public GetSizeCar(): number {
        return this.jsonCar.carSize;
    }

    public Init(cbTouchingNode: CallableFunction, idCar: number, jsonCar: JsonCar = null) {
        this._cbTouchingNode = cbTouchingNode;
        this.jsonCar = jsonCar;
        this._idCar = idCar;
        this.UpdateVisual();
    }

    public SetIdCar(idCar: number) {
        this._idCar = idCar;
        this.UpdateVisual();
    }

    private UpdateInfoRoot() {
        let nConveyorBelt: Node = BuildGameSys.Instance.getNConveyorBeltChoicing();
        nConveyorBelt.getComponent(BuildConveyorBelt).ChangeDataCarOfConveyorBeltCars(this._idCar, this.jsonCar);
    }

    //#region func btn
    public OnTouchStart() {
        if (this._cbTouchingNode != null) {
            this._cbTouchingNode(this.node);
        }
    }

    public ChoiceThisCar() {
        this.spBg.color = Color.GREEN;
    }

    public UnChoiceThisCar(idCarChoice: number) {
        if (this._idCar != idCarChoice) {
            this.spBg.color = Color.WHITE;
        }
    }

    public OnChangeColor(color: M_COLOR) {
        this.jsonCar.carColor = GetNumberByMColor(color);
        this.UpdateVisual();
        this.UpdateInfoRoot();
    }

    private _pathCarNow: string = null;
    private UpdateVisual() {
        const pathImageCar: string = MConfigResourceUtils.GetPathCar(GetMColorByNumber(this.jsonCar.carColor), ConvertSizeCarFromJson(this.jsonCar.carSize), this.jsonCar.carDirection);
        this._pathCarNow = pathImageCar;
        MConfigResourceUtils.GetImageCarUntilLoad(pathImageCar, (path, sfCar: SpriteFrame) => {
            try {
                if (this._pathCarNow == path) {
                    this.spCar.spriteFrame = sfCar;
                }
            } catch (e) {

            }
        });
        this.lbId.string = this._idCar.toString();
        this.node.name = "CarConveyorBeltId_" + this._idCar;
    }

    /**
     * 
     * @param size 4 | 6 | 10
     */
    public OnChangeSize(size: number) {
        this.jsonCar.carSize = size;
        this.UpdateVisual();
        this.UpdateInfoRoot();
    }
    //#endregion func btn
}


