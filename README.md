# liri-node-app

## Welcome to LIRI

LIRI is an application that exposes the spotify and OMDB APIs through the command line

##  LIRI can be used in two ways.

* Arguments can be passed when LIRI is executed
```bash
$ node liri.js spotify-this-song the saftey dance
```

* If no arguments are passed, LIRI will open in console mode, where liri's commands can be input directly
```
> movie-this kingsman
```

## Commands

* spotify-this-song [song name]: 
    
    searches for the specified song

    [spotify-img]: ./screenshots/spotify-this-song.png
    ![spotify-img]

* movie-this [movie name]:

    searches for the specified movie

    [movie-img]: ./screenshots/movie-this.png
    ![movie-img]

* do-what-it-says [file path]:

    executes the contents of random.txt or specified file

    [do-img]: ./screenshots/do-what-it-says.png
    ![do-img]

* help:

    displays list of available commands

* exit:

    exits the LIRI console

## Console Mode

LIRI's console mode lets you make your API calls faster, with tab-autocomplete and autocompletion hints.

[demo]: ./screenshots/demo.gif
![demo]