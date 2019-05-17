import PopUpBase from "../component/PopUpBase";
import { Common } from "../CommonData";
import { CFG } from "../core/ConfigManager";
import { ConfigConst } from "../GlobalData";
import { EVENT } from "../core/EventController";
import GameEvent from "../GameEvent";
import { SOUND } from "../core/SoundManager";
import ButtonEffect from "../component/ButtonEffect";

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
export default class UpgradeUI extends PopUpBase{

    @property(cc.Label)
    lblLv: cc.Label = null;
    @property(cc.RichText)
    lblUnlock: cc.RichText = null;
    @property(cc.Button)
    btntoGrowth: cc.Button = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    private unlockId:number = -1;
    public setData(data:any){
        super.setData(data);
        this.unlockId = data.unlockId;
    }

    onEnable(){
        super.onEnable();
        this.initView();
        SOUND.playLevelupSound();
        this.btntoGrowth.node.on(ButtonEffect.CLICK_END,this.onGotoGrowth,this);
    }
    onDisable(){

        this.btntoGrowth.node.off(ButtonEffect.CLICK_END,this.onGotoGrowth,this);
    }

    private _sureGo:boolean = false;
    private onGotoGrowth(e){
        this._sureGo = true;
        this.onClose(e);
    }
    protected onCloseComplete(){
        if(this._sureGo){
            EVENT.emit(GameEvent.FarmScene_To_Growth);
        }
        super.onCloseComplete();
    }

    private initView(){
        // var level:number = Common.userInfo.level;
        // var levelCfg:any = CFG.getCfgDataById(ConfigConst.Level,level);
        // if(levelCfg){
        //     this.lblLv.string = level.toString();
            
        //     var unlcokStr:string ="";
        //     if(Number(levelCfg.unlcokTitle)==1){
        //         unlcokStr = "获得职位：<color = #00ff00><b>"+levelCfg.title+"</b></c>";
        //     }
        //     var unlockPlant:string ="";
        //     var plantUnlockCfg:any[] = CFG.getCfgByKey(ConfigConst.Plant,"unlocklv",level);
        //     if(plantUnlockCfg.length>0){
        //         unlockPlant = "解锁植物：<color = #00ff00><b>"+plantUnlockCfg[0].name+"</b></c>";
        //     }
        //     if(unlockPlant!=""){
        //         unlcokStr = unlcokStr +"<br />"+ unlockPlant;
        //     }
        //     this.lblUnlock.string = "<color=#00FFF6>"+unlcokStr+"</c>";
        // }
        var farmlandcfg:any = CFG.getCfgDataById(ConfigConst.Farmland,this.unlockId);
        if(farmlandcfg){
            var unlockIndex = Number(farmlandcfg.index)+1;
            var goldmuti:number = Number(farmlandcfg.slotMuti);
            var str = "解锁：<color = #00ff00>第<b>"+unlockIndex+"块花田</b></c>";
            str += "<br />转盘金币加倍：<color = #00ff00><b>"+goldmuti+"</b>倍</c>";
            this.lblUnlock.string = "<color=#00FFF6>"+str+"</c>";
        }
    }
    // onCloseComplete(){
    //     EVENT.emit(GameEvent.UpgreadUI_Closed);
    //     super.onCloseComplete();
    // }

    start () {

    }

    // update (dt) {}
}
