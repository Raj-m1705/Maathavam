/* ======================================================
   MADHAVAM WEBSITE SCRIPT
   RESPONSIVE + GSAP + INTERACTIONS
====================================================== */


/* ======================================================
   DOM READY
====================================================== */

document.addEventListener("DOMContentLoaded", () => {


/* ======================================================
   MOBILE NAVBAR
====================================================== */


const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");


if(menuBtn && navLinks){


    menuBtn.addEventListener("click",()=>{

        navLinks.classList.toggle("active");
        menuBtn.classList.toggle("open");

    });



    document
    .querySelectorAll(".nav-links a")
    .forEach(link=>{

        link.addEventListener("click",()=>{

            navLinks.classList.remove("active");
            menuBtn.classList.remove("open");

        });

    });


}






/* ======================================================
   GSAP INITIALIZATION
====================================================== */


const hasGSAP =
typeof gsap !== "undefined";


const hasScrollTrigger =
typeof ScrollTrigger !== "undefined";



if(hasGSAP){


    if(hasScrollTrigger){

        gsap.registerPlugin(
            ScrollTrigger
        );

    }



/* ======================================================
   HERO ANIMATION
====================================================== */


const heroTimeline =
gsap.timeline();



heroTimeline
.from(".announcement",
{
    opacity:0,
    y:30,
    duration:.8
})


.from(".hero h1",
{
    opacity:0,
    y:50,
    duration:1
},
"-=.4")


.from(".hero h2",
{
    opacity:0,
    y:30,
    duration:.7
},
"-=.5")


.from(".hero p",
{
    opacity:0,
    y:30,
    duration:.7
},
"-=.5")


.from(".hero-buttons",
{
    opacity:0,
    y:30,
    duration:.7
},
"-=.4")



.from(".hero-core",
{
    opacity:0,
    scale:.5,
    duration:1,
    ease:"back.out"
},
"-=.6");







/* ======================================================
   AI CORE FLOAT
====================================================== */


const heroCore =
document.querySelector(".hero-core");


if(heroCore){


gsap.to(
heroCore,
{

y:-20,

duration:3,

repeat:-1,

yoyo:true,

ease:"sine.inOut"

});


}






/* ======================================================
   RING ROTATIONS
====================================================== */


[
[".ring1",360,20],
[".ring2",-360,25],
[".ring3",360,30],
[".ring4",-360,35]

]
.forEach(item=>{


if(document.querySelector(item[0])){


gsap.to(
item[0],
{

rotation:item[1],

duration:item[2],

repeat:-1,

ease:"none"

}

);


}


});







/* ======================================================
   SCROLL REVEAL
====================================================== */


if(hasScrollTrigger){


document
.querySelectorAll(
`
.challenge-card,
.stat-box,
.framework-card,
.solution-card,
.industry-card,
.why-point,
.leader-card,
.leader-message,
.insight-card,
.impact-item,
.contact-card
`
)
.forEach(element=>{


gsap.from(
element,
{


scrollTrigger:{

trigger:element,

start:"top 85%",

toggleActions:
"play none none reverse"

},


opacity:0,

y:50,

duration:.8,

ease:"power3.out"


});


});


}


/* ======================================================
   PARTICLE SYSTEM
====================================================== */


const particleCanvas =
document.getElementById("particles");



if(particleCanvas){


const ctx =
particleCanvas.getContext("2d");


let particles=[];



function resizeCanvas(){


particleCanvas.width =
window.innerWidth;


particleCanvas.height =
window.innerHeight;


}



resizeCanvas();



window.addEventListener(
"resize",
resizeCanvas
);





class Particle{


constructor(){


this.x =
Math.random()*particleCanvas.width;


this.y =
Math.random()*particleCanvas.height;


this.size =
Math.random()*2+1;


this.speedX =
(Math.random()-.5)*.5;


this.speedY =
(Math.random()-.5)*.5;


}



update(){


this.x += this.speedX;

this.y += this.speedY;



if(
this.x<0 ||
this.x>particleCanvas.width
)

this.speedX*=-1;



if(
this.y<0 ||
this.y>particleCanvas.height
)

this.speedY*=-1;


}



draw(){


ctx.beginPath();


ctx.arc(
this.x,
this.y,
this.size,
0,
Math.PI*2
);



ctx.fillStyle =
"rgba(46,139,255,.35)";


ctx.fill();


}


}






function createParticles(){


particles=[];


const count =
window.innerWidth < 700
?
35
:
90;



for(
let i=0;
i<count;
i++
){

particles.push(
new Particle()
);

}


}



createParticles();


window.addEventListener(
"resize",
createParticles
);






function connect(){


for(
let a=0;
a<particles.length;
a++
){


for(
let b=a;
b<particles.length;
b++
){


const dx =
particles[a].x -
particles[b].x;


const dy =
particles[a].y -
particles[b].y;


const distance =
Math.sqrt(
dx*dx+dy*dy
);



if(distance<120){


ctx.beginPath();


ctx.strokeStyle =
"rgba(46,139,255,.08)";


ctx.moveTo(
particles[a].x,
particles[a].y
);


ctx.lineTo(
particles[b].x,
particles[b].y
);


ctx.stroke();


}



}


}


}







function animateParticles(){


ctx.clearRect(
0,
0,
particleCanvas.width,
particleCanvas.height
);



particles.forEach(p=>{

p.update();

p.draw();

});



connect();



requestAnimationFrame(
animateParticles
);


}



animateParticles();


}








/* ======================================================
   CURSOR GLOW
====================================================== */


const cursorGlow =
document.getElementById(
"cursor-glow"
);



if(
cursorGlow &&
window.matchMedia(
"(pointer:fine)"
).matches
){


document.addEventListener(
"mousemove",
e=>{


if(typeof gsap !== "undefined"){


gsap.to(
cursorGlow,
{


x:e.clientX-150,

y:e.clientY-150,

duration:.4


});


}


});


}








/* ======================================================
   COUNTERS
====================================================== */


if(
typeof ScrollTrigger !== "undefined"
){


document
.querySelectorAll(".stat-box h3")
.forEach(counter=>{


ScrollTrigger.create({

trigger:counter,

start:"top 90%",


once:true,


onEnter:()=>{


const value =
counter.innerText;


let number =
parseInt(value);



if(!isNaN(number)){


gsap.fromTo(
counter,
{

innerText:0

},

{

innerText:number,

duration:2,

snap:
{
innerText:1
},


onUpdate:()=>{


counter.innerText =
Math.floor(
counter.innerText
)
+
(value.includes("%")
?
"%"
:
value.includes("X")
?
"X"
:
"");


}

}

);


}


}


});


});


}








/* ======================================================
   SMOOTH SCROLL
====================================================== */


document
.querySelectorAll(
'a[href^="#"]'
)
.forEach(anchor=>{


anchor.addEventListener(
"click",
e=>{


const target =
document.querySelector(
anchor.getAttribute("href")
);



if(target){


e.preventDefault();


target.scrollIntoView({

behavior:"smooth"

});


}


});


});







/* ======================================================
   NAVBAR SCROLL EFFECT
====================================================== */


const header =
document.querySelector("header");


if(header){


window.addEventListener(
"scroll",
()=>{


header.classList.toggle(
"scrolled",
window.scrollY>60
);


});


}







/* ======================================================
   CONTACT FORM
====================================================== */


const form =
document.querySelector(
".contact-card form"
);



if(form){


form.addEventListener(
"submit",
e=>{


e.preventDefault();


const btn =
form.querySelector("button");


btn.innerText =
"Message Sent ✓";


form.reset();



setTimeout(()=>{


btn.innerText =
"Start Conversation";


},3000);



});


}







/* ======================================================
   RESIZE REFRESH
====================================================== */


window.addEventListener(
"resize",
()=>{


if(
typeof ScrollTrigger !== "undefined"
){

ScrollTrigger.refresh();

}


});



}});
