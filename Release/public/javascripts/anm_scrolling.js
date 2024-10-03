gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", function () {
	let pinBoxes = document.querySelectorAll(".pin-wrap > *");
	let pinWrap = document.querySelector(".pin-wrap");
	let pinWrapWidth = pinWrap.offsetWidth;
	let horizontalScrollLength = pinWrapWidth - window.innerWidth;
  
	// Pinning and horizontal scrolling
  
	gsap.to(".pin-wrap", {
	  scrollTrigger: {
		scrub: true,
		trigger: "#sectionPin",
		pin: true,
		// anticipatePin: 1,
		start: "top top",
		end: pinWrapWidth
	  },
	  x: -horizontalScrollLength,
	  ease: "none"
	});
    
	ScrollTrigger.refresh();
  });