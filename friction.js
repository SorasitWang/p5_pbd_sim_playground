
class Movement extends Page {

    constructor(startTime) {

        super(startTime)
        this.constraints = [];
        this.edges = []; // only visual

        //const ball = new Ball(screenX/2,0);
        this.isInitialized = false;


        this.verts = [];
        this.anchorMouse = new Vec2([400, 600]);

        this.ground = new Line("ground", [0, screenY - 700], [screenX - 400, screenY - 500], [0, 0])
        this.ball = new Ball("ball", [100, 0], [200, 100], 20, [0, 0])
        this.ground1 = new Line("ground1", [200, screenY - 300], [screenX - 100, screenY - 400], [0, 0])
        this.grounds = [this.ground, this.ground1]
    }
    initialize() {

        const colFlags = new Map()
        colFlags.set("Ground", this.grounds)
        //colFlags.set("Ground_bounce", true)
        this.ball.prop.set("col_ground", false)
        this.constraints.push(makeColConstraint([this.ball], 10, colFlags));
        this.isInitialized = true;
    }


    setup() {

        createCanvas(screenX, screenY);
        frameRate(30)
        this.initialize();
    }

    calExternalForce() {
        // a = f/m , f*w

        // gravity

        let gForce = new Vec2([0, G * this.ball.m])
        let force = gForce;
        // friction

        // const ukGround = 0.25
        // const usGround = 5;
        // const colAny = []
        // let colGround = isColGround(ball.x, ball.rad)
        // if (colGround)
        //     ball.colSome(colAny)
        // // bounce
        // if (!ball.colState.get("ground") && colGround) {
        //     // add reflect force
        //     const prevV = new Vec2(ball.v)
        //     const magnitude = prevV.size()
        //     const newV = mulSc(normalizeVec2(mulSc(ground.reflect(new Vec2(ball.v)), 1)), magnitude)
        //     //force = mulSc(subVec2(newV, prevV), 2 * ball.m / deltaTime)
        //     console.log(newV.val, prevV.val, force)
        //     //console.log(ball.v, mulSc(normalizeVec2(mulSc(ground.reflect(new Vec2(ball.v)), 1)), magnitude).val)

        //     //ball.v = mulSc(normalizeVec2(mulSc(ground.reflect(new Vec2(ball.v)), 1)), magnitude).val

        // }


        //ball.colSome(colAny)

        // if (this.ground.isCol(this.ball.x, this.ball.rad)) {
        //     this.ball.v[1] *= -0.5
        //     this.ball.x = this.ground.closetPoint(this.ball.x, this.ball.rad)
        // }
        this.ball.f = gForce.val
    }

    draw() {
        clear();
        textSize(20);
        text(`Velocity : ${this.ball.v}`, 100, 100)
        this.deltaTime = millis() - this.lastUpdateTime;
        // console.log(net.particles[0].x, net.particles[1].x, net.particles[2].x)
        this.lastUpdateTime += this.deltaTime;

        this.calExternalForce();
        //console.log(this.ball.v, this.ball.f, this.ball.w)
        if (false) {
            this.ball.v[0] = this.ball.v[0] + (this.ball.f[0]) * (this.ball.w) * this.deltaTime * SCALE_TIME
            this.ball.v[1] = this.ball.v[1] + (this.ball.f[1]) * (this.ball.w) * this.deltaTime * SCALE_TIME

            this.ball.x[0] = this.ball.x[0] + (this.ball.v[0]) * this.deltaTime * SCALE_TIME
            this.ball.x[1] = this.ball.x[1] + (this.ball.v[1]) * this.deltaTime * SCALE_TIME
        }
        PBDUpdate([this.ball], this.constraints, this.deltaTime * SCALE_TIME, 100);



        stroke(200);


        fill(color(0, 0, 0));
        ellipse(this.ball.x[0], this.ball.x[1], this.ball.diameter, this.ball.diameter);
        //console.log(ball.x)


        // ground
        line(this.ground.start[0], this.ground.start[1], this.ground.end[0], this.ground.end[1])
        line(this.ground1.start[0], this.ground1.start[1], this.ground1.end[0], this.ground1.end[1])
    }

    mouseMoved() {

    }

    mouseClicked() {


    }

    keyPressed() {


    }



}