module.exports = function (grunt) {
    require('dotenv').config()
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.initConfig({
        replace: {
            example: {
                src: ['mia_pag/index.html'],             // source files array (supports minimatch)
                dest: 'mia_pag/index.html',             // destination directory or file
                replacements: [{
                    from: /(URL|http:\/\/localhost:3000|https:\/\/my-forum\.glitch\.me)/gm,                   // string replacement
                    to: function (matchedWord) {
                        console.log(`process.env.NODE_ENV`, process.env.NODE_ENV);
                        console.log(matchedWord)
                        if (process.env.NODE_ENV == "development") {
                          console.log(1)
                            return "http://localhost:3000"
                        } else {
                          console.log(11)
                            return "https://my-forum.glitch.me"
                        }
                    }
                }]
            }
        }
    });
    grunt.registerTask("default", ["replace"])

}
