//check /js/main.js for the value of "content" and other global variables

stdlib.background.video(content, "mechanical_principles.mp4", "black");

await stdlib.audio.load(content.files["detonate.ogg"]);
