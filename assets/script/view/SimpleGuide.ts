import { Guide, GuideInfo } from "../GuideController";
import { Scene } from "../scene/SceneController";
import FarmScene from "../scene/FarmScene";
import { EVENT } from "../core/EventController";
import GameEvent from "../GameEvent";
import GameScene from "../scene/GameScene";
import TouchHandler from "../component/TouchHandler";
import Farmland2 from "./farm2/Farmland2";

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
    @property(cc.Node)  tip: cc.Node = null;
    @property(cc.Node)  streakNode: cc.Node = null;

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
            // this.arrowNode.width = node.width;
            // this.arrowNode.height = node.height;
            this.arrowNode.stopAllActions();
            var seq = cc.sequence(cc.moveBy(0.4,cc.v2(-5,-20)),cc.moveBy(0.4,cc.v2(5,20))).repeatForever();
            this.arrowNode.runAction(seq);
        }else{
            this.arrowNode.active = false;
        }
    }

    private _pickNodes:Array<cc.Node> = null;
    private showMove(){
        var moveFrom:cc.Vec2 = cc.v2(0,0);
        var moveTo:cc.Vec2 = cc.v2(100,100);
        this._pickNodes = (Scene.getCurScene() as FarmScene).getMoveGuideNodes();
        if(this._pickNodes.length>1 && this._pickNodes[0]!=null && this._pickNodes[1]!=null){
            var wFrom = this._pickNodes[0].parent.convertToWorldSpaceAR(this._pickNodes[0].position);
            moveFrom = this.arrowNode.parent.convertToNodeSpaceAR(wFrom);
            var wTo = this._pickNodes[1].parent.convertToWorldSpaceAR(this._pickNodes[1].position);
            moveTo = this.arrowNode.parent.convertToNodeSpaceAR(wTo);
        }

        this.node.active = true;
        this.msgNode.active = false;
        this.arrowNode.active = true;
        this.addListener();
        this.arrowNode.setPosition(moveFrom);
        this.arrowNode.stopAllActions();
        var seq = cc.sequence(cc.moveTo(0.4,moveTo)
        ,cc.delayTime(1)
        ,cc.callFunc(()=>{
            this.arrowNode.setPosition(moveFrom);
        })).repeatForever();
        this.arrowNode.runAction(seq);

        //streak
        this.addStreak();
        this.scheduleOnce(this.endMoveGuide,15);
    }

    private addStreak(){
        this.node.addComponent(TouchHandler);
        this.node.on(TouchHandler.DRAG_START,this.onDragStart,this);
        this.node.on(TouchHandler.DRAG_MOVE,this.onDragMove,this);
        this.node.on(TouchHandler.DRAG_END,this.onDragEnd,this);
    }
    private removeStreak(){
        this.node.off(TouchHandler.DRAG_START,this.onDragStart,this);
        this.node.off(TouchHandler.DRAG_MOVE,this.onDragMove,this);
        this.node.off(TouchHandler.DRAG_END,this.onDragEnd,this);
        this.node.removeComponent(TouchHandler);
    }


    private onDragStart(e){
        var loc:cc.Vec2 = this.node.getComponent(TouchHandler).curLoc;
        loc = this.streakNode.parent.convertToNodeSpaceAR(loc);
        console.log(loc);
        this.streakNode.setPosition(loc);
        this.streakNode.getComponent(cc.MotionStreak).reset();
    }

    private onDragMove(e){
        var worldloc:cc.Vec2 = this.node.getComponent(TouchHandler).curLoc;
        var loc = this.streakNode.parent.convertToNodeSpaceAR(worldloc);
        this.streakNode.setPosition(loc);

        var farmlandNode:cc.Node;
        for(var i:number = 0;i<this._pickNodes.length;i++){
            farmlandNode = this._pickNodes[i];
            //获取target节点在父容器的包围盒，返回一个矩形对象
            let rect:cc.Rect = farmlandNode.getBoundingBox();
            //使用target容器转换触摸坐标
            let point:cc.Vec2 = farmlandNode.parent.convertToNodeSpaceAR(worldloc);
        //     //if (cc.rectContainsPoint(rect, targetPoint)) {
        //     //Creator2.0使用rect的成员contains方法
            if (rect.contains(point)) {
                var farmland:Farmland2 = (this._pickNodes.splice(i,1)[0] as cc.Node).getComponent(Farmland2);
                if(farmland){
                    farmland.onMovePick();
                }
            }
        }
    }

    private onDragEnd(e){
        if(this._pickNodes.length == 0){
            this.endMoveGuide();
        }
    }

    private endMoveGuide(){
        this.unschedule(this.endMoveGuide);
        this.removeStreak();
        Guide.hide();
        Guide.nextGuide();
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
