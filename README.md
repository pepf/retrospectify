![retrospectify screenshot](http://blog.pepf.nl/wp-content/uploads/2016/09/retrospectify.gif "Rertrospectify screenshot")

# Retrospectify
An awesome tool for doing agile team retrospectives digitally.
This can be useful when doing retrospectives with remote teams or when you want to keep track of retrospective outcomes over time.

## Features

* Three types of notes
* Moving around/prioritizing notes to your team's needs
* Adding points to individual notes

## Working on
 * Exporting the whole board to a (text) file
 * Timeboxing the meeting

## Try it!
[Live demo](http://pepf.nl/retrospective/)

## Usage

### I just want to use the app!
The quickest way is to use the live demo!
Other than that, you can clone this repository, and from the root run:
``` bash
npm install
npm run build
```

This will create a ```dist``` directory. Put the contents of that directory on a server and you're all set!

_Loading/Saving works using LocalStorage, so make sure the app has permission to read/write from LocalStorage._

### I want to build it myself from the source or contribute to the code
Then follow these instructions, depending on what you want to do

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```
