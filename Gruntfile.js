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
          },
          {
            expand: true,
            dot: true,
            cwd: '<%= config.src %>',
            src: ['{,*/,**/}*.php'],
            dest: '<%= config.dist %>'
          }
        ]
      }
    },
    watch: {
      options: {
        spawn: false,
        livereload: LIVERELOAD_PORT
      },
      assets: {
        files: [
          '<%= config.src %>/assets/{,*/,**/}*.*'
        ],
        tasks: [
          'copy'
        ]
      },
      php: {
        files: [
          '<%= config.src %>/{,*/,**/}*.php'
        ],
        tasks: [
          'copy'
        ]
      },
      styles: {
        files: [
          '<%= config.src %>/{,*/,**/}*.styl'
        ],
        tasks: [
          'stylus'
        ]
      },
      pages: {
        files: [
          '<%= config.src %>/{,*/,**/}*.html',
          '<%= config.src %>/data/{,*/,**/}*.json'
        ],
        tasks: [
          'json_bake',
          'bake'
        ]
      },
      scripts: {
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
        // hostname: 'localhost',
        hostname: '0.0.0.0',
        livereload: LIVERELOAD_PORT
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
            },
            upper: function(str) {
              return String(str).toUpperCase();
            },
            capitalize: function(str) {
              return String(str).charAt(0).toUpperCase() + String(str).slice(1);
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
    cssmin: {
      options: {
        sourceMap: false
      },
      dist: {
        files: [{
          expand: true,
          cwd: "<%= config.dist %>/styles/",
          src: ["{,*/,**/}*.css"],
          dest: "<%= config.dist %>/styles/",
          ext: ".css"
        }]
      }
    },
    htmlmin: {
      options: {
        removeComments: true,
        collapseWhitespace: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: "<%= config.dist %>/",
          src: ["{,*/,**/}*.html"],
          dest: "<%= config.dist %>/"
        }]
      }
    },
    image: {
      options: {
        pngquant: true,
        optipng: true,
        zopflipng: true,
        advpng: true,
        jpegRecompress: true,
        jpegoptim: true,
        mozjpeg: false,
        gifsicle: true,
        svgo: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: "<%= config.dist %>/assets/",
          src: [
            "!/fonts/{,*/,**/}*.*",
            "{,*/,**/}*.{png,jpg,gif,svg}"
          ],
          dest: "<%= config.dist %>/assets/"
        }]
      }
    },
    critical: {
      options: {
          inline: true,
          base: '<%= config.dist %>/',
          pathPrefix: "./",
          css: [
              '<%= config.dist %>/styles/main.css'
          ],
          dimensions: [
            {
              height: 800,
              width: 1280
            },
            {
              height: 1080,
              width: 1920
            }
          ],
          minify: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: ['{,*/,**/}*.html'],
          dest: '<%= config.dist %>'
        }]
      }
    },
    sitemaps: {
      options: {
        baseUrl: 'http://owltreebcn.com',
        contentRoot: '<%= config.dist %>',
        dest: '<%= config.dist %>',
        changefreq: 'weekly'
      },
      dist:{
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: ['{,*/,**/}*.html']
        }]
      }
    }
  });

  grunt.registerTask('default', [
    'clean',
    'stylus',
    'json_bake',
    'bake',
    'obfuscator',
    'concat',
    'copy',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('build', function (target) {
    if (typeof target === "undefined") {
      target = "dev";
    }

    grunt.task.run([
      'clean',
      'stylus',
      'json_bake',
      'bake',
      'obfuscator',
      'concat',
      'copy',
      // 'critical',
      'cssmin',
      'htmlmin',
      'sitemaps',
      // 'image',
      'connect:livereload',
      'watch'
    ]);
  });
};
