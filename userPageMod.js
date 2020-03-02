module.exports = { page: page };
function page(uid, hisData, hisPosts) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Titolo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    
    </head>
    <body style="background-color:grey">

        <h2>Pagina di ${hisData.Name}</h2>
        <img src="${hisData.picUrl}" alt="profile pic" height="152" width="152">
        <br>
        <br>
        <h2> Posts scritti di recente:<h2>
        ${"<textarea readonly>" + hisPosts.map(post => post.Text).join(`</textarea readonly id=${post._id} onclick=f(this)><br><br><textarea readonly>`) + "</textarea>"}
    </body>
    </html>
    <script>
    function f(chi) {
        window.location = \`https://my-forum.glitch.me/thread/\${chi.id}\`
    }
    </script>
    `;
    // link 2 these posts
    // link 2 these posts
};