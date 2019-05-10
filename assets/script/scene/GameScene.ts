import { Game } from "../GameController";
import { UI } from "../core/UIManager";
import { Slot } from "../game/SlotController";
import SlotView from "../game/SlotView";
import { EVENT } from "../core/EventController";
import GameEvent from "../GameEvent";
import ButtonEffect from "../component/ButtonEffect";
import { Common } from "../CommonData";
import ExpLevelEffect from "../component/ExpLevelEffect";
import NumberEffect from "../component/NumberEffect";
import { SlotInputStart, SlotInputEnum } from "../game/SlotInput";
import SlotWin from "../game/SlotWin";
import GameSlot from "./GameSlot";
import { SlotResultAnim, SlotResultAniEnum } from "../view/AnimUi";
import { ResConst, ConfigConst, SceneCont } from "../GlobalData";
import { CFG } from "../core/ConfigManager";
import SlotNode from "../game/SlotNode";
import { ShareType } from "../view/SharePanel";
import { ResType } from "../message/MsgAddRes";
import SceneBase, { SceneEnum } from "./SceneBase";

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
export default class GameScene extends SceneBase {

    @property(SlotView) slot1: SlotView = null;
    @property(SlotView) slot2: SlotView = null;
    @property(SlotView) slot3: SlotView = null;
    @property(cc.Button) btnOn: cc.Button = null;

    @property(cc.Label) lblAddExp: cc.Label = null;

    @property(cc.Node) houseNode:cc.Node = null;

    @property(cc.Node) iconEnergy: cc.Node = null;
    @property(cc.Label) lblcostLife: cc.Label = null;
    @property(cc.Label) lblTotalLife: cc.Label = null;
    @property(cc.Label) lblLifeDesc: cc.Label = null;

    @property(SlotNode) slotNode: SlotNode = null;

    @property(cc.Node) lightLeft: cc.Node = null;
    @property(cc.Node) lightRight: cc.Node = null;
    @property(cc.Label) bigwinTimes: cc.Label = null;


    @property(cc.Label) farmlandAdd: cc.Label = null;
    

    @property(cc.Button) btnToFarm: cc.Button = null;

    @property(cc.Node) sceneNode: cc.Node = null;


    @property(cc.Node) bigwinTimeNode:cc.Node = null;
    @property(cc.Node) slotMutiNode:cc.Node = null;
    // @property(cc.Node) sprTrans: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        this.showNothing();
    }

    constructor(){
        super();
        this.sceneName = SceneEnum.Game;
    }

    start () {

        this.moveInAction(()=>{
            // SOUND.playBgSound();
        });
        
    }


    onEnable(){
        EVENT.on(GameEvent.Play_Slot,this.onPlaySlot,this);
        EVENT.on(GameEvent.Show_Exp_Fly,this.onShowExpfly,this);
        EVENT.on(GameEvent.UpgreadUI_Closed,this.onUpgradeUIClose,this);
        EVENT.on(GameEvent.BigWin_Start,this.onBigwinStart,this);
        EVENT.on(GameEvent.BigWin_updateTurn,this.onBigwinTurn,this);
        EVENT.on(GameEvent.BigWin_End,this.onBigwinEnd,this);
        EVENT.on(GameEvent.Scene_To_Farm,this.onGoFarm,this);
        EVENT.on(GameEvent.Get_Res_Finish,this.onGetRes,this);
        this.initScene();
    }

    onDisable(){
        this.clearScene();
        EVENT.off(GameEvent.Play_Slot,this.onPlaySlot,this);
        EVENT.off(GameEvent.Show_Exp_Fly,this.onShowExpfly,this);
        EVENT.off(GameEvent.UpgreadUI_Closed,this.onUpgradeUIClose,this);
        EVENT.off(GameEvent.BigWin_Start,this.onBigwinStart,this);
        EVENT.off(GameEvent.BigWin_updateTurn,this.onBigwinTurn,this);
        EVENT.off(GameEvent.BigWin_End,this.onBigwinEnd,this);
        EVENT.off(GameEvent.Scene_To_Farm,this.onGoFarm,this);
        EVENT.off(GameEvent.Get_Res_Finish,this.onGetRes,this);
    }

    private _gameSlot:GameSlot;
    private _addLifeFlyInterval:number = 3;
    private _flowerMuti:number = 1;

    private initScene(){

        this._gameSlot = new GameSlot(this);
        this._gameSlot.initSlotView(this.slot1,this.slot2,this.slot3);
        this._gameSlot.initSlotView2(this.slotNode)
        this.btnOn.node.on(ButtonEffect.CLICK_END,this.onSlot,this);
        this.btnToFarm.node.on(ButtonEffect.CLICK_END,this.onGoFarm,this);
        this.schedule(this.lifeReturnFly,this._addLifeFlyInterval,cc.macro.REPEAT_FOREVER);
        this.onEnergyUIUpdate(null);
        this.updateCostView();

        this.farmlandAdd.string = Common.getSlotMuti().toString();
        this.bigwinTimeNode.active = false;
        this.slotMutiNode.active =true;
    }
    private onEnergyUIUpdate(e){
        Common.resInfo.updateEnergy();
        this.lblTotalLife.string = Common.resInfo.energy.toString();
    }
    private onGetRes(e){
        if(e.type == ResType.Energy){
            this.onEnergyUIUpdate(e);
        }
    }

    private clearScene(){
        this.btnOn.node.off(ButtonEffect.CLICK_END,this.onSlot,this);
        this.btnToFarm.node.off(ButtonEffect.CLICK_END,this.onGoFarm,this);
        this.unschedule(this.lifeReturnFly);
        this._gameSlot.clear();

    }

    private onGoFarm(e){
        this.btnToFarm.node.off(ButtonEffect.CLICK_END,this.onGoFarm,this);
        //去果园
        cc.director.preloadScene(SceneCont.FarmScene,()=>{
            this.sceneNode.runAction(
                cc.sequence(
                    cc.fadeOut(0.1),// cc.moveBy(0.2,cc.v2(this.sprTrans.width,0)),//.easing(cc.easeOut(1.5)),
                    cc.callFunc(()=>{
                        cc.director.loadScene(SceneCont.FarmScene);
                    })
                )
            )
        });
    }

    private moveInAction(cb){
        // this.sceneNode.x = this.sprTrans.width;
        this.sceneNode.runAction(cc.sequence(
            cc.fadeIn(0.1)// cc.moveBy(0.2,cc.v2(-this.sprTrans.width,0))//.easing(cc.easeIn(1.5))
            ,cc.callFunc(cb))    
        );
    }

    private onShowExpfly(e){
        var anim:SlotResultAnim = new SlotResultAnim(SlotResultAniEnum.Expfly);
        anim.starTo = UI.main.flowerIcon.parent.convertToWorldSpaceAR(UI.main.flowerIcon.position);
        anim.starFrom = this.btnOn.node.parent.convertToWorldSpaceAR(this.btnOn.node.position);
        UI.showWinAnim(anim);

        this.lblTotalLife.string = Common.resInfo.energy.toString();
    }

    private _isSlotLocked:boolean = false;
    private onSlot(e){

        if(Common.resInfo.energy< this.CurCost){
            UI.createPopUp(ResConst.SharePanel,{type:ShareType.shareGetEnergy});
            return;
        }
        if(this._isSlotLocked)
            return;
        this._isSlotLocked = true;
        this.enableButtons(false);
        var input:SlotInputStart = new SlotInputStart(SlotInputEnum.startPlay,this.CurCost);
        Slot.excute(input);
    }

    private onPlaySlot(e){
        var result:SlotWin = e;
        this._gameSlot.playSlotView(result,this.playEnd.bind(this));
    }

    private playEnd(){
        this._isSlotLocked = false;
        this.enableButtons(true);
    }

    private enableButtons(bool:boolean){
        this.btnOn.getComponent(ButtonEffect).enabled = bool;
        this.btnToFarm.getComponent(ButtonEffect).enabled = bool;
    }

    private showNothing(){
        this.lblAddExp.string = "";
        this.lblTotalLife.string = "";
        this.lblcostLife.string = "";
        this.lblLifeDesc.string ="";

        this.lightLeft.opacity = 0;
        this.lightRight.opacity = 0;
    }
    private onUpgradeUIClose(e){
        this.updateCostView();
    }

    private _curPlantCost:number = -1;
    private _curLifeReturn:number = 0;
    private _curLifeReturnMax:number = 0;
    private updateCostView(){
        var levelCfg:any = CFG.getCfgDataById(ConfigConst.Level,Common.userInfo.level);
        if(levelCfg){
            this._curLifeReturn = levelCfg.lifeReturn;
            this._curLifeReturnMax = levelCfg.lifeMax;
            this.lblLifeDesc.string = "每小时恢复"+this._curLifeReturn+"点";
            this._curPlantCost = Number(levelCfg.cost);
            this.lblcostLife.string = this.CurCost.toString();
            this.lblAddExp.string ="获得种植经验："+this.CurCost;
        }

    }
    public get CurCost(){
        return this._curPlantCost;
    }
    // update (dt) {}

    private lifeReturnFly(){
        this.onEnergyUIUpdate(null);
    }

    private _bigwinTiems:number = 0;
    private onBigwinStart(e){
        var seq = cc.sequence(cc.fadeIn(0.1),cc.fadeOut(0.1)).repeatForever();
        this.lightLeft.runAction(seq);
        var seq1 = cc.sequence(cc.fadeIn(0.1),cc.fadeOut(0.1)).repeatForever();
        this.lightRight.runAction(seq1);
        this._bigwinTiems = Number(CFG.getCfgByKey(ConfigConst.Constant,"key","bigWinRound")[0].value);
        this.bigwinTimes.string = this._bigwinTiems.toString();
        this.bigwinTimes.node.runAction(cc.sequence(cc.scaleTo(0.1,1.3),cc.scaleTo(0.15,1)));
        this.bigwinTimeNode.active = true;
        this.slotMutiNode.active =false;
    }

    private onBigwinTurn(e){
        this._bigwinTiems--;
        if(this._bigwinTiems<0){
            this._bigwinTiems = 0;
        }
        this.bigwinTimes.string = this._bigwinTiems.toString();
        this.bigwinTimes.node.runAction(cc.sequence(cc.scaleTo(0.1,1.3),cc.scaleTo(0.15,1)));
    }

    private onBigwinEnd(e){
        this.lightLeft.stopAllActions();
        this.lightLeft.opacity = 0;
        this.lightRight.stopAllActions();
        this.lightRight.opacity = 0;
        this.bigwinTimeNode.active = false;
        this.slotMutiNode.active =true;
    }
}
