import DisplayObject from "./DisplayObject";
import Util from "./Util";
import Vec3 from "./Vec3";
import Matrix3 from "./Matrix3";
import Global from "./Global";

class Shape extends DisplayObject {
  constructor() {
    super();
    this.name = "Shape";
    this._showList = [];
    this._setList = [];
  }

  on() {
    console.error(
      "shape object can't interative event, please add shape to sprite"
    ); // jshint ignore:line
  }

  off() {
    console.error(
      "shape object can't interative event, please add shape to sprite"
    ); // jshint ignore:line
  }

  show(matrix) {
    let ctx = this.ctx || this.stage.ctx;
    let showList = this._showList;
    if (!super.show(matrix)) {
      return false;
    }

    for (let i = 0, len = showList.length; i < len; i += 1) {
      let showListItem = showList[i];
      if (typeof showListItem === "function") {
        showListItem();
      }
    }

    return true;
  }

  lineWidth(thickness) {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.lineWidth = thickness;
    });
  }

  strokeStyle(color) {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.strokeStyle = color;
    });
  }

  stroke() {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.stroke();
    });
  }

  beginPath() {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.beginPath();
    });
  }

  closePath() {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.closePath();
    });
  }

  moveTo(x, y) {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.moveTo(x, y);
    });
  }

  lineTo(x, y) {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.lineTo(x, y);
    });
  }

  clear() {
    this._showList = [];
    this._setList = [];
  }

  rect(x, y, width, height) {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.rect(x, y, width, height);
    });

    this._setList.push({
      type: "rect",
      area: [x, y, width, height]
    });
  }

  fillStyle(color) {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.fillStyle = color;
    });
  }

  fill() {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.fill();
    });
  }

  arc(x, y, r, sAngle, eAngle, direct) {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.arc(x, y, r, sAngle, eAngle, direct);
    });

    this._setList.push({
      type: "arc",
      area: [x, y, r, sAngle, eAngle, direct]
    });
  }

  drawArc(thickness, lineColor, arcArgs, isFill, color) {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.beginPath();
      ctx.arc(
        arcArgs[0],
        arcArgs[1],
        arcArgs[2],
        arcArgs[3],
        arcArgs[4],
        arcArgs[5]
      );

      if (isFill) {
        ctx.fillStyle = color;
        ctx.fill();
      }

      ctx.lineWidth = thickness;
      ctx.strokeStyle = lineColor;
      ctx.stroke();
    });

    this._setList.push({
      type: "arc",
      area: arcArgs
    });
  }

  drawRect(thickness, lineColor, rectArgs, isFill, color) {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.beginPath();
      ctx.rect(rectArgs[0], rectArgs[1], rectArgs[2], rectArgs[3]);

      if (isFill) {
        ctx.fillStyle = color;
        ctx.fill();
      }

      ctx.lineWidth = thickness;
      ctx.strokeStyle = lineColor;
      ctx.stroke();
    });

    this._setList.push({
      type: "rect",
      area: rectArgs
    });
  }

  drawVertices(thickness, lineColor, vertices, isFill, color) {
    let len = vertices.length;
    if (len < 3) {
      return;
    }

    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.beginPath();
      ctx.moveTo(vertices[0][0], vertices[0][1]);

      for (let i = 1; i < len; i += 1) {
        let pointArr = vertices[i];
        ctx.lineTo(pointArr[0], pointArr[1]);
      }

      ctx.lineTo(vertices[0][0], vertices[0][1]);

      if (isFill) {
        ctx.fillStyle = color;
        ctx.fill();
      }

      ctx.lineWidth = thickness;
      ctx.strokeStyle = lineColor;
      ctx.closePath();
      ctx.stroke();
    });

    this._setList.push({
      type: "vertices",
      area: vertices
    });
  }

  drawLine(thickness, lineColor, points) {
    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.beginPath();
      ctx.moveTo(points[0], points[1]);
      ctx.lineTo(points[2], points[3]);
      ctx.lineWidth = thickness;
      ctx.strokeStyle = lineColor;
      ctx.closePath();
      ctx.stroke();
    });
  }

  lineStyle(thickness, color, alpha) {
    if (alpha) {
      this.alpha = alpha;
    }

    this._showList.push(() => {
      let ctx = this.ctx || this.stage.ctx;
      ctx.lineWidth = thickness;
      ctx.strokeStyle = color;
    });
  }

  add(fn) {
    this._showList.push(() => {
      fn.call(this);
    });
  }

  isMouseOn(cord) {
    let vec = new Vec3(cord.x, cord.y, 1);
    let inverse = Matrix3.inverse(this._matrix);
    vec.multiMatrix3(inverse);

    let setList = this._setList;
    for (let i = 0, len = setList.length; i < len; i += 1) {
      let item = setList[i];
      let area = item.area; // jshint ignore:line
      let minRect = {}; // jshint ignore:line

      // jshint ignore:start
      switch (item.type) {
        case "rect":
          area = [
            [area[0], area[1]],
            [area[0] + area[2], area[1]],
            [area[0] + area[2], area[1] + area[3]],
            [area[0], area[1] + area[3]]
          ];
        case "vertices":
          break;
        case "arc":
          minRect = this._computeArcMinRect.apply(this, area);
          area = [
            [minRect.s1v.x, minRect.s1v.y],
            [minRect.s2v.x, minRect.s2v.y],
            [minRect.e2v.x, minRect.e2v.y],
            [minRect.e1v.x, minRect.e1v.y]
          ];
          break;
      }
      // jshint ignore:end

      if (Util.pip([vec.x, vec.y], area)) {
        return true;
      }
    }

    return false;
  }

  getBounds() {
    let setList = this._setList;
    let sx = Global.maxNumber;
    let ex = Global.minNumber;
    let sy = Global.maxNumber;
    let ey = Global.minNumber;

    for (let i = 0, len = setList.length; i < len; i += 1) {
      let item = setList[i];
      let area = item.area; // jshint ignore:line
      let minRect = {}; // jshint ignore:line
      let vec3s = [];

      // jshint ignore:start
      switch (item.type) {
        case "rect":
          area = [
            [area[0], area[1]],
            [area[0] + area[2], area[1]],
            [area[0] + area[2], area[1] + area[3]],
            [area[0], area[1] + area[3]]
          ];
        case "vertices":
          vec3s = Util.map(area, item => {
            let vec = new Vec3(item[0], item[1], 1);
            return vec.multiMatrix3(this._matrix);
          });
          break;
        case "arc":
          minRect = this._computeArcMinRect.apply(this, area);
          vec3s = Util.map(minRect, item => {
            return item.multiMatrix3(this._matrix);
          });
          break;
      }
      // jshint ignore:end

      Util.each(vec3s, item => {
        sx = item.x < sx ? item.x : sx;
        ex = item.x > ex ? item.x : ex;
        sy = item.y < sy ? item.y : sy;
        ey = item.y > ey ? item.y : ey;
      });
    }

    if (
      sx === Global.maxNumber ||
      ex === Global.minNumber ||
      sy === Global.maxNumber ||
      ey === Global.minNumber
    ) {
      sx = sy = ex = ey = 0;
    }

    return {
      sv: new Vec3(sx, sy, 1),
      ev: new Vec3(ex, ey, 1)
    };
  }

  _computeArcMinRect(ox, oy, r, sAngle, eAngle, direct) {
    let sx = 0;
    let sy = 0;
    let ex = 0;
    let ey = 0;

    sAngle = Util.rad2deg(sAngle);
    eAngle = Util.rad2deg(eAngle);

    if (Math.abs(eAngle - sAngle) / 360 >= 1) {
      return {
        s1v: new Vec3(ox - r, oy - r, 1),
        s2v: new Vec3(ox + r, oy - r, 1),
        e1v: new Vec3(ox - r, oy + r, 1),
        e2v: new Vec3(ox + r, oy + r, 1)
      };
    }

    sAngle = sAngle - Math.floor(sAngle / 360) * 360;
    eAngle = eAngle - Math.floor(eAngle / 360) * 360;

    if (direct) {
      [sAngle, eAngle] = [eAngle, sAngle];
    }

    let rotateAngle = 0;
    if (sAngle < 180 && sAngle >= 90) {
      rotateAngle = 90;
    } else if (sAngle < 270 && sAngle >= 180) {
      rotateAngle = 180;
    } else if (sAngle < 360 && sAngle >= 270) {
      rotateAngle = 270;
    }

    sAngle -= rotateAngle;
    eAngle -= rotateAngle;
    sAngle = sAngle < 0 ? sAngle + 360 : sAngle;
    eAngle = eAngle < 0 ? eAngle + 360 : eAngle;

    let sin = Math.sin;
    let cos = Math.cos;
    let v1 = Vec3.zero();
    let v2 = Vec3.zero();

    if (eAngle < 90 && eAngle > sAngle) {
      let o1 = Util.deg2rad(sAngle);
      let o2 = Util.deg2rad(eAngle);
      v1 = new Vec3(cos(o2) * r, sin(o1) * r, 1);
      v2 = new Vec3(cos(o1) * r, sin(o2) * r, 1);
    } else if (eAngle < 90 && eAngle < sAngle) {
      v1 = new Vec3(-r, -r, 1);
      v2 = new Vec3(r, r, 1);
    } else if (eAngle < 180 && eAngle >= 90) {
      let o = Util.deg2rad(Math.min(180 - eAngle, sAngle));
      let o1 = Util.deg2rad(sAngle);
      let o2 = Util.deg2rad(180 - eAngle);
      v1 = new Vec3(-cos(o2) * r, sin(o) * r, 1);
      v2 = new Vec3(cos(o1) * r, r, 1);
    } else if (eAngle < 270 && eAngle >= 180) {
      let o1 = Util.deg2rad(sAngle);
      let o2 = Util.deg2rad(eAngle - 180);
      v1 = new Vec3(-r, -sin(o2) * r, 1);
      v2 = new Vec3(cos(o1) * r, r, 1);
    } else if (eAngle < 360 && eAngle >= 270) {
      let o = Util.deg2rad(Math.min(360 - eAngle, sAngle));
      v1 = new Vec3(-r, -r, 1);
      v2 = new Vec3(cos(o) * r, r, 1);
    }

    let translateMat = Matrix3.translation(ox, oy);
    let rotateMat = Matrix3.rotation(rotateAngle);
    let mat = translateMat.multi(rotateMat);

    v1.multiMatrix3(mat);
    v2.multiMatrix3(mat);

    if (v1.x < v2.x) {
      [sx, ex] = [v1.x, v2.x];
    } else {
      [sx, ex] = [v2.x, v1.x];
    }

    if (v1.y < v2.y) {
      [sy, ey] = [v1.y, v2.y];
    } else {
      [sy, ey] = [v2.y, v1.y];
    }

    return {
      s1v: new Vec3(sx, sy, 1),
      s2v: new Vec3(ex, sy, 1),
      e1v: new Vec3(sx, ey, 1),
      e2v: new Vec3(ex, ey, 1)
    };
  }

  get width() {
    let bounds = this.getBounds();
    return Math.abs(bounds.ev.x - bounds.sv.x);
  }

  get height() {
    let bounds = this.getBounds();
    return Math.abs(bounds.ev.y - bounds.sv.y);
  }
}

module.exports = Shape;
