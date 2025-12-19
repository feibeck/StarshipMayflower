module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.initConfig({
    browserify: {
      web_shared: {
        files: {
          'web-server/public/js/Util/shared.js': ['shared/index.js'],
        },
        options: {
          browserifyOptions: {
            standalone: 'ssmfShared',
            debug: true,
          },
        },
      },
    },

    mochaTest: {
      nyan: {
        options: {
          reporter: 'nyan',
          ui: 'tdd',
        },
        src: 'shared/tests/**/*.js',
      },
      debug: {
        options: {
          reporter: 'spec',
          ui: 'tdd',
          bail: true,
        },
        src: 'shared/tests/**/*.js',
      },
    },

    watch: {
      web_shared: {
        files: ['shared/**/*.js', '!shared/tests/**/*.js'],
        tasks: ['build'],
      },
    },
  });

  grunt.registerTask('default', ['test', 'build']);

  grunt.registerTask('build', ['browserify']);
  grunt.registerTask('test', ['mochaTest:nyan']);
  grunt.registerTask('test:debug', ['mochaTest:debug']);
};
