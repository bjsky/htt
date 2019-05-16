import { Common } from "./CommonData";
import { Scene } from "./scene/SceneController";
import GameScene from "./scene/GameScene";
import { UI } from "./core/UIManager";

export class GuideInfo{
    public guideId:number = 0;
    public guideType:number = 0;
    public sceneName:string = "";
    public gudieMessage:string = "";
    public guideNodeName:string = "";

    public static parse(obj:any):GuideInfo{
        var guideInfo:GuideInfo = new GuideInfo();
        guideInfo.guideId = obj.id;
        guideInfo.guideType = obj.type;
        guideInfo.sceneName = obj.scene;
        if(obj.message!=undefined){
            guideInfo.gudieMessage = obj.message;
        }
        if(obj.node!=undefined){
            guideInfo.guideNodeName = obj.node;
        }
        return guideInfo;
    }
}
export default class GuideController{
    private static _instance: GuideController = null;
    public static getInstance(): GuideController {
        if (GuideController._instance == null) {
            GuideController._instance = new GuideController();
            
        }
        return GuideController._instance;
    }
    public get isGuide(){
        return Common.newUser==1 && this.curGuideId>-1;
    }

    // update (dt) {}
    private _guideMap:any ={};
    public initGuide():void{
        var guideCfg =[
            {id:1,type:1,scene:"farm",message:"欢迎来到花田田，开始种植鲜花吧"},
            {id:2,type:1,scene:"farm",message:"点击第一块花田"},
            {id:3,type:2,scene:"farm",node:"firstFarmland"},
            {id:4,type:1,scene:"farm",message:"花田会持续生产金币，点击花田收集"},
            {id:5,type:2,scene:"farm",node:"toPick"},
            {id:6,type:1,scene:"farm",message:"在种植界面升级花田，可以增加金币产量"},
            {id:7,type:2,scene:"farm",node:"toPlant"},
            {id:8,type:2,scene:"farm",node:"uplvFarmland"},
            {id:9,type:1,scene:"farm",message:"满级可以种植高级鲜花，连续点击花田"},
            {id:10,type:2,scene:"farm",node:"uplvFarmland2"},
            {id:11,type:1,scene:"farm",message:"第二块花田已经解锁，去种植吧"},
            {id:12,type:2,scene:"farm",node:"toGrowth"},
            {id:13,type:2,scene:"farm",node:"unlockFarmland"},
            // {id:14,type:1,scene:"farm",message:"滑动屏幕收集金币"},
            // {id:15,type:3,scene:"farm",node:"pickTwo"},
            {id:14,type:1,scene:"farm",message:"转盘抽奖可以快速获取金币，去试试运气"},
            {id:15,type:2,scene:"farm",node:"toSlot"},
            {id:16,type:2,scene:"game",node:"startSlot"},
            {id:17,type:1,scene:"game",message:"再来一次"},
            {id:18,type:2,scene:"game",node:"startSlot"},
            {id:19,type:1,scene:"game",message:"有了金币，现在去解锁更多花田吧"},
            {id:20,type:2,scene:"game",node:"toFarm"},

        ];
        var guideInfo:GuideInfo;
        this._guideMap = {};
        guideCfg.forEach((obj:any)=>{
            guideInfo = GuideInfo.parse(obj);
            this._guideMap[guideInfo.guideId] = guideInfo;
        });
        if(Common.newUser == 1){
            this.curGuideId = 1;
        }
    }

    public curGuideId:number = 0;
    public startGuide(){
        if(!this.isGuide){
            return;
        }
        if(this._guideMap[this.curGuideId]!=undefined){
            var info:GuideInfo = this._guideMap[this.curGuideId];
            var sceneName = (Scene.getCurScene() instanceof GameScene?"game":"farm");
            if(info.sceneName == sceneName){
                UI.guideView.show(info);
            }else{
                UI.guideView.hide();
            }
        }else{
            UI.guideView.hide();
        }
    }   
    public hide(){
        UI.guideView.hide();
    }

    public nextGuide(){
        if(!this.isGuide){
            return;
        }
        this.curGuideId++;
        this.startGuide();
    }

    public endGuide(){
        this.curGuideId =-1;

    }
}

export var Guide:GuideController = GuideController.getInstance();
