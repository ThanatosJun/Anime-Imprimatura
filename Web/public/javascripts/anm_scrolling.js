import { gsap } from "gsap";
gsap.registerPlugin(ScrollTrigger,ScrollToPlugin,TextPlugin);

const growStory = gsap.timeline();

ScrollTrigger.create({
    animation: growStory,
    trigger: ".text-container",
    start: "top top",
    end: "+=5000",  // 你可以調整這個值以控制動畫時長
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    horizontal: true // 將方向改為水平
});

growStory
  .fromTo(".c1 h1", 
    { xPercent: 100, opacity: 1 },  // 起始狀態，文字從右側開始
    { 
      xPercent: -100, // 最後文字移動到左邊
      opacity: 0.1, // 文字逐漸變得透明
      ease: "none" // 緩動效果
    }
  );