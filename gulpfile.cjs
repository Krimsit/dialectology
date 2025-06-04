const gulp = require('gulp')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const dartSass = require('sass')
const babel = require('gulp-babel')
const terser = require('gulp-terser')
const browserSync = require('browser-sync')
const { rimraf } = require('rimraf')
const fs = require('fs');
const path = require('path');
const generateSiteContent = require('./site-content-generator/index');

const bs = browserSync.create();
const scss = sass(dartSass);
const buildDir = 'dist';

// Очистка
gulp.task('clean', () => rimraf(buildDir));

// Pug
gulp.task('html', () =>
    gulp
    .src('src/**/*.pug')
    .pipe(pug())
    .pipe(gulp.dest(buildDir))
    .pipe(bs.stream())
);

// SCSS
gulp.task('styles', () =>
    gulp
    .src('src/**/*.scss')
    .pipe(scss().on('error', scss.logError))
    .pipe(gulp.dest(buildDir))
    .pipe(bs.stream())
);

// JS (ESM + Babel + Minify)
gulp.task('scripts', () =>
    gulp
    .src('src/**/*.js')
    .pipe(
        babel({
          presets: ['@babel/preset-env'],
        })
    )
    .pipe(terser())
    .pipe(gulp.dest(buildDir))
    .pipe(bs.stream())
);

function copyFolder(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolder(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Assets files
gulp.task('assets', (done) => {
  const srcAssets = path.resolve(__dirname, 'src/assets');
  const contentAssets = path.resolve(__dirname, 'site-content/assets');
  const destAssets = path.resolve(__dirname, `${buildDir}/assets`);

  copyFolder(srcAssets, destAssets);
  copyFolder(contentAssets, destAssets);
  bs.reload();

  done();
});

// Watch + Server
gulp.task('serve', () => {
  bs.init({
    server: {
      baseDir: `./${buildDir}`,
    },
  });
  gulp.watch('src/**/*.pug', gulp.series('html'));
  gulp.watch('src/**/*.scss', gulp.series('styles'));
  gulp.watch('src/**/*.js', gulp.series('scripts'));
  gulp.watch('src/assets/**/*.{jpg,jpeg,png,gif,svg,pdf}', gulp.series('assets'));
  gulp.watch('site-content/assets/**/*.{jpg,jpeg,png,gif,svg,pdf}', gulp.series('assets'));
});

// Docx to
gulp.task('generate-site-content', async () => {
  await generateSiteContent()
})

// Сборка
gulp.task('build', gulp.series('clean', gulp.parallel('html', 'styles', 'scripts', 'assets')));

// По умолчанию
gulp.task('default', gulp.series('build', 'serve'));