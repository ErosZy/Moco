class Vec3 {
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  distance() {
    let { x, y, z } = this;
    return Math.sqrt(x * x + y * y + z * z);
  }

  multi(k) {
    if (k instanceof Vec3) {
      let { x, y, z } = k;
      return this.x * x + this.y * y + this.z * z;
    } else {
      this.x *= k;
      this.y *= k;
      this.z *= k;
    }

    return this;
  }

  divi(k) {
    if (k instanceof Vec3) {
      let { x, y, z } = k;
      return this.x / x + this.y / y + this.z / z;
    } else {
      this.x /= k;
      this.y /= k;
      this.z /= k;
    }

    return this;
  }

  add(vec3) {
    this.x += vec3.x;
    this.y += vec3.y;
    this.z += vec3.z;
    return this;
  }

  sub(vec3) {
    let clone = Vec3.clone(vec3);
    clone.multi(-1);
    this.add(clone);
    return this;
  }

  multiMatrix3(m) {
    let matrix = m.getMatrix();
    let { x, y, z } = this;
    this.x = x * matrix[0] + y * matrix[3] + z * matrix[6];
    this.y = x * matrix[1] + y * matrix[4] + z * matrix[7];
    this.z = x * matrix[2] + y * matrix[5] + z * matrix[8];
    return this;
  }

  static zero() {
    return new Vec3(0, 0, 0);
  }

  static clone(vec3) {
    return new Vec3(vec3.x, vec3.y, vec3.z);
  }

  static angle(v1, v2) {
    let c1 = Vec3.clone(v1);
    let c2 = Vec3.clone(v2);
    let rad = c1.multi(c2) / (v1.distance() * v2.distance());
    return Math.acos(rad);
  }

  static equal(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
  }

  static crossProduct(v1, v2) {
    return new Vec3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );
  }

  static proj(v1, v2) {
    let v = Vec3.clone(v2);
    let distance = v.distance();
    let vii = v.multi(
      Vec3.zero()
        .add(v1)
        .multi(v) /
        (distance * distance)
    );
    return v1.sub(vii);
  }

  static norm(vec3) {
    let clone = Vec3.clone(vec3);
    let distance = clone.distance();
    if (distance) {
      return clone.multi(1 / distance);
    } else {
      throw new Error("zero vec3 cant be norm");
    }
  }
}

module.exports = Vec3;
