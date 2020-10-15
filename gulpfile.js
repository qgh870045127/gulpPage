var del = require('del')
var gulp = require('gulp')
var gutil = require('gulp-util')
var babel = require('gulp-babel')
var uglify = require('gulp-uglify')
var htmlmin = require('gulp-htmlmin')
var nodemon = require('gulp-nodemon')
var minifyCss = require('gulp-minify-css')
var browserSync = require('browser-sync').create()

// 压缩css
gulp.task('css', async function () {
  await gulp
    .src('./styles/*.css') //要压缩的css文件
    .pipe(minifyCss())
    .pipe(gulp.dest('./dist/css'))
})

// 压缩html
gulp.task('html', async function () {
  var options = {
    removeComments: true, //清除HTML注释
    collapseWhitespace: true, //压缩HTML
    collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input checked />
    removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
    minifyJS: true, //压缩页面JS
    minifyCSS: true, //压缩页面CSS
  }
  await gulp
    .src('./html/*.html') //要压缩的html文件
    .pipe(htmlmin(options))
    .pipe(gulp.dest('./dist/html'))
})

// 压缩js
gulp.task('js', async function () {
  await gulp
    .src('./js/*.js')
    .pipe(babel())
    .pipe(uglify())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString())
    })
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('clean', async function () {
  await del('./dist')
})

// 打包
const build = gulp.series('clean', gulp.parallel('css', 'html', 'js'))
gulp.task('build', build, function () {})

// 通过browserSync.proxy代理nodejs项目端口，在port：8900下进行nodejs项目的监听
browserSync.init(
  {
    browser: ['chrome'],
    proxy: 'http://localhost:8899',
    port: 8900,
  },
  function () {
    console.log('browser refreshed.')
  }
)

// 热更新
const update = gulp.parallel('css', 'html', 'js')

gulp.task('server', async function () {
  await build()
  nodemon({
    script: 'cluster.js',
    // 忽略部分对程序运行无影响的文件的改动，nodemon只监视js文件，可用ext项来扩展别的文件类型
    ignore: ['*'],
    env: {
      NODE_ENV: 'development',
    },
  }).on('start', async function () {
    await gulp
      .watch(['./html/', './js/', './styles/'])
      .on('change', async function () {
        await update()
        browserSync.reload()
      })
  })
})
