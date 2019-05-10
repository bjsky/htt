import FarmlandInfo from "../../FarmlandInfo";
import UIBase from "../../component/UIBase";
import { FarmSceneState } from "../../scene/FarmScene";
import { EVENT } from "../../core/EventController";
import GameEvent from "../../GameEvent";
import { Farm2 } from "../../game/farm2/Farm2Controller";
import { ConfigConst } from "../../GlobalData";
import { CFG } from "../../core/ConfigManager";
import { Common } from "../../CommonData";
import LoadSprite from "../../component/LoadSprite";
import StringUtil from "../../utils/StringUtil";
import { ResType } from "../../message/MsgAddRes";
import { UI } from "../../core/UIManager";

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
export enum Farmland2State{
    Unplant = 1,        //未种植
    Growth = 2,         //生长
    Lock = 3,           //锁定
    UnLock = 4,         //解锁
    Plant = 5,           //种植
    upLv = 6,        //升级
}

@ccclass
export default class Farmland2 extends UIBase{

    
    @property(cc.Node) lockNode: cc.Node = null;
    @property(cc.Node) unlockNode: cc.Node = null;
    @property(cc.Node) growthNode: cc.Node = null;
    @property(cc.Node) plantNode: cc.Node = null;
    @property(cc.Node) uplvNode: cc.Node = null;

    @property(cc.Sprite) growthBg: cc.Sprite = null;
    @property(cc.Sprite) plantBg: cc.Sprite = null;
    @property(cc.Sprite) upLvBg: cc.Sprite = null;
    @property(cc.Sprite) unlockBg: cc.Sprite = null;
    //unlock
    @property(cc.Label) unlockCost:cc.Label = null;
    //lock
    @property(cc.RichText) lbLock: cc.RichText = null;
    //plant
    @property(cc.Label) plantName: cc.Label = null;
    // @property(LoadSprite) plantSpr: LoadSprite = null;
    @property(cc.Label) plantCost: cc.Label = null;
    @property(cc.Label) plantFlower: cc.Label = null;
    @property(cc.Node) getFlowerIcon: cc.Node = null;

    //upLv
    @property(cc.Label) upLvName: cc.Label = null;
    @property(cc.Label) levelStr: cc.Label = null;
    @property(cc.ProgressBar) levelPro: cc.ProgressBar = null;
    @property(cc.Label) upLvCost: cc.Label = null;
    @property(cc.Label) curFlower: cc.Label = null;

    //growth
    @property(cc.ProgressBar) growthPro: cc.ProgressBar = null;
    @property(cc.Label) getGold: cc.Label = null;
    @property(cc.Node) getGoldIcon: cc.Node = null;
    @property(LoadSprite) sprTree: LoadSprite = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    private _farmland:FarmlandInfo;
    private _state:Farmland2State = 0;
    private _lockTreeId:number = 0;
    private _isMaxLevel:boolean = false;

    public get index(){
        return this._farmland.index;
    }

    public setData(data:any){
        super.setData(data);
        this._farmland = data.farmland;
    }

    onEnable(){
        EVENT.on(GameEvent.Farm_State_Change,this.onFarmStateChange,this);
        EVENT.on(GameEvent.RES_Change,this.onResChange,this);

        this.plantBg.node.on(cc.Node.EventType.TOUCH_START,this.onPlantTouch,this);
        this.growthBg.node.on(cc.Node.EventType.TOUCH_START,this.onGrowthTouch,this);
        this.upLvBg.node.on(cc.Node.EventType.TOUCH_START,this.onUpLevelTouch,this);
        this.unlockBg.node.on(cc.Node.EventType.TOUCH_START,this.onUnlockTouch,this);
        
        this._curState = FarmSceneState.Growth;
        this.updateView();
    }

    onDisable(){
        EVENT.off(GameEvent.Farm_State_Change,this.onFarmStateChange,this);
        EVENT.off(GameEvent.RES_Change,this.onResChange,this);

        this.plantBg.node.off(cc.Node.EventType.TOUCH_START,this.onPlantTouch,this);
        this.growthBg.node.off(cc.Node.EventType.TOUCH_START,this.onGrowthTouch,this);
        this.upLvBg.node.off(cc.Node.EventType.TOUCH_START,this.onUpLevelTouch,this);
        this.unlockBg.node.off(cc.Node.EventType.TOUCH_START,this.onUnlockTouch,this);
    }

    private _curState:FarmSceneState = 0;
    private onFarmStateChange(e){
        var state:FarmSceneState = e.state;
        if(state== this._curState){
            return;
        }
        this._curState = state;
        this.updateView();
    }
    private onResChange(e){
        var type = e.type;
        if(type == ResType.Gold){
            if(this._state == Farmland2State.Plant){
                if(Common.resInfo.gold<this._plantCost){
                    this.plantCost.node.color = new cc.Color().fromHEX("#ff0000");
                }else{
                    this.plantCost.node.color = new cc.Color().fromHEX("#863819");
                }
            }else if(this._state == Farmland2State.upLv){
                if(Common.resInfo.gold<this._upCost){
                    this.upLvCost.node.color = new cc.Color().fromHEX("#ff0000");
                }else{
                    this.upLvCost.node.color = new cc.Color().fromHEX("#863819");
                }
            }
        }else if(type == ResType.Flower){
        }
    }

    private updateView(){
        var lockedIndex:number = Farm2.getFarmlandLockedIndex();
        var isUnlock:boolean = lockedIndex>-1?this.index<lockedIndex:true;
        if(this._curState == FarmSceneState.Growth){
            if(this._farmland.treeType == 0){
                if(isUnlock){
                    this._state = Farmland2State.UnLock;
                }else{
                    if(this.index == lockedIndex){
                        this._state = Farmland2State.Lock;
                    }else{
                        this._state = Farmland2State.Unplant;
                    }
                }
            }else{
                this._state = Farmland2State.Growth;
            }
        }else if(this._curState == FarmSceneState.Plant){
            if(this._farmland.treeType == 0){
                this._state = Farmland2State.Unplant;
            }else{
                var cfg =CFG.getCfgDataById(ConfigConst.Flower,this._farmland.treeType);
                if(this._farmland.level >= Number(cfg.maxLevel)){
                    var lockTreeId = Number(cfg.nextId);
                    if(lockTreeId>0){
                        this._state = Farmland2State.Plant;
                        this._lockTreeId = lockTreeId;
                    }else{
                        this._state = Farmland2State.upLv;
                        this._isMaxLevel = true;
                    }
                }else{
                    this._state = Farmland2State.upLv;
                }
            }
        }
        this.uplvNode.active = false;
        this.growthNode.active = false;
        this.lockNode.active = false;
        this.plantNode.active = false;
        this.unlockNode.active = false;
        switch(this._state){
            case Farmland2State.Unplant:{
            }break;
            case Farmland2State.Growth:{
                this.growthNode.active = true;
                this.showGrowth();
            }break;
            case Farmland2State.Plant:{
                this.plantNode.active = true;
                this.showPlant();
            }break;
            case Farmland2State.upLv:{
                this.uplvNode.active = true;
                this.showUpgrade();
            }break;
            case Farmland2State.Lock:{
                this.lockNode.active = true;
                this.showLock();
            }break;
            case Farmland2State.UnLock:{
                this.unlockNode.active = true;
                this.showUnlock();
            }break;
        }
    }

    private _growthGold:number = 0;
    private _growthCfg:any = null;
    private showGrowth(){
        this._growthCfg =CFG.getCfgDataById(ConfigConst.Flower,this._farmland.treeType); 
        if(this._growthCfg){
            this.sprTree.load(this._growthCfg.icon);
            this.growthPro.progress = 0;
            this.getGold.string = "";
        }
    }
    private showLock(){
        var cfg:any = Farm2.getUnlockCfg(this.index);
        this.lbLock.string ="<color=#ffffff> <color=#FFF600>"+Number(cfg.unlockFlower)+"</color> 解锁</c>";
    }

    private _unlockCost:number = 0;
    private showUnlock(){

        var cfg:any = Farm2.getUnlockCfg(this.index);
        this._unlockCost = Number(cfg.unlockGold);
        this.unlockCost.string =StringUtil.formatReadableNumber(this._unlockCost);
    }

    private _plantCost:number = 0;
    private showPlant(){
        var cfg:any = CFG.getCfgDataById(ConfigConst.Flower,this._lockTreeId);
        if(cfg){
            this.plantName.string = cfg.name;
            // var goldOnce = Number(cfg.goldOnce);
            // var flowerOnce = Number(cfg.flowerOnce);
            // var str = "<color=#c68e3d>金币产出 <color=#00ff00>"+goldOnce+"</c>"+
            // "<br />采摘鲜花<color=#ff0000> "+flowerOnce+"</></color>";
            // this.plantDesc.string = str;
            // this.plantSpr.load(cfg.icon);
            
            this._plantCost = Number(cfg.unlock);
            this.plantCost.string = (this._plantCost==0)?"免费":StringUtil.formatReadableNumber(this._plantCost);
            if(Common.resInfo.gold<this._plantCost){
                this.plantCost.node.color = new cc.Color().fromHEX("#ff0000");
            }else{
                this.plantCost.node.color = new cc.Color().fromHEX("#863819");
            }
            this.plantFlower.string = "+"+cfg.addFlower;
        }
    }

    private _upCost:number = 0;
    private showUpgrade(){
        var cfg:any = CFG.getCfgDataById(ConfigConst.Flower,this._farmland.treeType);
        if(cfg){
            this.upLvName.string = cfg.name;
            var totalLevel:number = Number(cfg.maxLevel);
            this.levelStr.string = this._farmland.level+"/"+totalLevel;
            this._upCost = Number(cfg.upCost);
            this.upLvCost.string = StringUtil.formatReadableNumber(this._upCost);
            if(Common.resInfo.gold<this._upCost){
                this.upLvCost.node.color = new cc.Color().fromHEX("#ff0000");
            }else{
                this.upLvCost.node.color = new cc.Color().fromHEX("#863819");
            }
            this.levelPro.progress = this._farmland.level/totalLevel;
            this.curFlower.string = cfg.flowerLevel;
        }
    }

    start () {

    }
    public get growthTime(){
        if(this._farmland.growthStartTime>0){
            return (Common.getServerTime() - this._farmland.growthStartTime)/1000;
        }else{
            return 0;
        }
    }
    update (dt) {
        if(this._state == Farmland2State.Growth){
            var growthTime = this.growthTime;

            var growthOnceTime = Number(this._growthCfg.baseTime)-this._farmland.level * Number(this._growthCfg.speedUp);
            var growthOnceGold = Number(this._growthCfg.goldOnce)+this._farmland.level * Number(this._growthCfg.goldUp);
            var growthCount = Math.floor( growthTime / growthOnceTime);
            var curTime = growthTime - growthOnceTime*growthCount;
            if(growthCount>Farm2.Growth_Max_Count){
                growthCount = Farm2.Growth_Max_Count;
            }
            this._growthGold = this._farmland.stageGold + growthCount*growthOnceGold;
            this.getGold.string = StringUtil.formatReadableNumber(this._growthGold);
            this.growthPro.progress = curTime/growthOnceTime;
        }

    }

    public onGrowthTouch(e){
        if(this._growthGold>0){
            Farm2.pickOnce(this.index);
        }
    }

    private onPlantTouch(e){
        if(Common.resInfo.gold<this._plantCost){
            // UI.showTip("金币不足，采摘花田或转盘抽奖");
            return;
        }

        Farm2.plantFarmland(this._lockTreeId,this.index,this._plantCost);
    }

    public onUnlockTouch(e){
        if(Common.resInfo.gold<this._unlockCost){
            UI.showTip("金币不足，采摘花田或转盘抽奖");
            return;
        }
        Farm2.unlockFarmland(1,this.index,this._unlockCost);
    }

    private onUpLevelTouch(e){
        if(this._isMaxLevel)
            return;
        if(Common.resInfo.gold<this._upCost){
            // UI.showTip("金币不足，采摘花田或转盘抽奖");
            return;
        }

        Farm2.upLevelFarmland(this.index,this._upCost);
    }

    public onGuideUpLevel(){
        var plant:boolean = false;
        if(this._state == Farmland2State.upLv){
            this.onUpLevelTouch(null);
        }else if(this._state == Farmland2State.Plant){
            this.onPlantTouch(null);
            plant = true;
        }
        return plant;
    }


    public updateFarmland(){
        this._farmland = Farm2.getFarmlandAtIndex(this.index);
        this.updateView();
    }

}
