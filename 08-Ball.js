class Ball {
	constructor(pos, radius, vel, scene, physicsScene)
	{
		// physics data 

    this.pos = pos;
    this.radius = radius;
    this.vel = vel;
		this.grabbed = false;

    // three scene to which ball is added
    this.scene = scene;
    // physcis parameters
    this.physicsScene = physicsScene;

		// visual mesh
    var geometry = new THREE.SphereGeometry( radius, 32, 32 );
    var material = new THREE.MeshPhongMaterial({color: 0xff0000});
    this.visMesh = new THREE.Mesh( geometry, material );
		this.visMesh.position.copy(pos);
		this.visMesh.userData = this;		// for raycasting
		this.visMesh.layers.enable(1);
		this.scene.add(this.visMesh);
	}

	simulate()
	{
		if (this.grabbed)
			return;

		this.vel.addScaledVector(this.physicsScene.gravity, this.physicsScene.dt);
		this.pos.addScaledVector(this.vel, this.physicsScene.dt);

		var size = this.physicsScene.worldSize;

		if (this.pos.x < -size.x) {
			this.pos.x = -size.x; this.vel.x = -this.vel.x;
		}
		if (this.pos.x >  size.x) {
			this.pos.x =  size.x; this.vel.x = -this.vel.x;
		}
		if (this.pos.z < -size.z) {
			this.pos.z = -size.z; this.vel.z = -this.vel.z;
		}
		if (this.pos.z >  size.z) {
			this.pos.z =  size.z; this.vel.z = -this.vel.z;
		}
		if (this.pos.y < this.radius) {
			this.pos.y = this.radius; this.vel.y = -this.vel.y;
		}

		this.visMesh.position.copy(this.pos);
		this.visMesh.geometry.computeBoundingSphere();
	}

	startGrab(pos) 
	{
		this.grabbed = true;
		this.pos.copy(pos);
		this.visMesh.position.copy(pos);
	}

	moveGrabbed(pos, vel) 
	{
		this.pos.copy(pos);
		this.visMesh.position.copy(pos);
	}

	endGrab(pos, vel) 
	{
		this.grabbed = false;
		this.vel.copy(vel);
	}				
}
