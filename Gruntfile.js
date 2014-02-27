module.exports = function(grunt) {
  'use strict';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    express: {
      dev: {
        options: {
          script: 'js/server.js'
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
        transform: []
      }
    },
    jade: {
      dev: {
        options: {
          pretty: true
        },
        files: [
          {
            expand: true,
            cwd: 'src/jade/',
            src: ['*.jade'],
            dest: 'static',
            ext: '.html'
          }
        ]
      }
    },
    watch: {
      options: {
        livereload: true
      },
      scss: {
        files: ['src/scss/*.scss'],
        tasks: ['compass:dev']
      },
      js: {
        files: ['src/js/*.js'],
        tasks: ['browserify:dev']
      },
      jade: {
        files: ['src/jade/**/*.jade'],
        tasks: ['jade:dev']
      },
      express: {
        files:  [ 'js/*.js' ],
        tasks:  [ 'express:dev' ],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('default', ['jade', 'compass', 'browserify', 'express', 'watch']);

};