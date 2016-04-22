//var oneParticle;
var particleSystem = [];
var sound;

function preload(){
    sound = loadSound('explosion.m4a')
}


function setup() {
    
    var canvas = createCanvas(windowWidth,
                              windowHeight);

    frameRate(30);
    
    //colorMode(HSB,360,100,100,100);
    
    //var pos =  createVector(width/2, height/2);
    //var vel =  createVector(0, 5); //5 is speed
    //oneParticle = new Particle(pos, vel);
    
    for(var i=0; i<200; i++){
        
        var pos = createVector(width/2,
                               height/2);
        var vel = createVector(0,1);
        vel.rotate(random(0,TWO_PI));
        vel.mult(random(1,10));
        var newBorn = new Particle(pos, vel);
        particleSystem.push(newBorn);
    }
  colorMode(HSB,360,100,100,100);
}

function draw() {
  
    background(0);
    blendMode(SCREEN);
    
    for(var i=particleSystem.length-1; i>=0; i--){
        var p = particleSystem[i];
        
        if(p.areYouDeadYet()){
            particleSystem.splice(i,1);
            
        if(particleSystem.length<300){createMightyParticles(p.getPos())}
        } else {//update and render the particle
        p.update();
        p.draw();
        
    }
    }
}


function windowResized(){
    resizeCanvas(windowWidth,windowHeight);
}

 var Particle= function(pp,vv,hh){
    var pos= pp.copy();  //*add velocity to the position*/
    var vel = vv.copy(); 
    var acc = createVector(0,0.25);
    var psize = random(10,20);
    
    var initialLifeSpan = random (30,60);
    this.lifeSpan = initialLifeSpan;
    
    var hh = random(hh-15, hh+15);
     
    this.update = function(){
        vel.add(acc);
        this.lifeSpan--;//*this.lifeSpan = this.lifeSpan - 1;*/
       
        pos.add(vel);
    }
       
     
    
    this.draw= function(){
            
        var transparency = map(this.lifeSpan,0,initialLifeSpan,0,100);
        stroke(hh,100,100,transparency);
        line(pos.x,pos.y,pos.x -5*vel.x, pos.y - 5*vel.y);
        noStroke();
        fill(hh,100,100,transparency);
        ellipse(pos.x, 
                pos.y,
                psize,
                psize);
        }
    
    this.areYouDeadYet = function(){
            return this.lifeSpan <= 0;
    }
    
    this.getPos = function(){
        return pos.copy();
    }
    
 }
    
   function createMightyParticles(initialPos){
       sound.play();
     var pos; if(!initialPos){pos = createVector(mouseX,mouseY);}
       else{pos = initialPos.copy();}
            
        var hue=random(0,360);
       var saturation = random(0,100);
       
       for(var i=0;i<200;i++){
        var vel = createVector(0,1);
        vel.rotate(random(0,TWO_PI));
        vel.mult(random(1,10));
            
        var newBorn = new Particle(pos, vel, hue);
        particleSystem.push(newBorn)
            
        }
}
    
function mouseClicked(){
    createMightyParticles();
}
//the mouseClicked function should be outside the particle

//*var particle = new Particle(myposition, my velocity);*/