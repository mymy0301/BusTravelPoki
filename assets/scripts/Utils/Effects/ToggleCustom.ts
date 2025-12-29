import { _decorator, Button, CCFloat, Component, EventHandler, Label, Node, Sprite, SpriteFrame } from 'cc';
import { MConst } from '../../Const/MConst';
import { btnAdapter } from '../../Common/btnAdapter';
const { ccclass, property, requireComponent, disallowMultiple } = _decorator;


@ccclass('ToggleCustom')
@requireComponent(btnAdapter)
@disallowMultiple
export class ToggleCustom extends Component {
   @property(Node) iconToggle: Node;
   @property(Label) lbToggle: Label;

   @property(CCFloat) xIconToggleOn: number = 0;
   @property(CCFloat) xIconToggleOff: number = 0;
   @property(CCFloat) xLbToggleOn: number = 0;
   @property(CCFloat) xLbToggleOff: number = 0;

   @property(SpriteFrame) sfToggleOn: SpriteFrame;
   @property(SpriteFrame) sfToggleOff: SpriteFrame;

   private _callbackToggleOn: CallableFunction = null;
   private _callbackToggleOff: CallableFunction = null;
   private _stateToggle: boolean = false; // meaning off

   //#region self func
   private ToggleOn() {
      this.iconToggle.getComponent(Sprite).spriteFrame = this.sfToggleOn;
      this.lbToggle.string = 'ON';
      let oldPosIcon = this.iconToggle.position.clone(); oldPosIcon.x = this.xIconToggleOn;
      let oldPosLb = this.lbToggle.node.position.clone(); oldPosLb.x = this.xLbToggleOn;
      this.iconToggle.setPosition(oldPosIcon);
      this.lbToggle.node.setPosition(oldPosLb);
      this._stateToggle = true;

   }

   private ToggleOff() {
      this.iconToggle.getComponent(Sprite).spriteFrame = this.sfToggleOff;
      this.lbToggle.string = 'OFF';
      let oldPosIcon = this.iconToggle.position.clone(); oldPosIcon.x = this.xIconToggleOff;
      let oldPosLb = this.lbToggle.node.position.clone(); oldPosLb.x = this.xLbToggleOff;
      this.iconToggle.setPosition(oldPosIcon);
      this.lbToggle.node.setPosition(oldPosLb);
      this._stateToggle = false;
   }
   //#endregion


   //#region common
   public SetUp(callbackToggleOn: CallableFunction, callbackToggleOff: CallableFunction, isStateOnStart: boolean) {
      this._stateToggle = isStateOnStart;

      if (this._stateToggle) {
         this.ToggleOn();
      } else {
         this.ToggleOff();
      }
      // set callback after to call toggle not call callback
      this._callbackToggleOff = callbackToggleOff;
      this._callbackToggleOn = callbackToggleOn;

      // register event button
      const clickEventHandler = new EventHandler();
      // This node is the node to which your event handler code component belongs
      clickEventHandler.target = this.node;
      // This is the script class name
      clickEventHandler.component = 'ToggleCustom';
      clickEventHandler.handler = 'OnClickSelf';

      const button = this.node.getComponent(Button);
      button.clickEvents.push(clickEventHandler);
   }

   public GetStatusToggle(): boolean {
      return this._stateToggle;
   }
   //#endregion

   //#region listen func
   private OnClickSelf() {
      this._stateToggle = !this._stateToggle;
      if (!this._stateToggle) {
         this.ToggleOff();
         if (this._callbackToggleOff != null) {
            this._callbackToggleOff();
         }
      } else {
         this.ToggleOn();
         if (this._callbackToggleOn != null) {
            this._callbackToggleOn();
         }
      }
   }
   //#endregion
}


