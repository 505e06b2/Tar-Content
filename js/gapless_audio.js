"use strict";

//Check "B2 Big Surf" for some examples

function gaplessAudio() {
	const audio = new AudioContext();
	const node_analyser = audio.createAnalyser();
	const node_gain = audio.createGain();

	node_analyser.connect(audio.destination);
	node_gain.connect(node_analyser);

	let buffer_source;
	let enable_visualiser = false;

	this.decodeFile = async (file) => {
		return await audio.decodeAudioData(file, function(buffer) {
			return buffer;
		}, function(e) {
			console.log(e.toString());
		});
	};

	this.getCurrentTime = () => {
		if(!buffer_source) return 0;
		return audio.currentTime; //currentTime is the time from when the AudioContext was created
	}

	this.changeTrack = (buffer, startTime = 0) => {
		if(buffer_source) buffer_source.disconnect();

		buffer_source = audio.createBufferSource();
		buffer_source.buffer = buffer;

		buffer_source.connect(node_gain);
		buffer_source.loop = true;
		buffer_source.start(0, startTime);
		audio.resume();
	}

	//Helper for decodeFile -> changeTrack
	this.load = async (file) => {
		const buffer = await this.decodeFile(file);
		if(!buffer) {
			console.log("Could not decode file");
			return;
		}

		this.changeTrack(buffer);

		return buffer; //for possible later use
	};

	this.suspend = async () => {await audio.suspend();};
	this.resume = async () => {await audio.resume();};

	this.state = () => {return audio.state;};

	this.gain = {
		get: () => { return node_gain.gain.value; },
		set: (v) => { node_gain.gain.value = v; }
	};

	this.rate = {
		get: () => { return (buffer_source) ? audio.playbackRate.value : 1 },
		set: (v) => { if(buffer_source) buffer_source.playbackRate.value = v; }
	};

	this.visualiser = new (function(node) {
		let canvas_context;

		this.enable = async (render_options) => {
			const contents_elem = document.getElementById("content");
			const canvas = document.createElement("canvas");
			canvas.width = "800"; canvas.height = "600";
			canvas.className = "visualiser";
			contents_elem.append(canvas);

			canvas_context = canvas.getContext("2d");

			node.fftSize = 256;
			const data_array = new Uint8Array(node.frequencyBinCount);

			//used every loop
			let bar_height;
			let x_offset;

			const fillStyleRGB = (typeof(render_options) === "string") ? render_options : "255,255,255";
			const fillStyle = (typeof(render_options) === "function") ? render_options : () => `rgba( ${fillStyleRGB}, ${bar_height/512} )`;

			const draw_bar = () => {
				if(!canvas_context) return;
				requestAnimationFrame(draw_bar);

				node.getByteFrequencyData(data_array);

				const bar_width = (canvas.width / node.frequencyBinCount) * 2.5;
				x_offset = 0;

				canvas_context.clearRect(0,0, canvas.width,canvas.height);

				for(var i = 0; i < node.frequencyBinCount; i++) {
					bar_height = data_array[i] / 256.0 * canvas.height; //256 max val of uint8

					canvas_context.fillStyle = fillStyle();
					canvas_context.fillRect(
						x_offset, (canvas.height - bar_height/2),
						bar_width, bar_height
					);

					x_offset += bar_width + 1;
				}
			};

			draw_bar();
		}

		this.disable = async () => {canvas_context = null;}

	})(node_analyser);
}

