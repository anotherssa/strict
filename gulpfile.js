// TODO: watch sprite

'use strict';

var gulp = require('gulp'),
  webpack = require('webpack-stream'),
  buffer = require('vinyl-buffer'),
  merge = require('merge-stream'),
  fileInclude = require('gulp-file-include'),
  sass = require('gulp-sass'),
  bourbon = require('bourbon'),
  imagemin = require('gulp-imagemin'),
  spritesmith = require('gulp.spritesmith'),
  browserSync = require('browser-sync').create();

var src = {
  html: 'src/*.html',
  scss: 'src/assets/scss/**/*.scss',
  images: ['src/assets/images/**/*', '!src/assets/images/icons{,/**}'],
  icons: 'src/assets/images/icons/*'
}

gulp.task('html', function() {
  gulp.src(src.html)
    .pipe(fileInclude())
    .pipe(gulp.dest('dist'));
});

gulp.task('scss', function() {
  return gulp.src(src.scss)
    .pipe(sass({includePaths: bourbon.includePaths})
    .on('error', sass.logError))
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(browserSync.stream());
});

gulp.task('images', function() {
  gulp.src(src.images)
    .pipe(imagemin())
    .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('sprite', function() {
  // Generate our spritesheet
   var spriteData = gulp.src(src.icons)
     .pipe(spritesmith({
       imgName: 'sprite.png',
       cssName: 'sprite.css',
       imgPath: '../images/sprite.png'
     }));

   // Pipe image stream through image optimizer and onto disk
   var imgStream = spriteData.img
     // DEV: We must buffer our stream into a Buffer for `imagemin`
     .pipe(buffer())
     .pipe(imagemin())
     .pipe(gulp.dest('dist/assets/images/'));

   // Pipe CSS stream through CSS optimizer and onto disk
   var scssStream = spriteData.css
     .pipe(gulp.dest('dist/assets/css/'));

   // Return a merged stream to handle both `end` events
   return merge(imgStream, scssStream);
});

gulp.task('js', function() {
  return gulp.src('src/assets/js/main.js')
   .pipe(webpack({
     output: {
       filename: 'main.js'
     }
   }))
   .pipe(gulp.dest('dist/assets/js'));
})

gulp.task('serve', ['html', 'scss', 'images', 'sprite'], function() {
  browserSync.init({
    server: 'dist',
    notify: false
  });

  gulp.watch(['src/**/*.html'], ['html']).on('change',  browserSync.reload);
  gulp.watch('src/assets/scss/**/*.scss', ['scss']);
  gulp.watch(['src/assets/images/**/*'], ['images']).on('change',  browserSync.reload);
})

gulp.task('default', ['serve']);
