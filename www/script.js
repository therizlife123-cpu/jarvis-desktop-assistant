window.addEventListener("load", windowLoadHandler, false);
var sphereRad = 140;
var radius_sp = 1;
var Debugger = function () {};
Debugger.log = function (message) { try { console.log(message); } catch (exception) { return; } };
function windowLoadHandler() { canvasApp(); }
function canvasSupport() { return Modernizr.canvas; }
function canvasApp() {
    if (!canvasSupport()) return;
    var theCanvas = document.getElementById("canvasOne");
    var context = theCanvas.getContext("2d");
    var displayWidth = theCanvas.width, displayHeight = theCanvas.height;
    var fLen = 320, projCenterX = displayWidth / 2, projCenterY = displayHeight / 2;
    var zMax = fLen - 2, particleList = {}, recycleBin = {};
    var randAccelX = 0.1, randAccelY = 0.1, randAccelZ = 0.1, gravity = 0;
    var particleRad = 1.8, sphereCenterX = 0, sphereCenterY = 0, sphereCenterZ = -3 - sphereRad;
    var zeroAlphaDepth = -750, turnSpeed = 2 * Math.PI / 1200, turnAngle = 0;
    var wait = 1, count = 0, numToAddEachFrame = 8;
    var rgbString = "rgba(0,72,255,", particleAlpha = 1;
    var p, nextParticle, sinAngle, cosAngle, rotX, rotZ, m, outsideTest, depthAlphaFactor;
    var i, theta, phi, x0, y0, z0;
    setInterval(onTimer, 10 / 24);
    function onTimer() {
        count++;
        if (count >= wait) {
            count = 0;
            for (i = 0; i < numToAddEachFrame; i++) {
                theta = Math.random() * 2 * Math.PI;
                phi = Math.acos(Math.random() * 2 - 1);
                x0 = sphereRad * Math.sin(phi) * Math.cos(theta);
                y0 = sphereRad * Math.sin(phi) * Math.sin(theta);
                z0 = sphereRad * Math.cos(phi);
                p = addParticle(x0, sphereCenterY + y0, sphereCenterZ + z0, 0.002*x0, 0.002*y0, 0.002*z0);
                p.attack=50; p.hold=50; p.decay=100; p.initValue=0; p.holdValue=particleAlpha;
                p.lastValue=0; p.stuckTime=90+Math.random()*20;
                p.accelX=0; p.accelY=gravity; p.accelZ=0;
            }
        }
        turnAngle = (turnAngle + turnSpeed) % (2*Math.PI);
        sinAngle = Math.sin(turnAngle); cosAngle = Math.cos(turnAngle);
        context.fillStyle="#000"; context.fillRect(0,0,displayWidth,displayHeight);
        p=particleList.first;
        while (p != null) {
            nextParticle=p.next; p.age++;
            if (p.age > p.stuckTime) {
                p.velX += p.accelX + randAccelX*(Math.random()*2-1);
                p.velY += p.accelY + randAccelY*(Math.random()*2-1);
                p.velZ += p.accelZ + randAccelZ*(Math.random()*2-1);
                p.x += p.velX; p.y += p.velY; p.z += p.velZ;
            }
            rotX=cosAngle*p.x+sinAngle*(p.z-sphereCenterZ);
            rotZ=-sinAngle*p.x+cosAngle*(p.z-sphereCenterZ)+sphereCenterZ;
            m=radius_sp*fLen/(fLen-rotZ);
            p.projX=rotX*m+projCenterX; p.projY=p.y*m+projCenterY;
            if (p.age < p.attack+p.hold+p.decay) {
                if (p.age < p.attack) p.alpha=(p.holdValue-p.initValue)/p.attack*p.age+p.initValue;
                else if (p.age < p.attack+p.hold) p.alpha=p.holdValue;
                else p.alpha=(p.lastValue-p.holdValue)/p.decay*(p.age-p.attack-p.hold)+p.holdValue;
            } else p.dead=true;
            outsideTest=p.projX>displayWidth || p.projX<0 || p.projY<0 || p.projY>displayHeight || rotZ>zMax;
            if (outsideTest || p.dead) recycle(p);
            else {
                depthAlphaFactor=Math.max(0,Math.min(1,1-rotZ/zeroAlphaDepth));
                context.fillStyle=rgbString+depthAlphaFactor*p.alpha+")";
                context.beginPath(); context.arc(p.projX,p.projY,m*particleRad,0,2*Math.PI,false);
                context.closePath(); context.fill();
            }
            p=nextParticle;
        }
    }
    function addParticle(x0,y0,z0,vx0,vy0,vz0) {
        var newParticle;
        if (recycleBin.first != null) {
            newParticle=recycleBin.first;
            if (newParticle.next != null) { recycleBin.first=newParticle.next; newParticle.next.prev=null; }
            else recycleBin.first=null;
        } else newParticle={};
        if (particleList.first == null) { particleList.first=newParticle; newParticle.prev=null; newParticle.next=null; }
        else { newParticle.next=particleList.first; particleList.first.prev=newParticle; particleList.first=newParticle; newParticle.prev=null; }
        newParticle.x=x0; newParticle.y=y0; newParticle.z=z0;
        newParticle.velX=vx0; newParticle.velY=vy0; newParticle.velZ=vz0;
        newParticle.age=0; newParticle.dead=false; newParticle.right=Math.random()<0.5;
        return newParticle;
    }
    function recycle(p) {
        if (particleList.first == p) {
            if (p.next != null) { p.next.prev=null; particleList.first=p.next; }
            else particleList.first=null;
        } else if (p.next == null) p.prev.next=null;
        else { p.prev.next=p.next; p.next.prev=p.prev; }
        if (recycleBin.first == null) { recycleBin.first=p; p.prev=null; p.next=null; }
        else { p.next=recycleBin.first; recycleBin.first.prev=p; recycleBin.first=p; p.prev=null; }
    }
}
$(function () {
    $("#slider-range").slider({range:false,min:20,max:500,value:280,slide:function(event,ui){console.log(ui.value);sphereRad=ui.value;}});
});
$(function () {
    $("#slider-test").slider({range:false,min:1.0,max:2.0,value:1,step:0.01,slide:function(event,ui){radius_sp=ui.value;}});
});
