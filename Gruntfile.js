'use strict'

var LIVERELOAD_PORT = 35730
var SERVER_PORT = 9001
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT })
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir))
}

module.exports = function (grunt) {
  var target = grunt.option('target') || ''
  var config = {
    src: 'src',
    dist: 'dist',
    tmp: '.tmp'
  }

  require('load-grunt-tasks')(grunt)

  grunt.initConfig({
    config: config,
    clean: {
      dist: ['<%= config.tmp %>/', '<%= config.dist %>/']
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= config.src %>/assets/',
            src: ['{,*/,**/}*.*', '!old/{,*/,**/}*.*'],
            dest: '<%= config.dist %>/assets/'
          },
          {
            expand: true,
            dot: true,
            cwd: '<%= config.src %>/',
            src: ['*.{png,ico,php,txt}'],
            dest: '<%= config.dist %>/'
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
        files: ['<%= config.src %>/assets/{,*/,**/}*.*'],
        tasks: ['copy']
      },
      php: {
        files: ['<%= config.src %>/{,*/,**/}*.php'],
        tasks: ['copy']
      },
      styles: {
        files: ['<%= config.src %>/{,*/,**/}*.styl'],
        tasks: ['stylus']
      },
      pages: {
        files: [
          '<%= config.src %>/{,*/,**/}*.html',
          '<%= config.src %>/data/{,*/,**/}*.json'
        ],
        tasks: ['json_bake', 'bake']
      },
      scripts: {
        files: ['<%= config.src %>/{,*/,**/}*.js'],
        tasks: ['concat']
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
          // keepalive: true,
          base: [config.dist],
          open: {
            target: 'http://localhost:<%= connect.options.port %>'
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [mountFolder(connect, config.dist)]
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
          '<%= config.tmp %>/data/final.json':
            '<%= config.src %>/data/base.json'
        }
      }
    },
    bake: {
      dist: {
        options: {
          basePath: '<%= config.src %>/',
          content: '<%= config.tmp %>/data/final.json',
          transforms: {
            join: function (str, joinValue) {
              return str.join(joinValue)
            },
            upper: function (str) {
              return String(str).toUpperCase()
            },
            capitalize: function (str) {
              return (
                String(str)
                  .charAt(0)
                  .toUpperCase() + String(str).slice(1)
              )
            }
          }
        },
        files: [
          {
            expand: true,
            cwd: '<%= config.src %>/',
            src: ['{,*/,**/}*.html', '!includes/{,*/,**/}*.html'],
            dest: '<%= config.dist %>/'
          }
        ]
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
          '<%= config.dist %>/styles/main.css':
            '<%= config.src %>/styles/main.styl'
        }
      }
    },
    obfuscator: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= config.src %>/scripts/',
            src: '{,*/,**/}*.js',
            dest: '<%= config.dist %>/scripts/'
          }
        ]
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['<%= config.src %>/scripts/{,*/,**/}*.js'],
        dest: '<%= config.dist %>/scripts/main.min.js'
      }
    },
    cssmin: {
      options: {
        sourceMap: false
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= config.dist %>/styles/',
            src: ['{,*/,**/}*.css'],
            dest: '<%= config.dist %>/styles/',
            ext: '.css'
          }
        ]
      }
    },
    htmlmin: {
      options: {
        removeComments: true,
        collapseWhitespace: true
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= config.dist %>/',
            src: ['{,*/,**/}*.html'],
            dest: '<%= config.dist %>/'
          }
        ]
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
        mozjpeg: true,
        gifsicle: true,
        svgo: true
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= config.dist %>/assets/',
            src: ['{,*/,**/}*.{png,jpg,gif,svg}', '!fonts/{,*/,**/}*.*'],
            dest: '<%= config.dist %>/assets/'
          }
        ]
      }
    },
    critical: {
      options: {
        inline: true,
        base: '<%= config.dist %>/',
        pathPrefix: './',
        css: ['<%= config.dist %>/styles/main.css'],
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
        files: [
          {
            expand: true,
            cwd: '<%= config.dist %>/',
            src: ['{,*/,**/}*.html'],
            dest: '<%= config.dist %>/'
          }
        ]
      }
    },
    sitemaps: {
      options: {
        baseUrl: 'https://owltreebcn.com',
        contentRoot: '<%= config.dist %>',
        dest: '<%= config.dist %>',
        changefreq: 'weekly'
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= config.dist %>/',
            src: ['{,*/,**/}*.html']
          }
        ]
      }
    },
    prompt: {
      target: {
        options: {
          questions: [
            {
              config: 'what-to-do',
              type: 'list', // list, checkbox, confirm, input, password
              message: 'What do you want to do?',
              default: 'local', // default value if nothing is entered
              choices: [
                {
                  name: 'Develop in a localhost server [> grunt local]',
                  value: 'local'
                },
                {
                  name: 'Build for production [> grunt build]',
                  value: 'build'
                },
                {
                  name: 'Update stock JSON [> grunt get-stock]',
                  value: 'get-stock'
                }
              ]
            }
          ]
        }
      }
    },
    shell: {
      'get-stock': {
        command: 'node get-stock.js'
      }
    }
  })

  // grunt.registerTask('tasks', function () {
  //   grunt.task.run(['prompt', 'what-to-do'])
  // })

  grunt.registerTask('what-to-do', function (a, b) {
    grunt.task.run([grunt.config('what-to-do')])
  })

  grunt.registerTask('default', function (target) {
    // grunt.task.run(['tasks'])
    grunt.task.run(['prompt', 'what-to-do'])

  })

  grunt.registerTask('local', function (target) {
    if (typeof target === 'undefined') {
      target = 'local'
    }

    grunt.task.run([
      'clean',
      'stylus',
      'json_bake',
      'bake',
      'concat',
      'copy',
      'connect:livereload',
      'watch'
    ])
  })

  grunt.registerTask('build', function (target) {
    if (typeof target === 'undefined') {
      target = 'dev'
    }

    grunt.task.run([
      'clean',
      'shell:get-stock',
      'stylus',
      'json_bake',
      'bake',
      'obfuscator',
      'concat',
      'copy',
      'critical',
      'cssmin',
      'htmlmin',
      'sitemaps',
      'image',
      'connect:livereload',
      'watch'
    ])
  })

  grunt.registerTask('get-stock', function (target) {
    if (typeof target === 'undefined') {
      target = 'get-stock'
    }

    grunt.task.run(['shell:get-stock'])
  })
}
