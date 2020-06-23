"use strict";

function Content(element, files = {}) {
	this.parent = element;
	this.files = files;
}

function StandardLibrary() {
	this.audio = new gaplessAudio();

	this.background = new (function() {
		this.video = (content, file, bg_colour = "none") => {
			if(!content) throw "No content object given";
			if(!content.parent) throw "No element in content object";
			if(!content.files[file]) throw `${file} does not exist`;

			const video_elem = document.createElement("video");
			video_elem.id = "alter_playbackrate";
			video_elem.autoplay = true;
			video_elem.controls = false;
			video_elem.loop = true;
			video_elem.disablePictureInPicture = true;
			video_elem.src = URL.createObjectURL( new Blob([content.files[file]]) );

			content.parent.appendChild(video_elem);

			video_elem.style.position = "relative";
			video_elem.style.zIndex = "-1";
			video_elem.style.width = "100%";
			video_elem.style.height = "100%";
			video_elem.style.background = bg_colour;
		}

		this.image = (content, file, bg_colour = "none") => {
			if(!content) throw "No content object given";
			if(!content.parent) throw "No element in content object";
			if(!content.files[file]) throw `${file} does not exist`;

			const file_url = URL.createObjectURL( new Blob([content.files[file]]) );
			content.parent.style.backgroundImage = `url(${file_url})`;
			content.parent.style.backgroundSize = "contain";
			content.parent.style.backgroundRepeat = "no-repeat";
			content.parent.style.backgroundPosition = "center";
			content.parent.style.backgroundColor = bg_colour;
		}
	})();

	this.setPlaybackRate = (percent) => {
		const v = percent/100; //all values use double
		const video_bg = document.getElementById("alter_playbackrate");
		if(video_bg) video_bg.playbackRate = v;
		this.audio.rate.set(v);
	}
}
