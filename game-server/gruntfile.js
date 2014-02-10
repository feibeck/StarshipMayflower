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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint']);

};