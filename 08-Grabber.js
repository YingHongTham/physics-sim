class Grabber {
	constructor(gThree) {
    this.gThree = gThree;

		this.prevPos = new THREE.Vector3();
		this.vel = new THREE.Vector3();
		this.time = 0.0;
    // dist from camera to object when raycast hits
		this.distance = 0.0;
    // position(ray hit obj) - obj.pos
    this.posOffset = new THREE.Vector3();

    // object that raycaster finds; reset when pointerup
		this.physicsObject = null;
    //this.gMouseDown = false; // not used?

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

  // repositions the ray to cast from given x,y
  // (typically x,y = clientX,Y, mouse position)
  // x,y is compared to boundingbox and rescaled
	updateRaycaster(x, y) {
		var rect =
      this.gThree.renderer.domElement.getBoundingClientRect();

    // raycaster position is measured from center of rect
    // (because from POV of camera)
    // scaled to be in [-1.0,1.0]
		this.mousePos = new THREE.Vector2();
		this.mousePos.x = ((x - rect.left) / rect.width ) * 2 - 1;
		this.mousePos.y = -((y - rect.top) / rect.height ) * 2 + 1;

		this.raycaster.setFromCamera( this.mousePos, this.gThree.camera);
	}

  // cast ray, keep nearest object in this.physicsObject
  // and record the position etc for use later
  // to compute new velocity upon release
	start(x, y) {
		this.physicsObject = null;
		this.updateRaycaster(x, y);
		var intersects = this.raycaster.intersectObjects(
        this.gThree.scene.children );

    if (intersects.length == 0)
      return;

		var obj = intersects[0].object.userData;
    if (obj === null || obj === undefined)
      return;

		this.physicsObject = obj;

    // get position of where ray hits obj
    // camera.pos + (ray dir)*dist
		this.distance = intersects[0].distance;
		var pos = this.raycaster.ray.origin.clone();
		pos.addScaledVector(this.raycaster.ray.direction, this.distance);

    this.posOffset.copy(pos);
    this.posOffset.sub(obj.pos);

		this.physicsObject.startGrab();
		this.prevPos.copy(pos);
		this.vel.set(0.0, 0.0, 0.0);
		this.time = 0.0;

		if (gPhysicsScene.paused)
			run(); // resumes physics simulation
	}

	move(x, y) {
    if (this.physicsObject === null)
      return; // does nothing if no object has been selected

    var pos = this.posFromRayDist(x,y,this.distance);

    // this.vel = (pos - prevPos) / this.time
    // reset this.time = 0; it increase at each time step
		this.vel.copy(pos);
		this.vel.sub(this.prevPos);
		if (this.time > 0.0)
			this.vel.divideScalar(this.time);
		else
			this.vel.set(0.0, 0.0, 0.0);
		this.prevPos.copy(pos);
		this.time = 0.0;

    pos.sub(this.posOffset);
		this.physicsObject.moveGrabbed(pos);
	}

  // one last move is always called before end
  // (i.e. the evt.clientX/Y of the last onPointerMove
  // is same as onPointerUp)
  // but there could have been several time steps
  // between last move call and now
	end(x, y) {
    //console.log(this.time); // almost never 0..
		if (this.physicsObject === null)
      return;

    // make object have no velocity if held for long
    if (this.time > 0.5) {
      this.vel.set(0,0,0);
    }

		this.physicsObject.endGrab(null, this.vel);
		this.physicsObject = null;
	}

  posFromRayDist(x,y,dist) {
		this.updateRaycaster(x, y);
		var pos = this.raycaster.ray.origin.clone();
		pos.addScaledVector(this.raycaster.ray.direction, dist);
    return pos;
  }

  onPointerDown(evt) {
	  this.start(evt.clientX, evt.clientY);
	  //this.gMouseDown = true;
	  if (this.physicsObject) {
	  	this.gThree.control.saveState();
      this.gThree.control.enabled = false;
	  }
  }
  onPointerMove(evt) {
		this.move(evt.clientX, evt.clientY);
  }
  onPointerUp(evt) {
		if (this.physicsObject) {
			this.end(evt.clientX, evt.clientY);
			this.gThree.control.reset();
		}
		//this.gMouseDown = false;
		this.gThree.control.enabled = true;
  }
}			
