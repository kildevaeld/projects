'use strict';

const gulp = require('gulp'),
			$ = require('gulp-load-plugins')(),
      merge = require('merge2');
			

gulp.task('build', function () {

  let result = gulp.src('./src/**/*.ts')
  .pipe($.typescript({
    "target": "ES5",
    "module": "commonjs",
    "isolatedModules": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "declaration": true,
    "noImplicitAny": false,
    "removeComments": false,
    "noLib": false,
    "preserveConstEnums": true,
    "suppressImplicitAnyIndexErrors": true,
    declarationFiles: true
  }));

  let js = result.js
  .pipe(gulp.dest('./lib'));

  let dts = result.dts.pipe(gulp.dest('./lib'));

  return merge([js,dts]);

});

gulp.task('build:bower', ['build'], function () {
  return gulp.src('./lib/index.js')
  .pipe($.webpack({
    devtool: "source-map",
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
    },
    output: {
      library: "views",
      libraryTarget: "umd",
      filename: 'views.js'
    }
  }))
  .pipe(gulp.dest('./dist'));
});

gulp.task('definition', ['build', 'build:bower'], function () {
  return gulp.src('./templates/views.d.ts')
  .pipe(gulp.dest('./'));
});