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
    <body>

        <h2>Pagina di ${hisData.Name}</h2>
        <img src="${hisData.picUrl}" alt="profile pic" height="42" width="42">
        <br>
        <br>
        ${"<textarea disabled>" + hisPosts.join("</textarea><textarea disabled>") + "</textarea>"}
    </body>
    </html>`;
    // +all his posts
};