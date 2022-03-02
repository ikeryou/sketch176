import triVs from '../glsl/tri.vert';
import triFs from '../glsl/tri.frag';
import { Util } from "../libs/util";
import { Mesh } from 'three/src/objects/Mesh';
import { DoubleSide } from 'three/src/constants';
import { Func } from "../core/func";
import { Vector3 } from "three/src/math/Vector3";
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Object3D } from "three/src/core/Object3D";
import { Scroller } from "../core/scroller";
import { Conf } from '../core/conf';
import { MyObject3D } from '../webgl/myObject3D';
import { Vector2 } from "three/src/math/Vector2";

export class Item extends MyObject3D {

  private _id:number
  private _con:Object3D
  private _tri:Mesh
  private _nowRotPos:number = 0
  private _dotSize:number = Util.instance.randomInt(36, 70)

  public itemSize:Vector3 = new Vector3()
  public onRotate:any

  constructor(opt:any = {}) {
    super()

    this._id = opt.id

    this._con = new Object3D()
    this.add(this._con)

    this._tri = new Mesh(
      opt.geo,
      new ShaderMaterial({
        vertexShader:triVs,
        fragmentShader:triFs,
        transparent:true,
        side:DoubleSide,
        uniforms:{
          alpha:{value:1},
          color:{value:opt.col[0]},
          r:{value:new Vector2()},
          dotSize:{value:1},
          useDot:{value:this._id % 3 == 0 ? 1 : 0},
        }
      })
    )
    this._con.add(this._tri)

    // 基準点ずらす
    this._tri.position.x = 0.5
  }


  // ---------------------------------
  // 更新
  // ---------------------------------
  protected _update():void {
    super._update()

    const sw = Func.instance.sw()
    const sh = Func.instance.sh()
    const s = Scroller.instance.val.y

    const sukima = 0.9
    this._con.position.y = 0
    const num = Conf.instance.ROT_NUM
    const it = (Conf.instance.SCROLL_HEIGHT * sh - sh) / num

    let nowRotPos = 0

    for(let i = 0; i < num; i++) {
      const start = i * it
      const end = start + (it * sukima)
      const r = Util.instance.map(s, 0, 1, start, end)
      const nowAng = 180 * i
      const addAng = i % 2 == 0 ? 180 : -180
      if(i == 0 || r > 0) this._con.rotation.z = Util.instance.radian(Util.instance.mix(nowAng, nowAng + addAng, r))

      if(i % 2 != 0 && r >= 1) {
        this._tri.position.y = 0.5
      }

      if(i % 2 == 0 && r >= 1) {
        this._tri.position.y = -0.5
      }

      if(i == 0 && r < 1) {
        this._tri.position.y = 0.5
      }

      if(r >= 1) this._con.position.y -= this._con.scale.y

      if(r >= 1) {
        nowRotPos = i + 1
      }

      if(r <= 0 && i == 0) {
        nowRotPos = -1
      }


    }



    if(this._id == 0) {
      // console.log(nowRotPos)
      if(this._nowRotPos != nowRotPos) {
        this._call(this.onRotate)
      }
    }
    this._nowRotPos = nowRotPos

    const size = sw / Conf.instance.LINE
    this._con.scale.set(size, size, 1)

    this.itemSize.x = size
    this.itemSize.y = size

    this._setUni(this._tri, 'r', new Vector2(size, size))
    this._setUni(this._tri, 'dotSize', Func.instance.val(120, this._dotSize) * 0.001 * 2)
  }
}