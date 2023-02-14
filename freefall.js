class FreeFall extends Page {
    constructor(startTime) {
        super(startTime)
        this.sphere = new Vertex("sphere", [screenX / 2, 0], [0, 0], 17, [0, 0], 40)
        console.log(this.sphere)
        this.constraints = []
        this.pond = new Pond("pond", [0, screenY - 400], [screenX, screenY - 400], [0, 0])
        this.air = new Pond("air", [0, 0], [screenX, screenY - 400], [0, screenY], 0.00001)
    }
    freeFall(dt) {
        const force = new Vec2([0, 0])
        const dragForce = this.pond.calDragForce(this.sphere, dt);
        force.addVec2(new Vec2([0, G * this.sphere.m]))
        force.addVec2(this.pond.calBuoyantForce(this.sphere))
        force.addVec2(this.air.calBuoyantForce(this.sphere))
        force.addVec2(dragForce)

        this.sphere.setForce(force.val)

    }



    setup() {
        createCanvas(screenX, screenY);
        this.denseSphereInput = createInput(String(roundAny(this.sphere.dense, 4)));
        this.denseSphereInput.position(100, 65);


        this.denseWaterInput = createInput(String(roundAny(this.pond.dense, 4)));
        this.denseWaterInput.position(100, 100);

        this.button = createButton('submit');
        this.button.position(this.denseWaterInput.x, 125);
        this.button.mousePressed(() => { this.updateInput(this) });

        frameRate(30)
    }

    updateInput(self) {
        const denseWater = self.denseWaterInput.value();
        const denseSphere = self.denseSphereInput.value();
        if (isNaN(denseWater) || isNaN(denseSphere))
            return
        self.pond.dense = float(denseWater)
        self.sphere.reDense(float(denseSphere))
    }


    draw() {
        clear();

        text(`Sphere : \n  Density : ${roundAny(this.sphere.dense, 4)}\n  Position : ${roundAny(this.sphere.x)}\n  Velocity : ${roundAny(this.sphere.v)}
    Water : \n  Density : ${this.pond.dense}
    Air : \n  Density : ${this.air.dense}`,
            600, 30);
        text("Sphere density:", 10, 80)
        text("Water density:", 10, 115)

        this.deltaTime = millis() - this.lastUpdateTime;
        this.lastUpdateTime += this.deltaTime;


        this.freeFall(this.deltaTime * SCALE_TIME);
        PBDUpdate([this.sphere], this.constraints, this.deltaTime * SCALE_TIME, 100);

        stroke(200);
        fill(0, 0, 0)
        ellipse(this.sphere.x[0], this.sphere.x[1], this.sphere.rad * 2, this.sphere.rad * 2);

        // pond
        line(this.pond.start[0], this.pond.start[1], this.pond.end[0], this.pond.end[1])

    }

    clearPage() {
        this.denseSphereInput.remove()
        this.denseWaterInput.remove()
        this.button.remove()
    }
}