import GameScene from "./GameScene";
import SlotView from "../game/SlotView";
import SlotWin, { SlotWinEnum } from "../game/SlotWin";
import { SlotResultAnim, SlotResultAniEnum} from "../view/AnimUi";
import { SlotFruit } from "../game/SlotController";
import { CFG } from "../core/ConfigManager";
import { ConfigConst, ResConst } from "../GlobalData";
import { UI } from "../core/UIManager";
import SlotNode from "../game/SlotNode";
import GameEvent from "../GameEvent";
import { EVENT } from "../core/EventController";
import { ShareType } from "../view/SharePanel";
import { MessagePanelType } from "../view/MessagePanel";
import { SOUND } from "../core/SoundManager";
import MsgAddRes, { ResType } from "../message/MsgAddRes";
import { NET } from "../core/net/NetController";
import { Common } from "../CommonData";

export default class GameSlot{

    private _scene:GameScene;
    constructor(scene:GameScene){
        this._scene = scene;
    }

    private _slotView1:SlotView;
    private _slotView2:SlotView;
    private _slotView3:SlotView;

    private _slot:SlotNode;

    public initSlotView(slot1:SlotView,slot2:SlotView,slot3:SlotView){
        this._slotView1 = slot1;
        // this._slotView1.initFruit();
        this._slotView2 = slot2;
        // this._slotView2.initFruit();
        this._slotView3 = slot3;
        // this._slotView3.initFruit();
    }
    public initSlotView2(slotNode:SlotNode){
        this._slot = slotNode;
        this._slot.initFruit();
    }

    public clear(){
        this._slotView1 = this._slotView2 = this._slotView3 = null;
        this._slot = null;
        this._scene = null;
    }

    public playSlotView(result:SlotWin,cb:Function){
        var slotArr:Array<number> = result.slotArr;
        var winAnim:SlotResultAnim = null;
        if(result.type == SlotWinEnum.Normal){
            winAnim = new SlotResultAnim(SlotResultAniEnum.Hevart);
            winAnim.coinTo = UI.main.coinIcon.parent.convertToWorldSpaceAR(UI.main.coinIcon.position);
            var fruitCfg:any = CFG.getCfgDataById(ConfigConst.Fruit,slotArr[0]);
            winAnim.muti = Number(fruitCfg.winMuti);
            winAnim.flyCoin = Number(fruitCfg.flyCoin);
            winAnim.addGold = winAnim.muti * result.cost;
        }
        if(result.type == SlotWinEnum.Normal){
            this.playSlotViewResult(result.slotArr,winAnim,cb);
        }else if(result.type== SlotWinEnum.Repeat){
            this.playSlotViewRepeat(result,cb);
        }else if(result.type == SlotWinEnum.BigWin){
            this.playSlotViewBigWin(result,cb);
        }else if(result.type == SlotWinEnum.Share){
            this.playSlotViewShare(result,cb);
        }else if(result.type == SlotWinEnum.Plant){
            this.playSlotViewPlant(result,cb);
        }else if(result.type == SlotWinEnum.Pick){
            this.playSlotViewPick(result,cb);
        }else if(result.type == SlotWinEnum.GetRes){
            this.playSlotViewGetRes(result.slotArr,cb);
        }
        else{
            cb && cb();
        }
    }

    public playSlotViewResult(slotArr:Array<number> ,anim:SlotResultAnim,cb:Function){
        // this._slotView1.play(Number(slotArr[0]),0.6);
        // this._slotView2.play(Number(slotArr[1]),0.8);
        // this._slotView3.play(Number(slotArr[2]),1);
        // if(anim!=null){
        //     this._scene.scheduleOnce(()=>{
        //         UI.showWinAnim(anim);
        //     },1);
        //     this._scene.scheduleOnce(()=>{
        //         cb && cb();
        //     },1.5)
        // }else{
        //     this._scene.scheduleOnce(()=>{
        //         cb && cb();
        //     },1)
        // }
        var id:number = slotArr[0];
        this._slot.play(id);
        if(anim!=null){
                this._scene.scheduleOnce(()=>{
                    UI.showWinAnim(anim);
                },2);
                this._scene.scheduleOnce(()=>{
                    cb && cb();
                },2.5)
            }else{
                this._scene.scheduleOnce(()=>{
                    cb && cb();
                },2)
        }
    }
    public playSlotViewGetRes(slotArr:Array<number>,cb:Function){
        var id:number = slotArr[0];
        this._slot.play(id);
        var anim:SlotResultAnim;
        this._scene.scheduleOnce(()=>{
            anim = new SlotResultAnim(SlotResultAniEnum.SlotGetRes);
            var resType:ResType ;
            var fruitCfg:any = CFG.getCfgDataById(ConfigConst.Fruit,slotArr[0]);
            var resCount = Number(fruitCfg.getResCount);
            if(fruitCfg.id == SlotFruit.water){
                resType = ResType.Water;
            }
            anim.resType = resType; 
            anim.addResCount = resCount;
            anim.starFrom = this._slot.getFruitPos(SlotFruit.water);
            anim.starTo = this._scene.btnToFarm.node.parent.convertToWorldSpaceAR(this._scene.btnToFarm.node.position);
            UI.showWinAnim(anim);
        },2);
        this._scene.scheduleOnce(()=>{
            NET.send(MsgAddRes.create(anim.resType,anim.addResCount),(msg:MsgAddRes)=>{
                if(msg && msg.resp){
                    Common.resInfo.updateInfo(msg.resp.resInfo);
                    anim.type = SlotResultAniEnum.GetResFly;
                    UI.showWinAnim(anim);
                }
            },this)
        },2.5)
        
        this._scene.scheduleOnce(()=>{
            cb && cb();
        },3)
    }

    public playSlotViewShare(result:SlotWin,cb:Function){
        this._slot.play(SlotFruit.share);
        var anim:SlotResultAnim = new SlotResultAnim(SlotResultAniEnum.Share);
        var fruitCfg:any = CFG.getCfgDataById(ConfigConst.Fruit,result.slotArr[0]);
        anim.muti =  Number(fruitCfg.winMuti);
        anim.addGold =  anim.muti * result.cost;
        this._scene.scheduleOnce(()=>{
            UI.showWinAnim(anim);
        },2);
        this._scene.scheduleOnce(()=>{
            UI.createPopUp(ResConst.SharePanel,{type:ShareType.shareGetGold,muti:anim.muti,addGold:anim.addGold});
            cb && cb();
        },2.5)
    }

    public playSlotViewPlant(reslut:SlotWin,cb:Function){
        this._slot.play(SlotFruit.plant);
        var anim:SlotResultAnim = new SlotResultAnim(SlotResultAniEnum.Plant);
        this._scene.scheduleOnce(()=>{
            UI.showWinAnim(anim);
        },2);
        this._scene.scheduleOnce(()=>{
            UI.createPopUp(ResConst.MessgaePanel,{type:MessagePanelType.plantFree});
            cb && cb();
        },2.5)
    }

    public playSlotViewPick(result:SlotWin,cb:Function){
        this._slot.play(SlotFruit.pick);
        var anim:SlotResultAnim = new SlotResultAnim(SlotResultAniEnum.Pick);
        this._scene.scheduleOnce(()=>{
            UI.showWinAnim(anim);
        },2);
        this._scene.scheduleOnce(()=>{
            UI.createPopUp(ResConst.MessgaePanel,{type:MessagePanelType.pickImmediatly});
            cb && cb();
        },2.5)
    }

    public playSlotViewRepeat(result:SlotWin,cb:Function){
        var slotArr:Array<number> = result.slotArr;
        // this._slotView1.play(SlotFruit.shoutao,0.6);
        // this._slotView2.play(SlotFruit.shoutao,0.8);
        // this._slotView3.play(SlotFruit.shoutao,1);
        // this._scene.scheduleOnce(()=>{
        //     UI.showWinAnim(new SlotResultAnim(SlotResultAniEnum.Repeat));
        // },1);
        // this._scene.scheduleOnce(()=>{
        //     result.type = SlotWinEnum.Normal;
        //     this.playSlotView(result,cb);
        // },1.5)
        this._slot.play(SlotFruit.repeat);
        this._scene.scheduleOnce(()=>{
            UI.showWinAnim(new SlotResultAnim(SlotResultAniEnum.Repeat));
        },2);
        this._scene.scheduleOnce(()=>{
            var repeat:SlotWin = result.repeatSlotWin;
            this.playSlotView(repeat,cb);
        },2.5)
    }

    public playSlotViewBigWin(result:SlotWin,cb:Function){
        this._slot.play(SlotFruit.guolan);
        this._scene.scheduleOnce(()=>{
            UI.showWinAnim(new SlotResultAnim(SlotResultAniEnum.BigWin));
            EVENT.emit(GameEvent.BigWin_Start);
        },2);
        var i:number = 0;
        for(var i:number = 0;i<=result.bigwinSlotWin.length;i++){
            this._scene.scheduleOnce(()=>{
                if(result.bigwinSlotWin.length>0){
                    var bigwin:SlotWin = result.bigwinSlotWin.shift();
                    this.playSlotView(bigwin,null);
                    EVENT.emit(GameEvent.BigWin_updateTurn);
                }else{
                    SOUND.playFarmBgSound();
                    EVENT.emit(GameEvent.BigWin_End);
                    cb && cb();
                }
            },(i+1)*3.5)
        }
    }

}
