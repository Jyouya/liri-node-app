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
                commands[cmd](args);
            } else {
                console.log(`Command "${chalk.red(cmd)}" not found.`);
            }
            rl.prompt();
        } catch (err) {
            console.log(err);
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

function spotifyThisSong(args = ['The Sign']) {
    const query = args.join(' ');
    spotify.search(query).then(function (result) {
        console.log(result);
    })
}