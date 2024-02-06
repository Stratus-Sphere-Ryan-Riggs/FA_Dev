/// <binding ProjectOpened='watch' />
var gulp = require('gulp');
var gulpif = require('gulp-if');
var changed = require('gulp-changed');
var uglify = require('gulp-uglify');
var fs = require('fs');
var concat = require('gulp-concat');
var es = require('event-stream');

function bundle() {
    var bundleFile, bundleMap;

    console.log(' ');
    console.log('-- Bundling bundlejs.json');

    if (fs.existsSync('bundlejs.json')) {
        bundleFile = fs.readFileSync('bundlejs.json', 'utf-8');
        bundleMap = JSON.parse(bundleFile);

        return es.merge(bundleMap.bundles.map(function (bundle) {
            return gulp.src(bundle.source)
                .pipe(concat(bundle.dest))
                .pipe(gulpif(bundle.uglify == 'true' || bundle.uglify, uglify()))
                .pipe(changed('.', { hasChanged: changed.compareSha1Digest }))
                .pipe(gulp.dest('.'));
        }));
    }
}

gulp.task('bundlejs', function (done) {

    try {
        // If a bundlejs.json file is available, use that.
        // Otherwise, check for and convert a chirpy file.
        if (fs.existsSync('bundlejs.json')) {

            console.log(' ');
            console.log('-- Found bundlejs.json. --');

            bundle();

            console.log(' ');

        } else {
            console.log(' ');
            console.log('-- No bundlejs.json found. --');
            console.log(' ');
        }

    } catch (ex) {
        console.log('ERROR - ' + ex.name + ' : ' + ex.message);
    }
    done();
});

gulp.task('watch', function () {
    gulp.watch(['./**/*.js', './**/*.css', './js.chirp.config', './bundlejs.json', '!./node_modules/**', '!./gulpfile.js'], gulp.series('bundlejs'));
});

gulp.task('default', gulp.series('bundlejs'));
