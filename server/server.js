'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const chalk = require('chalk');

if (process.env.DL_CLIENT === 'true') {
  const fs = require('fs');
  const shell = require('shelljs');
  
  // Verify git is installed and available
  if (!shell.which('git')) {
    shell.echo(chalk.red('This script requires git in order to download the latest client'));
    shell.exit(1);
  }
  
  const wd = process.cwd();
  shell.cd(__dirname);
  shell.cd('..');
  
  let doClone = !fs.existsSync('client');
  
  // Try a pull first to cut down on setup time
  if (!doClone) {
    shell.echo(chalk.cyan('Updating client...\n') + chalk.yellow('_________________\n>>> git pull -f'));
    shell.cd('client');
    const pullRes = shell.exec('git pull -f');
    shell.echo(chalk.yellow('_________________\n'));
    if (pullRes.code === 0) {
      doClone = false;
      if (!pullRes.stdout.startsWith('Already up-to-date.')) {
        shell.echo(chalk.cyan('Client updated.'));
      }
    } else {
      shell.echo(chalk.yellow('Client update failed. Trying redownload...'));
      shell.echo(chalk.yellow('Deleting old client...'));
      shell.cd('..');
      shell.rm('-rf', 'client');
    }
  }
  
  // (Re)download the client
  if (doClone) {
    shell.echo(chalk.cyan('Downloading client...\n') + chalk.yellow('_________________\n>>> git clone https://github.com/ProgBot/frc-scouting-app client'));
    let success = shell.exec('git clone https://github.com/ProgBot/frc-scouting-app client').code === 0;
    shell.echo(chalk.yellow('_________________\n'));
    if (!success) {
      shell.echo(chalk.red('Client download failed. Aborting.'));
      shell.exit(1);
    }
    shell.echo('Client updated.');
    shell.cd('client');
  }
  
  // Build the client if we aren't already up-to-date
  shell.echo(chalk.cyan('Building client...\n') + chalk.yellow('_________________\n>>> npm install && npm run build'));
  const failed = shell.exec('npm install').code !== 0 || shell.exec('npm run build').code !== 0;
  shell.echo(chalk.yellow('_________________\n'));
  if (failed) {
    shell.echo(chalk.red('Client build failed. Aborting.'));
    shell.exit(1);
  }
  
  // Change the working directory back to what it was initially
  shell.cd(wd);
  shell.echo(chalk.green('Client update complete'));
}


var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
