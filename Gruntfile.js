'use strict';

var LIVERELOAD_PORT = 35730;
var SERVER_PORT = 9001;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
  var target = grunt.option('target') || '';
  var config = {
    src: 'src',
    dist: 'dist',
    tmp: '.tmp'
  }

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    config: config,
    clean: {
      dist: [
        '<%= config.tmp %>',
        '<%= config.dist %>'
      ]
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= config.src %>/assets',
            src: ['{,*/,**/}*.*'],
            dest: '<%= config.dist %>/assets'
          },
          {
            expand: true,
            dot: true,
            cwd: '<%= config.src %>',
            src: ['{,*/,**/}*.{png,ico}'],
            dest: '<%= config.dist %>'
          }
        ]
      }
    },
    watch: {
      options: {
        spawn: false,
        livereload: true
      },
      asstes: {
        files: [
          '<%= config.src %>/assets/{,*/,**/}*.*'
        ],
        tasks: [
          'copy'
        ]
      },
      stylus: {
        files: [
          '<%= config.src %>/{,*/,**/}*.styl'
        ],
        tasks: [
          'stylus'
        ]
      },
      bake: {
        files: [
          '<%= config.src %>/{,*/,**/}*.html',
          '<%= config.src %>/data/{,*/,**/}*.json'
        ],
        tasks: [
          'json_bake',
          'bake'
        ]
      },
      obfuscator: {
        files: [
          '<%= config.src %>/{,*/,**/}*.js'
        ],
        tasks: [
          'obfuscator',
          'concat'
        ]
      }
    },
    connect: {
      options: {
        port: grunt.option('port') || SERVER_PORT,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost',
        //hostname: '0.0.0.0'
        livereload: true
      },
      livereload: {
        options: {
          //keepalive: true,
          base: [config.dist],
          open: {
            target: 'http://localhost:<%= connect.options.port %>'
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, config.dist)
            ];
          }
        }
      }
    },
    json_bake: {
      dist: {
        options: {
          stripComments: true
        },
        files: {
            '<%= config.tmp %>/data/final.json': '<%= config.src %>/data/base.json'
        }
      }
    },
    bake: {
      dist: {
        options: {
          basePath: '<%= config.src %>/',
          content: '<%= config.tmp %>/data/final.json',
          transforms: {
            join: function (str) {
              return str.join(' ');
            }
          }
        },
        files: [{
          expand: true,
          cwd: '<%= config.src %>/',
          src: ['{,*/,**/}*.html', '!includes/{,*/,**/}*.html'],
          dest: '<%= config.dist %>/'
        }]
      }
    },
    stylus: {
      dist: {
        options: {
          sourcemap: {
            inline: true
          },
          'include css': true,
          compress: false
        },
        files: {
          '<%= config.dist %>/styles/main.css': '<%= config.src %>/styles/main.styl'
        }
      }
    },
    obfuscator: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= config.src %>/scripts',
            src: '{,*/,**/}*.js',
            dest: '<%= config.tmp %>/scripts'
          }
        ]
      }
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['<%= config.tmp %>/scripts/{,*/,**/}*.js'],
        dest: '<%= config.dist %>/scripts/main.min.js',
      },
    },
  });

  grunt.registerTask('default', [
    'clean',
    'json_bake',
    'bake',
    'stylus',
    'obfuscator',
    'concat',
    'copy',
    'connect:livereload',
    'watch'
  ]);
};
