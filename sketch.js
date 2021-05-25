
const flock = []; // Array of boids
let depth = 800; // The Z location of the boid tend to stay between +depth/2 and -depth/2
let gap = 300; // Boids can go further than the edges, this further distance is the gap
let quadTree; // A quad tree to minimize the cost of distance calculation
let unitX, unitY, unitZ; // Unit vectors pointing in the X, Y, and Z directions

let useQuadTree = true; // Toogle the use of a quad tree
let showPerceptionRadius = false; // Toogle vizualization of perception radius
let goMiddle = false; // Pressing "a" toogle it, making all boids go to the center
let downloadCanvas = false; // Make it true to lower frameRate and download the canvas each 2 frames

let boid
//let boidsSlider, perceptionSlider, alignmentSlider, separationSlider; // Sliders
let boidsP, perceptionP, alignmentP, cohesionP, separationP; // Paragraphs
let startingBoids = 200; // Amount of boid at the start of the sketch
let startingPerception = 90; // Perception radius at the start of the sketch
let t = 0; // Counts the frame from the time boids go out of the middle of space


let numbernumberone
let numbernumberminusone



let m 


function setup (){
	fft = new p5.FFT();
    //music.amp(0.2);
    
	//music.play()

	

	let p5Canvas;
	if (downloadCanvas) {
    p5Canvas = createCanvas(windowWidth -10, windowHeight -10, WEBGL);
    frameRate(3);
  } else {
    p5Canvas = createCanvas(windowWidth -10, windowHeight -10, WEBGL);
	  frameRate(3)// You can change the resolution here
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
  
  // Create the DOM elements: sliders and paragraphs
  createDOMs();

  // Create an initial population of 100 boids
  for (let i = 0; i < 200; i++) {
    pushRandomBoid();


	noCursor()
  }
}

// DRAW FUNCTION ---------------------------------------------------
function draw() {
  // Background and lightning
  //background(0, 22.0, 84.3);

  background(0)
  let dirX = (mouseX / width - 0.5) * 2;
  let dirY = (mouseY / height - 0.5) * 2;
  directionalLight(0,22, 84.3, -dirX, -dirY, -1);

  let dirXX	 = (mouseX / width - 0.25) * 4;
  let dirYY = (mouseY / height - 0.25) * 4;
  directionalLight(68.6, 7.8 , 87.1, -dirXX, -dirYY, -1);

   m = millis()
   print(millis())

   if ( m > 186000){ambientLight(255)}else{
  ambientLight(93.3, 38.4, 56.1, 100)}
  //ambientLight(255)



  orbitControl();
  rotateY(0.5)

  

  boidfam()
 
}

function tempsoundting (){

	
	let spectrum = fft.analyze();
	noStroke();
	fill(255, 0, 255);
	translate(250, -200, 150)
	for (let i = 0; i< spectrum.length; i++){
	  let x = map(i, 0, spectrum.length, 0, width);
	  let h = -height + map(spectrum[i], 0, 255, height, 0);
	  sphere(x, height, width / spectrum.length, h )
	}
  
	let waveform = fft.waveform();
	noFill();
	beginShape();
	stroke(20);
	for (let i = 0; i < waveform.length; i++){
	  let x = map(i, 0, waveform.length, 0, width);
	  let y = map( waveform[i], -1, 1, 0, height);
	  vertex(x,y);
	}
	endShape();
}


  function boidfam (){
  // Make the quad tree
  //translate(-windowWidth, -windowHeight, -windowWidth, -windowHeight)
  let boundary = new Cube(0, 0, 0, width + 4 * gap, height + 4 * gap, depth + 4 * gap);
  quadTree = new QuadTree(boundary, 4);
  for (let boid of flock) {
    quadTree.insert(boid);
  }
  
  // Each boid determines its acceleration for the next frame
  for (let boid of flock) {
    boid.flock(flock, quadTree);
  }
  // Each boid updates its position and velocity, and is displayed on screen
  for (let boid of flock) {
    boid.update(gap);
    boid.show();
  }

  // Adjust the amount of boids on screen according to the slider value
  let maxBoids = 200;
  let difference = flock.length - maxBoids;
  if (difference < 0) {
    for (let i = 0; i < -difference; i++) {
      pushRandomBoid(); // Add boids if there are less boids than the slider value
    }
  } else if (difference > 0) {
    for (let i = 0; i < difference; i++) {
      flock.pop(); // Remove boids if there are more boids than the slider value
    }
  }
  
  t++; // t counts the number of frames, it is used to not have cohesion in the first 40 frames
  // Download the current state of the canvas as .png
  if (downloadCanvas && frameCount % 2 == 1) download(canvas, 'Flocking_' + frameCount + '.png');
}

// Create the DOM elements
function createDOMs() {
 
}

// Make a new boid
function pushRandomBoid() {
  //let pos = createVector(random(width), random(height), random(-depth/2, depth/2)); // Uncomment and comment next line to create boids at random position
  let pos = createVector(0, 0, 0); // Create a boid at the center of space
  let vel = p5.Vector.random3D().mult(random(0.5, 3)); // Give a random velocity
  let boid = new Boid(pos, vel); // Create a new boid
  flock.push(boid); // Add the new boid to the flock
}

// Canvas Donwload to make the gif
// Taken from Jose Quintana: https://codepen.io/joseluisq/pen/mnkLu
function download(canvas, filename) {
  /// create an "off-screen" anchor tag
  var lnk = document.createElement('a'), e;

  /// the key here is to set the download attribute of the a tag
  lnk.download = filename;

  /// convert canvas content to data-uri for link. When download
  /// attribute is set the content pointed to by link will be
  /// pushed as "download" in HTML5 capable browsers
  lnk.href = canvas.toDataURL("image/png;base64");

  /// create a "fake" click-event to trigger the download
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

// Boid class with flocking behavior
class Boid {
	constructor(pos, vel) {
	  this.pos = pos; // Position
	  this.vel = vel; // Velocity
	  this.acc = createVector(0, 0, 0); // Acceleration
	  this.maxForce = 0.1; // Maximum steering force for alignment, cohesion, separation
	  this.maxSpeed = 5; // Desired velocity for the steering behaviors
	  this.r = (0); // red color of the boid
	  this.g = floor(random(150, 200)); // green color of the boid
	  this.b = floor(random(50, 120)); // blue color of the boid
	}
	
	// Alignment rule
	// Steering to average neighbors velocity
	alignment(neighbors) {
	  let steering = createVector();
	  for (let other of neighbors) steering.add(other.vel); // Sum of neighbor velocities 
	  if (neighbors.length > 0) {
		steering.div(neighbors.length); // Average neighbors velocity
		steering.setMag(this.maxSpeed); // Desired velocity
		steering.sub(this.vel); // Actual steering
		steering.limit(this.maxForce); // Steering limited to maxForce
	  }
		return steering;
	}
	
	// Cohesion rule
	// Steering to the average neighbors position
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
		// Make an array of neighbors, i.e. all boids closer than the perception radius
		// The array will be passed to the different flocking behaviors
		for (let other of boids) {
		  let distance = this.pos.dist(other.pos);
		  if (other != this && distance < radius) {
			other.distance = distance; // Record the distance so it can be used later
			neighbors.push(other); // Put this neighbor in the "neighbors" array
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
	  
	  // If the boid is flies too high or too low, apply another force to make it fly around the middle of space's depth
	  if (this.pos.z < -depth/8 || this.pos.z > depth/8) {
		let force = createVector(0, 0, -this.pos.z / depth * this.maxForce * 2);
		this.acc.add(force);
	  }
	  
	  // If the boid has no neighbor, apply random forces so it can go find other boids
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
	  this.vel.mult(0.999); // Some friction
	  this.vel.limit(this.maxSpeed);
	  this.acc.mult(0);
	  
	  // Teleport to opposite side if the boid goes further than a side of space (X and Y axis)
	  // Except for the Z axis, as there is already a force keeping the boid from getting too far
	  if (this.pos.x > width/2 + gap) this.pos.x -= width + 1.7 * gap;
	  if (this.pos.x < -(width/2 + gap)) this.pos.x += width + 1.7 * gap;
	  if (this.pos.y > height/2 + gap) this.pos.y -= height + 1.7 * gap;
	  if (this.pos.y < -(height/2 + gap)) this.pos.y += height + 1.7 * gap;
	}
	
	// Show the boid on screen
	show() {
	  noStroke();
	  
	  //ambientMaterial(this.r, this.g, this.b);
  
	  push()
	  translate(this.pos.x, this.pos.y, this.pos.z);
	  
	  specularMaterial(61.2, 67.8, 100.0)
	  
	  sphere(20 +sin(frameCount/30)*35); // A sphere where the boid is
	  
	  translate(this.pos.x + 10 +sin(frameCount/20)*25, this.pos.y + 10 +sin(frameCount/20)*25, this.pos.z + 10 +sin(frameCount/20)*25);
	  specularMaterial(93.3, 38.4, 56.1)
	  
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

  // This file contains the QuadTree class
// as well as the Cube classe used by the QuadTree

// Cube --------------------------------------------------
// A cube delimiting the volume of a quad tree
// or the volume used for asking boids from a quad tree
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
  
  // QUAD TREE --------------------------------------------------
  // The quad tree stores points in a tree structure
  // to minimize the cost of distance calculation
  class QuadTree {
	constructor(boundary, capacity) {
	  this.boundary = boundary; // cube giving the borders of the quad tree
	  this.capacity = capacity; // Maximum amount of points that can be stored in the quad tree
	  this.boids = []; // Array storing the boids in the quad tree
	  this.divided = false; // True when the quad tree subdivides
	}
  
	// Insert a boid in the quad tree
	insert(boid) {
	  // Return if the boid is not in the area of this layer of quad tree
	  if (!this.boundary.contains(boid)) {
		return false;
	  }
  
	  // Add the boid at this layer or a deeper layer depending on capacity
	  if (this.boids.length < this.capacity) {
		// Add the point to this layer if there is still room for it
		this.boids.push(boid);
		return true;
	  } else {
		// Otherwise, subdivide to make room for the new boid
		// Subdivision divides the quad tree area into 8 new children quad trees
		if (!this.divided) {
		  this.subdivide();
		}
  
		// Add the boid to the relevant subdivision
		// N = North, S = South, E = East, W = West, B = Bottom, T = Top
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
  
	// Subdivides the quad tree if it is at full capacity, creating 8 new children quad trees
	subdivide() {
	  this.divided = true; // Informs of the subdivision to only subdivide once
  
	  let x = this.boundary.x;
	  let y = this.boundary.y;
	  let z = this.boundary.z;
	  let w = this.boundary.w / 2;
	  let h = this.boundary.h / 2;
	  let d = this.boundary.d / 2;
  
	  // Creates the 8 children quad trees with the relevant positions and area
	  // North West Top quad tree
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

  
