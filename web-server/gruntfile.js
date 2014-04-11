module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt, {
        pattern: 'grunt-*',
        config:  'package.json'
    });

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
                files: ['**/*.less'],
                tasks: ['less'],
                options: {
                    event: ['changed'],
                    nospawn: true
                }
            }
        },

        execute: {
            target: {
                src: ['app.js']
            }
        }

    });

    grunt.registerTask('start', function() {
        grunt.task.run('less');
        grunt.task.run('execute');
        grunt.task.run('watch');
    });

    grunt.registerTask('default', ['jshint']);
};