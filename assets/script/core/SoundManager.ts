
export default class SoundManager{

    private _bgVolume:number = 0.8;
    private _volume:number = 1;

    // private _musicSwitch:boolean = true;
    private _bgMusicSwitch:boolean = true;

    private _clipMaps:any ={};

    private static _instance: SoundManager = null;
    public static getInstance(): SoundManager {
        if (SoundManager._instance == null) {
            SoundManager._instance = new SoundManager();
            
        }
        return SoundManager._instance;
    }
    
    public getBgMusicSwitch() {
        return this._bgMusicSwitch;
    }

    // public getMusicSwitch() {
    //     return this._musicSwitch;
    // }

    public SetBgMuiscOpenClose() {
        this._bgMusicSwitch = !this._bgMusicSwitch;
        if (this._bgMusicSwitch) {
            this.resumeMusic();
        }else {
            this.pauseMusic();
        }
        let val = this._bgMusicSwitch ? 1 : 0;
    }

    // public SetMuiscOpen() {
    //     this._musicSwitch = !this._musicSwitch;
    //     let val = this._musicSwitch ? 1 : 0;
    // }

    private _currentOnceId:number = NaN;
    private _loadingEffect:boolean = false;
    private playEffectSound(path:string,single:boolean =false){
        if (this._bgMusicSwitch == false ||this._loadingEffect){
            return;
        }

        if(!isNaN(this._currentOnceId) && single){
            if(cc.audioEngine.getState(this._currentOnceId) == cc.audioEngine.AudioState.PLAYING){
                return;
            }
        }
        if(this._clipMaps[path]){
            this._currentOnceId = cc.audioEngine.play(this._clipMaps[path],false,this._volume);
        }else{
            this._loadingEffect = true;
            cc.loader.loadRes(path, cc.AudioClip, (err, clip)=>{
                this._currentOnceId = cc.audioEngine.play(clip,false,this._volume);
                this._clipMaps[path] = clip;
                this._loadingEffect = false;
                console.log("sound start:",this._currentOnceId,path);
            });
        }
    }

    private _currentBgId:number = NaN;
    private _loadingMusic:boolean = false;
    private playMusicSound(path:string){
        if (this._bgMusicSwitch == false ||this._loadingMusic){
            return;
        }
        if(!isNaN(this._currentBgId)){
            cc.audioEngine.stop(this._currentBgId);
        }
        if(this._clipMaps[path]){
            this._currentBgId = cc.audioEngine.play(this._clipMaps[path],true,this._bgVolume);
        }else{
            this._loadingMusic = true;
            cc.loader.loadRes(path, cc.AudioClip, (err, clip)=>{
                this._currentBgId = cc.audioEngine.play(clip,true,this._bgVolume);
                this._clipMaps[path] = clip;
                this._loadingMusic = false;
                console.log("music start:",this._currentBgId,path);
            });
        }
    }

    public resumeMusic(){
        if(isNaN(this._currentBgId)){
            this.playMusicSound(SoundConst.Bg_sound);
        }else{
            cc.audioEngine.resume(this._currentBgId);
            console.log("music resume:",this._currentBgId);
        }
    }

    public pauseMusic(){
        if(!isNaN(this._currentBgId)){
            cc.audioEngine.pause(this._currentBgId);
            console.log("music pause:",this._currentBgId);
        }
    }
    /**
     * 播放按钮声音
     */
    public playBtnSound(){
        this.playEffectSound(SoundConst.Btn_sound);
    }
    public playSlotSound(){
        this.playEffectSound(SoundConst.Slot_sound);
    }
    public playBgSound(){
        this.playMusicSound(SoundConst.Bg_sound);
    }
    public playBigWinBgSound(){
        this.playMusicSound(SoundConst.BigWin_Bg_sound);
    }
    public playFarmBgSound(){
        this.playMusicSound(SoundConst.Farm_Bg_sound);
    }
    public playCoinflySound(len:number){
        this.playEffectSound(SoundConst["Coinfly_sound_"+len]);
    }
    public playLevelupSound(){
        this.playEffectSound(SoundConst.Levelup_sound);
    }
    public playBigWinLockSound(){
        this.playEffectSound(SoundConst.bigWinLock_sound);
    }
    public playPlantSound(){
        this.playEffectSound(SoundConst.Plant_sound);
    }
    public playStarBounceSound(){
        this.playEffectSound(SoundConst.Star_Bounce_sound);
    }

    public playWaterSound(){
        this.playEffectSound(SoundConst.Water_sound);
    }
    public playPickSound(){
        this.playEffectSound(SoundConst.Pick_sound,true);
    }
}

export class SoundConst {
    public static Slot_sound:string ="sounds/slot"
    public static Btn_sound:string ="sounds/btn";
    public static Bg_sound:string ="sounds/bgmusic";
    public static BigWin_Bg_sound:string ="sounds/bigwinbgmusic";
    public static Coinfly_sound_5:string ="sounds/coinfly_1";
    public static Coinfly_sound_10:string ="sounds/coinfly_2";
    public static Coinfly_sound_20:string ="sounds/coinfly_3";
    public static Levelup_sound:string ="sounds/levelup";
    public static bigWinLock_sound:string ="sounds/bigwinlock";
    public static Farm_Bg_sound:string ="sounds/farm";
    public static Plant_sound:string ="sounds/plant";
    public static Star_Bounce_sound:string ="sounds/star";
    public static Water_sound:string ="sounds/water";
    public static Pick_sound:string ="sounds/pick";
}

export var SOUND = SoundManager.getInstance();