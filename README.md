# tweeting-natural

## Introduction
---
This is a student project done in 2013 at the `University of Applied Sciences in Berlin`. The task was to come up with a sort of innovative way of data mapping.

The goal of **Tweeting Natural** is to take real-time input from the Twitter Streaming API and map the incoming data to a soundscape based on samples and recordings from wildlife animals. This mapping should be based on a defined database, which maps words and emotions to particular sounds. Furthermore any location data received from Twitter should be used to place the sound on an intentional spot in the soundscape of the user. This mapping is relative to the actual geo location of the user. The entire project should mainly be seen as a web based sound installation as there is currently a time limit of four weeks. This limit forces us to concentrate on a specific set of tasks and problems to solve instead of giving the user a more overall experience by f.e. including a visual component.



## development setup
---

1. make sure you have `node` and `npm` installed
2. run the `npm install` command
3. run `make all` (Note: if you are on Windows, get MSYS or Cygwin and put it in your PATH env variable before running `make`)
3. copy the file `config_template.json` to a new file `config.json` 
4. fill in your host settings in the `config.json` file
5. in your mysql instance (needed), add a database that matches your config.json
6. run `node app.js`
