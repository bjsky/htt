import { Common } from "./CommonData";
import SceneBase from "./scene/SceneBase";
import { Scene } from "./scene/SceneController";
import GameScene from "./scene/GameScene";
import FarmScene from "./scene/FarmScene";
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
        return Common.newUser==1;
    }

    // update (dt) {}
    private _guideMap:any ={};
    public initGuide():void{
        var guideCfg =[
            {id:1,type:1,scene:"farm",message:"欢迎来到花田田，开始建设属于你的花园吧"},
            {id:2,type:1,scene:"farm",message:"第一块花田已经解锁，点击花田收获金币"},
            {id:3,type:2,scene:"farm",node:"firstFarmland"},
            {id:4,type:1,scene:"farm",message:"在种植界面升级花田，加快金币生产速度"},
            {id:5,type:2,scene:"farm",node:"toPlant"},
            {id:6,type:2,scene:"farm",node:"uplvFarmland"},
            {id:7,type:1,scene:"farm",message:"满级后可以种植其他鲜花，生产更多金币"},
            {id:8,type:2,scene:"farm",node:"uplvFarmland2"},
            {id:9,type:1,scene:"farm",message:"第二块花田已经解锁，去收集金币"}
        ];
        var guideInfo:GuideInfo;
        this._guideMap = {};
        guideCfg.forEach((obj:any)=>{
            guideInfo = GuideInfo.parse(obj);
            this._guideMap[guideInfo.guideId] = guideInfo;
        });
        this.curGuideId = 1;
    }

    public curGuideId:number = 0;
    public startGuide(showParent:boolean = false){
        if(!this.isGuide){
            return;
        }
        if(this._guideMap[this.curGuideId]!=undefined){
            var info:GuideInfo = this._guideMap[this.curGuideId];
            var sceneName = (Scene.getCurScene() instanceof GameScene?"game":"farm");
            if(info.sceneName == sceneName){
                UI.guideView.show(info);
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
}

export var Guide:GuideController = GuideController.getInstance();
