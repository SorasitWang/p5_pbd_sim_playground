// you can try it out on https://editor.p5js.org/


// -------------- helpers ------------------ // 
// function mod(p1, p2) {
//    return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]))
// }


const Epsilon = 1e-2

function isColGround(p, x, offset = 0) {
  // if proposed postion and current postion are on the opposite side
  // and current pos is near surface

  return ground.distance(p) < dotRadius
  //return pos[1]+2.5+offset >= screenY-groundH
}

function isColGroundNormal(pos, offset) {
  return ground.distance(pos) < dotRadius
}
function updateDistanceConstraintPosition(v1, v2, d, k) {

  let mag = modVec2(new Vec2(v1.p), new Vec2(v2.p));
  // if (mag >= 3*d)

  //     return false
  k = 0.99
  let s1 = 1.0 * (-v1.w) / (v1.w + v2.w) * (mag - d) / mag;
  let s2 = 1.0 * v2.w / (v1.w + v2.w) * (mag - d) / mag;
  v1.p[0] += s1 * (v1.p[0] - v2.p[0]) * k;
  v1.p[1] += s1 * (v1.p[1] - v2.p[1]) * k;
  v2.p[0] += s2 * (v1.p[0] - v2.p[0]) * k;
  v2.p[1] += s2 * (v1.p[1] - v2.p[1]) * k;

  return true
}
function updatePositionConstraintPosition(v, anchor, d, k) {

  //console.log(v.p,anchor,k)
  let mag = modVec2(new Vec2(v.p), new Vec2(anchor));
  let s = (mag - d) / mag;
  v.p[0] -= s * (v.p[0] - anchor[0]) * k;
  v.p[1] -= s * (v.p[1] - anchor[1]) * k;
  return true

}

function colSphere(obs, vertex) {
  let center = new Vec2(obs.x)
  let pos = new Vec2(vertex.p)
  if (modVec2(center, pos) < obs.rad) {
    //console.log("col")
    //       
    let dir = normalizeVec2(subVec2(pos, center))
    //console.log(dir.size())
    let newPos = addVec2(center, mulSc(dir, obs.rad))
    let v = new Vec2(vertex.p)
    let diff = subVec2(newPos, v)
    //console.log(center.val,mouseX,mouseY)
    vertex.p = addVec2(v, mulSc(diff, 1)).val
  }
}

function colSelf(v1, v2) {
  let v1_ = new Vec2(v1.p)
  let v2_ = new Vec2(v2.p)

  if (modVec2(v1_, v2_) < 2 * dotRadius) {
    let dir = normalizeVec2(subVec2(v2_, v1_))
    let newPos = addVec2(v1_, mulSc(dir, 2 * dotRadius))
    let diff = mulSc(subVec2(newPos, v2_), 0.5)
    v1.p = addVec2(v1_, mulSc(diff, -0.5)).val
    v2.p = addVec2(v2_, mulSc(diff, 0.5)).val
  }
}
function updateColConstraintPosition(k) {

  c++
  for (let i = 0; i < verts.length; i++) {
    // check ground

    // if (c%100 ==0 && i==verts.length-1){
    //   console.log(verts[i].p,ground.side(verts[i].p),verts[i].x,ground.side(verts[i].x))
    // }
    if (isColGround(verts[i].p, verts[i].x)) {

      verts[i].p = ground.closetPoint(verts[i].p, dotRadius)
    }



    // col with obstruct
    colSphere(obs, verts[i])

    // self collision
    for (let j = i + 1; j < verts.length; j++) {
      colSelf(verts[i], verts[j]);
    }


  }


  return true
}
let c = 0
function updateBendingConstraintPosition1(v1, v2, v3, angle, stiffness, dd) {
  let v1_ = new Vec2(v1.p);
  let v2_ = new Vec2(v2.p);
  let v3_ = new Vec2(v3.p);
  angle = radians(angle)
  let allLength = 1 / (v1_.size() * v1_.size() + v2_.size() * v2_.size() + v3_.size() * v3_.size())
  let allW = 1 / (v1.w + v2.w + v3.w)
  // let n1 = normalizeVec2(crossVec2(v1_,v2_))
  // let n2 = normalizeVec2(crossVec2(v1_,v3_))
  // let d = dotVec2(n1,n2)
  let n1 = normalVec2(v1_, v2_)
  let n2 = normalVec2(v1_, v3_)
  let d = dotVec2(n1, n2)
  if (d < 1 + 0.00001 && d >= 1) d = 1
  let s1 = -3 * v1.w * allW * Math.sqrt(1 - d * d) * (Math.acos(d) - angle) * stiffness * allLength
  let s2 = -3 * v2.w * allW * Math.sqrt(1 - d * d) * (Math.acos(d) - angle) * stiffness * allLength
  let s3 = -3 * v3.w * allW * Math.sqrt(1 - d * d) * (Math.acos(d) - angle) * stiffness * allLength

  //if (d < 1) console.log(d)
  v1.p = addVec2(mulSc(v1_, s1), v1_).val
  v2.p = addVec2(mulSc(v2_, s2), v2_).val
  v3.p = addVec2(mulSc(v3_, s3), v3_).val
  return true
}

function updateBendingConstraintPosition(v1, v2, v3, angle, stiffness, dd) {

  let v1_ = new Vec2(v1.p)
  let v2_ = new Vec2(v2.p)
  let v3_ = new Vec2(v3.p)
  let center = mulSc(addVec2(addVec2(v1_, v2_), v3_), 0.333333)
  let dirCenter = subVec2(v3_, center)

  let distCenter = dirCenter.size()
  let diff = 1 - (dd / distCenter)
  let ww = 1 / (v1.m + v1.m + v1.m)
  let mass = v1.m
  let dirForce = mulSc(dirCenter, diff)
  let fa = mulSc(dirForce, stiffness * (2 * mass * ww));
  //if (c++%500 ==0)
  //console.log(fa)
  v1.p = addVec2(fa, v1_).val;

  let fb = mulSc(dirForce, stiffness * (2 * mass * ww));
  v2.p = addVec2(fb, v2_).val;

  let fc = mulSc(dirForce, -stiffness * (4 * mass * ww));
  v3.p = addVec2(fc, v3_).val;
  return true
}

function makeTwoVertexDistanceConstraint(v1, v2, d, stiffness) {
  return new Constraint(
    "distance",
    (verts) => updateDistanceConstraintPosition(verts[v1], verts[v2], d, stiffness),
    stiffness);
}

function makePositionConstraint(v, anchor, d, stiffness) {
  return new Constraint(
    "position",
    (verts) => updatePositionConstraintPosition(v, anchorMouse, d, stiffness),
    stiffness);
}
function makeColConstraint(stiffness) {
  return new Constraint(
    "ground",
    (verts) => updateColConstraintPosition(stiffness),
    stiffness);
}


function makeBendintConsraints(v1, v2, v3, angle, stiffness, d) {
  return new Constraint(
    "bending",
    (verts) => updateBendingConstraintPosition(verts[v1], verts[v2], verts[v3], angle, stiffness, d),
    stiffness);
}


// --------------- application --------------- //


const constraints = [];
const edges = []; // only visual

//const ball = new Ball(screenX/2,0);
let isInitialized = false;

let dragIndex = -1;
let lastUpdateTime;
const verts = [];
let anchorMouse = [400, 600];

const groundH = 300;
const ground = new Line([0, screenY - 300], [screenX, screenY - 200], [0, 0])
const pond = new Pond([0, screenY - 400], [screenX, screenY - 400], [0, 0])
const ball = new Sphere([0, 0], 20)
const sphere_ = new Sphere([screenX / 2, 0], 40)
const obs = new Sphere([500, 500], 30)
let state = 0;
const SCALE_TIME = 0.001
function initialize() {
  // creates a vertex matrix



  const D = 10.0;
  const NStep = 100;
  const K = 1;
  // verts.push(ball);
  //    for(let i=0;i<N;i++){
  //     verts.push(new Vertex([screenX/2,-100-i*10],[0.0,0.0],0.5,[0.0,0.0]))

  //    }


  for (let i = 0; i < N; i++) {
    verts.push(new Vertex([400, 400 + (-i * 10)], [0.0, 0.0], dotMass, [0.0, 0.0]))
    if (i < N - 1)
      constraints.push(makeTwoVertexDistanceConstraint(i, i + 1, D, K));
  }

  for (let i = 1; i < N - 1; i++) {
    constraints.push(makeBendintConsraints(i - 1, i, i + 1, 180, 0.1, D));
  }

  constraints.push(makePositionConstraint(verts[0], anchorMouse, 100, K));
  constraints.push(makeColConstraint(1));

  setAnchor([400, 400])

  isInitialized = true;
}


function setup() {

  createCanvas(screenX, screenY);

  frameRate(30)
  lastUpdateTime = 0;
  initialize();
  dragIndex = verts.length - 1; //Math.floor(verts.length / 2);

}

function calExternalForce() {
  // a = f/m , f*w

  // gravity

  let gForce = new Vec2([0, G * dotMass])
  let forces = [];
  // friction

  const ukGround = 2
  const usGround = 5;
  for (let i = 0; i < verts.length; i++) {
    forces.push(new Vec2([0, 0]))

    let f = -1
    // TODO : Generalize to any orientation of ground's surface
    if (isColGroundNormal(verts[i].x, 0.01)) {
      // project vertex's velocity to plane of ground
      /*f = uGround * verts[i].m * 1000
     
      f = min(abs(verts[i].v[0]),f*deltaTime*SCALE_TIME)
      f *=  Math.sign(verts[i].v[0])
      if (Math.abs(verts[i].v[0]) < Epsilon){
        
        f = 0
      }
      f = mulSc(new Vec2([1,0]),f)
       c++;
     
      forces[i] = addVec2(forces[i],f);
      */

      //if (c%10==0 && i==verts.length-1)
      // console.log(verts[i].v[0],verts[i].v[0]*usGround * deltaTime*SCALE_TIME)
      if (abs(verts[i].v[0]) < usGround)
        verts[i].v[0] = 0
      else
        verts[i].v[0] -= verts[i].v[0] * ukGround * deltaTime * SCALE_TIME
    }
  }

  for (let i = 0; i < N; i++) {
    let tmp = new Vec2([0, 0])
    tmp.addVec2(pond.calBuoyantForce(verts[i]));
    tmp.addVec2(pond.calDragForce(verts[i]))
    if (i == N - 1) {
      //console.log(pond.calDragForce(verts[i]).val,verts[i].v)
    }
    forces[i].addVec2(tmp)
  }

  for (let i = 0; i < N; i++) {
    forces[i] = addVec2(forces[i], gForce)
    verts[i].setForce(forces[i].val);
  }

}

function draw() {
  clear();
  textSize(20);
  text(sphere_.p, 500, 30);

  deltaTime = millis() - lastUpdateTime;

  lastUpdateTime += deltaTime;

  calExternalForce();

  PBDUpdate(verts, constraints, deltaTime * SCALE_TIME, 500);

  freeFall(deltaTime * SCALE_TIME);
  stroke(200);

  for (let i = 0; i < N; i++) {
    fill(color(0, 0, 0));
    ellipse(verts[i].x[0], verts[i].x[1], dotRadius * 2, dotRadius * 2);
    if (i < N - 1)
      line(verts[i].x[0], verts[i].x[1], verts[i + 1].x[0], verts[i + 1].x[1]);
  }


  // ground
  line(ground.start[0], ground.start[1], ground.end[0], ground.end[1])

  // pond
  line(pond.start[0], pond.start[1], pond.end[0], pond.end[1])

  ellipse(ball.x[0], ball.x[1], 2 * ball.rad, 2 * ball.rad)
  ellipse(sphere_.x[0], sphere_.x[1], 2 * sphere_.rad, 2 * sphere_.rad)

  text("State : " + state, 10, 10);

  fill(color(1, 0, 0));
  ellipse(obs.x[0], obs.x[1], 2 * obs.rad, 2 * obs.rad)
  if (state == 1) {
    noFill()

    const intersectPoints = circleIntersectLine(obs, ground)

    if (intersectPoints.length == 2) {
      //console.log(calAreaCircleLine(obs,ground))
      fill(color(1, 0, 0));
      ellipse(intersectPoints[0].val[0], intersectPoints[0].val[1], 5, 5)
      ellipse(intersectPoints[1].val[0], intersectPoints[1].val[1], 5, 5)
    }
  }


}

function freeFall(dt) {
  //sphere_.v[0] += G*dt
  let velo = new Vec2(sphere_.v)
  let pos = new Vec2(sphere_.x)
  const dragForce = pond.calDragForce(sphere_);

  velo.addVec2(new Vec2([0, G * dt]))
  velo.addVec2(mulSc(pond.calBuoyantForce(sphere_), sphere_.w * dt));
  velo.addVec2(mulSc(dragForce, sphere_.w * dt))

  console.log(dragForce.val, velo.val)

  pos.addVec2(mulSc(velo, dt))
  //console.log(velo,dt)
  //return
  // sphere_.x[0] += sphere_.v[0]*dt
  // sphere_.x[1] += sphere_.v[1]*dt
  sphere_.v = velo.val
  sphere_.x = pos.val
}
function mouseMoved() {
  if (isInitialized) {
    if (state == 0)
      setAnchor([mouseX, mouseY])
    else if (state == 1)
      moveSphere([mouseX, mouseY])
  }
}

function mouseClicked() {


}

function moveSphere(pos) {
  obs.x = pos
}
function keyPressed() {
  if (keyCode === ENTER) {
    state = (state + 1) % 2
  }

}


function setAnchor(pos) {

  anchorMouse = pos
  ball.x = anchorMouse

  verts[0].setForce([
    (1.0 * anchorMouse[0] - verts[0].x[0]) * 10.0,
    (1.0 * anchorMouse[1] - verts[0].x[1]) * 10.0
  ]);
}