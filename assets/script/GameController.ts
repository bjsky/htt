import { Loading } from "./LoadingController";
import { Global } from "./GlobalData";
import { UI } from "./core/UIManager";
import { EVENT } from "./core/EventController";
import GameEvent from "./GameEvent";
import { Wechat } from "./WeChatInterface";

export default class GameController {
    private static _instance: GameController = null;
    public static getInstance(): GameController {
        if (GameController._instance == null) {
            GameController._instance = new GameController();
            
        }
        return GameController._instance;
    }
    

    public startGame(root:cc.Node){
        UI.registerLayer(root);
        Global.initGame();
        Loading.startLoading(this.onLoadingComplete.bind(this));
        //广告位
        Wechat.showBannerAd("adunit-de632cdf5e658b47");

    }
    
    private _loadingComplete:boolean = false;
    public get loadingComplete(){
        return this._loadingComplete;
    }
    private onLoadingComplete(){
        this._loadingComplete = true;
        EVENT.emit(GameEvent.Loading_complete);
    }

    private _isReLogin:boolean =false;
    public get isReLogin(){
        return this._isReLogin;
    }
    //断线重来
    public reLogin(){
        if(this._isReLogin){
            return;
        }
        this._isReLogin = true;
        Loading.startReConnect(this.onReconnectComplete.bind(this));
    }

    private onReconnectComplete(){
        this._isReLogin = false;
    }
}


export var Game:GameController = GameController.getInstance();