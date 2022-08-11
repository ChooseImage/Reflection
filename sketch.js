
// COLOR
const lGray = '#D0D0D0';
const mGray = '#8e8e8e';
const dGray = '#535353';
// Primary
const Yellow = '#EEA71F';
const dYellow = '#df9912';
const lBlue = '#2973f3';
const dBlue = '#1757d7';
const Red = '#e1503c';
const lRed = '#f25b47';
const dRed = '#da4631';
const rRed = '#eb796a';
// Secondary
const Green = '#179e7e'
const lGreen = '#1dab89';
const dGreen = '#19866c';
const lPurple = '#8f37ff';
const Purple = '#802eea';
const dPurple = '#6d22cc';
const lPink = '#E76AFB';
const Pink = '#db53f1';
const dPink = '#c347d7';

/*
TWEAKPANE init
places to instantiate toggles for visual guides, 
element positions
*/
const pane = new Tweakpane.Pane();
// add a folder var for sandbox controllers
const sandBoxCtrls = pane.addFolder({
  title: 'SandBoxControls',
  expanded: true,
  hidden: false
});

const PARAMS = {
  SandBox: true,
  ShowNewSurface: false,
  ShowEdge: false,
  SurfaceExtension: false,
  ObjectRay: false,
  SurfaceNormal: false,
  ObjectDistance: false,
  SurfaceAng: 0,
  newSurfaceAng: 0,
  SurfacePos: {x: 0, y: 0},  
  ObjPos: {x:0, y:0},
  showSight: false
}

// Var for checking if Observer and Object are on the same side
let eyeRightSide, triangleRightSide;
// RAY LENGTH
let rayMax = 0; 

let ObjectDistance = false;          // Show objDistance
let SurfaceExtension = false;        // Show surface Extension
let ObjectRay = false;               // Show object reflection
let showSight = false;               // Var for displaying observer's rayline
let objMove, pointSize; // Var for obj drag and drop
let sourceMove;   // Var for source drag n drop
let surfaceMove;                    // Var for surface drag n drop

// Prompt
let displayText;
// SURFACE 
let surface1Center, surface1;
// TRIANGLE
let triangle1, triangle1Pos, triangle1Size;
// EYE
let eyePos1;
let lx, ly; // Cartesian representation for line coords
let r; // half the length of Line
let offX, offY, offAng // Position and Rotation Var for user controls

// Fonts

let sourceCode, soleil;

function preload() {
  sourceCode = loadFont('fonts/SourceCodePro-Regular.ttf');
  soleil = loadFont('fonts/SoleilRegular.otf');
}




function setup() {
  angleMode(DEGREES);
  createCanvas(800, 800);
  
  // TEXT VISUAL PARAMS
  textSize(16);
  textFont(soleil);
  textFont(sourceCode);

  // TWEAKPANE
 

  pane.addInput(PARAMS, 'SandBox');
  sandBoxCtrls.addInput(PARAMS, 'SurfaceExtension');
  sandBoxCtrls.addInput(PARAMS, 'ObjectDistance');
  sandBoxCtrls.addInput(PARAMS, 'ObjectRay');
  sandBoxCtrls.addInput(PARAMS, 'showSight');
  sandBoxCtrls.addInput(PARAMS, 'SurfaceAng',{
   min: -90,
   max: 90 
  });

 

  // RAY LENGTH
  rayMax = 1200;
  
  // Surface Length
  r = 50;
  // Surface Initial position
  surface1Center = new p5.Vector(width/2, height/2);
  // Triangle Properties
  triangle1Pos = new p5.Vector(width*0.75, height*0.4);
  triangle1Size = 40;
  eyePos1 = new p5.Vector(width*0.3, height*0.2);
}


// ------------------------------------------------------------------------------------------- //

function draw() {
  
  clear();
  background(lGray);
  noStroke();
  strokeWeight(4);
  displayText = 'Click and move the Yellow Dot around';
  
  // Check if toggled 'SandBox Mode'
  if(!PARAMS.SandBox){
    execSenario();
    sandBoxCtrls.hidden = true;
  }else{
    sandBoxCtrls.hidden = false;
  };
  
  pointSize = 13;
  
  // Create the object surface 
  surface1 = createSurface(surface1Center, 40, PARAMS.SurfaceAng);
 
  if(eyeRightSide && showSight){
    stroke(dGreen); // Draw incentent ray
  } else {
    stroke(230, 230, 230, 0); // Hide ray 
  }
  
  noStroke();
  fill(30);
  
  // TRIANGLE
  // Draw triangle Ray
  if(triangleRightSide){
    triangleRay(triangle1Pos, surface1);
    // Draw Triangle Distance
    if(ObjectDistance){
      stroke(Purple);
      drawTriangleDistance(triangle1Pos, triangle1, surface1);
    }
  }
  // Draw Triangle + Drag Point
  const tSize = 40;
  noStroke();
  fill(210, 100, 100);
  triangle1 = createTriangle(triangle1Pos, 40);
  fill(Yellow);
  circle(triangle1Pos.x, triangle1Pos.y, pointSize);
  // Virtual
  if(triangleRightSide && eyeRightSide){
    stroke(210, 100, 100);
    noFill();
    drawingContext.setLineDash([5, 7]);
    let triangle1_Reflection_From_Surface1 = reflectTriangle(triangle1, surface1);
  }
  // Draw eye + Drag Point + eye Ray
  eye(eyePos1, surface1); 

  // Draw Surface + Drag Point + Extension
  strokeWeight(4);
  surfaceExtension(surface1);
  drawingContext.setLineDash([1, 1]);
  stroke(dGray);
  line(surface1.point1.x, surface1.point1.y,
       surface1.point2.x, surface1.point2.y);
  noStroke();
  fill(Yellow);
  circle(surface1.center.x, surface1.center.y, pointSize);
  
  //Check triangle rightside
  triangleRightSide = triangle1Pos.copy().sub(surface1.center).dot(surface1.normal) > 0 ? false : true;
  // Show angle
  if(triangleRightSide){
    showAngle(surface1, triangle1Pos, surface1.point1, ObjectRay);
    showAngle(surface1, triangle1Pos, surface1.point2, ObjectRay);
    showAngle(surface1, eyePos1, surface1.center, showSight);
  }
  
  // Display Text
  fill(30);
  text(displayText, 20, 40);
  
}

// ------------------------------------------------------------------------------------------- //


function eye(eyePos, surface){
  /*
  Draw eye to surface center's incident ray and reflection ray
  */
  
  let eyeToSurface = eyePos.copy().sub(surface.center);
  eyeRightSide = eyeToSurface.dot(surface.normal) > 0 ? false : true;


  // Visual properties
  strokeWeight(4);
  // Check if Observer is on the right side
  if(eyeRightSide && showSight){
    stroke(dGreen); // Draw incentent ray
  } else {
    stroke(230, 230, 230, 0); // Hide ray 
  }
  //Incident Ray
  drawingContext.setLineDash([1,1]);
  line(eyePos.x, eyePos.y, surface.center.x, surface.center.y);
  if(PARAMS.ShowEdge){
    strokeWeight(2);
    stroke(Red);
    line(eyePos.x, eyePos.y, surface.point1.x, surface.point1.y);
    line(eyePos.x, eyePos.y, surface.point2.x, surface.point2.y);
    strokeWeight(4);
    stroke(lBlue);
  }
  
    // Reflection
  if(showSight){
  reflection(surface.center.x, surface.center.y, eyePos.x, eyePos.y, surface.normal, surface.tangent, 4, lGreen);
  }
 
  // Drag Point
  noStroke();
  fill(255, 90);
  ellipse(eyePos.x, eyePos.y, 42, 18);
  fill(Yellow);
  circle(eyePos.x, eyePos.y, 16);
  

}


function drawTriangleDistance(trianglePos, triangle, surface){
  drawingContext.setLineDash([3,7]);
  let tri_Reflection_From_Surface = reflectTriangle(triangle, surface);
  // Calculate Distance Between Object and Surface -> Use the Virtual one
  let tri_Reflection_From_Surface_Pos = reflectPoint(surface.center.x, surface.center.y, trianglePos.x, trianglePos.y, surface.normal, surface.tangent);
  let intersection = p5.Vector.lerp(trianglePos, tri_Reflection_From_Surface_Pos, 1/2);
    stroke(Purple);
    line(trianglePos.x, trianglePos.y, intersection.x, intersection.y);
  // Draw normal indicator
    let nSize = 18;
    line(intersection.x + nSize * -surface.normal.x, intersection.y + nSize * -surface.normal.y, 
         intersection.x + nSize * -surface.tangent.x + nSize * -surface.normal.x, intersection.y + nSize * -surface.tangent.y + nSize * -surface.normal.y);
    
    line(intersection.x + nSize * -surface.tangent.x, intersection.y + nSize * -            surface.tangent.y, 
         intersection.x + nSize * -surface.tangent.x + nSize * -surface.normal.x, intersection.y + nSize * -surface.tangent.y + nSize * -surface.normal.y);
    
    stroke('purple');
    line(tri_Reflection_From_Surface_Pos.x, tri_Reflection_From_Surface_Pos.y, intersection.x, intersection.y);
    
    // Draw length indicator
    push();
    strokeWeight(1);
    drawingContext.setLineDash([1,1]);
    stroke(dBlue);
    translate(2*nSize * surface.tangent.x, 2*nSize * surface.tangent.y);
    line(trianglePos.x, trianglePos.y, intersection.x, intersection.y); 
    line((trianglePos.x + intersection.x) / 2 - nSize/2 * surface.tangent.x, 
         (trianglePos.y + intersection.y) / 2 - nSize/2 * surface.tangent.y,
         (trianglePos.x + intersection.x) / 2 + nSize/2 * surface.tangent.x, 
         (trianglePos.y + intersection.y) / 2 + nSize/2 * surface.tangent.y
    )
    push();
    translate(nSize*surface.normal.x/2, nSize*surface.normal.y/2);
    line((trianglePos.x + intersection.x) / 2 - nSize/2 * surface.tangent.x, 
         (trianglePos.y + intersection.y) / 2 - nSize/2 * surface.tangent.y,
         (trianglePos.x + intersection.x) / 2 + nSize/2 * surface.tangent.x, 
         (trianglePos.y + intersection.y) / 2 + nSize/2 * surface.tangent.y
    )
    pop();
    
    line(intersection.x + nSize * -surface.tangent.x, intersection.y + nSize * - surface.tangent.y,            intersection.x, intersection.y);
    
    line(trianglePos.x + nSize * -surface.tangent.x, trianglePos.y + nSize * - surface.tangent.y, trianglePos.x, trianglePos.y);
    
    
    line(tri_Reflection_From_Surface_Pos.x, tri_Reflection_From_Surface_Pos.y, intersection.x, intersection.y);
    line(tri_Reflection_From_Surface_Pos.x + nSize * -surface.tangent.x, tri_Reflection_From_Surface_Pos.y + nSize * - surface.tangent.y, tri_Reflection_From_Surface_Pos.x, tri_Reflection_From_Surface_Pos.y);
    
    line((tri_Reflection_From_Surface_Pos.x + intersection.x) / 2 - nSize/2 * surface.tangent.x, 
         (tri_Reflection_From_Surface_Pos.y + intersection.y) / 2 - nSize/2 * surface.tangent.y,
         (tri_Reflection_From_Surface_Pos.x + intersection.x) / 2 + nSize/2 * surface.tangent.x, 
         (tri_Reflection_From_Surface_Pos.y + intersection.y) / 2 + nSize/2 * surface.tangent.y
    )
    push();
    translate(nSize*surface.normal.x/2, nSize*surface.normal.y/2);
    line((tri_Reflection_From_Surface_Pos.x + intersection.x) / 2 - nSize/2 * surface.tangent.x, 
         (tri_Reflection_From_Surface_Pos.y + intersection.y) / 2 - nSize/2 * surface.tangent.y,
         (tri_Reflection_From_Surface_Pos.x + intersection.x) / 2 + nSize/2 * surface.tangent.x, 
         (tri_Reflection_From_Surface_Pos.y + intersection.y) / 2 + nSize/2 * surface.tangent.y
    )
    pop();
    
    pop();
}


function createSurface(surfaceCenter, surfaceLength, surfaceAngle){
  
  // X,Y distance to SurfaceCenter
     const lx = r * cos(surfaceAngle);
     const ly = r * sin(surfaceAngle);
  // Calc two Surface Points
     const p1 = new p5.Vector(surfaceCenter.x -lx, 
                            surfaceCenter.y - ly);
     const p2 = new p5.Vector(surfaceCenter.x + lx, 
                            surfaceCenter.y + ly);
  // Calc distance and Direction between p1 and p2
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    d = Math.sqrt(dx * dx + dy * dy);
  // Calc Surface's Normal and Tangent Vector
  const tangent = new p5.Vector(dx / d, dy /d);
  const normal = new p5.Vector(-tangent.y, tangent.x);
  // Calc Surface's angle
  const SurfaceAng = degrees(tangent.heading());
  
  
  // Return an object containing all the above properties
  return {
    point1: p1,
    point2: p2,
    tangent: tangent,
    normal: normal,
    angle: surfaceAngle,
    center: surfaceCenter
  }
}

function createTriangle(center, r){
  const p1 = new p5.Vector(center.x - r/2, center.y - r / (2 * sqrt(3)));
  const p2 = new p5.Vector(center.x + r/2, center.y - r / (2 * sqrt(3)));
  const p3 = new p5.Vector(center.x, center.y + r / sqrt(3));
  
  
  
  noStroke();
  fill(230, 100, 100);
  triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  let points = [p1, p2, p3]
  return points;
}

function triangleRay(trianglePos, surface){
    if(ObjectRay){
    strokeWeight(4);
    stroke(dRed);
    drawingContext.setLineDash([1,1]);
    line(trianglePos.x, trianglePos.y, surface.point1.x, surface.point1.y);
    line(trianglePos.x, trianglePos.y, surface.point2.x, surface.point2.y);
    // Reflection Line
    reflection(surface.point1.x, surface.point1.y, trianglePos.x, trianglePos.y, surface.normal, surface1.tangent, 4, rRed, rRed, true);
    reflection(surface.point2.x, surface.point2.y, trianglePos.x, trianglePos.y, surface.normal, surface1.tangent, 4, rRed, rRed, true);
  }
}

function reflectTriangle(trianglePoints, surface){
  const newPoints = [];
  for(let i =0; i< trianglePoints.length; i++){
    newPoints.push(reflectPoint(surface.center.x, surface.center.y, trianglePoints[i].x, trianglePoints[i].y, surface.normal, surface.tangent));
  }
  drawingContext.setLineDash([3,7]);
  stroke(230, 100, 100);
  noFill();
  triangle(newPoints[0].x, newPoints[0].y, newPoints[1].x, newPoints[1].y, newPoints[2].x, newPoints[2].y);
  return newPoints;
}


function reflection(xSurface, ySurface, xSource, ySource, norm, tangent, lineWeight = 4, rColor = color(lBlue), vColor = color(210, 100, 100), obj = false){
  const dx = xSurface - xSource;
  const dy = ySurface - ySource;
  const d = Math.sqrt(dx * dx + dy * dy);
  const r = max(0, rayMax - d);
  
  // Normalized direction
  const dnx = dx / d;
  const dny = dy / d;

  
  const dpNorm = dnx * norm.x + dny * norm.y;
  
  const rx = dnx - 2 * norm.x * dpNorm;
  const ry = dny - 2 * norm.y * dpNorm;
  
  strokeWeight(lineWeight);
  


  if(eyeRightSide){
    // Reflection Line
    stroke(rColor);
    drawingContext.setLineDash([1, 1]);
    line(xSurface, ySurface, xSurface + rx * r, ySurface + ry * r);
    // Virtual Line
    stroke(vColor);
    drawingContext.setLineDash([5, 15]);
    
    if(!obj){
      line(xSurface, ySurface, xSurface + dnx * r, ySurface + dny * r);
    }
    
    
    // Obj virtual Line
    if(obj){
      
      let virtualObjPoint = reflectPoint(xSurface, ySurface, xSource, ySource,       norm, tangent);
      line(xSurface, ySurface, virtualObjPoint.x, virtualObjPoint.y);
    }
  }

}

function showAngle(surface, target, contactPoint, isVisible){
  
  push();
  translate(contactPoint.x, contactPoint.y);
  if(eyeRightSide){
    let incident = target.copy().sub(contactPoint);
    let incident_angle = degrees(incident.heading());
    let delta_incident_to_surface = Math.abs(incident_angle - surface.angle);
    // Calc Text pos -> Needs further Finetuning, easily broken now
    const rText = 40;
    const angOffset = 0.3;
    let posText = new p5.Vector(- rText * cos(incident_angle * angOffset), -rText * sin(incident_angle * angOffset));
    // Display Text + Arc
    if(isVisible){
      noStroke();
      fill(0, 95);
      let displayAng = min(delta_incident_to_surface, 180-delta_incident_to_surface); // Catch the other side
      if(delta_incident_to_surface < 90){
        text(displayAng.toFixed(1), posText.x, posText.y);
        // Display Arc
        noFill();
        strokeWeight(2);
        drawingContext.setLineDash([2, 3]);
        stroke(0, 95);
        arc(0, 0, rText, rText, incident_angle, surface.angle);
        stroke(0, 60);
        arc(0, 0, rText, rText, surface.angle-180, 180-incident_angle+2*surface.angle);
      }else{
        text(Math.abs(displayAng.toFixed(1)), -posText.x, -posText.y);
        // Display Arc
        noFill();
        strokeWeight(2);
        drawingContext.setLineDash([2, 3]);
        stroke(0, 95);
        arc(0, 0, rText, rText, surface.angle-180, incident_angle);
        stroke(0, 60);
        arc(0, 0, rText, rText, 180-incident_angle+surface.angle*2, surface.angle);
      }
    }
  }
  pop();
}


function surfaceExtension(surface){
  const length = sqrt(width * width + height * height);
    if(SurfaceExtension){
      
    // Draw Line Guide
    stroke(mGray);
    drawingContext.setLineDash([5,7]);
    line(surface.point2.x - surface.tangent.x * length, 
         surface.point2.y - surface.tangent.y*length,
         surface.point1.x + surface.tangent.x * length, 
         surface.point1.y + surface.tangent.y*length)
      
    // Draw Ground
    noStroke();
      fill(20, 20);
    beginShape();
    vertex(surface.point2.x - surface.tangent.x * length, 
           surface.point2.y - surface.tangent.y*length);
    vertex(0, height);
    vertex(width, height);
    vertex(surface.point1.x + surface.tangent.x * length,
           surface.point1.y + surface.tangent.y*length);
    endShape(CLOSE);  
    
  }
}

function reflectPoint(xSurface, ySurface, xSource, ySource, norm, tangent){
  const dx = xSurface - xSource;
  const dy = ySurface - ySource;
  const d = Math.sqrt(dx * dx + dy * dy);
  const r = d;
  
  // Normalized direction
  const dnx = dx / d;
  const dny = dy / d;

  
  const dpNorm = dnx * norm.x + dny * norm.y;
  
  const rx = dnx - 2 * norm.x * dpNorm;
  const ry = dny - 2 * norm.y * dpNorm;
  
  strokeWeight(4);
  
  // Reflection Point
  let rPoint = new p5.Vector(xSurface - rx * r, ySurface - ry * r);
  return rPoint;

}

function execSenario(){
    surface1Center = new p5.Vector(width/2, height/2);
    triangle1Pos = new p5.Vector(width*0.75, height*0.2);
    // Restrict eye movement
    eyePos1.y = height*0.2;
    PARAMS.SurfaceAng = 0;
    SurfaceExtension = true; 
    showSight = true;
    drawEyeMoveArrow(eyePos1);
    displayText = 'Move the eye left and right to reach the triangle';
  /*
    
  */
    displayEyeToTriangle(eyePos1, triangle1Pos, surface1);
    displaySurfaceNormal(surface1);

}

function displayEyeToTriangle(eyePos, trianglePos, surface){
  
  // Calc intersections and draw 2 lines
    let intersection = new p5.Vector(surface.center.x, eyePos.y);
    stroke(lGreen);
    strokeWeight(4);

    let distEyeToIntersection = eyePos.dist(intersection);
    let distTriangleToIntersection = trianglePos.dist(intersection);
  
  // 90 Degree notation
    noFill();
    strokeWeight(4);
    rect(intersection.x-15, eyePos.y, 15, 15);
  
  // Check if eye can see the object
    if(Math.abs(distEyeToIntersection - distTriangleToIntersection) <= 25){
      stroke(rRed);
      // Equal notation
      line(eyePos.x + distEyeToIntersection/2, eyePos.y-10, 
           eyePos.x + distEyeToIntersection/2, eyePos.y+10);
      line(eyePos.x + distEyeToIntersection/2+7, eyePos.y-10, 
           eyePos.x + distEyeToIntersection/2+7, eyePos.y+10);
      
      line(trianglePos.x - distTriangleToIntersection/2, trianglePos.y-10, 
           trianglePos.x - distTriangleToIntersection/2, trianglePos.y+10);
      line(trianglePos.x - distTriangleToIntersection/2+7, trianglePos.y-10, 
           trianglePos.x - distTriangleToIntersection/2+7, trianglePos.y+10)
    }
  
    drawingContext.setLineDash([2, 5]);
    line(eyePos.x, eyePos.y, intersection.x, intersection.y);
    stroke(rRed);
    line(trianglePos.x, trianglePos.y, intersection.x, intersection.y);
}

function displaySurfaceNormal(surface){
  drawingContext.setLineDash([2, 5]);
  stroke(mGray);
  strokeWeight(4);
  line(surface.center.x, 0, surface.center.x, surface.center.y);
}

function drawEyeMoveArrow(eyepos){
  let p1 = new p5.Vector(eyepos.x + 35, eyepos.y);
  let p2 = new p5.Vector(eyepos.x + 26, eyepos.y - 7);
  let p3 = new p5.Vector(eyepos.x + 26, eyepos.y + 7);
  
  let pa = new p5.Vector(eyepos.x - 35, eyepos.y);
  let pb = new p5.Vector(eyepos.x - 26, eyepos.y - 7);
  let pc = new p5.Vector(eyepos.x - 26, eyepos.y + 7);
  noStroke();
  fill(dYellow);
  triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  triangle(pa.x, pa.y, pb.x, pb.y, pc.x, pc.y);
}

function mousePressed(){
  
  // OBJ DRAG n DROP
  let distance = dist(mouseX, mouseY, triangle1Pos.x, triangle1Pos.y);
  if (distance <= pointSize){
      objMove = true;
      ObjectDistance = true;    // Show Guided lines when moving
      SurfaceExtension = true;    // Show Guided lines when moving
      ObjectRay = true;
      showSight = false;
      }else{
        objMove = false;
      }
  
  // EYE DRAG n DROP
  let distance1 = dist(mouseX, mouseY, eyePos1.x, eyePos1.y);
  if  (distance1 <= pointSize){
    sourceMove = true;
    showSight = true;
    SurfaceExtension = true;
      }else{
        sourceMove = false;
      }
  
  
  // Surface Drag and Drop
  let distance2 = dist(mouseX, mouseY, surface1.center.x, surface1.center.y)
  if  (distance2 <= pointSize){
      surfaceMove = true;
      ObjectDistance = true; 
      SurfaceExtension = true;
    if(PARAMS.ShowNewSurface){
      nsExt = true;
    }
      }else{
        surfaceMove = false; 
      }
  
}

function mouseReleased(){
  objMove = false;
  sourceMove = false;
  surfaceMove = false;
  nsurfaceMove = false;
  ObjectDistance = PARAMS.ObjectDistance;
  SurfaceExtension = PARAMS.SurfaceExtension;
  nsExt = false;
  ObjectRay = PARAMS.ObjectRay;
  showSight = PARAMS.showSight;
  
}

function mouseDragged(){
  
  if(objMove){
    triangle1Pos.x = mouseX;
    triangle1Pos.y = mouseY;
  }
  
  if(sourceMove){
    eyePos1.x = mouseX;
    eyePos1.y = mouseY;
    
    if(!PARAMS.SandBox){
      eyePos1.x = mouseX;
    }
  }
  
  if(surfaceMove){
    surface1.center.x = mouseX;
    surface1.center.y = mouseY;
  }

}


