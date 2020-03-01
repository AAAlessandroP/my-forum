module.exports = { page: page };
const { ObjectId } = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://forum:${process.env.PASS}@miocluster2-igwb8.mongodb.net/test?retryWrites=true&w=majority`;

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

        <h2>Pagina di ${
        (async function () {
            db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            let a = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(uid) })
            return a.Name
        })()
        }</h2>
        <img src="https://cdn.glitch.com/8f696785-3177-4609-b393-3252e90ccbf5%2F${uid}.jpg" alt="profile pic" height="42" width="42">

    </body>
    </html>`;
    // +all his posts
};