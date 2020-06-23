stdlib.background.image(content, "album_cover.jpg", "#140d2e");

await stdlib.audio.load(content.files["eyes_closed.ogg"]);
stdlib.audio.visualiser.enable();
