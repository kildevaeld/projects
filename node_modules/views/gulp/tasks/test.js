

const gulp = require('gulp'),
			$ = require('gulp-load-plugins')({
        rename: {
          'gulp-jasmine-phantom': 'jasmine'
        }
      });

gulp.task('test', ['build'], function () {
  return gulp.src('./spec/*.js')
  .pipe($.jasmine({
    integration: false
  }))
})



gulp.task('test:integration', ['build:bower'], function () {
  return gulp.src('./spec/integration/*.js')
  .pipe($.jasmine({
    integration: true,
    keepRunner: './',
    vendor: [
      './dist/views.js',
      './node_modules/jquery/dist/jquery.js',
      './node_modules/jasmine-jquery/lib/jasmine-jquery.js' 
     ]
  }))
})