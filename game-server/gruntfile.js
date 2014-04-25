module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        jshint: {
            all: ['Gruntfile.js', 'app/**/*.js'],
            options: {
                globals:{
                    angular: true,
                    console: true,
                    pomelo: true,
                    window: true,
                    $: true
                }
            }
        },

        jasmine_node: {
            projectRoot: "app"
        }

    });

    grunt.registerTask('default', ['jshint', 'jasmine_node']);
};