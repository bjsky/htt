import { SOUND } from "../core/SoundManager";

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

export enum SlotStateEnum{
    Idle = 1,
    Fast = 2,
    SlowBegin,
    Slow,
}
@ccclass
export default class SlotNode extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }
    private _fruitNode:cc.Node[] = [];
    private _fruitIds:number[] = [1,2,3,4,5,6,7,8,9,13,11,12];

    public initFruit(){
        this.node.children.forEach((child:cc.Node)=>{
            this._fruitNode.push(child);
        })
    }

    private _state :SlotStateEnum = SlotStateEnum.Idle;
    private _toId:number = 0;

    private _complete:Function = null;
    public play(id:number,complete:Function = null){
        this._toId = id;
        this._state = SlotStateEnum.Fast;
        this.scheduleOnce(()=>{
            this._state = SlotStateEnum.SlowBegin;
        },1.4);
        SOUND.playSlotSound();
        if(complete!=null){
            this._complete = complete;
        }
    }
    public getFruitPos(fruidId:number):cc.Vec2{
        var index:number = this._fruitIds.indexOf(this._toId);
        var fruitNode:cc.Node = this._fruitNode[index];
        return fruitNode.parent.convertToWorldSpaceAR(fruitNode.position);
    }

    private _speed:number = 800;
    update (dt) {
        if(this._state == SlotStateEnum.Fast){
            var angleF:number = dt*this._speed;
            this.node.rotation+=angleF;
            // for(var i:number = 0;i<this._fruitNode.length;i++){
            //     if(i!=6 && i!=8 && i!=11){
            //         this._fruitNode[i].rotation = -this.node.rotation;
            //     }
            // }
        }
        else if(this._state == SlotStateEnum.SlowBegin){
            this.node.stopAllActions();
            var toIndex:number = this._fruitIds.indexOf(this._toId);
            var fromIndex:number = toIndex + 5;
            // if(fromIndex<0){
            //     fromIndex+=this._fruitIds.length;
            // }
            var fromAngle:number = (fromIndex * -30)-15;
            this.node.rotation = fromAngle;
            this.node.runAction(cc.sequence(cc.rotateBy(0.6,5*30).easing(cc.easeOut(1.8)),cc.callFunc(()=>{
                this._state = SlotStateEnum.Idle;
                this._complete && this._complete();
                this._complete = null;
            })))
            this._state = SlotStateEnum.Slow;
        }else if(this._state == SlotStateEnum.Slow){
            // for(var i:number = 0;i<this._fruitNode.length;i++){
            //     if(i!=6 && i!=8 && i!=11){
            //         this._fruitNode[i].rotation = -this.node.rotation;
            //     }
            // }
        }

    }
}
