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


// --------------- application --------------- //


const constraints = [];
const edges = []; // only visual

//const ball = new Ball(screenX/2,0);
let isInitialized = false;

let dragIndex = -1;
let lastUpdateTime;
const verts = [];
let anchorMouse = new Vec2([400, 600]);

const groundH = 300;
const ground = new Line([0, screenY - 300], [screenX, screenY - 200], [0, 0])
const pond = new Pond([0, screenY - 400], [screenX, screenY - 400], [0, 0])
const ball = new Sphere([0, 0], 20)
const sphere_ = new Vertex([screenX / 2, 0], [0, 0], 10, [0, 0], 40)
const obs = new Sphere([500, 500], 30)
const net = new Net(20, [100, 100], [700, 100])
const envConstraints = []
let state = 0;

function initialize() {
  // creates a vertex matrix



  const D = 10.0;
  const NStep = 100;
  const K = 1;
  // verts.push(ball);
  //    for(let i=0;i<N;i++){
  //     verts.push(new Vertex([screenX/2,-100-i*10],[0.0,0.0],0.5,[0.0,0.0]))

  //    }

  // rope
  for (let i = 0; i < N; i++) {
    verts.push(new Vertex([400, 400 + (-i * 10)], [0.0, 0.0], dotMass, [0.0, 0.0]))
    if (i < N - 1)
      constraints.push(makeTwoVertexDistanceConstraint(verts, i, i + 1, D, K));
  }

  for (let i = 1; i < N - 1; i++) {
    constraints.push(makeBendintConsraints(i - 1, i, i + 1, 180, 0.1, D));
  }
  constraints.push(makeMousePosConstraint(verts[0], anchorMouse, 100, K));
  constraints.push(makeColConstraint(verts, 1));

  setAnchor([400, 400])


  // net

  net.constraints.push(makePositionConstraint(net.particles[0], net.posStart, 0, K));
  net.constraints.push(makeMousePosConstraint(net.particles[net.particles.length - 1], anchorMouse, 0, K));
  net.constraints.push(makeColConstraint(net.particles, 1));
  for (let i = 0; i < net.particles.length - 1; i++)
    net.constraints.push(makeTwoVertexDistanceConstraint(net.particles, i, i + 1, net.interval, 1));


  envConstraints.push(makeEnvColConstraint([net.particles, verts], sphere_, 1))

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
    tmp.addVec2(pond.calDragForce(verts[i], deltaTime * SCALE_TIME))
    if (i == N - 1) {
      // console.log(pond.calDragForce(verts[i], deltaTime * SCALE_TIME).val)
    }
    forces[i].addVec2(tmp)
  }
  gForce = new Vec2([0, G * net.pMass])
  for (let i = 0; i < N; i++) {
    forces[i] = addVec2(forces[i], gForce)
    verts[i].setForce(forces[i].val);
  }

  for (let i = 0; i < net.particles.length; i++) {
    //console.log(net.particles[0])
    net.particles[i].setForce(gForce.val)
  }



}

function draw() {
  clear();
  textSize(20);
  text(sphere_.p, 500, 30);
  deltaTime = millis() - lastUpdateTime;
  // console.log(net.particles[0].x, net.particles[1].x, net.particles[2].x)
  lastUpdateTime += deltaTime;

  calExternalForce();
  freeFall(deltaTime * SCALE_TIME);
  //PBDUpdate(verts, constraints, deltaTime * SCALE_TIME, 300);
  PBDUpdate([sphere_].concat(net.particles), net.constraints, deltaTime * SCALE_TIME, 300);
  //PBDUpdate(, envConstraints, deltaTime * SCALE_TIME, 100);


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

  for (let i = 0; i < net.particles.length - 1; i++) {

    ellipse(net.particles[i].x[0], net.particles[i].x[1], 2 * net.pRad, 2 * net.pRad)
    line(net.particles[i].x[0], net.particles[i].x[1], net.particles[i + 1].x[0], net.particles[i + 1].x[1])
  }
  ellipse(net.particles[net.particles.length - 1].x[0], net.particles[net.particles.length - 1].x[1], 2 * net.pRad, 2 * net.pRad)


}

function freeFall(dt) {
  //sphere_.v[0] += G*dt
  //let velo = new Vec2(sphere_.v)
  //let pos = new Vec2(sphere_.x)
  const force = new Vec2([0, 0])
  const dragForce = pond.calDragForce(sphere_, dt);
  //console.log(dragForce.val)
  /*velo.addVec2(new Vec2([0, G * dt]))
  velo.addVec2(mulSc(pond.calBuoyantForce(sphere_), sphere_.w * dt));
  velo.addVec2(mulSc(dragForce, sphere_.w * dt))
  */
  force.addVec2(new Vec2([0, G * sphere_.m]))
  force.addVec2(pond.calBuoyantForce(sphere_))
  force.addVec2(dragForce)
  sphere_.setForce(force.val)
  //console.log(sphere_.v)
  //console.log(dragForce.val, velo.val)

  //pos.addVec2(mulSc(velo, dt))
  //console.log(velo,dt)
  //return
  // sphere_.x[0] += sphere_.v[0]*dt
  // sphere_.x[1] += sphere_.v[1]*dt
  //sphere_.v = velo.val
  //sphere_.x = pos.val
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

  anchorMouse = new Vec2(pos)
  ball.x = anchorMouse.val

  verts[0].setForce([
    (1.0 * anchorMouse.val[0] - verts[0].x[0]) * 10.0,
    (1.0 * anchorMouse.val[1] - verts[0].x[1]) * 10.0
  ]);
}