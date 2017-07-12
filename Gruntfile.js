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
            cwd: '<%= config.src %>/includes',
            src: ['{,*/,**/}*.html'],
            dest: '<%= config.tmp %>/includes'
          },
          {
            expand: true,
            dot: true,
            cwd: '<%= config.src %>/assets',
            src: ['{,*/,**/}*.*'],
            dest: '<%= config.tmp %>/assets'
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
    bake: {
      options: {
        basePath: '<%= config.tmp %>',
        removeUndefined: false
      },
      metas: {
        options: {
          content: '<%= config.src %>/data/bake.json',
          section: 'metas'
        },
        files: {
          '<%= config.tmp %>/includes/header.html': '<%= config.src %>/includes/header.html'
        }
      },
      index: {
        options: {
          content: '<%= config.src %>/data/bake.json',
          section: 'index'
        },
        files: {
          '<%= config.tmp %>/index.html': '<%= config.src %>/index.html'
        }
      }
    },
    stylus: {
      compile: {
        options: {
          sourcemap: {
            inline: true
          },
          'include css': true,
          compress: false
        },
        files: {
          '<%= config.tmp %>/styles/main.css': '<%= config.src %>/styles/main.styl'
        }
      }
    }
  });

  grunt.registerTask('default', [
    'clean:build',
    'copy:build',
    'bake',
    'stylus:compile'
  ]);
};
