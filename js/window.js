const content_url = "content/";
const default_gain = 0.2;
const default_rate = 100;

const stdlib = new StandardLibrary();
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
let loading = false;

const page_content = new (function() {
	this.load = async (filename, progress = null) => { //helper function
		const url = content_url + filename + ".tar.gz";
		console.log(`Requesting ${url}`);

		const r = await fetch(url);
		const content_length = r.headers.get("Content-Length");
		let file_buffer;

		if(content_length) {
			const chunks = [];
			const reader = r.body.getReader();
			let received_bytes = 0;

			while(true) {
				const {done, value} = await reader.read();
				if(done) break;

				chunks.push(value);
				received_bytes += value.length;
				progress(Math.trunc(received_bytes/content_length*98), "Downloading"); //last few percent is for unzipping/parsing
			}

			const buffer_array = new Uint8Array(received_bytes);
			let position = 0;
			for(const i in chunks) {
				buffer_array.set(chunks[i], position);
				position += chunks[i].length;
			}

			file_buffer = buffer_array.buffer;
		} else {
			progress(-1, "Downloading");
			file_buffer = await r.arrayBuffer();
		}

		progress(98, "Decompressing");
		const decompress_file = pako.ungzip(file_buffer);

		progress(99, "Untarring");
		const tar_contents = await untar(decompress_file.buffer);

		const ret = {};
		tar_contents.forEach((x) => {
			ret[x.name] = x.buffer;
		})
		return ret;
	}

	this.displayMessage = (message = "", submessage = "") => {
		if(!message && !submessage) {
			document.getElementById("content").outerHTML= `<div id="content"></div>`;
			return;
		}

		document.getElementById("content").outerHTML = `
			<div id="content">
				<div class="loader">
					<div style="width: 100%;">
						<div class="percent">${message}</div>
						<div class="task loader" style="height: unset">
							<div style="width:80%">${submessage}</div>
						</div>
					</div>
				</div>
			</div>`;
	}

	this.clear = async (no_message) => {
		await stdlib.audio.suspend();
		stdlib.audio.visualiser.disable();

		document.getElementById("gain_control").value = default_gain;
		stdlib.audio.gain.set(default_gain);

		document.getElementById("rate_control").value = default_rate;
		stdlib.audio.rate.set(default_rate);

		document.title = "Tar Content";

		if(no_message) {
			this.displayMessage();
		} else {
			this.displayMessage(
				"Click an item in the list to load it",
				"If you're on mobile, this site works better when you \"Add to Home Screen\" as it can force Landscape mode"
			);
		}
	}

	this.execute = async (filename) => {
		if(loading) return;
		loading = true;

		try {
			await this.clear(true);
			document.title = filename + " - Tar Content";

			const files = await this.load(filename, (percent, task) => {
				percent = (percent < 0) ? "Loading..." : `${percent}%`;
				this.displayMessage(percent, task);
			});

			if(files["source.txt"]) console.log("Source:\n" + new TextDecoder().decode(files["source.txt"]));

			await this.clear(true);
			AsyncFunction("content", "stdlib", new TextDecoder().decode(files["main.js"]))(
				new Content(
					document.getElementById("content"),
					files
				),
				stdlib
			);

		} catch(error) {
			await this.clear(true);
			this.displayMessage("ERROR!", error.message);
		};

		loading = false;
	}
})();

window.onload = async () => {
	const selection_bar = document.getElementById("selection");

	const response = await (await fetch("content_files.json")).arrayBuffer();
	const raw_json = new TextDecoder().decode(response);
	const selections = JSON.parse(raw_json);

	for(const i in selections) {
		selection_bar.innerHTML += `<div title="${selections[i]}" onclick="page_content.execute(\`${selections[i]}\`)">${selections[i]}</div>`;
	}

	await page_content.clear();
};
