module.exports = { page: page };
function page(uid, hisData, hisPosts) {
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

        <h2>Pagina di ${hisData.Name}</h2>
        <img src="${hisData.picUrl}" alt="profile pic" height="152" width="152">
        <br>
        <br>
        <h2> Posts scritti di recente:</h2>
        `
    console.log(`hisPosts`, hisPosts);

    if (hisPosts.length)
        hisPosts.forEach(post => {
            s += `<textarea readonly id=${post._id} onclick=f(this)> ${post.Text} </textarea> <br><br>`
        });
    else s += "<i>sembra che l'utente non abbia ancora scritto niente.</i>"


    s += `
        </body>
    </html>
    <script>
    f = chi=> window.location = \`/thread/\${chi.id}\`   
    </script>
    `;
    return s;
    // link 2 these posts
    // link 2 these posts
};