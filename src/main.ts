import p5 from "p5";
import v1 from "./interactives/v1";
import v2 from "./interactives/v2";
import v3 from "./interactives/v3";
import v4 from "./interactives/v4";
import v5 from "./interactives/v5";
import "./style.css"

new p5(v5, document.querySelector<HTMLElement>("main")!);
new p5(v4, document.querySelector<HTMLElement>("main")!);
new p5(v3, document.querySelector<HTMLElement>("main")!);
new p5(v2, document.querySelector<HTMLElement>("main")!);
new p5(v1, document.querySelector<HTMLElement>("main")!);

