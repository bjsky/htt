
export enum SceneEnum{
    Farm = 1,
    Game = 2,
}
export default class SceneBase extends cc.Component {
    //场景名
    public sceneName:SceneEnum = 0;
}
