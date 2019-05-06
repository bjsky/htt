import PopUpBase from "../component/PopUpBase";
import { Common } from "../CommonData";
import { CFG } from "../core/ConfigManager";
import { ConfigConst } from "../GlobalData";
import { EVENT } from "../core/EventController";
import GameEvent from "../GameEvent";
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

@ccclass
export default class UpgradeUI extends PopUpBase{

    @property(cc.Label)
    lblLv: cc.Label = null;
    @property(cc.RichText)
    lblUnlock: cc.RichText = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    onEnable(){
        super.onEnable();
        this.initView();
        SOUND.playLevelupSound();
    }

    private initView(){
        var level:number = Common.userInfo.level;
        var levelCfg:any = CFG.getCfgDataById(ConfigConst.Level,level);
        if(levelCfg){
            this.lblLv.string = level.toString();
            
            var unlcokStr:string ="";
            if(Number(levelCfg.unlcokTitle)==1){
                unlcokStr = "获得职位：<color = #00ff00><b>"+levelCfg.title+"</b></c>";
            }
            var unlockPlant:string ="";
            var plantUnlockCfg:any[] = CFG.getCfgByKey(ConfigConst.Plant,"unlocklv",level);
            if(plantUnlockCfg.length>0){
                unlockPlant = "解锁植物：<color = #00ff00><b>"+plantUnlockCfg[0].name+"</b></c>";
            }
            if(unlockPlant!=""){
                unlcokStr = unlcokStr +"<br />"+ unlockPlant;
            }
            this.lblUnlock.string = "<color=#00FFF6>"+unlcokStr+"</c>";
        }
    }
    onCloseComplete(){
        EVENT.emit(GameEvent.UpgreadUI_Closed);
        super.onCloseComplete();
    }

    start () {

    }

    // update (dt) {}
}
