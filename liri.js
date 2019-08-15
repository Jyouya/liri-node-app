require('dotenv').config();
const Spotify = require('node-spotify-api');
chalk = require('chalk');
const keys = require('./keys.js');
const readline = require('readline');

const spotify = new Spotify(keys.spotify);

const commands = {
    'concert-this': 'concertThis',
    'spotify-this-song': 'spotifyThisSong',
    'movie-this': 'movieThis',
    'do-what-it-says': 'doWhatItSays',
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
    // std.on('data', function(data) {
    //     if (data === 'exit\r\n') {
    //         console.log(`Exiting LIRI.  Have a nice day.`)
    //         process.exit();
    //     }
    // });

    // std.on('readable', () => {
    //     let chunk;
    //     // Use a loop to make sure we read all available data.
    //     while ((chunk = std.read()) !== null) {
    //       process.stdout.write(`data: ${chunk}`);
    //     }
    //   });
    let val = '';
    let ind = 0;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completer,
        prompt: '> '
    })

    process.stdin.on('readable', function () {
        const line = rl.line + this.read();
        while (this.read()) { };//clear the stream or we'll crash
        const complete = completer(line);
        if (complete) {
            const rest = complete[0][0].slice(line.length);
            process.stdout.write(chalk.blue(rest));
            readline.moveCursor(process.stdout, -rest.length, 0);
        }
    })

    rl.prompt();



    // std.pipe(process.stdout);

    // std.on('keypress', function (str, key) {
    //     val += str;
    //     if (key.ctrl && key.name === 'c') {
    //         process.exit();
    //     }
    //     if (key.name === 'return') {
    //         readline.clearLine(process.stdout);
    //         console.log(val);
    //         val = '';
    //     } else if (key.name === 'backspace') {
    //         process.stdout.write(' \b');
    //     }
    // });

    // std.on('keypress', function(str, key) {
    //     if (key.ctrl && key.name === 'c' ){
    //         process.exit();
    //     }
    //     if (key.name === 'return') {
    //         process.stdout.write('\n');
    //         console.log(val);
    //         val = '';
    //         ind = 0;
    //     } else if (key.name === 'backspace' ){
    //         if (ind > 0) {
    //             val = [val.slice(0, ind-1), val.slice(ind)].join('');
    //         }
    //         process.stdout.write(str);
    //         ind--;
    //     } else {
    //         process.stdout.write(str);
    //         val = [val.slice(0, ind), str, val.slice(ind)].join('');
    //         ind++;
    //         // splice str at prompt[i];
    //     }
    // })
}

// function matchCommands(answers, input) {
//     return new Promise(resolve => {
//         resolve(Object.keys(commands).filter(filter(input)));
//     })
// }

// function filter(input) {
//     return function (cmd) {
//         return new RegExp(input, 'i').exec(cmd) !== null;
//     };
// }

function completer (line) {
    const options = Object.keys(commands).filter(c => c.startsWith(line));
    if (options[0]) {
        return [options, line];
    }
}