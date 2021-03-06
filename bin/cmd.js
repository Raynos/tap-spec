#!/usr/bin/env node

var through = require('through2');
var parser = require('tap-parser');
var duplexer = require('duplexer');
var chalk = require('chalk');

var out = through();
var tap = parser();
var dup = duplexer(tap, out);
var currentTestName = '';
var errors = [];

out.push('\n');

tap.on('comment', function (comment) {
  currentTestName = comment;
  
  if (/^tests\s+[1-9]/gi.test(comment)) comment = chalk.white(comment);
  else if (/^pass\s+[1-9]/gi.test(comment)) comment = chalk.green(comment);
  else if (/^fail\s+[1-9]/gi.test(comment)) comment = chalk.red(comment);
  else if (/^ok$/gi.test(comment)) return;
  else out.push('\n');
  
  out.push('  ' + comment + '\n');
});

tap.on('assert', function (res) {
  var output = (res.ok)
    ? chalk.green('\u2713')
    : chalk.red('✗');
  
  if (!res.ok) errors.push(currentTestName + ' ' + res.name);
  
  out.push('    ' + output + ' ' + chalk.gray(res.name) + '\n');
});

tap.on('extra', function (extra) {
  out.push('   ' + extra + '\n');
});

tap.on('results', function (res) {
  if (errors.length) {
    var past = (errors.length == 1) ? 'was' : 'were';
    var plural = (errors.length == 1) ? 'failure' : 'failures';
    
    out.push('  ' + chalk.red('Failed Tests: '));
    out.push('There ' + past + ' ' + chalk.red(errors.length) + ' ' + plural + '\n\n');
    
    errors.forEach(function (error) {
      out.push('    ' + chalk.red('✗') + ' ' + chalk.red(error) + '\n');
    });
  }
  else{
    out.push('  ' + chalk.green('Pass!') + '\n');
  }
});

process.stdin
  .pipe(dup)
  .pipe(process.stdout);