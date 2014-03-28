module.exports = function(grunt) {

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

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jasmine-node');

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('jasmine', ['jasmine_node']);
};