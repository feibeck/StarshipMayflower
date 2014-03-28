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
        },

        less: {
            development: {
                options: {
                    paths: [
                        "public/less",
                        "public/components/bootstrap/less",
                        "public/components/bootswatch/cyborg",
                        "public/components/bootswatch/global"
                    ]
                },
                files: {
                    "public/css/StarshipMayflower.css": "public/less/StarshipMayflower.less"
                }
            }
        },

        watch: {
            scripts: {
                files: ['**/*.css'],
                tasks: ['less'],
                options: {
                    event: ['changed'],
                    reload: true
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('default', ['jshint']);

};