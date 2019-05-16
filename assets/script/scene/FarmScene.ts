import ButtonEffect from "../component/ButtonEffect";
import { SceneCont, ResConst, Global, ServerType, ConfigConst } from "../GlobalData";
import { UI } from "../core/UIManager";
import { EVENT } from "../core/EventController";
import GameEvent from "../GameEvent";
import FarmlandInfo from "../FarmlandInfo";
import { Common } from "../CommonData";
import { SlotResultAnim, SlotResultAniEnum } from "../view/AnimUi";
import { Game } from "../GameController";
import { SOUND } from "../core/SoundManager";
import SceneBase, { SceneEnum } from "./SceneBase";
import { Wechat } from "../WeChatInterface";
import { MessagePanelType } from "../view/MessagePanel";
import UIBase from "../component/UIBase";
import { Farm2 } from "../game/farm2/Farm2Controller";
import Farmland2 from "../view/farm2/Farmland2";
import { Guide, GuideInfo } from "../GuideController";
import { CFG } from "../core/ConfigManager";

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

export enum FarmSceneState{
    Growth = 1,     //成长
    Plant = 2,      //种植
}
@ccclass
export default class FarmScene extends SceneBase{


    @property(cc.Node) uicanvas: cc.Node = null;
    @property(cc.Button) btnToSlot: cc.Button = null;
    @property(cc.Button) btnFlowerDesc: cc.Button = null;
    // @property(cc.Button) btnPick: cc.Button = null;
    // @property(cc.Button) btnPickIme: cc.Button = null;
    // @property(cc.Node) pickNode:cc.Node = null;



    @property(cc.Node) sceneNode: cc.Node = null;

    // @property(cc.Node) sprTrans: cc.Node = null;

    // @property(DList) seedList: DList = null;
    @property([cc.Node]) farmlandNodes: cc.Node[] = [];
    @property(cc.Button) btnRank: cc.Button = null;
    @property(cc.Button) btnPlant: cc.Button = null;
    @property(cc.Button) btnGrowth: cc.Button = null;

    @property(cc.Node) nodeTipGrowth: cc.Node = null;
    @property(cc.Node) nodeTipPlant: cc.Node = null;

    // @property(cc.Label) lblWater: cc.Label = null;
    // @property(cc.Node) iconWater: cc.Node = null;

    @property(cc.RichText) nextSceneFlower: cc.RichText = null;
    constructor(){
        super();
        this.sceneName = SceneEnum.Farm;
    }
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    private _farmlandNodeDic:any = {};
    public getFarmland2WithIdx(indx:number):Farmland2{
        return this._farmlandNodeDic[indx];
    }
    start () {
        if(Game.loadingComplete){
            this.initScene();
            this.moveInAction(()=>{
                // SOUND.playFarmBgSound();
            });
        }else{
            Game.startGame(this.uicanvas);
        }
    }

    onEnable(){
        EVENT.on(GameEvent.Loading_complete,this.onLoadingComplete,this);
        EVENT.on(GameEvent.Plant_Tree,this.onPlantTree,this);
        EVENT.on(GameEvent.Unlock_Tree,this.onUnlockTree,this);
        EVENT.on(GameEvent.Pick_Tree,this.onPickTree,this);
        EVENT.on(GameEvent.Up_Level_Tree,this.onUpLevelTree,this);
        EVENT.on(GameEvent.Scene_To_Slot,this.onGoSlot,this);
        EVENT.on(GameEvent.Guide_Touch,this.onGuideTouch,this);
        EVENT.on(GameEvent.Unlock_Change,this.unlockChange,this);
        EVENT.on(GameEvent.FarmScene_To_Growth,this.farmScenetoGrowth,this);
    }


    onDisable(){
        EVENT.off(GameEvent.Loading_complete,this.onLoadingComplete,this);
        EVENT.off(GameEvent.Plant_Tree,this.onPlantTree,this);
        EVENT.off(GameEvent.Unlock_Tree,this.onUnlockTree,this);
        EVENT.off(GameEvent.Pick_Tree,this.onPickTree,this);
        EVENT.off(GameEvent.Up_Level_Tree,this.onUpLevelTree,this);
        EVENT.off(GameEvent.Scene_To_Slot,this.onGoSlot,this);
        EVENT.off(GameEvent.Guide_Touch,this.onGuideTouch,this);
        EVENT.off(GameEvent.Unlock_Change,this.unlockChange,this);
        EVENT.off(GameEvent.FarmScene_To_Growth,this.farmScenetoGrowth,this);

        this.clearScene();
    }

    private onLoadingComplete(e){
        this.initScene();
        SOUND.playFarmBgSound();
        Guide.startGuide();
        console.log(Common.newUser)
    }
    private initScene(){

        this.btnToSlot.node.on(ButtonEffect.CLICK_END,this.onGoSlot,this);
        this.btnFlowerDesc.node.on(ButtonEffect.CLICK_END,this.showFlowerDesc,this);
        this.btnRank.node.on(ButtonEffect.CLICK_END,this.onRankClick,this);
        this.btnPlant.node.on(ButtonEffect.CLICK_END,this.toPlantState,this);
        this.btnGrowth.node.on(ButtonEffect.CLICK_END,this.toGrowthState,this);
        this.changeState(FarmSceneState.Growth);
        this.initFarmland();
        this.nextSceneFlower.string = "<color=#7A4414><color=#f04a3d>"+Farm2.getNextSceneFlower()+"</color> 解锁</c>";
        this.addMoveEvent();
    }
    private clearScene(){

        this.btnToSlot.node.off(ButtonEffect.CLICK_END,this.onGoSlot,this);
        this.btnFlowerDesc.node.off(ButtonEffect.CLICK_END,this.showFlowerDesc,this);
        this.btnRank.node.off(ButtonEffect.CLICK_END,this.onRankClick,this);
        this.btnPlant.node.off(ButtonEffect.CLICK_END,this.toPlantState,this);
        this.btnGrowth.node.off(ButtonEffect.CLICK_END,this.toGrowthState,this);
        this._farmlandNodeDic = {};
        this.removeMoveEvent();
    }
    private onLbTouch(e){
        console.log("testlb");
    }
    private onRankClick(e){
        
        if(Global.serverType == ServerType.Publish){
            if(Common.userInfo.level<3){
                UI.showTip("排行榜3级开放");
                return;
            }
            this.onInitUserInfo(null);
            // Wechat.getUserInfo((userInfo)=>{
            //     if(userInfo==null){
            //         this.showUserInfoButton();
            //     }else{
            //         this.onInitUserInfo(userInfo);
            //     }
            // })
        }else {
            UI.createPopUp(ResConst.RankPanel,{});
        }
    }
    private _message:cc.Node = null;
    private showUserInfoButton(){
        let systemInfo = Wechat.getSystemInfo();
        let w = systemInfo.windowWidth;
        let h = systemInfo.windowHeight;
        let left = 0;
        let top = 0;
        let width = w;
        let height = h;
        Wechat.createUserInfoButton(left,top,width,height,(userInfo)=>{
            if(userInfo){
                this.onInitUserInfo(userInfo);
            }
            if(this._message!=null){
                UI.closePopUp(this._message);
                this._message = null;
            }
        });
        UI.createPopUp(ResConst.MessgaePanel,{type:MessagePanelType.userInfo},(ui:UIBase)=>{
            this._message = ui.node;
        });
    }

    private _curState:FarmSceneState = 0;
    private toGrowthState(e){
        this.changeState(FarmSceneState.Growth);
    }
    private toPlantState(e){
        this.changeState(FarmSceneState.Plant);
    }
    private farmScenetoGrowth(e){
        this.changeState(FarmSceneState.Growth);
    }

    private changeState(state:FarmSceneState){
        if(this._curState == state)
        return;
        this._curState = state;
        switch(this._curState){
            case FarmSceneState.Growth:
            {
                this.btnGrowth.node.active = false;
                this.btnPlant.node.active = true;
            }break;
            case FarmSceneState.Plant:
            {
                this.btnGrowth.node.active = true;
                this.btnPlant.node.active = false;
            }break;
        }

        this.nodeTipGrowth.active = (this._curState == FarmSceneState.Growth);
        this.nodeTipPlant.active = (this._curState == FarmSceneState.Plant);

        EVENT.emit(GameEvent.Farm_State_Change,{state:this._curState});
    }

    private onInitUserInfo(userInfo){
        Global.initUserInfo(userInfo);
        Wechat.opendata.postMessage({
            messageId:1
        })

        UI.createPopUp(ResConst.RankPanel,{});
    }

    private onGoSlot(e){
        this.btnToSlot.node.off(ButtonEffect.CLICK_END,this.onGoSlot,this);
        //去转盘
        cc.director.preloadScene(SceneCont.SlotScene,()=>{
            this.sceneNode.runAction(
                cc.sequence(
                    cc.fadeOut(0.1),// cc.moveBy(0.2,cc.v2(-this.sprTrans.width,0)),//.easing(cc.easeOut(1.5)),
                cc.callFunc(()=>{
                    cc.director.loadScene(SceneCont.SlotScene);
                }))
            )
        });
    }

    private showFlowerDesc(){
        UI.createPopUp(ResConst.FlowerDesc,{});
    }

    private moveInAction(cb:Function){
        // this.sceneNode.x = -this.sprTrans.width;
        this.sceneNode.runAction(
            cc.sequence(
                cc.fadeIn(0.1),
                // cc.moveBy(0.2,cc.v2(this.sprTrans.width,0)),//.easing(cc.easeIn(1.5)),
            cc.callFunc(cb))
        );
    }

    private _farmlandLoad:boolean = false;
    private initFarmland(){
        var farmlandNode:cc.Node;
        var farmland:FarmlandInfo;
        this._farmlandNodeDic = {};
        for(var i:number = 0;i<this.farmlandNodes.length;i++){
            farmlandNode = this.farmlandNodes[i];
            farmland = Farm2.getFarmlandAtIndex(i);
            if(farmland){
                UI.loadUI(ResConst.Farmland2,{farmland:farmland},farmlandNode,(ui:Farmland2)=>{
                    this._farmlandNodeDic[ui.index] = ui;
                });
            }
        }
    }

    private onPlantTree(e){
        var treeid:number = e.seedId;
        var index:number = e.index;
        var farmland2:Farmland2 = this.getFarmland2WithIdx(index);
        if(farmland2){
            farmland2.updateFarmland();

            var anim:SlotResultAnim = new SlotResultAnim(SlotResultAniEnum.PlantTreefly);
            anim.starTo = UI.main.flowerIcon.parent.convertToWorldSpaceAR(UI.main.flowerIcon.position);
            anim.starFrom = farmland2.getFlowerIcon.parent.convertToWorldSpaceAR(farmland2.getFlowerIcon.position);
            UI.showWinAnim(anim);
        }
    }   
    private onUnlockTree(e){
        var index:number = e.index;
        var farmland2:Farmland2 = this.getFarmland2WithIdx(index);
        if(farmland2){
            farmland2.updateFarmland();
            var anim:SlotResultAnim = new SlotResultAnim(SlotResultAniEnum.PlantTreefly);
            anim.starTo = UI.main.flowerIcon.parent.convertToWorldSpaceAR(UI.main.flowerIcon.position);
            anim.starFrom = farmland2.node.parent.convertToWorldSpaceAR(farmland2.node.position);
            UI.showWinAnim(anim);
        }
    }

    private unlockChange(e){
        var unlockId:number = e.id;
        var unlockIndex:number = e.index;
        var farmland2:Farmland2 = this.getFarmland2WithIdx(unlockIndex);
        if(farmland2){
            farmland2.updateFarmland();
        }
        if(unlockIndex<=8){ //解锁地块
            var farmland2:Farmland2 = this.getFarmland2WithIdx(unlockIndex+1);
            if(farmland2){
                farmland2.updateFarmland();
            }
        }
        if(!Guide.isGuide){
            UI.createPopUp(ResConst.UpgradeUI,{unlockId:unlockId});
            // UI.createPopUp(ResConst.MessgaePanel,{type:MessagePanelType.toGrowth})
        }
        
    }

    private onPickTree(e){
        var index:number = e.index;
        var farmland2:Farmland2 = this.getFarmland2WithIdx(index);
        if(farmland2){
            farmland2.updateFarmland();

            var anim:SlotResultAnim = new SlotResultAnim(SlotResultAniEnum.PickTreefly);
            anim.starTo = UI.main.coinIcon.parent.convertToWorldSpaceAR(UI.main.coinIcon.position);
            anim.starFrom = farmland2.getGoldIcon.parent.convertToWorldSpaceAR(farmland2.getGoldIcon.position);
            UI.showWinAnim(anim);
            
        }
    }

    private onUpLevelTree(e){
        var index:number = e.index;
        var farmland2:Farmland2 = this.getFarmland2WithIdx(index);
        if(farmland2){
            farmland2.updateFarmland();
        }
    }

    private addMoveEvent(){
        this.sceneNode.on(cc.Node.EventType.TOUCH_START,this.onSceneTouchStart,this);
    }

    private removeMoveEvent(){
        this.sceneNode.off(cc.Node.EventType.TOUCH_START,this.onSceneTouchStart,this);

    }

    private onSceneTouchStart(e){
        console.log("_____touch");
    }

    public getGuideNode(nodeName:string):cc.Node{
        var node:cc.Node = null;
        if(nodeName == "firstFarmland"  ||
            nodeName == "uplvFarmland"  ||
            nodeName == "uplvFarmland2" ||
            nodeName == 'toPick'){
            node = this.getFarmland2WithIdx(0).node;
        }else if(nodeName == "toPlant"||
            nodeName == "toGrowth"){
            node = this.btnPlant.node;
        }else if(nodeName == "unlockFarmland"){
            node = this.getFarmland2WithIdx(1).node;
        }else if(nodeName == "toSlot"){
            node = this.btnToSlot.node;
        }
        return node;
    }

    public onGuideTouch(e){
        var info:GuideInfo = e.info;
        if(info.guideNodeName == "firstFarmland"){
            var farmland:Farmland2 = this.getFarmland2WithIdx(0);
            if(farmland){
                farmland.onUnlockTouch(null);
                Guide.hide();
                this.scheduleOnce(()=>{
                    Guide.nextGuide();
                },0.5)
            }
        }else if(info.guideNodeName == "toPick"){
            var farmland:Farmland2 = this.getFarmland2WithIdx(0);
            if(farmland){
                farmland.onGrowthTouch(null);
                Guide.hide();
                this.scheduleOnce(()=>{
                    Guide.nextGuide();
                },0.5)
            }
        }else if(info.guideNodeName == "toPlant"){
            this.changeState(FarmSceneState.Plant);
            Guide.hide();
            Guide.nextGuide();
        }else if(info.guideNodeName == "toGrowth"){
            this.changeState(FarmSceneState.Growth);
            Guide.hide();
            Guide.nextGuide();
        }else if(info.guideNodeName == "uplvFarmland"){
            var farmland:Farmland2 = this.getFarmland2WithIdx(0);
            if(farmland){
                farmland.onGuideUpLevel();
                Guide.hide();
                Guide.nextGuide();
            }
        }else if(info.guideNodeName == "uplvFarmland2"){
            var farmland:Farmland2 = this.getFarmland2WithIdx(0);
            if(farmland){
                var isPlant = farmland.onGuideUpLevel();
                if(isPlant){
                    Guide.hide();
                    this.scheduleOnce(()=>{
                        Guide.nextGuide();
                    },0.5)
                }
            }
        }else if(info.guideNodeName == "unlockFarmland"){
            var farmland:Farmland2 = this.getFarmland2WithIdx(1);
            if(farmland){
                farmland.onUnlockTouch(null);
                Guide.hide();
                Guide.nextGuide();
            }
        }else if(info.guideNodeName == "toSlot"){
            this.onGoSlot(null);
            Guide.hide();
            Guide.nextGuide();
        }
    }
    // update (dt) {}
}