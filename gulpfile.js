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
import gulpImage from "gulp-image";
import gulpWebp from "gulp-webp";
import gulpAvif from "gulp-avif";
import { stream as critical } from "critical";
import gulpIf from "gulp-if";


const prepros = false;

let dev = false;

const sass = gulpSass(sassPkg);

const allJS = [
  //пути к файлам js
  './src/libs/jquery-3.6.0.min.js',
  './src/libs/inert.js',
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
      .pipe(gulpIf(dev, sourcemaps.init()))
      .pipe(sass().on('error', sass.logError))
      .pipe(cleanCss({
        2: {
          specialComments: 0,
        }
      }))
      .pipe(gulpIf(dev, sourcemaps.write('../maps')))
      .pipe(gulp.dest('dist/css'))
      .pipe(browserSync.stream());
  }
  return gulp
    .src('src/css/index.css')
    .pipe(gulpIf(dev, sourcemaps.init()))
    .pipe(gulpCssimport({
      extensions: ['css'],
    }))
    .pipe(cleanCss({
      2: {
        specialComments: 0,
      }
    }))
    .pipe(gulpIf(dev, sourcemaps.write('../maps')))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
}

export const js = () => gulp
  .src([...allJS, 'src/js/**/*.js'])
  .pipe(gulpIf(dev, sourcemaps.init()))
  .pipe(terser())
  .pipe(concat('index.min.js'))
  .pipe(gulpIf(dev, sourcemaps.write('../maps')))
  .pipe(gulp.dest('dist/js'))
  .pipe(browserSync.stream());

export const image = () => gulp
  .src('src/img/**/*.{jpg,jpeg,png,svg,gif}')
  .pipe(gulpIf(!dev, gulpImage({
    optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
    pngquant: ['--speed=1', '--force', 256],
    zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
    jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
    mozjpeg: ['-optimize', '-progressive'],
    gifsicle: ['--optimize'],
    svgo: true,
  })))
  .pipe(gulp.dest('dist/img'))
  .pipe(browserSync.stream());

export const webp = () => gulp
  .src('src/img/**/*.{jpg,jpeg,png}')
  .pipe(gulpWebp({
    quality: 60
  }))
  .pipe(gulp.dest('dist/img'))
  .pipe(browserSync.stream());

export const avif = () => gulp
  .src('src/img/**/*.{jpg,jpeg,png}')
  .pipe(gulpAvif({
    quality: 60
  }))
  .pipe(gulp.dest('dist/img'))
  .pipe(browserSync.stream());

export const critCSS = () => gulp
  .src('dist/*.html')
  .pipe(critical({
    base: 'dist/',
    inline: true,
    css: ['dist/css/index.css']
  }))
  .on('error', err => {
    console.error(err.massage);
  })
  .pipe(gulp.dest('dist'))

export const copy = () => gulp
  .src('src/fonts/**/*', {
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
  gulp.watch('./src/img/**/*.{jpg,jpeg,png,svg,gif}', image);
  gulp.watch('./src/fonts/**/*', copy);
  gulp.watch('./src/img/**/*.{jpg,jpeg,png}', webp);
  gulp.watch('./src/img/**/*.{jpg,jpeg,png}', avif);

};

export const clear = () => deleteAsync('dist/**/*', { forse: true, });

//запуск

export const develop = async() => {
  dev = true; 
}

export const base = gulp.parallel(html, style, js, image, avif, webp, copy);

export const build = gulp.series(clear, base, critCSS);

export default gulp.series(develop, base, server);