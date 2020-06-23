#!/usr/bin/env python3

import os, tarfile, json

content_files = []

if not os.path.isdir("raw_content/"):
	print("! No \"raw_content\" folder")
	raise SystemExit

print("Clearing content/ folder")
os.chdir("content")
for x in os.listdir("."): os.remove(x)
os.chdir("..")

print("Generating tar files from raw_content")
os.chdir("raw_content")
for x in sorted(os.listdir("."), key=lambda x: x.casefold()):
	print("Adding \"%s\"..." % x)
	content_files.append(x)

	with tarfile.open(os.path.join("..", "content", "%s.tar.gz" % x), "w:gz") as f:
		os.chdir(x)
		for file_name in os.listdir("."):
			f.add(file_name)
		os.chdir("..")
os.chdir("..")

with open("content_files.json", "w") as f:
	json.dump(content_files, f)

print("Done")
