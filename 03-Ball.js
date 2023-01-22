class Ball {
	constructor(radius, mass, pos, vel) {
		this.radius = radius;
		this.mass = mass;
		this.pos = pos.clone();
		this.vel = vel.clone();
    this.defaultCol = "#FF0000";
	}
	simulate(dt, gravity) {
		this.vel.addByScaledVec(gravity, dt);
		this.pos.addByScaledVec(this.vel, dt);
	}
}
