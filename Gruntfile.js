/* jshint node: true */

module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json')
    , jshint: {
        all: [
            "Gruntfile.js"
          , "static/figure/js/*.js"
        ]
      , options: {
          jshintrc: '.jshintrc'
        },
      }
    , jasmine: {
        src: [
            "static/figure/3rdparty/jquery-1.7.2.js",
            "static/figure/3rdparty/underscore.js",
            "static/figure/3rdparty/backbone.js",
            "static/figure/js/*.js"
        ]
      , options: {
          specs: "spec/*.js"
        // , vendor: "vendor/**/*.js"
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-jasmine')

  grunt.registerTask('test', ['jshint', 'jasmine'])
  grunt.registerTask('default', ['test'])
};