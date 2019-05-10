import UIBase from "../component/UIBase";
import NumberEffect from "../component/NumberEffect";
import { EVENT } from "../core/EventController";
import GameEvent from "../GameEvent";
import { Common } from "../CommonData";
import ResBounceEffect from "../component/ResBounceEffect";
import { SOUND } from "../core/SoundManager";
import { FlyResType } from "./AnimUi";
import { Farm2 } from "../game/farm2/Farm2Controller";

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
export default class MainUI extends UIBase {

    @property(cc.Label) lblGold: cc.Label = null;
    @property(cc.Label) lblFlower: cc.Label = null;
    @property(NumberEffect) goldEffect:NumberEffect = null;
    @property(ResBounceEffect) goldBounceEffect:ResBounceEffect = null;
    @property(ResBounceEffect) flowerBounceEffect:ResBounceEffect = null;

    @property(cc.Node) coinIcon:cc.Node = null;
    @property(cc.Node) flowerIcon:cc.Node = null;

    @property(cc.Node) subContent: cc.Node = null;
    

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        this.hideAll();
    }

    onEnable(){
        EVENT.on(GameEvent.Loading_complete,this.initView,this);
        
        EVENT.on(GameEvent.Fly_Res_End,this.onFlyResEnd,this);
        EVENT.on(GameEvent.Show_Gold_Fly_End,this.onShowGoldfly,this);
        EVENT.on(GameEvent.Plant_Tree,this.onPlantTree,this);
        EVENT.on(GameEvent.Unlock_Tree,this.onUnlockTree,this);
        EVENT.on(GameEvent.Up_Level_Tree,this.onUplevelTree,this);

        this.subContent.active = false;
    }

    onDisable(){
        EVENT.off(GameEvent.Loading_complete,this.initView,this);
        
        EVENT.off(GameEvent.Fly_Res_End,this.onFlyResEnd,this);
        EVENT.off(GameEvent.Show_Gold_Fly_End,this.onShowGoldfly,this);
        EVENT.off(GameEvent.Plant_Tree,this.onPlantTree,this);
        EVENT.off(GameEvent.Unlock_Tree,this.onUnlockTree,this);
        EVENT.off(GameEvent.Up_Level_Tree,this.onUplevelTree,this);
    }

    private hideAll(){
        this.lblGold.string = "";
        this.lblFlower.string ="";
    }

    private initView(e){
        // this.explevelEffect.initProgress(Common.userInfo.exp,Common.userInfo.levelExp,Common.userInfo.level);
        this.goldEffect.setValue(Common.resInfo.gold,false);
        this.lblFlower.string = Common.resInfo.flower.toString();
    }

    private onShowGoldfly(e){
        this.goldEffect.setValue(Common.resInfo.gold);
    }
    private onPlantTree(e){
        this.goldEffect.setValue(Common.resInfo.gold);
    }
    private onUnlockTree(e){
        this.goldEffect.setValue(Common.resInfo.gold);
    }
    private onUplevelTree(e){
        this.goldEffect.setValue(Common.resInfo.gold);

    }
    start () {

    }

    public onFlyResEnd(e){
        var restype:FlyResType = e.type;
        if(restype == FlyResType.Gold){
            this.playGoldBounce();
            this.goldEffect.setValue(Common.resInfo.gold);
        }else if(restype == FlyResType.Flower){
            this.playFlowerBounce();
            this.lblFlower.string = Common.resInfo.flower.toString();
        }
    }

    public playExpBounce(){
        // this.expBounceEffect.play();
        SOUND.playStarBounceSound();
    }

    public playFlowerBounce(){
        this.flowerBounceEffect.play();
        SOUND.playStarBounceSound();
    }
    public playGoldBounce(){
        this.goldBounceEffect.play();
    }


    // update (dt) {}
}
