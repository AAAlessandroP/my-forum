module.exports = { page: page };
function page(uid) {
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

        <img src="https://cdn.glitch.com/8f696785-3177-4609-b393-3252e90ccbf5%2F${uid}.jpg" alt="profile pic" height="42" width="42">

    </body>
    </html>`;
    // +all his posts
};