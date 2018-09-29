import InteractiveObject from "./InteractiveObject";
import Event from "./Event";
import Util from "./Util";
import Matrix3 from "./Matrix3";
import Vec3 from "./Vec3";
import Global from "./Global";

export default class Label extends InteractiveObject {
  constructor() {
    super();
    this.name = "Label";
    this._color = "#000000";
    this._textAlign = "left";
    this._text = "";
    this._textBaseline = "alphabetic"; // equal to baseline
    this._font = "arial";
    this._size = 12;
    this._wordWrap = false;
    this._fontHeight = 0;
    this._fillX = 0;
    this._areas = [];
    this._bindEvents();
  }

  show(matrix) {
    if (!super.show(matrix)) {
      return false;
    }

    let ctx = this.ctx || this.stage.ctx;
    ctx.strokeStyle = this._color;
    ctx.fillStyle = this._color;
    ctx.font = this._size + "px " + this._font;
    ctx.textAlign = this._textAlign;
    ctx.textBaseline = this._textBaseline;

    let text = this._text;
    let areas = this._areas;
    let fontHeight = this._fontHeight;
    for (let i = 1, len = this._areas.length; i < len; i += 1) {
      ctx.fillText(
        text.slice(areas[i - 1], areas[i]),
        this._fillX,
        i * fontHeight
      );
    }

    return true;
  }

  isMouseOn(cord) {
    let vec = new Vec3(cord.x, cord.y, 1);
    let inverse = Matrix3.inverse(this._matrix);
    let area = [
      [0, 0],
      [this._width, 0],
      [this._width, this._height],
      [0, this._height]
    ];

    vec.multiMatrix3(inverse);
    return Util.pip([vec.x, vec.y], area);
  }

  getBounds() {
    let sx = Global.maxNumber;
    let ex = Global.minNumber;
    let sy = Global.maxNumber;
    let ey = Global.minNumber;
    let area = [
      [0, 0],
      [this._width, 0],
      [this._width, this._height],
      [0, this._height]
    ];

    let matrix = this._matrix;
    let vec3s = Util.map(area, item => {
      let vec = new Vec3(item[0], item[1], 1);
      return vec.multiMatrix3(matrix);
    });

    Util.each(vec3s, item => {
      sx = item.x < sx ? item.x : sx;
      ex = item.x > ex ? item.x : ex;
      sy = item.y < sy ? item.y : sy;
      ey = item.y > ey ? item.y : ey;
    });

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

  _bindEvents() {
    this.on(Event.ADD_TO_STAGE, () => {
      this._compute();
    });
  }

  _compute() {
    let textLen = this._text.length;
    this._fontHeight = this._computeLineHeight();
    this._areas = [];
    if (this._wordWrap) {
      this._areas = this._areas.concat(0, this._computeAreas(), textLen);
    } else {
      this._areas.push(0, this._text.length);
    }
  }

  _computeLineHeight() {
    return (
      wx.getTextLineHeight({
        text: "Hg",
        fontWeight: "normal",
        fontStyle: "normal",
        fontFamily: this._font,
        fontSize: this._size
      }) || this._height * 1.2
    );
  }

  _computeAreas() {
    let cache = {};
    let ctx = this.ctx || this.stage.ctx;
    let text = this._text;
    let tWidth = this._width;
    let count = 0;
    let areas = [];

    ctx.strokeStyle = this._color;
    ctx.fillStyle = this._color;
    ctx.font = this._size + "px " + this._font;
    ctx.textAlign = this._textAlign;
    ctx.textBaseline = this._textBaseline;

    for (let i = 0, len = text.length; i < len; i += 1) {
      let char = text.charAt(i);
      let width = 0;

      if (char === "\n") {
        count = 0;
        areas.push(i);
        continue;
      }

      if (cache[char]) {
        width = cache[char];
      } else {
        width = ctx.measureText(char).width;
      }

      count += width;
      if (count >= tWidth) {
        count = 0;
        areas.push((i -= 1));
      }
    }

    return areas;
  }

  get color() {
    return this._color;
  }

  set color(color) {
    this._color = color;
  }

  get textAlign() {
    return this._textAlign;
  }

  set textAlign(textAlign) {
    this._textAlign = textAlign;

    // jshint ignore: start
    switch (textAlign) {
      case "end":
      case "right":
        this._fillX = this._width;
        break;
      case "center":
        this._fillX = this._width / 2;
        break;
      case "start":
      case "left":
      default:
        this._fillX = 0;
        break;
    }
    // jshint ignore: end
  }

  get textBaseline() {
    return this._textBaseline;
  }

  set textBaseline(textBaseline) {
    this._textBaseline = textBaseline;
  }

  get size() {
    return this._size;
  }

  set size(size) {
    this._size = size;
    if (this._addedToStage) {
      this._compute();
    }
  }

  get font() {
    return this._font;
  }

  set font(font) {
    this._font = font;
    if (this._addedToStage) {
      this._compute();
    }
  }

  get wordWrap() {
    return this._wordWrap;
  }

  set wordWrap(wordWrap) {
    this._wordWrap = wordWrap;
    if (this._addedToStage) {
      this._compute();
    }
  }

  get text() {
    return this._text;
  }

  set text(text) {
    this._text = ("" + text).replace("\r\n", "\n");
    if (this._addedToStage) {
      this._compute();
    }
  }

  // jshint ignore: start

  set width(width) {
    this._width = width;
  }

  set height(height) {
    this._height = height;
  }
  // jshint ignore: end
}
