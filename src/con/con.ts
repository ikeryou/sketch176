import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Param } from '../core/param';
import { Conf } from '../core/conf';
import { Color } from "three/src/math/Color";
import { Item } from './item';
import { Util } from '../libs/util';
import { Scroller } from '../core/scroller';
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import Snd from 'snd-lib';

export class Con extends Canvas {

  private _con: Object3D;
  private _item:Array<Item> = []
  private _colors:Array<Color> = []
  private _heightEl:any
  // private _playCnt:number = 0

  private _snd:Snd
  private _isSndLoaded:boolean = false

  constructor(opt: any) {
    super(opt);

    this._heightEl = document.querySelector('.js-height')

    Param.instance.bgColor = new Color(Util.instance.random(0,1), Util.instance.random(0,1), Util.instance.random(0,1))

    this._con = new Object3D()
    this.mainScene.add(this._con)

    this._snd = new Snd()
    this._snd.load(Snd.KITS.SND01).then(() => {

      document.querySelector('.js-start')?.classList.add('-show')
      document.querySelector('.js-start')?.addEventListener('click', () => {
        if(this._isSndLoaded) return
        this._snd.play(Snd.SOUNDS.TAP)
        this._isSndLoaded = true
        document.querySelector('.js-start')?.classList.remove('-show')
      })
    })


    // 共通ジオメトリ
    const geo = new PlaneGeometry(1,1)

    // アイテム作成
    this._makeColors()
    for(let i = 0; i < Conf.instance.ITEM_NUM; i++) {
      const ix = i % Conf.instance.LINE
      if(ix % 4 == 0) {
        this._makeColors()
      }

      const item = new Item({
          geo:geo,
          col:this._colors,
          id:i,
      })
      if(i == 0) {
        item.onRotate = () => {
          this._eRotate()
        }
      }
      this._con.add(item)
      this._item.push(item)
    }

    setTimeout(() => {
      Scroller.instance.set(0)
    }, 500);
    setTimeout(() => {
      Param.instance.isStart = true
    }, 700);

    this._resize()
  }


  private _eRotate(): void {
    if(this._isSndLoaded) {
      // console.log('_eRotate')
      // this._playCnt++
      // const type = this._playCnt % 4 == 0 ? Snd.SOUNDS.TOGGLE_OFF : Snd.SOUNDS.TAP
      this._snd.play(Snd.SOUNDS.TAP)
    }
  }


  protected _update(): void {
    super._update()

    // const w = this.renderSize.width
    const h = this.renderSize.height
    // const s = Scroller.instance.val.y

    // スクロールするサイズはこっちで指定
    this.css(this._heightEl, {
      height:(h * Conf.instance.SCROLL_HEIGHT) + 'px'
    })

    const sizeX = this._item[0].itemSize.x
    const sizeY = this._item[0].itemSize.y
    let line = Conf.instance.LINE
    const yNum = ~~(this._item.length / line)
    this._item.forEach((val,i) => {
      const iy = ~~(i / line)
      const ix = i % line
      val.position.x = sizeX * ix - (sizeX * line * 0.5) + sizeX * 0.5
      val.position.y = sizeY * iy - (yNum * sizeY * 0.5)

      if(iy % 2 != 0) {
        val.scale.y = -1
        val.scale.x = 1
      } else {
        val.scale.y = 1
        val.scale.x = -1
      }

      if(ix % 2 != 0) {
        val.position.x += sizeX
      }
      if(iy % 2 != 0) {
        val.position.x -= sizeX
      }
    })

    this._con.position.y = Func.instance.screenOffsetY() * -1

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(Param.instance.bgColor, 1)
    this.renderer.render(this.mainScene, this.camera)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    if(Conf.instance.IS_SP || Conf.instance.IS_TAB) {
      if(w == this.renderSize.width && this.renderSize.height * 2 > h) {
        return
      }
    }

    this.renderSize.width = w;
    this.renderSize.height = h;

    this.updateCamera(this.camera, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }


  // ------------------------------------
  // 使用カラー作成
  // ------------------------------------
  private _makeColors():void {
    this._colors = []

    const colA = new Color(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1))
    const colB = new Color(1 - colA.r, 1 - colA.g, 1 - colA.b)

    const hslA = { h: 0, s: 0, l: 0 }
    colA.getHSL(hslA)

    const hslB = { h: 0, s: 0, l: 0 }
    colB.getHSL(hslB)

    const r = 0.5
    for(let i = 0; i < 20; i++) {
      const hslA = { h: 0, s: 0, l: 0 }
      colA.getHSL(hslA)
      hslA.s += Util.instance.range(r)
      hslA.l += Util.instance.range(r)

      const hslB = { h: 0, s: 0, l: 0 }
      colB.getHSL(hslB)
      hslB.s += Util.instance.range(r)
      hslB.l += Util.instance.range(r)

      const colC = new Color()
      colC.setHSL(hslA.h, hslA.s, hslA.l)
      this._colors.push(colC)

      const colD = new Color()
      colD.setHSL(hslB.h, hslB.s, hslB.l)
      this._colors.push(colD)
    }
  }
}
