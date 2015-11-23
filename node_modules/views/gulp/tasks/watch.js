

const gulp = require('gulp');

gulp.task('watch', ['build:bower'],function () {
  gulp.watch('./src/**/*.ts', ['build:bower']);
});