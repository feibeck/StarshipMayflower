module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-browserify');
    
    grunt.initConfig({
        browserify: {
            web_shared: {
                files: {
                    'web-server/public/js/Util/shared.js': ['shared/index.js']
                },
                options: {
                    browserifyOptions: {
                        standalone: 'ssmfShared',
                        debug: true
                    }
                }
            }
        }
    });
    
    grunt.registerTask('default', ['browserify']);
};