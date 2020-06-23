//Set up font
const font_url = URL.createObjectURL( new Blob([content.files["chivo_bold_italic.woff2"]]) );
content.parent.innerHTML += `
<style>
@font-face {
	font-family: 'Chivo';
	font-style: italic;
	font-weight: 900;
	font-display: swap;
	src: local('Chivo Black Italic'), local('Chivo-BlackItalic'), url(${font_url}) format('woff2');
	unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@keyframes gradient {
	0%    {background-position: 0vw;}
	50%   {background-position: 25vw;}
	100%   {background-position: 50vw;}
}
</style>`;

//BG
stdlib.background.video(content, "big_surf.webm", "#282e36");

//audio
const non_boost_buffer = await stdlib.audio.load( content.files["pass_me_by_non_boost.ogg"] );
const start_time = stdlib.audio.getCurrentTime();

const boost_buffer = await stdlib.audio.decodeFile( content.files["pass_me_by_boost.ogg"] );

const buffers = [non_boost_buffer, boost_buffer];
const texts = ["Click to BOOST!", "BURNOUT!"];
let index = 0;

//BOOST text
const message = document.createElement("div");
message.style = `display: flex; position: absolute; top: 0px; left: 0px;
	width: 100%; height: 100%;
	align-items: center;
	justify-content: center;
	text-align: center;

	font-size: 6vh;
	font-weight: bold;
	font-style: italic;
	font-family: "Chivo";
	pointer-events: none;
	user-select: none;

	background-color: yellow;
	background-image: linear-gradient(to right, transparent, red, transparent);
	background-size: 50vw 1px;
	animation: gradient 3s linear infinite;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	-webkit-text-stroke: 2px black;`;
message.innerText = texts[index];
content.parent.appendChild(message);

content.parent.onclick = async () => {
	index = +!index; //+ to int
	const current_time = (stdlib.audio.getCurrentTime() - start_time) % buffers[index].duration;
	stdlib.audio.changeTrack(buffers[index], current_time);
	message.innerText = texts[index];
}
