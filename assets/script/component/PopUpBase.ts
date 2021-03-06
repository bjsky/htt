import UIBase from "./UIBase";
import { EVENT } from "../core/EventController";
import GameEvent from "../GameEvent";
import { UI } from "../core/UIManager";
import ButtonEffect from "./ButtonEffect";
// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopUpBase extends UIBase {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(Boolean)
    enableMaskTouchClose: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    private _nodeOpactiy:number = 0;
    protected showImmediately:boolean = true;
    onEnable(){
        if(this.enableMaskTouchClose){
            EVENT.on(GameEvent.Mask_touch,this.onMaskTouch,this);
        }
        if(this.closeBtn!=null){
            this.closeBtn.node.on(ButtonEffect.CLICK_END,this.onBtnClose,this);
        }
        this._nodeOpactiy = this.node.opacity;
        this.node.opacity = 0;
        if(this.showImmediately){
            this.onShow();
        }
    }

    onDisable(){
        if(this.enableMaskTouchClose){
            EVENT.off(GameEvent.Mask_touch,this.onMaskTouch,this);
        }
        if(this.closeBtn!=null){
            this.closeBtn.node.off(ButtonEffect.CLICK_END,this.onBtnClose,this);
        }
        this.node.opacity = this._nodeOpactiy;
    }
    start () {

    }

    protected onMaskTouch(e){
        this.onClose(e);
    }
    private onBtnClose(e){
        this.onClose(e);
    }
    public onShow(){
        this.node.opacity = this._nodeOpactiy;
        this.node.scale = 0.4;
        var seq = cc.sequence(
            cc.spawn(
                cc.scaleTo(0.2,1).easing(cc.easeBackOut())
                ,cc.fadeIn(0.2)
            ),
            cc.callFunc(this.onShowComplete.bind(this))
        )
        this.node.runAction(seq);
    }
    protected onShowComplete(){

    }

    public onClose(e){
        var seq = cc.sequence(
            cc.spawn(
                cc.scaleTo(0.2,0.4).easing(cc.easeBackIn())
                ,cc.fadeOut(0.2)
            ),
            cc.callFunc(()=>{
                this.onCloseComplete();
            })
        )
        this.node.runAction(seq);
    }

    protected onCloseComplete(){
        UI.closePopUp(this.node);
    }

    // update (dt) {}
}
