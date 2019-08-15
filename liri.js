require('dotenv').config();
const Spotify = require('node-spotify-api');
chalk = require('chalk');
const keys = require('./keys.js');
const readline = require('readline');

const spotify = new Spotify(keys.spotify);

const commands = {
    // 'concert-this': 'concertThis',
    'spotify-this-song': spotifyThisSong,
    'movie-this': 'movieThis',
    'do-what-it-says': 'doWhatItSays',
    'exit': process.exit.bind(null, 0),
}

let command;
let args;

[, , command, ...args] = process.argv;

if (!command) {
    console.log(`LIRI is in console mode, type ${chalk.green('exit')} to quit.\n`);
    openConsole();
} else if (commands[command]) {
    commands[command](args);
} else {
    console.log(`Command '${chalk.red(command)}' not found.  Starting in console mode.\nType ${chalk.green('exit')} to quit.\n`)
}

function openConsole() {
    const std = process.stdin;
    readline.emitKeypressEvents(std);
    std.setEncoding('utf-8');
    std.setRawMode(true);
    let val = '';
    let ind = 0;

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
                commands[cmd](args).then(function() {
                    console.log('');
                    rl.prompt();
                });
            } else {
                console.log(`Command "${chalk.red(cmd)}" not found.\n`);
                rl.prompt();
            }
        } catch (err) {
            console.log(chalk.red('Oh no! Something has gone horribly wrong!\n'));
            rl.prompt();
        }
    });

    rl.on('SIGINT', () => {
        process.exit();
    });
    rl.prompt();
}

function completer(line) {
    const options = Object.keys(commands).filter(c => c.startsWith(line) && c !== line);
    if (options[0]) {
        return [options, line];
    }
    return [[], line];
}

function spotifyThisSong(args) {
    const query = args.join(' ') || 'The Sign Ace of Base';
    return spotify.search({ type: 'track', query: query }).then(function (response) {
        const track = response.tracks.items[0];
        console.log(
            `${chalk.bold('Artists')}: ${track.artists.map(a => a.name).join(', ')}\n` +
            `${chalk.bold('Title')}: ${track.name}\n` +
            `${chalk.bold('Album')}: ${track.album.name}\n` +
            `${chalk.bold('Preview')}: ${track.preview_url || chalk.grey('Preview not available.')}`);
    });
}