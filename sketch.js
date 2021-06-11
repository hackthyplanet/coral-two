//////////////////CODE TWO/////////////////////////////////////////////////////////////////////////

const flock = [];
let depth = 800; 
let gap = 300; 
let quadTree;
let unitX, unitY, unitZ; 

let useQuadTree = true; 
let showPerceptionRadius = false; 
let goMiddle = false; 
let downloadCanvas = false; 

let boid
let boidsP, perceptionP, alignmentP, cohesionP, separationP; 
let startingBoids = 100; 
let startingPerception = 90;
let t = 0; 


let music 

let m 

function preload(){
	

    music = loadSound('assets/coral two.mp3')

}
function setup (){
	    
	music.loop()

	let p5Canvas;
	if (downloadCanvas) {
    p5Canvas = createCanvas(windowWidth -1, windowHeight -1, WEBGL);
    frameRate(3);
  } else {
    p5Canvas = createCanvas(windowWidth -1, windowHeight -1, WEBGL); // You can change the resolution here
  }

  // Declaration of depth (z axis), unit vectors, and the camera
  depth = height*2;
  unitX = createVector(1, 0, 0);
  unitY = createVector(0, 1, 0);
  unitZ = createVector(0, 0, 1);
  let cameraX = 630 / 600 * width;
  let cameraY = 140 / 500 * height;
  let cameraZ = -280 / 500 * depth;
  camera(cameraX, cameraY, cameraZ, 0, 0, 0, 0, 0, 1);
  
  createDOMs();


  for (let i = 0; i < 200; i++) {
    pushRandomBoid();

	noCursor()
  }
}

// DRAW FUNCTION ---------------------------------------------------
function draw() {
  

  background(0)
  let dirX = (mouseX / width - 0.5) * 2;
  let dirY = (mouseY / height - 0.5) * 2;
  directionalLight(0,22, 84.3, -dirX, -dirY, -1);

  let dirXX	 = (mouseX / width - 0.25) * 4;
  let dirYY = (mouseY / height - 0.25) * 4;
  directionalLight(68.6, 7.8 , 87.1, -dirXX, -dirYY, -1);

   m = millis()
   print(millis())

   if ( m > 150000){ambientLight(255)}else{
  ambientLight(93.3, 38.4, 56.1, 100)}
  //ambientLight(255)



  orbitControl();
  rotateY(0.5)

  

  boidfam()
 
}


  function boidfam (){

  let boundary = new Cube(0, 0, 0, width + 4 * gap, height + 4 * gap, depth + 4 * gap);
  quadTree = new QuadTree(boundary, 4);
  for (let boid of flock) {
    quadTree.insert(boid);
  }

	  
  for (let boid of flock) {
    boid.flock(flock, quadTree);
  }

	  
  for (let boid of flock) {
    boid.update(gap);
    boid.show();
  }

  let maxBoids = 200;
  let difference = flock.length - maxBoids;
  if (difference < 0) {
    for (let i = 0; i < -difference; i++) {
      pushRandomBoid(); 
    }
  } else if (difference > 0) {
    for (let i = 0; i < difference; i++) {
      flock.pop(); 
    }
  }
  
  t++; 

  if (downloadCanvas && frameCount % 2 == 1) download(canvas, 'Flocking_' + frameCount + '.png');
}


function createDOMs() {
 
}


function pushRandomBoid() {
  let pos = createVector(0, 0, 0); 
  let vel = p5.Vector.random3D().mult(random(0.5, 3)); 
  let boid = new Boid(pos, vel); 
  flock.push(boid); 
}


function download(canvas, filename) {
 
  var lnk = document.createElement('a'), e;
  lnk.download = filename;

  lnk.href = canvas.toDataURL("image/png;base64");
	
  if (document.createEvent) {
    e = document.createEvent("MouseEvents");
    e.initMouseEvent("click", true, true, window,
                     0, 0, 0, 0, 0, false, false, false,
                     false, 0, null);

    lnk.dispatchEvent(e);
  } else if (lnk.fireEvent) {
    lnk.fireEvent("onclick");
  }
}

class Boid {
	constructor(pos, vel) {
	  this.pos = pos; 
	  this.vel = vel; 
	  this.acc = createVector(0, 0, 0); 
	  this.maxForce = 0.1; 
	  this.maxSpeed = 5; 
	  this.r = (0); 
	  this.g = floor(random(150, 200)); 
	  this.b = floor(random(50, 120)); 
	}
	
	alignment(neighbors) {
	  let steering = createVector();
	  for (let other of neighbors) steering.add(other.vel); 
	  if (neighbors.length > 0) {
		steering.div(neighbors.length); 
		steering.setMag(this.maxSpeed); 
		steering.sub(this.vel); 
		steering.limit(this.maxForce); 
	  }
		return steering;
	}
	
	// Cohesion rule
	
	cohesion(neighbors) {
	  let steering = createVector();
	  for (let other of neighbors) steering.add(other.pos); // Sum of neighbor positions
	  if (neighbors.length > 0) {
		steering.div(neighbors.length); // Average neighbors position
		steering.sub(this.pos); // Orientation of the desired velocity
		steering.setMag(this.maxSpeed); // Desired velocity
		steering.sub(this.vel); // Actual steering
		steering.limit(this.maxForce); // Steering limited to maxForce
	  }
	  return steering;
	}
	
	// Separation rule
	// Steering to avoid proximity of the neighbors
	separation(neighbors) {
	  let steering = createVector();
	  for (let other of neighbors) {
		let diff = p5.Vector.sub(this.pos, other.pos); // Vector from other boid to this boid
		let d = max(other.distance, 0.01); // Distance between other boid and this boid
		steering.add(diff.div(d)); // Magnitude inversely proportional to the distance
	  }
	  if (neighbors.length > 0) {
		steering.div(neighbors.length); // Orientation of the desired velocity
		steering.setMag(this.maxSpeed); // Desired velocity
		steering.sub(this.vel); // Actual steering
		steering.limit(this.maxForce); // Steering limited to maxForce
	  }
		return steering;
	}
	
	// Application of the rules
	flock(boids, quadTree) {
	  // Go to the middle if goMiddle is true
	  // Create a large force towards the middle, apply it to the boid, and "return" to not apply other forces
	  if (goMiddle) {
		let force = createVector(-this.pos.x, -this.pos.y, -this.pos.z);
		force.setMag(this.maxForce * 20);
		this.acc.add(force);
		return;
	  }
	  
	  let radius = 100; // Max distance of a neighbor
	  let neighbors = [];
	  
	  
		// VERSION WITHOUT QUADTREE
		
		for (let other of boids) {
		  let distance = this.pos.dist(other.pos);
		  if (other != this && distance < radius) {
			other.distance = distance; 
			neighbors.push(other); 
		  }
		}
	  
	  // Calculate the force of alignments and apply it to the boid
	  let alignment = this.alignment(neighbors);
	  alignment.mult(0);
	  this.acc.add(alignment);
	  
	  // Calculate the force of cohesion and apply it to the boid
	  if (t > 40) { // No cohesion in the first 40 frames
		let cohesion = this.cohesion(neighbors)
		
		cohesion.mult(mouseY/20);
		this.acc.add(cohesion);
	  }
	  
	  // Calculate the force of separation and apply it to the boid
	  let separation = this.separation(neighbors);
	  separation.mult(mouseX/10);
	  this.acc.add(separation);
	  
	  if (this.pos.z < -depth/8 || this.pos.z > depth/8) {
		let force = createVector(0, 0, -this.pos.z / depth * this.maxForce * 2);
		this.acc.add(force);
	  }
	  

	  if (neighbors.length == 0) {
		let force = p5.Vector.random3D().mult(this.maxForce/4);
		force.z = 0; // Only go find other in an XY plane
		this.acc.add(force);
	  }
	}
	
	// Update position, velocity, and acceleration
	update(gap) {
	  // Apply physics
	  this.pos.add(this.vel);
	  this.vel.add(this.acc);
	  this.vel.mult(0.999); 
	  this.vel.limit(this.maxSpeed);
	  this.acc.mult(0);
	  
	  if (this.pos.x > width/2 + gap) this.pos.x -= width + 1.7 * gap;
	  if (this.pos.x < -(width/2 + gap)) this.pos.x += width + 1.7 * gap;
	  if (this.pos.y > height/2 + gap) this.pos.y -= height + 1.7 * gap;
	  if (this.pos.y < -(height/2 + gap)) this.pos.y += height + 1.7 * gap;
	}
	
	// Show the boid on screen
	show() {
	  noStroke();
	  

  
	  push()
	  translate(this.pos.x, this.pos.y, this.pos.z);
	  //texture(algae1)
	  specularMaterial(61.2, 67.8, 100.0)
	  
	  sphere(20 +sin(frameCount/30)*35); // A sphere where the boid is
	  
	  translate(this.pos.x + 10 +sin(frameCount/20)*25, this.pos.y + 10 +sin(frameCount/20)*25, this.pos.z + 10 +sin(frameCount/20)*25);
	  specularMaterial(93.3, 38.4, 56.1)
	  //texture(algae2)
	  sphere(20 +sin(frameCount/10)*15)
	  
	 
	  let arrow = createVector(this.vel.x, this.vel.y, this.vel.z).setMag(10);
	  translate(arrow.x, arrow.y, arrow.z);
	  fill(0, 200, 0)
	  sphere(10)
	  ; // Another sphere, smaller, in the direction of the boid's velocity
	  
	 translate(this.pos.x *2, this.pos.y*2, this.pos.z*2)
	 //fill(100, 83.1, 99.6, 100)
	 //stroke(255)
	 ambientMaterial(100, 83.1, 99.6)
     sphere(30)
	 
	  pop();
	  
	  // Show perception radius, all circles are drawn at z = 0
	  if (showPerceptionRadius) {
		stroke(255, 255, 255, 100);
		noFill();
		strokeWeight(1);
		let perception = 200 * 2;
		ellipse(this.pos.x, this.pos.y, perception, perception);
	  }
	}
  }

 
class Cube {
	constructor(x, y, z, w, h, d) {
	  this.x = x;
	  this.y = y;
	  this.z = z;
	  this.w = w;
	  this.h = h;
	  this.d = d;
  
	  this.xMin = x - w;
	  this.xMax = x + w;
	  this.yMin = y - h;
	  this.yMax = y + h;
	  this.zMin = z - d;
	  this.zMax = z + d;
	}
  
	// Checks if a boid is inside the cube
	contains(boid) {
	  let pos = boid.pos;
	  return (pos.x >= this.xMin && pos.x <= this.xMax &&
					pos.y >= this.yMin && pos.y <= this.yMax &&
					pos.z >= this.zMin && pos.z <= this.zMax);
	}
  
	// Check if two cubes intersect
	intersects(range) {
	  return !(this.xMax < range.xMin || this.xMin > range.xMax ||
					 this.yMax < range.yMin || this.yMin > range.yMax ||
					 this.zMax < range.zMin || this.zMin > range.zMax);
	}
  }
  
 
  class QuadTree {
	constructor(boundary, capacity) {
	  this.boundary = boundary; 
	  this.capacity = capacity; 
	  this.boids = []; 
	  this.divided = false; 
	}
  
	// Insert a boid in the quad tree
	insert(boid) {
	  // Return if the boid is not in the area of this layer of quad tree
	  if (!this.boundary.contains(boid)) {
		return false;
	  }
  
	 
	  if (this.boids.length < this.capacity) {
		this.boids.push(boid);
		return true;
	  } else {
		
		if (!this.divided) {
		  this.subdivide();
		}
  
		if (this.NWT.insert(boid)) {
		  return true;
		} else if (this.NET.insert(boid)) {
		  return true;
		} else if (this.SET.insert(boid)) {
		  return true;
		} else if (this.SWT.insert(boid)) {
		  return true;
		} else if (this.NWB.insert(boid)) {
		  return true;
		} else if (this.NEB.insert(boid)) {
		  return true;
		} else if (this.SEB.insert(boid)) {
		  return true;
		} else if (this.SWB.insert(boid)) {
		  return true;
		}
	  }
	}
  
	subdivide() {
	  this.divided = true; 
  
	  let x = this.boundary.x;
	  let y = this.boundary.y;
	  let z = this.boundary.z;
	  let w = this.boundary.w / 2;
	  let h = this.boundary.h / 2;
	  let d = this.boundary.d / 2;
  
	  let NWTBoundary = new Cube(x - w, y - h, z - d, w, h, d);
	  this.NWT = new QuadTree(NWTBoundary, this.capacity);
  
	  // North East Top quad tree
	  let NETBoundary = new Cube(x + w, y - h, z - d, w, h, d);
	  this.NET = new QuadTree(NETBoundary, this.capacity);
  
	  // South East Top quad tree
	  let SETBoundary = new Cube(x + w, y + h, z - d, w, h, d);
	  this.SET = new QuadTree(SETBoundary, this.capacity);
  
	  // South West Top quad tree
	  let SWTBoundary = new Cube(x - w, y + h, z - d, w, h, d);
	  this.SWT = new QuadTree(SWTBoundary, this.capacity);
	  
	  // North West Bot quad tree
	  let NWBBoundary = new Cube(x - w, y - h, z + d, w, h, d);
	  this.NWB = new QuadTree(NWBBoundary, this.capacity);
  
	  // North East Bot quad tree
	  let NEBBoundary = new Cube(x + w, y - h, z + d, w, h, d);
	  this.NEB = new QuadTree(NEBBoundary, this.capacity);
  
	  // South East Bot quad tree
	  let SEBBoundary = new Cube(x + w, y + h, z + d, w, h, d);
	  this.SEB = new QuadTree(SEBBoundary, this.capacity);
  
	  // South West Bot quad tree
	  let SWBBoundary = new Cube(x - w, y + h, z + d, w, h, d);
	  this.SWB = new QuadTree(SWBBoundary, this.capacity);
	}
  
	// Returns all the points in a given range (Cube) and put them in the "found" array
	query(range, found) {
	  // The array "found" will check all quad trees intersecting with the range,
	  // looking for points intersecting with the range
	  if (!found) found = []; // Creates the array at the beginning of the recursion
  
	  if (!this.boundary.intersects(range)) {
		return found; // No intersection between the quad tree and the range, no need to check for points
	  } else {
		// If the range intersects this quad tree, check for the intersection of its points with the range
		for (let boid of this.boids) {
		  if (range.contains(boid)) {
			found.push(boid); // Add the points intersecting with the range to "found"
		  }
		}
  
		// This quad tree intersects with the range, now do the same for its children quad trees
		if (this.divided) {
		  this.NWT.query(range, found);
		  this.NET.query(range, found);
		  this.SET.query(range, found);
		  this.SWT.query(range, found);
		  this.NWB.query(range, found);
		  this.NEB.query(range, found);
		  this.SEB.query(range, found);
		  this.SWB.query(range, found);
		}
	  }
  
	  return found;
	}
  }

  
