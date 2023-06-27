const {src, dest, watch, parallel, series} = require('gulp');

const scss               = require('gulp-sass')(require('sass'));
const concat             = require('gulp-concat');
const uglify             = require('gulp-uglify-es').default;
const imagemin           = require('gulp-imagemin');
const plumber            = require('gulp-plumber');
const rename             = require('gulp-rename');
const nunjucksRender     = require('gulp-nunjucks-render');
const browserSync        = require('browser-sync').create();
const autoprefixer       = require('gulp-autoprefixer');
const clean              = require('gulp-clean');


function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.js',
		'node_modules/slick-carousel/slick/slick.js',
		'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
		'node_modules/rateyo/src/jquery.rateyo.js',
		'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
		'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
		'app/js/main.js'
	])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}

function nunjucks() {
	return src('app/*.njk')
		.pipe(nunjucksRender())
		.pipe(dest('app'))
		.pipe(browserSync.stream())
}

function styles() {
	return src('app/scss/*.scss')
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 version']}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(plumber())
		.pipe(scss({outputStyle: 'compressed'}).on('error', scss.logError))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

function images() {
	return src('app/images/**/*.*')
	.pipe(imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.mozjpeg({quality: 75, progressive: true}),
		imagemin.optipng({optimizationLevel: 5}),
		imagemin.svgo({
			plugins: [
				{removeViewBox: true},
				{cleanupIDs: false}
			]
		})
	]))
	.pipe(dest('dist/images'))
}

function watching() {
	watch(['app/**/*.scss'], styles);
	watch(['app/*.njk'], nunjucks);
	watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
	watch(['app/**/*.html']).on('change', browserSync.reload);
}

function browsersync() {
	browserSync.init({
		server: {
			baseDir: "app/"
		},
		notify: false
	});
}

function cleanDist() {
	return src('dist')
	.pipe(clean())
}

function building() {
	return src([
		'app/css/style.min.css',
		'app/js/main.min.js',
		'app/**/*.html'
	], {base : 'app'})
		.pipe(dest('dist'))
}

exports.styles = styles;
exports.scripts = scripts;
exports.nunjucks = nunjucks;
exports.images = images;
exports.watching = watching;
exports.browsersync = browsersync;
exports.build = series(cleanDist, images, building);

exports.dev = parallel(nunjucks, styles, scripts, browsersync, watching);