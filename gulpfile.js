var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var wiredep = require('wiredep').stream;

var paths = {
    scripts: 'app/**/*.js',
    index: 'app/index.html',
    dest: 'dest'
};


gulp.task('injectPathsToIndexAndMinify', function() {
    gulp.src(paths.index)
        .pipe(plugins.inject(gulp.src(
            [paths.scripts, '!app/bower_components/**/*', '!app/assets/js/socket.io.min.js', 'app/assets/css/style.css'],
            {read: false}), {relative:true}))
        .pipe(wiredep({
            cwd: 'app/',
        }))
        .pipe(plugins.useref())
        .pipe(plugins.if('*.js', plugins.uglify()))
        .pipe(plugins.if('*.css', plugins.cleanCss()))

        .pipe(gulp.dest(paths.dest));
});

gulp.task('injectCssToLogin', function() {
    gulp.src('app/components/login/login.html')
        .pipe(plugins.inject(gulp.src('app/assets/css/b-cover.css', {read: false}), {relative:true}))
        .pipe(plugins.useref())
        .pipe(plugins.if('*.css', plugins.cleanCss()))
        .pipe(gulp.dest(paths.dest + '/components/login'));
});

gulp.task('minifyOtherCss', function() {
    gulp.src('app/assets/css/black-style.css')
        .pipe(plugins.cleanCss())
        .pipe(gulp.dest(paths.dest + '/css'));
    gulp.src('app/assets/css/pink-style.css')
        .pipe(plugins.cleanCss())
        .pipe(gulp.dest(paths.dest + '/css'));
});



