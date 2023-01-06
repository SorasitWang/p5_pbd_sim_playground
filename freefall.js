const sphere = new Vertex([screenX / 2, 0], [0, 0], 17, [0, 0], 40)
const constraints = []
const pond = new Pond([0, screenY - 400], [screenX, screenY - 400], [0, 0])
const air = new Pond([0, 0], [screenX, screenY - 400], [0, screenY], 0.00001)
function freeFall(dt) {

    const force = new Vec2([0, 0])
    const dragForce = pond.calDragForce(sphere, dt);
    force.addVec2(new Vec2([0, G * sphere.m]))
    force.addVec2(pond.calBuoyantForce(sphere))
    force.addVec2(air.calBuoyantForce(sphere))
    force.addVec2(dragForce)
    sphere.setForce(force.val)

}



function initialize() {
    // creates a vertex matrix

    isInitialized = true;
}


function setup() {

    createCanvas(screenX, screenY);

    frameRate(30)
    lastUpdateTime = 0;
    initialize();
}


function draw() {
    clear();
    textSize(20);
    text(`Sphere : \n  Density : ${roundAny(sphere.dense, 4)}\n  Position : ${roundAny(sphere.x)}\n  Velocity : ${roundAny(sphere.v)}
    Water : \n  Density : ${pond.dense}
    Air : \n  Density : ${air.dense}`,
        500, 30);
    deltaTime = millis() - lastUpdateTime;
    // console.log(net.particles[0].x, net.particles[1].x, net.particles[2].x)
    lastUpdateTime += deltaTime;


    freeFall(deltaTime * SCALE_TIME);
    PBDUpdate([sphere], constraints, deltaTime * SCALE_TIME, 100);

    stroke(200);
    fill(0, 0, 0)
    ellipse(sphere.x[0], sphere.x[1], sphere.rad * 2, sphere.rad * 2);

    // pond
    line(pond.start[0], pond.start[1], pond.end[0], pond.end[1])

}