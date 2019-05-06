import { SlotFruit } from "./SlotController";
import { CFG } from "../core/ConfigManager";
import { ConfigConst } from "../GlobalData";
import { Game } from "../GameController";
import LoadSprite from "../component/LoadSprite";

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



export enum SlotViewPlayState{
    Idle = 1,
    Playfast = 2,
    PlaySlow = 3,
}
@ccclass
export default class SlotView extends cc.Component {

    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    @property(cc.Node)
    content: cc.Node = null;
    @property(Number)
    index: number = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    }

    onEnable(){
    }
    onDisable(){

    }


    start () {

    }

    private _fruits:Array<SlotFruit> = [];
    // private _fruitIcons:Array<cc.Node> = [];
    private _fruitNode1:cc.Node = null;
    private _fruitNode2:cc.Node = null;

    private _offY:number = 95;
    private _startY:number = 50;

    public initFruit(){
        var slotFruits:string = CFG.getCfgByKey(ConfigConst.Constant,"key","slotFruits")[0].value;
        var fruitIdStr:string[] = slotFruits.split("|")[this.index].split(";");
        this._fruits = [];
        fruitIdStr.forEach((str)=>{
            this._fruits.push(Number(str));
        });
        // this._fruitIcons = [];
        this._fruitNode1 = new cc.Node();
        this._fruitNode1.anchorY = 0;
        this._fruitNode2 = new cc.Node();
        this._fruitNode2.anchorY = 0;
        var fruitIcon:cc.Node = null;
        var fruitIcon2:cc.Node = null;
        var fruitCfg:any=null;
        for(var i:number = 0;i<this._fruits.length;i++){
            var id:number = this._fruits[i];
            fruitCfg = CFG.getCfgDataById(ConfigConst.Fruit,id);
            fruitIcon = new cc.Node();
            fruitIcon.width = fruitIcon.height = 90;
            fruitIcon.parent = this._fruitNode1;
            fruitIcon.y = this._startY+ i* this._offY;
            var spr:LoadSprite =  fruitIcon.addComponent(LoadSprite);
            spr.load(fruitCfg.icon);
            // this._fruitIcons.push(fruitIcon);

            fruitIcon2 = new cc.Node();
            fruitIcon2.width = fruitIcon2.height = 90;
            fruitIcon2.parent = this._fruitNode2;
            fruitIcon2.y = this._startY+ i* this._offY;
            var spr:LoadSprite =  fruitIcon2.addComponent(LoadSprite);
            spr.load(fruitCfg.icon);
        }
        this._fruitNode1.parent = this.content;
        this._fruitNode2.parent = this.content;
        this._fruitNode2.y = 860;
        this.content.height = 860 *2;
    }

    private _toId:number = 0;
    private _during:number = 0;
    private _playState:SlotViewPlayState = SlotViewPlayState.Idle;
    private _speed:number = 0;
    public play(id:number,during:number){
        this._toId = id;
        this._during = during;

        this._speed = 2800;
        this._playState = SlotViewPlayState.Playfast;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(()=>{
            this._playState = SlotViewPlayState.PlaySlow;
            var curIndex = this._fruits.indexOf(this._toId);
            var starIndex  = curIndex -4;
            if(starIndex<0){
                starIndex+=this._fruits.length;
            }
            this._fruitNode1.y = -starIndex*95;
            this._fruitNode2.y = 860 +this._fruitNode1.y;
            this._fruitNode1.runAction(cc.moveBy(0.15,cc.v2(0,-3*95)).easing(cc.easeOut(2)));
            this._fruitNode2.runAction(cc.moveBy(0.15,cc.v2(0,-3*95)).easing(cc.easeOut(2)));
        },during-0.15);
    }


    update (dt) {
        if(this._playState == SlotViewPlayState.Playfast){
            var offy = dt * this._speed;
            this._fruitNode1.y -= offy;
            this._fruitNode2.y -= offy;

            if(this._fruitNode1.y<=-860){
                this._fruitNode1.y = 860;
            }
            if(this._fruitNode2.y<=-860){
                this._fruitNode2.y = 860;
            }
        }
    }
}