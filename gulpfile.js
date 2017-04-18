var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var uglify = require('gulp-uglifyjs');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var path = require('path');
var inject = require('gulp-inject');
var replace = require('gulp-replace');

main('dist/dev_index.html');



function main(indexHtml) {

  var flowTypesMap = {
    'sass': addSassToCssTask,
    'css-min': addCssMinifyTask,
    'css-concat': addCssConcatTask,
    'js-concat': addJsConcatTask,
    'js-min': addJsMinifyTask,
    'svg': addSvgTask,
    'html': addHtmlTask
  }

  var flow = [
    {
      type: 'sass',
      name: 'sass',
      src: 'src/sass/main.sass',
      dest: 'src/css',
      filename: '',
      watch: 'src/**/*.sass'
    },
    {
      type: 'css-concat',
      name: 'css-concat',
      src: ['src/css/reset.css', 'src/css/main.css'],
      dest: 'dist',
      filename: 'main',
      watch: 'src/css/main.css'
    },
    {
      type: 'css-min',
      name: 'css-min',
      src: 'dist/main.css',
      dest: 'dist',
      filename: 'main',
      watch: 'dist/main.css'
    },
    {
      type: 'js-concat',
      name: 'js-concat',
      src: 'src/js/**/*.js',
      dest: 'dist',
      filename: 'main',
      watch: 'src/js/**/*.js'
    },
    {
      type: 'js-min',
      name: 'js-min',
      src: 'dist/main.js',
      dest: 'dist',
      filename: 'main',
      watch: 'dist/main.js'
    },
    {
      type: 'svg',
      name: 'svg',
      src: 'pictures/svg/**/*.svg',
      dest: 'dist',
      filename: 'src/index.html',
      watch: ['pictures/svg/**/*.svg', 'src/index.html']
    },
    {
      type: 'html',
      name: 'html',
      src: 'dist/dev_index.html',
      dest: 'dist',
      filename: '',
      watch: 'dist/dev_index.html'
    }
  ]

  gulp.task('browser-sync', function () {
    browserSync({
      server: {
        baseDir: './',
        index: indexHtml
      },
      notify: true,
      open: false
    });
  });

  flow.forEach(function (e) {
    flowTypesMap[e.type](e.name, e.src, e.dest, e.filename);
  });

  gulp.task('default', ['browser-sync'].concat(flow.map(e => e.name)), function () {
    gulp.watch(indexHtml, browserSync.reload);

    flow.forEach(function (e) {
      gulp.watch(e.watch, [e.name]);
    });

  });



  function addSassToCssTask(name, src, dest) {
    gulp.task(name, function () {
      return gulp.src(src)
        .pipe(sass())
        .pipe(autoprefixer(['> 0.1%'], { cascade: true }))
        .pipe(gulp.dest(dest));
    });
  }



  function addCssMinifyTask(name, src, dest, filename) {
    gulp.task(name, function () {
      gulp.src(src)
        .pipe(cssnano())
        .pipe(rename({
          basename: filename,
          suffix: '.min'
        }))
        .pipe(replace(/url\([^\)\(]*((pictures|dist|bower_components)[^\)\(]*)\)/g, 'url("/fudi/$1")'))
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({ stream: true }));

        gulp.src(src)
        .pipe(cssnano())
        .pipe(rename({
          basename: filename,
          prefix: 'dev_',
          suffix: '.min'
        }))
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({ stream: true }));

      return del(src);
    });
  }



  function addCssConcatTask(name, src, dest, filename) {
    gulp.task(name, function () {
      return gulp.src(src)
        .pipe(concatCss(filename + '.css'))
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({ stream: true }));
    });
  }



  function addJsMinifyTask(name, src, dest, filename) {
    gulp.task(name, function () {
      gulp.src(src)
        .pipe(uglify())
        .pipe(rename({
          basename: filename,
          suffix: '.min'
        }))
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({ stream: true }));
      return del(src);
    });
  }



  function addJsConcatTask(name, src, dest, filename) {
    gulp.task(name, function () {
      return gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(babel({
          'presets': ['env']
        }))
        .pipe(concat(filename + '.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({ stream: true }));
    });
  }



  function addSvgTask(name, src, dest, filename) {
    gulp.task(name, function () {
      var svgs = gulp.src(src)
        .pipe(svgmin(function (file) {
          var prefix = path.basename(file.relative, path.extname(file.relative));
          return {
            plugins: [{
              cleanupIDs: {
                prefix: prefix + '-',
                minify: true
              }
            }]
          }
        }))
        .pipe(svgstore());

      function fileContents(filePath, file) {
        return file.contents.toString();
      }

      return gulp.src(filename)
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(rename({
          basename: indexHtml.replace(/.*\/(.*).html/, '$1')
        }))
        .pipe(gulp.dest(dest));
    });
  }



  function addHtmlTask(name, src, dest, filename) {
    gulp.task(name, function () {
      return gulp.src(src)
        .pipe(replace(/(href|src)="\/?((bower_components|pictures|dist).*)"/g, '$1="/fudi/$2"'))
        .pipe(rename({
          basename: 'index'
        }))
        .pipe(gulp.dest(dest));
    });
  }


}


