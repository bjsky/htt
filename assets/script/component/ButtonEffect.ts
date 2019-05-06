import { SOUND } from "../core/SoundManager";


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
export default class ButtonEffect extends cc.Component {

    @property originalScale:number = 1;
    @property effectSound:boolean = true;

    
    private onNodeTouchStart(evt) {
        // console.log("set startlocked");
        this.node.stopAllActions();
        var seq = cc.sequence(
            cc.scaleTo(0.08, 1.3 * this.originalScale),
            cc.scaleTo(0.05, 1.1 * this.originalScale)
        );
        this.node.runAction(seq);
        if(this.effectSound){
            SOUND.playBtnSound();
        }
    }

    private onNodeTouchEnd(evt) {
        // console.log("set endlocked");
        this.node.stopAllActions();
        var seq = cc.sequence(
            cc.scaleTo(0.04, 1.2 * this.originalScale),
            cc.scaleTo(0.07, 1 * this.originalScale),
            cc.callFunc(()=>{
                this.node.emit(ButtonEffect.CLICK_END);
            },this)
        );
        this.node.runAction(seq);
    }

    public static CLICK_END:string= "CLICK_END";
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    }

    start () {

    }

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onNodeTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onNodeTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onNodeTouchEnd, this);
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onNodeTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onNodeTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onNodeTouchEnd, this);
    }

    private _enabled:boolean = true;
    public set enabled(bool:boolean){
        if(bool == this._enabled){
            return;
        }
        this._enabled = bool;
        if(this._enabled){
            this.node.on(cc.Node.EventType.TOUCH_START, this.onNodeTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onNodeTouchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.onNodeTouchEnd, this);
        }else{
            this.node.off(cc.Node.EventType.TOUCH_START, this.onNodeTouchStart, this);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onNodeTouchEnd, this);
            this.node.off(cc.Node.EventType.TOUCH_END, this.onNodeTouchEnd, this)
        }
        var btn:cc.Button = this.node.getComponent(cc.Button);
        if(btn){
            btn.enableAutoGrayEffect = true;
            btn.interactable = this._enabled;
        }

    }

    private setChildrenDisabled(bool:boolean){
        
    }
    // update (dt) {}

    onDestroy() {

    }
}
