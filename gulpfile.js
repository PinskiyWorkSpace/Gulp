import gulp from "gulp";
import browserSync from "browser-sync";
import sassPkg from "sass";
import gulpSass from "gulp-sass";
import gulpCssimport from "gulp-cssimport";
import { deleteAsync } from "del";
import htmlmin from "gulp-htmlmin";
import cleanCss from "gulp-clean-css";
import terser from "gulp-terser";
import concat from "gulp-concat";
import sourcemaps from "gulp-sourcemaps";


const prepros = true;

const sass = gulpSass(sassPkg);

const allJS = [
  //пути к файлам js
  //'src/libs/jquery-3.6.min.js',
  //'src/libs/inputmask.min.js',
]

//задачи

export const html = () => gulp
  .src('src/*.html')
  .pipe(htmlmin({
    removeComments: true,
    collapseWhitespace: true,
  }))
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream());

export const style = () => {
  if (prepros) {
    return gulp
      .src('src/scss/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(cleanCss({
        2: {
          specialComments: 0,
        }
      }))
      .pipe(sourcemaps.write('../maps'))
      .pipe(gulp.dest('dist/css'))
      .pipe(browserSync.stream());
  }
  return gulp
    .src('src/css/index.css')
    .pipe(sourcemaps.init())
    .pipe(gulpCssimport({
      extensions: ['css'],
    }))
    .pipe(cleanCss({
      2: {
        specialComments: 0,
      }
    }))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
}

export const js = () => gulp
  .src([...allJS, 'src/js/**/*.js'])
  .pipe(sourcemaps.init())
  .pipe(terser())
  .pipe(concat('index.min.js'))
  .pipe(sourcemaps.write('../maps'))
  .pipe(gulp.dest('dist/js'))
  .pipe(browserSync.stream());

export const copy = () => gulp
  .src([
    'src/fonts/**/*',
    'src/img/**/*'
  ], {
    base: 'src'
  })
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream({
    once: true
  }));

export const server = () => {
  browserSync.init({
    online: true,
    ui: false,
    notify: false,
    browser: 'chrome',
    // tunnel: true,
    server: {
      baseDir: 'dist'
    }
  })

  gulp.watch('./src/**/*.html', html);
  gulp.watch(prepros ? './src/scss/**/*.scss' : './src/css/**/*.css', style);
  gulp.watch('./src/js/**/*.js', js);
  gulp.watch([
    './src/img/**/*',
    './src/fonts/**/*'
  ], copy);
};

export const clear = () => deleteAsync('dist/**/*', { forse: true, });

//запуск

export const base = gulp.parallel(html, style, js, copy);

export const build = gulp.series(clear, base);

export default gulp.series(base, server);