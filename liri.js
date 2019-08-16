require('dotenv').config();
const Spotify = require('node-spotify-api');
chalk = require('chalk');
const keys = require('./keys.js');
const readline = require('readline');
const axios = require('axios');
const fsp = require('fs').promises;

const spotify = new Spotify(keys.spotify);

const commands = {
    // 'concert-this': 'concertThis',
    'spotify-this-song': spotifyThisSong,
    'movie-this': movieThis,
    'do-what-it-says': doWhatItSays,
    'exit': process.exit.bind(null, 0),
    'help': help,
}

let command;
let args;

function main(command, ...args) {
    // console.log(command, args);
    
    if (!command) {
        console.log(`LIRI is in console mode, type ${chalk.green('exit')} to quit.\n`);
        openConsole();
    } else if (commands[command]) {
        return commands[command](args);
    } else {
        console.log(`Command '${chalk.red(command)}' not found.  Starting in console mode.\nType ${chalk.green('exit')} to quit.\n`)
    }
}

[, , command, ...args] = process.argv;
main(command, ...args);

function openConsole() {
    consoleMode = true;
    const std = process.stdin;
    readline.emitKeypressEvents(std);
    std.setEncoding('utf-8');
    // std.setRawMode(true);

    // set up terminal with tab autocomplete
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completer,
        prompt: '> '
    });

    // show autocomplete hint
    process.stdin.on('readable', function () {
        // if (typeof this != 'string' && typeof this != 'Buffer') return;
        const line = rl.line + this.read();
        while (this.read()) { };//clear the stream or we'll crash
        const complete = completer(line)[0];
        if (complete[0]) {
            const rest = complete[0].slice(line.length);
            process.stdout.write(chalk.blue(rest));
            readline.moveCursor(process.stdout, -rest.length, 0);
        } else {
            // Need to be able to get the position of the cursor to make this not bug out the left right arrows.
            // The position it must be moved to for the clearline is rl.line.length, but it needs to be moved back
            // to the current position afterwards
            readline.clearLine(process.stdout, 1);
        }
    });

    // insert a space after autocompletion
    process.stdin.on('keypress', function (str, key) {
        switch (key.name) {
            case 'tab':
                rl.write(' ');
                break;
            // case 'up': // history is done automatically 
            //     console.log(rl.history, rl.historyIndex);
            //     break;
        }
    });

    // when enter is pressed
    rl.on('line', function (line) {
        try {
            let cmd;
            let args;
            [cmd, ...args] = line.split(' ');
            if (commands[cmd]) {
                commands[cmd](args).then(function () {
                    console.log('');
                    rl.prompt();
                });
            } else {
                console.log(`Command "${chalk.red(cmd)}" not found.\n`);
                rl.prompt();
            }
        } catch (err) {
            // console.log(chalk.red('Oh no! Something has gone horribly wrong!\n'));
            console.log(err);
            rl.prompt();
        }
    });

    rl.on('SIGINT', () => {
        process.exit();
    });
    rl.prompt();
    return rl;
}

function completer(line) {
    const options = Object.keys(commands).filter(c => c.startsWith(line) && c !== line);
    if (options[0]) {
        return [options, line];
    }
    return [[], line];
}

class Info {
    constructor(category, value) {
        this.category = category;
        this.value = value;
    }
    text() {

        return `${chalk.bold(this.category)}: ${this.value || chalk.grey(`${this.category} not available.`)}`
    }
}

function spotifyThisSong(args) {
    const query = args.join(' ') || 'The Sign Ace of Base';
    return spotify.search({ type: 'track', query: query }).then(function (response) {
        const track = response.tracks.items[0];
        console.log([
            new Info('Artists', track.artists.map(a => a.name).join(', ')),
            new Info('Title', track.name),
            new Info('Album', track.album.name),
            new Info('Preview', track.preview_url)
        ].map(i => i.text()).join('\n'));

        // console.log(
        //     `${chalk.bold('Artists')}: ${track.artists.map(a => a.name).join(', ')}\n` +
        //     `${chalk.bold('Title')}: ${track.name}\n` +
        //     `${chalk.bold('Album')}: ${track.album.name}\n` +
        //     `${chalk.bold('Preview')}: ${track.preview_url || chalk.grey('Preview not available.')}`);
    });
}


Array.prototype.with = function (key, val) {
    for (el of this) {
        if (el[key] === val) {
            return el;
        }
    }
}

function movieThis(args) {
    const movieName = args.join(' ') || 'Mr. Nobody';
    const params = { t: movieName, apikey: keys.omdb.key }
    return axios.get('http://www.omdbapi.com/',
        { params: params }
    ).then(function (results) {
        // console.log(results.data.Ratings)
        // console.log(results.data.Ratings.with('Source', 'Rotten Tomatoes'));
        console.log([
            new Info('Title', results.data.Title),
            new Info('Year', results.data.Year),
            new Info('IMDB Rating', results.data.imdbRating),
            new Info('Rotten Tomatoes Rating', results.data.Ratings.with('Source', 'Rotten Tomatoes') && results.data.Ratings.with('Source', 'Rotten Tomatoes').Value),
            new Info('Country', results.data.Country),
            new Info('Language', results.data.Language),
            new Info('Plot', results.data.Plot),
            new Info('Actors', results.data.Actors)
        ].map(i => i.text()).join('\n'));
    }).catch(function(err) {
        console.log(`No results found for ${chalk.red(movieName)}`)
    });
}

// Takes an optional filepath argument
function doWhatItSays(args) {
    return fsp.readFile('./random.txt' || args.join(' '), 'utf-8').then(async function (data) {
        const commands = data.split(/(?:\r\n|\r|\n)/g)
        for (line of commands) {
            if (line.match(/^\s*$/)) { // don't try to execute blank lines
                continue;
            }
            await main(...line.split(/[\s,]+/));
        }
    }).catch(function (err) {
        console.log(err);
    });
}

function help() {
    console.log([
        chalk.bold.magenta('Available Commands:'),
        ...Object.keys(commands).map(text => chalk.green(text))
    ].join('\n  '));
    return new Promise(resolve => resolve()); // empty promise, will resolve immediately
}