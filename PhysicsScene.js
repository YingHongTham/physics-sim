class PhysicsScene {
  constructor(simWidth,simHeight) {
		this.gravity = new Vector2(0.0, -1.0);
		this.dt = 1.0 / 60.0;
		this.worldSize = new Vector2(simWidth, simHeight);

    this.numFramesColorChange = 5;

    // loss of energy at each collision
		this.restitution = 1.0;

		this.numBalls = 200;
    this.balls = new Array(this.numBalls);
    this.minRadius = 0.02;
    this.maxRadius = 0.04;

    // hash grid
    this.hashGrid = new HashGrid(this.maxRadius, this.numBalls);

    // balls that collided in the current time step
    this.ballsCollided = new Set();

    // ball is made to be colored differently after collision
    // for this.numFramesColorChange frames
    // this array counts down how many frames left
    this.colorChangeTimer = new Array(this.numBalls).fill(0);
  }

	setupSceneRandom() {
    this.hashGrid.clear();

		for (let i = 0; i < this.numBalls; i++) {
			var radius = this.minRadius +
          Math.random() * (this.maxRadius - this.minRadius);
			var mass = Math.PI * radius * radius;
			var pos = new Vector2(
        Math.random() * this.worldSize.x,
        Math.random() * this.worldSize.y);
			var vel = new Vector2(
          -1.0 + 2.0 * Math.random(),
          -1.0 + 2.0 * Math.random());

			this.balls[i] = new Ball(radius, mass, pos, vel);
		}
	}
  
  // perform one time step
  simulate() {
    for (let i = 0; i < this.numBalls; i++) {
      this.colorChangeTimer[i]--;
    }

		for (const b of this.balls) {
			b.simulate(this.dt, this.gravity);
    }

    this.hashGrid.clear();
    for (const b of this.balls) {
      this.hashGrid.insertBall(b);
    }

    let ballsCollided = new Set();
    for (const b of this.balls) {
      let nearbyBalls = this.hashGrid.getBallsNearby(b.pos, 1);
      for (const bp of nearbyBalls) {
        let collided = this.handleBallCollision(b,bp);
        if (collided) {
          ballsCollided.add(b);
          ballsCollided.add(bp);
        }
      }
    }
    for (let i = 0; i < this.numBalls; i++) {
      if (ballsCollided.has(this.balls[i])) {
        this.colorChangeTimer[i] = this.numFramesColorChange;
      }
    }
    // slower method of pairwise checking
		//for (let i = 0; i < this.balls.length; i++) {
    //  var ball1 = this.balls[i];
		//	for (let j = i + 1; j < this.balls.length; j++) {
		//		var ball2 = this.balls[j];
		//		this.handleBallCollision(ball1, ball2);
		//	}
    //}

		for (const b of this.balls) {
			this.handleWallCollision(b);
		}
  }

	// collision handling ------------

  // returns true if have collision
  // first checks if within distance
  // second checks if velocities point in direction that
  // makes distance less
  // then performs collision
  //
  // the second check helps avoid balls passing through
  // (perhaps because of other balls around)
  // also if handleBallCollision is called on the
  // same pair of balls again,
  // the second check would not pass
	handleBallCollision(ball1, ball2) {
		var dir = new Vector2();
		dir.subtractVectors(ball2.pos, ball1.pos);
		var d = dir.length();
		if (d == 0.0 || d > ball1.radius + ball2.radius)
			return false;

		dir.scale(1.0 / d);

		var corr = (ball1.radius + ball2.radius - d) / 2.0;
		//ball1.pos.addByScaledVec(dir, -corr);
		//ball2.pos.addByScaledVec(dir, corr);

		var v1 = ball1.vel.dot(dir);
		var v2 = ball2.vel.dot(dir);

    // already moving apart
    if (v2 > v1) {
      return false;
    }

		var m1 = ball1.mass;
		var m2 = ball2.mass;

		var newV1 = (m1 * v1 + m2 * v2 - m2 * (v1 - v2) * this.restitution) / (m1 + m2);
		var newV2 = (m1 * v1 + m2 * v2 - m1 * (v2 - v1) * this.restitution) / (m1 + m2);

		ball1.vel.addByScaledVec(dir, newV1 - v1);
		ball2.vel.addByScaledVec(dir, newV2 - v2);

    return true;
	}

	handleWallCollision(ball) {
		if (ball.pos.x < ball.radius) {
			ball.pos.x = ball.radius;
			ball.vel.x = -ball.vel.x;
		}
		if (ball.pos.x > this.worldSize.x - ball.radius) {
			ball.pos.x = this.worldSize.x - ball.radius;
			ball.vel.x = -ball.vel.x;
		}
		if (ball.pos.y < ball.radius) {
			ball.pos.y = ball.radius;
			ball.vel.y = -ball.vel.y;
		}

		if (ball.pos.y > this.worldSize.y - ball.radius) {
			ball.pos.y = this.worldSize.y - ball.radius;
			ball.vel.y = -ball.vel.y;
		}
	}
}


class HashGrid {
  constructor(spacing, numObj) {
    this.spacing = spacing;
    this.arrSize = numObj * 5;
    this.arr = new Array(this.arrSize);
    for (let i = 0; i < this.arrSize; i++) {
      this.arr[i] = new Set();
    }
  }

  clear() {
    for (let i = 0; i < this.arrSize; i++) {
      this.arr[i].clear();
    }
  }

  insert(pos,ball) {
    let g = this.gridPos(pos);
    let ind = this.hashFn(g.x,g.y);
    this.arr[ind].add(ball);
  }
  insertBall(ball) {
    this.insert(ball.pos,ball);
  }

  gridPos(pos) {
    var xi = Math.floor(pos.x / this.spacing);
    var yi = Math.floor(pos.y / this.spacing);

    return { x: xi, y: yi };
  }

  hashFn(xi,yi) {
    let ind = (xi * 92837111) ^ (yi * 287849147);
    return ((ind % this.arrSize) + this.arrSize) % this.arrSize;
  }

  hashInd(pos) {
    let gridPos = this.gridPos(pos);
    return this.hashFn(gridPos.x, gridPos.y);
  }
  
  hashIndNearby(pos, dist) {
    let gridPos = this.gridPos(pos);
    let inds = new Set();
    for (let i = -dist; i <= dist; i++) {
      for (let j = -dist; j <= dist; j++) {
        inds.add(this.hashFn(gridPos.x + i, gridPos.y + j));
      }
    }
    return inds;
  }

  getBalls(pos) {
    let ind = hashInd(pos);
    return this.arr[ind];
  }

  getBallsNearby(pos, dist) {
    let inds = this.hashIndNearby(pos, dist);
    let balls = new Set();
    for (const ind of inds) {
      for (const b of this.arr[ind]) {
        balls.add(b);
      }
    }

    return balls;
  }
}
