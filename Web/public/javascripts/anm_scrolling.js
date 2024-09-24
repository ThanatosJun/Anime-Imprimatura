document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // onscroll text animation
  gsap.to(".c1 h1", {
    duration: 2,
    ease: "expo.inOut",
    x: "-60%",
    scrollTrigger: {
      trigger: ".c1",
      start: "top top",
      end: "bottom top",
      scrub: 2,
      pin: true,
    },
  });
});