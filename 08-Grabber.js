class Grabber {
	constructor(gThree) {
    this.gThree = gThree;

    this.gMouseDown = false;
		this.prevPos = new THREE.Vector3();
		this.vel = new THREE.Vector3();
		this.time = 0.0;
		this.distance = 0.0;
		this.physicsObject = null;
		this.raycaster = new THREE.Raycaster();

		this.raycaster.layers.set(1);
		this.raycaster.params.Line.threshold = 0.1;


    const self = this;
		this.gThree.renderer.domElement.addEventListener(
      'pointerdown', (e) => { self.onPointerDown(e); }, false);
		this.gThree.renderer.domElement.addEventListener(
      'pointermove', (e) => { self.onPointerMove(e); }, false);
		this.gThree.renderer.domElement.addEventListener(
      'pointerup', (e) => { self.onPointerUp(e); }, false);
	}
	increaseTime(dt) {
		this.time += dt;
	}
	updateRaycaster(x, y) {
		var rect =
        this.gThree.renderer.domElement.getBoundingClientRect();
		this.mousePos = new THREE.Vector2();
		this.mousePos.x = ((x - rect.left) / rect.width ) * 2 - 1;
		this.mousePos.y = -((y - rect.top) / rect.height ) * 2 + 1;
		this.raycaster.setFromCamera( this.mousePos, this.gThree.camera);
	}
	start(x, y) {
		this.physicsObject = null;
		this.updateRaycaster(x, y);
		var intersects = this.raycaster.intersectObjects(
        this.gThree.scene.children );
		if (intersects.length > 0) {
			var obj = intersects[0].object.userData;
			if (obj) {
				this.physicsObject = obj;
				this.distance = intersects[0].distance;
				var pos = this.raycaster.ray.origin.clone();
				pos.addScaledVector(this.raycaster.ray.direction, this.distance);
				this.physicsObject.startGrab(pos);
				this.prevPos.copy(pos);
				this.vel.set(0.0, 0.0, 0.0);
				this.time = 0.0;

				if (gPhysicsScene.paused)
					run();
			}
		}
	}
	move(x, y) {
    // does nothing if no object has been selected
    if (this.physicsObject === null)
      return;

		this.updateRaycaster(x, y);
		var pos = this.raycaster.ray.origin.clone();
		pos.addScaledVector(this.raycaster.ray.direction, this.distance);

		this.vel.copy(pos);
		this.vel.sub(this.prevPos);
		if (this.time > 0.0)
			this.vel.divideScalar(this.time);
		else
			vel.set(0.0, 0.0, 0.0);
		this.prevPos.copy(pos);
		this.time = 0.0;

		this.physicsObject.moveGrabbed(pos, this.vel);
	}
	end(x, y) {
		if (this.physicsObject) { 
			this.physicsObject.endGrab(this.prevPos, this.vel);
			this.physicsObject = null;
		}
	}

  onPointerDown(evt) {
	  this.start(evt.clientX, evt.clientY);
	  this.gMouseDown = true;
	  if (this.physicsObject) {
	  	this.gThree.control.saveState();
      this.gThree.control.enabled = false;
	  }
  }
  onPointerMove(evt) {
		this.move(evt.clientX, evt.clientY);
    console.log(evt.clientX, evt.clientY);
  }
  onPointerUp(evt) {
		if (this.physicsObject) {
			this.end();
			this.gThree.control.reset();
		}
		this.gMouseDown = false;
		this.gThree.control.enabled = true;
  }
}			
