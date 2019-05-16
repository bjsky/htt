import FarmlandInfo from "../../FarmlandInfo";
import { SFarmlandInfo } from "../../message/MsgLogin";
import { NET } from "../../core/net/NetController";
import MsgPlant from "../../message/MsgPlant";
import { Common } from "../../CommonData";
import { EVENT } from "../../core/EventController";
import GameEvent from "../../GameEvent";
import { CFG } from "../../core/ConfigManager";
import { ConfigConst } from "../../GlobalData";
import MsgPickFarm from "../../message/MsgPickFarm";
import MsgUpdateFarm from "../../message/MsgUpdateFarm";

export default class Farm2Controller {
    private static _instance: Farm2Controller = null;
    public static getInstance(): Farm2Controller {
        if (Farm2Controller._instance == null) {
            Farm2Controller._instance = new Farm2Controller();
            
        }
        return Farm2Controller._instance;
    }
    public Farmland_Count:number = 9;
    public Growth_Max_Count:number = 50;

    private _farmlandMap:any =  {};
    // private _lockMap:any =null;
    
    public initFromServer(farmlands:SFarmlandInfo[]){
        this._farmlandMap = {};
        farmlands.forEach((tr:SFarmlandInfo)=>{
            var farmland:FarmlandInfo = new FarmlandInfo();
            farmland.initFromServer(tr);
            this._farmlandMap[farmland.index] = farmland;
        });
        var unlockFarmland:FarmlandInfo = null;
        for(var i:number=0 ;i<this.Farmland_Count;i++){
            if(this._farmlandMap[i]== undefined){
                unlockFarmland = new FarmlandInfo();
                unlockFarmland.index = i;
                this._farmlandMap[i] = unlockFarmland;
            }
        }

        this.Growth_Max_Count = Number(CFG.getCfgByKey(ConfigConst.Constant,"key","goldStageCount")[0].value)
    }
    public getFarmlandLockedIndex():number{
        var lockedIndex:number = -1;
        var lockCfg:any = CFG.getCfgGroup(ConfigConst.Farmland);
        
        for(var key in lockCfg){
            var needFlower:number = Number(lockCfg[key].unlockFlower);
            if(Common.resInfo.flower < needFlower){
                lockedIndex = Number(key)-1;
                break;
            }
        }
        return lockedIndex;
    }
    public getUnlockCfg(index:number){
        var farmId = (index+1);
        return  CFG.getCfgDataById(ConfigConst.Farmland,farmId);
    }
    public getNextSceneFlower(){
        var cfg = CFG.getCfgDataById(ConfigConst.Farmland,10);
        return Number(cfg.unlockFlower);
    }
    public getFlowerisPlant(mapid:number,flowerid:number):boolean{
        if(mapid>1){
            return false;
        }else{
            for(var i:number=0 ;i<this.Farmland_Count;i++){
                var farmland:FarmlandInfo = this.getFarmlandAtIndex(i);
                if(farmland.treeType>=flowerid){
                    return true;
                }
            }
            return false;
        }
    }
    public isMapLock(mapid:number):boolean{
        return mapid>1;
    }

    public getFarmlandAtIndex(index:number):FarmlandInfo{
        if(this._farmlandMap[index]!=undefined ||this._farmlandMap[index]!=null){
            return this._farmlandMap[index];
        }else{
            return null;
        }
    }
    public getIndexCanUp(index:number){
        var minTreeType:number = NaN;
        for(var i:number=0 ;i<this.Farmland_Count;i++){
            var farmland:FarmlandInfo = this.getFarmlandAtIndex(i);
            if(farmland.treeType>0){
                if(isNaN(minTreeType)){
                    minTreeType = farmland.treeType;
                }else{
                    minTreeType = Math.min(minTreeType,farmland.treeType);
                }
            }
        }
        var cur:FarmlandInfo = this.getFarmlandAtIndex(index);
        return isNaN(minTreeType)?true:(cur.treeType<=minTreeType+1);
    }

    public unlockChangeObj:any = null;
    public checkUnlockChange(){
        var lockCfg:any = CFG.getCfgGroup(ConfigConst.Farmland);
        var unlockId:number = -1;
        for(var key in lockCfg){
            var needFlower:number = Number(lockCfg[key].unlockFlower);
            if(Common.resInfo.flower == needFlower){
                unlockId = Number(key);
                break;
            }
        }
        if(unlockId>-1){
            this.unlockChangeObj = {id:unlockId,index:Number(lockCfg[unlockId].index)};
        }

    }
    public showUnlockChange(){
        if(this.unlockChangeObj!=null){
            EVENT.emit(GameEvent.Unlock_Change,this.unlockChangeObj);
            this.unlockChangeObj = null;
        }
    }

    public plantFarmland(treeType:number,index:number,cost:number){
        var info:FarmlandInfo = this.stageFarmland(index);
        var addFlower:number = Number(CFG.getCfgDataById(ConfigConst.Flower,treeType).addFlower);

        NET.send(MsgUpdateFarm.create(index,treeType,1,info.growthStartTime,info.stageGold,cost,addFlower),(msg:MsgPlant)=>{
            if(msg && msg.resp){
                Common.resInfo.updateInfo(msg.resp.resInfo);
                this.updateFarmland(msg.resp.farmland);
                this.checkUnlockChange();
                EVENT.emit(GameEvent.Plant_Tree,{index:index,seedId:msg.resp.farmland.treeType});
            }
        },this);
    }

    public unlockFarmland(treeType:number,index:number,cost:number){

        var addFlower:number = Number(CFG.getCfgDataById(ConfigConst.Flower,treeType).addFlower);
        NET.send(MsgUpdateFarm.create(index,treeType,1,Common.getServerTime(),0,cost,addFlower),(msg:MsgPlant)=>{
            if(msg && msg.resp){
                Common.resInfo.updateInfo(msg.resp.resInfo);
                this.updateFarmland(msg.resp.farmland);
                EVENT.emit(GameEvent.Unlock_Tree,{index:index,seedId:msg.resp.farmland.treeType});
            }
        },this);
    }

    public stageFarmland(index:number){
        var info:FarmlandInfo = this.getFarmlandAtIndex(index);
        if(info && info.treeType>0){
            var cfg:any = CFG.getCfgDataById(ConfigConst.Flower,info.treeType);
            var growthOnceTime:number = Number(cfg.baseTime)-info.level * Number(cfg.speedUp);
            var growthOnceGold:number = Number(cfg.goldOnce)+ info.level * Number(cfg.goldUp);
            var serverTime = Common.getServerTime();
            var growthTime = (serverTime-info.growthStartTime)/1000;
            var growthCount:number = Math.floor( growthTime / growthOnceTime);
            var curTime = growthTime - growthOnceTime * growthCount;
            var startTime = serverTime - curTime*1000;
            if(growthCount>this.Growth_Max_Count){
                growthCount = this.Growth_Max_Count;
            }
            var growthGold = growthCount * growthOnceGold;
            info.stageGold += growthGold;
            info.growthStartTime = startTime;
        }
        return info;
    }

    public updateFarmland(sFarmland:SFarmlandInfo){
        var farmland:FarmlandInfo = new FarmlandInfo();
        farmland.initFromServer(sFarmland);
        this._farmlandMap[sFarmland.index] = farmland;
    }

    public pickOnce(index:number){
        var farmland:FarmlandInfo = this.stageFarmland(index);
        if(farmland){
            var cfg:any = CFG.getCfgDataById(ConfigConst.Flower,farmland.treeType);
            // var addFlower:number = Number(cfg.addFlower);
            // var addExp:number = 0;//Number(cfg.expOnce);
            console.log("addGold,",farmland.stageGold);
            NET.send(MsgPickFarm.create(index,farmland.growthStartTime,farmland.stageGold)
                ,(msg:MsgPickFarm)=>{
                    if(msg && msg.resp){
                        Common.resInfo.updateInfo(msg.resp.resInfo);
                        this.updateFarmland(msg.resp.farmland);
                        EVENT.emit(GameEvent.Pick_Tree,{index:msg.resp.farmland.index});
                    }
            },this)
        }
    }
    public upLevelFarmland(index:number,cost:number){
        var farmland:FarmlandInfo = this.stageFarmland(index);
        if(farmland){
            NET.send(MsgUpdateFarm.create(index,farmland.treeType,farmland.level+1
                ,farmland.growthStartTime,farmland.stageGold,cost,0),(msg:MsgPlant)=>{
                if(msg && msg.resp){
                    Common.resInfo.updateInfo(msg.resp.resInfo);
                    var sfarm:SFarmlandInfo = msg.resp.farmland;
                    this.updateFarmland(sfarm);
                    EVENT.emit(GameEvent.Up_Level_Tree,{index:msg.resp.farmland.index});

                }
            },this);
        }
    }
}

export var Farm2:Farm2Controller = Farm2Controller.getInstance();
