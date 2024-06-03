import p5 from "p5";
import v8 from "./interactives/v8";
import "./style.css"

new p5(v8, document.querySelector<HTMLElement>("#interactive")!);

