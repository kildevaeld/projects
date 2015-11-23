'use strict';

const gulp = require('gulp'),
	typescript = require('gulp-typescript'),
	concat = require('gulp-concat'),
	merge = require('merge2'),
	sq = require('streamqueue'),
	webpack = require('gulp-webpack');

const project = typescript.createProject('tsconfig.json', {
	 declaration: true,
	 sortOutput: true,
	 target: 'ES5'
});

gulp.task('build', function () {
	let result = project.src('./src/**/*.ts')
	.pipe(typescript(project))

	return merge([
		result.js.pipe(gulp.dest('./lib')),
		result.dts.pipe(gulp.dest('./lib'))
	]);

})

gulp.task('build:bundle', ['build'], function () {

	return gulp.src('./lib/index.js')
	.pipe(webpack({
		module: {
			loaders: [
				{test: /\.js$/, loader: 'babel'}
			]
		},
		output: {
			filename: 'utils.js',
			libraryTarget: 'umd',
			library: 'utils'
		}
	}))
	.pipe(gulp.dest('dist'))

})

gulp.task('default', ['build:bundle'])