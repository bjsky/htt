import { Guide, GuideInfo } from "../GuideController";
import { Scene } from "../scene/SceneController";
import FarmScene from "../scene/FarmScene";
import { EVENT } from "../core/EventController";
import GameEvent from "../GameEvent";
import GameScene from "../scene/GameScene";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class SimpleGuide extends cc.Component {

    @property(cc.RichText)  message: cc.RichText = null;
    @property(cc.Node)  msgNode: cc.Node = null;
    @property(cc.Node)  arrowNode: cc.Node = null;
    @property(cc.Node)  hand: cc.Node = null;
    @property(cc.Node)  tip: cc.Node = null;
    

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    private _info:GuideInfo;
    public show(info:GuideInfo){
        this._info = info;
        if(this._info.guideType == 1){
            this.showMessage();
        }else if(this._info.guideType == 2){
            this.showArrow();
        }else if(this._info.guideType == 3){
            this.showMove();
        }
    }

    private showMessage(){
        this.node.active = true;
        this.msgNode.active = true;
        this.arrowNode.active = false;
        this.message.string = "<color=#942F00>"+this._info.gudieMessage+"</c>";
        this.scheduleOnce(this.addListener.bind(this),0.5);
    }

    private addListener(){
        this.node.on(cc.Node.EventType.TOUCH_START,this.onGuideTouch,this);
    }
    private removeListener(){
        this.node.off(cc.Node.EventType.TOUCH_START,this.onGuideTouch,this);
    }

    private showArrow(){
        this.node.active = true;
        this.msgNode.active = false;
        this.arrowNode.active = true;
        var node:cc.Node = this.getGuideNode();
        if(node!=null){
            this.addListener();
            var pos:cc.Vec2 = node.parent.convertToWorldSpaceAR(node.position)
            pos = this.arrowNode.parent.convertToNodeSpaceAR(pos);
            this.arrowNode.setPosition(pos);
            this.arrowNode.width = node.width;
            this.arrowNode.height = node.height;
            this.hand.stopAllActions();
            var seq = cc.sequence(cc.moveBy(0.4,cc.v2(-5,-20)),cc.moveBy(0.4,cc.v2(5,20))).repeatForever();
            this.hand.runAction(seq);
        }else{
            this.arrowNode.active = false;
        }
    }

    private showMove(){
    }

    public hide(){
        this.node.active = false;
        this.removeListener();
    }
    private getGuideNode():cc.Node{
        var node:cc.Node;
        if(this._info.sceneName == "farm"){
            node = (Scene.getCurScene() as FarmScene).getGuideNode(this._info.guideNodeName);
        }else if(this._info.sceneName == "game"){
            node = (Scene.getCurScene() as GameScene).getGuideNode(this._info.guideNodeName);
        }
        return node;
    }

    private onGuideTouch(e){

        if(this._info.guideType == 1){
            Guide.nextGuide();
        }else{
            EVENT.emit(GameEvent.Guide_Touch,{info:this._info})
        }
    }

    // update (dt) {}
}
