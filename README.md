# Le Bat!

## Introduction
---
This is a student project done in 2013 at the `University of Applied Sciences in Berlin`. The task was to come up with an innovative way of data mapping.

The goal of this project is to take real-time input from the Twitter Streaming API and transform the incoming data to a sample based soundscape. This mapping should be based on a defined database, which maps words to particular sounds. Furthermore any location data received from Twitter should be used to place the sound on an intentional spot in the soundscape of the user. This mapping is relative to the actual geo location of the user. The entire project should mainly be seen as a web based sound installation.


## development setup
---

1. make sure you have `node` and `npm` installed
2. run the `npm install` command
3. run `make all` (Note: if you are on Windows, get MSYS or Cygwin and put it in your PATH env variable before running `make`)
4. optional: get ffmpeg (http://www.ffmpeg.org/download.html) and install it for more input media coverage.
5. copy the file `config_template.json` to a new file `config.json`
6. fill in your host settings in the `config.json` file (if you have ffmpeg, also specify the path to its binary)
7. in your mysql instance (needed), add a database that matches your config.json
8. run `node app.js`
9. open your browser and point it to right url
