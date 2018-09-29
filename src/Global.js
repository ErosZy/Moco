import Vec3 from "./Vec3";

export default class Global {
  static get guid() {
    this._guid = this._guid || 0;
    return this._guid;
  }

  static set guid(guid) {
    this._guid = guid;
  }

  static get fnRegExp() {
    return /\s+/g;
  }

  static get maxNumber() {
    return Number.MAX_VALUE;
  }

  static get minNumber() {
    return -1 * Number.MAX_VALUE;
  }

  static get maxNumberVec3() {
    let maxNumber = Number.MAX_VALUE;
    return new Vec3(maxNumber, maxNumber, 1);
  }

  static get minNumberVec3() {
    let minNumber = -1 * Number.MAX_VALUE;
    return new Vec3(minNumber, minNumber, 1);
  }
}
