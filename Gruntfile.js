'use strict';

module.exports = grunt => {
  require('load-grunt-tasks')(grunt);

  var config = {
    src: 'src',
    dist: 'dist',
    tmp: '.tmp'
  }

  grunt.initConfig({
    config: config,
    clean: {
      build: [
        '<%= config.tmp %>',
        '<%= config.dist %>'
      ]
    },
    copy: {
      build: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= config.src %>/assets',
            src: ['{,*/,**/}*.*'],
            dest: '<%= config.dist %>/assets'
          }
        ]
      }
    },
    watch: {
      options: {
        spawn: false,
        livereload: true
      },
      stylus: {
        files: [
          '<%= config.src %>/{,*/,**/}*.styl'
        ],
        tasks: [
          'stylus:compile'
        ]
      },
    },
    json_bake: {
      build: {
        options: {
          stripComments: true
        },
        files: {
            '<%= config.tmp %>/data/final.json': '<%= config.src %>/data/base.json'
        }
      }
    },
    bake: {
      pages: {
        options: {
          basePath: '<%= config.src %>/',
          content: '<%= config.tmp %>/data/final.json'
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
      build: {
        options: {
          sourcemap: {
            inline: true
          },
          'include css': true,
          compress: true
        },
        files: {
          '<%= config.dist %>/styles/main.css': '<%= config.src %>/styles/main.styl'
        }
      }
    },
    obfuscator: {
      build: {
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
    'clean:build',
    'json_bake',
    'bake',
    'stylus:build',
    'obfuscator:build',
    'concat',
    'copy:build'
  ]);
};
