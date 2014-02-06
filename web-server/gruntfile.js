module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            all: ['Gruntfile.js', 'public/src/**/*.js'],
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