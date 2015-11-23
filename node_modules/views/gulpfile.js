/* jshint esnext:true, node:true */
'use strict';

const gulp = require('gulp'),
      tsc = require('gulp-typescript'),
      wrap = require('gulp-wrap-umd'),
      merge = require('merge2'),
      del = require('del'),
      webpack = require('gulp-webpack'),
      uglify = require('gulp-uglify'),
      rename = require('gulp-rename'),
      jasmine = require('gulp-jasmine-phantom'),
      size = require('gulp-size');


require('requiredir')('./gulp/tasks', { recurse: true });


gulp.task('uglify', ['build:bower'], function () {
  return gulp.src('./dist/views.js')
  .pipe(uglify())
  .pipe(rename('views.min.js'))
  .pipe(size())
  .pipe(gulp.dest('dist'));

});

gulp.task('clean', function (done) {
  del(['./lib','./dist', './docs'], done);
});


gulp.task('docs', function (done) {
  let exec = require('child_process').exec

  exec('./node_modules/.bin/tsc --outDir ./tmp', function (err) {
    if (err) return done(err)

    exec('./node_modules/.bin/jsdoc -R README.md -r -d ./docs tmp/*.js', function (err) {
      exec('rm -r tmp', done)
    })

  })
})



gulp.task('default', [
  'build',
  'build:bower',
  'definition',
  'test',
  'test:integration',
  //'docs',
  'uglify'
]);