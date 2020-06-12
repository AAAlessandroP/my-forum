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
        },
        concat: {
            dist: {
                src: ["docs/app.html", "docs/myscript.html"],
                dest: 'docs/app.html',
            },
        },
    });
    grunt.registerTask("default", ["replace"])

    var execSync = require('child_process').execSync;

    grunt.loadNpmTasks("grunt-contrib-concat")
    grunt.registerTask("execDocco", () => {
        console.log(123);

        execSync("docco -l \"linear\" *.js", function (err, stdout, stderr) {
            console.log(`err`, err);
            console.log(`stdout`, stdout);
            console.log(`stderr`, stderr);
        });
    })

    grunt.registerTask("docs", ["execDocco", "concat"])
}
