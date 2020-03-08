module.exports = { page: page };
function page(id, posts) {
    let s = `
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
    `
    posts.forEach(nota => {
        s += `<br><a href="/user/${nota.By}"> ${nota.ByName} </a>scrive:<br><textarea id=${nota._id} onclick=f(this) readonly>${nota.Text}</textarea>`
    })
        + `    
    </body>
    </html>`;
    return s;
};