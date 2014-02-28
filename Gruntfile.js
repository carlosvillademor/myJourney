var conf = require('./js/config');
var config = conf.load('development');
//config.port
module.exports = function(grunt) {
  'use strict';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    express: {
      dev: {
        options: {
          script: 'js/server.js',
          port: config.port,
          delay: 5000
        }
      }
    },
    compass: {
      dev: {
        options: {
          sassDir: 'src/scss',
          cssDir: 'static/css'
        }
      }
    },
    browserify: {
      dev: {
        files: {
          'static/js/main.js':
            [
              'src/js/*.js'
            ]
        }
      },
      options: {
        transform: ['jadeify']
      }
    },
    watch: {
      options: {
        livereload: true
      },
      scss: {
        files: ['src/scss/**/*.scss'],
        tasks: ['compass:dev']
      },
      js: {
        files: ['src/js/**/*.js', 'src/templates/**/*.jade'],
        tasks: ['browserify:dev']
      },
      jade: {
        files: ['src/jade/**/*.jade'],
        tasks: ['jade:dev']
      },
      express: {
        files:  [ 'js/*.js', 'routes/*.js' ],
        tasks:  [ 'express:dev' ],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('default', ['compass', 'browserify', 'express', 'watch']);

};