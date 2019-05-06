import FarmlandInfo from "../../FarmlandInfo";
import UIBase from "../../component/UIBase";
import { CFG } from "../../core/ConfigManager";
import { ConfigConst, ResConst } from "../../GlobalData";
import { Drag, CDragEvent } from "../../core/DragManager";
import { Farm, UnlockFarmlandInfo } from "../../game/farm/FarmController";
import { UI } from "../../core/UIManager";
import { Common } from "../../CommonData";
import StringUtil from "../../utils/StringUtil";
import LoadSprite from "../../component/LoadSprite";
import PathUtil from "../../utils/PathUtil";
import { MessagePanelType } from "../MessagePanel";
import { ShareType } from "../SharePanel";
import { SOUND } from "../../core/SoundManager";

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

export enum FarmlandState{
    Lock = 1,
    Planting =2,
    Planed
}
@ccclass
export default class FarmlandUI extends UIBase {

    @property(LoadSprite) sprTree: LoadSprite = null;
    @property(cc.Node) nodeProgress: cc.Node = null;
    @property(cc.ProgressBar) plantProgress: cc.ProgressBar = null;
    @property(cc.Label) lblProgress: cc.Label = null;
    @property(cc.Node) nodeLock: cc.Node = null;
    @property(cc.Node) nodeOpen: cc.Node = null;
    @property(cc.Label) lockCondi: cc.Label = null;
    @property(cc.Node) nodeSuo: cc.Node = null;
    // @property(cc.Node) nodeWater: cc.Node = null;
    @property(cc.Button) waterIcon: cc.Button = null;
    @property(cc.Label) waterSaveTime: cc.Label = null;
    @property(cc.Node) waterSaveTimeNode:cc.Node = null;

    @property(cc.Node) planted:cc.Node = null;
    @property(cc.Node) plantedStar:cc.Node = null;
    @property(cc.Label) plantedExp:cc.Label = null;

    

    private _farmland:FarmlandInfo = null;
    private _growthTotalTime:number = 0;
    private _growthStartTime:number = 0;
    // private _pickTimes:number = 0;
    private _addExp:number = 0;
    private _treeIcon:string ="";

    private _state:FarmlandState = 0;
    public get index(){
        return this._farmland.index;
    }

    public setData(data:any){
        super.setData(data);
        this._farmland = data.farmland;

        console.log("farmland:"+JSON.stringify( this._farmland));
        if(this._farmland instanceof UnlockFarmlandInfo){
            this._state = FarmlandState.Lock;
        }else{
            this._growthStartTime = this._farmland.growthStartTime;
            // this._pickTimes = this._farmland.pickTimes;
            var cfg:any = CFG.getCfgDataById(ConfigConst.Plant,this._farmland.treeType);
            this._growthTotalTime = Number(cfg.growthTime);
            this._addExp = Number(cfg.addExpPer);
            this._treeIcon = cfg.icon;
            this._state = this.growthTime>=this._growthTotalTime?FarmlandState.Planed:FarmlandState.Planting;
        }
    }
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    onEnable(){

        this._waterShow = false;
        Drag.addDragMove(this.node);
        this.node.on(CDragEvent.DRAG_MOVE,this.onDragMove,this);
        this.onStateChange();
        // this.pickCount.string = this._pickTimes.toString();
        // this.nodePick.active = this._pickTimes>0;
    }
    private onStateChange(){
        this.nodeLock.active = false;
        this.nodeOpen.active = false;
        this.waterIcon.node.active = this.waterSaveTime.node.active = false;
        this.planted.active = false;

        this.waterIcon.node.off(cc.Node.EventType.TOUCH_START,this.onWaterTouch,this);
        this.sprTree.node.off(cc.Node.EventType.TOUCH_START,this.onWaterTouch,this);
        if(this._state == FarmlandState.Lock){
            this.nodeLock.active = true;
            var unlock:UnlockFarmlandInfo = this._farmland as UnlockFarmlandInfo;
            if(unlock.nextUnlock){
                this.lockCondi.node.active = true;
                this.nodeSuo.setPosition(cc.v2(0,25));
                var str = "种植"+unlock.treeName+"解锁\n  "+unlock.treeCount+"/"+unlock.treeTotalCount;
                this.lockCondi.string = str;
            }else{
                this.lockCondi.node.active = false;
                this.nodeSuo.setPosition(cc.v2(0,0));
            }
        }else{
            this.nodeOpen.active = true;
            if(this._state == FarmlandState.Planed){
                this.nodeProgress.active = false;
                this.sprTree.load(this._treeIcon)
                this.showPlanted();
            }else if(this._state == FarmlandState.Planting){
                this.nodeProgress.active = true;
                this.sprTree.load(this._treeIcon+'_g')
            }
        }
    }

    onDisable(){
        Drag.removeDragMove(this.node);
        this.node.off(CDragEvent.DRAG_MOVE,this.onDragMove,this);
    }

    public onUpdateView(){
        var farmland = Farm.getFarmlandAtIndex(this.index);
        this._farmland = farmland;
        // this._pickTimes = this._farmland.pickTimes;
        this._growthStartTime = this._farmland.growthStartTime;
        this._state = (this.growthTime>=this._growthTotalTime)?FarmlandState.Planed:FarmlandState.Planting;
        this.onStateChange();
        // this.pickCount.string = this._pickTimes.toString();
        // this.nodePick.active = this._pickTimes>0;
    }

    public onUpdateLock(){
        var farmland = Farm.getUnlockFarmlandInfo(this.index);
        this._farmland = farmland;
        // this._pickTimes = this._farmland.pickTimes;
        this._state = FarmlandState.Lock;
        this.onStateChange();
    }

    public onRemoveView(cb:Function){
        cb && cb();
    }

    private showPlanted(){
        this.planted.active = true;
        this.plantedExp.string = this._addExp.toString();
        // this.plantedStar.stopAllActions();
        // this.plantedStar.setPosition(cc.v2(0,0));
        // this.plantedStar.runAction(cc.sequence(
        //     cc.moveTo(0.1,cc.v2(0,10)),
        //     cc.moveTo(0.3,cc.v2(0,0)).easing(cc.easeBounceOut()),
        //     cc.delayTime(0.5)
        // ).repeatForever())
    }

    start () {

    }

    public get growthTime(){
        return (Common.getServerTime() - this._growthStartTime)/1000;
    }
    update (dt) {
        if(this._state == FarmlandState.Planting){
            var growTime = this.growthTime;
            if(growTime>= this._growthTotalTime){
                this._state = FarmlandState.Planed;
                this.onStateChange();
            }else{
                var levelTime:number = Math.ceil(this._growthTotalTime - growTime);
                this.lblProgress.string = StringUtil.formatTimeHMS(levelTime,2);
                var pro:number = (this._growthTotalTime - growTime)/this._growthTotalTime;
                this.plantProgress.progress = pro;    

                this.showWater();
            }
        }
    }

    private onDragMove(e){
        if(this._state == FarmlandState.Planed
            ||Farm.pickImmediatly){
            SOUND.playPickSound();
            Farm.pickOnce(this._farmland.index,this._addExp);
        }
    }

    private _iconOrgPos:cc.Vec2 = cc.v2(0,130);
    private _txtOrgPos:cc.Vec2 = cc.v2(0,110);
    private _waterShow:boolean = false;
    private showWater(){
        if(!this._waterShow && Math.ceil(this._growthTotalTime - this.growthTime)>5){
            this._waterShow = true;
            this.waterSaveTime.node.active = false;
            this.waterIcon.node.active = true;
            this.waterIcon.node.setPosition(this._iconOrgPos);
            this.waterIcon.node.opacity = 255;
            this.waterIcon.node.on(cc.Node.EventType.TOUCH_START,this.onWaterTouch,this);
            this.sprTree.node.on(cc.Node.EventType.TOUCH_START,this.onWaterTouch,this);
        }
    }

    private onWaterTouch(e){
        if(Common.resInfo.water<=0){
            UI.createPopUp(ResConst.SharePanel,{type:ShareType.seeVideoGetWater});
            SOUND.playBtnSound();
            return;
        }

        this.waterIcon.node.off(cc.Node.EventType.TOUCH_START,this.onWaterTouch,this);
        this.sprTree.node.off(cc.Node.EventType.TOUCH_START,this.onWaterTouch,this);
        SOUND.playWaterSound();

        var farmland = Farm.getFarmlandAtIndex(this.index);
        var seedCfg:any = CFG.getCfgDataById(ConfigConst.Plant,farmland.treeType);
        var cost:number = Number(seedCfg.waterCost);
        var levelTime:number = Math.ceil(this._growthTotalTime - this.growthTime);
        var saveTime:number = Number(seedCfg.waterSaveTime)* levelTime;
        saveTime = Number(saveTime.toFixed(0));
        var startTime:number = farmland.growthStartTime - saveTime*1000;
        var addExp:number = Number(seedCfg.waterAddExp);
        Farm.speedUp(this.index,cost,addExp,startTime);
        
        this.waterIcon.node.stopAllActions();
        this.waterSaveTimeNode.stopAllActions();
        this.waterSaveTimeNode.setPosition(cc.v2(0,0));
        this.waterIcon.node.off(cc.Node.EventType.TOUCH_START,this.onWaterTouch,this);
        var seq = cc.sequence(cc.spawn(
            cc.moveBy(0.3,cc.v2(0,-30))
            ,cc.fadeOut(0.3)
        ),cc.callFunc(()=>{

            this.waterSaveTime.node.setPosition(this.getRandomPos());
            this.waterSaveTime.node.active = true;
            this.waterSaveTime.string = "+"+saveTime+"秒";
        
            this.waterIcon.node.active = false;
            var seq2 = cc.sequence(
                cc.moveBy(0.15,cc.v2(0,10)).easing(cc.easeBackOut()),
                cc.delayTime(0.3),
                cc.callFunc(()=>{
                    this.waterSaveTime.node.active = false;
                    if(this.isValid){
                        this.onUpdateView();
                    }
                }),
                cc.delayTime(3),
                cc.callFunc(()=>{
                    this._waterShow = false;
                })
            )
            this.waterSaveTimeNode.runAction(seq2);
        }))
        this.waterIcon.node.runAction(seq);
    }

    private getRandomPos():cc.Vec2{
        return cc.v2(60* Math.random()-30,20* Math.random()-10).add(this._txtOrgPos);
    }
}
