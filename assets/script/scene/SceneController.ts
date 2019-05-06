import SceneBase from "./SceneBase";

export default class SceneController{
    private static _instance: SceneController = null;
    public static getInstance(): SceneController {
        if (SceneController._instance == null) {
            SceneController._instance = new SceneController();
            
        }
        return SceneController._instance;
    }

    public getCurScene():SceneBase{
        var node:cc.Node = cc.director.getScene().getChildByName("Canvas");
        return node.getComponent(SceneBase);
    }
}

export var Scene:SceneController = SceneController.getInstance();
