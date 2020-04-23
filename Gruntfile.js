module.exports = function (grunt) {
    require('dotenv').config()
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.initConfig({
        replace: {
            example: {
                src: ['mia_pag/index.html'],             // source files array (supports minimatch)
                dest: 'mia_pag/index.html',             // destination directory or file
                replacements: [{
                    from: 'URL',                   // string replacement
                    to: function (matchedWord) {
                        // console.log(`process.env.NODE_ENV`, process.env.NODE_ENV);
                        if (process.env.NODE_ENV == "development") {
                            return "http://localhost:3000"
                        } else {
                            return "https://my-forum.glitch.me"
                        }
                    }
                }]
            }
        }
    });
    grunt.registerTask("default", ["replace"])

}
