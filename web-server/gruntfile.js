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
            less: {
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
        },

        forever: {
            webserver: {
                options: {
                    index: 'app.js'
                }
            },
            gameserver: {
                options: {
                    index: '../game-server/app.js'
                }
            }
        }

    });

    grunt.registerTask('start-webserver', function() {
        grunt.task.run('forever:webserver:start');
    });

    grunt.registerTask('stop-webserver', function() {
        grunt.task.run('forever:webserver:stop');
    });

    grunt.registerTask('restart-webserver', function() {
        grunt.task.run('forever:webserver:restart');
    });

    grunt.registerTask('start-gameserver', function() {
        grunt.task.run('forever:gameserver:start');
    });

    grunt.registerTask('stop-gameserver', function() {
        grunt.task.run('forever:gameserver:stop');
    });

    grunt.registerTask('restart-gameserver', function() {
        grunt.task.run('forever:gameserver:restart');
    });

    grunt.registerTask('start-servers', function() {
        grunt.task.run('start-gameserver');
        grunt.task.run('start-webserver');
    });

    grunt.registerTask('stop-servers', function() {
        grunt.task.run('stop-gameserver');
        grunt.task.run('stop-webserver');
    });

    grunt.registerTask('restart-servers', function() {
        grunt.task.run('restart-gameserver');
        grunt.task.run('restart-webserver');
    });

    grunt.registerTask('start', function() {
        grunt.task.run('less');
        grunt.task.run('restart-servers');
        grunt.task.run('watch');
    });

    grunt.registerTask('default', ['jshint']);
};