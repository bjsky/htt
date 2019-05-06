import { SResInfo } from "./message/MsgLogin";
import { Common } from "./CommonData";
import { ConfigConst } from "./GlobalData";
import { CFG } from "./core/ConfigManager";

export default class ResInfo {
    //精力
    public energy:number = 0;
    //精力开始时间
    public energyStartTime:number = 0;
    //当前经验
    public gold:number = 0;
    //水滴
    public water:number = 0;
    //鲜花
    public flower:number = 0;

    public initFormServer(sInfo:SResInfo){
        this.energy = sInfo.energy;
        this.energyStartTime = sInfo.energyStartTime;
        this.gold = sInfo.gold;
        this.water = sInfo.water;
        this.flower = sInfo.flower;
    }

    public updateInfo(sInfo:SResInfo){
        this.initFormServer(sInfo);
    }

    public cloneServerInfo():SResInfo{
        var sInfo:SResInfo = new SResInfo();
        sInfo.energy = this.energy;
        sInfo.energyStartTime = this.energyStartTime;
        sInfo.gold = this.gold;
        sInfo.water = this.water;
        sInfo.flower = this.flower;
        return sInfo;
    }

    public updateEnergy(){
        var hours = (Common.getServerTime()- Common.resInfo.energyStartTime)/(60*60*1000);
        var levelCfg:any = CFG.getCfgDataById(ConfigConst.Level,Common.userInfo.level);
        var curEnerty:number = Common.resInfo.energy + hours*Number(levelCfg.lifeReturn);
        if(curEnerty>Number(levelCfg.lifeMax)){
            curEnerty = Number(levelCfg.lifeMax);
        }else{
            curEnerty = Number(curEnerty.toFixed(0));
        }
        this.energy = curEnerty;
        this.energyStartTime = Common.getServerTime();
    }
}
