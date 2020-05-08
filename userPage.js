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
        <style>
        .nota {
            font-family: roboto condensed, serif;
        }

        div[contenteditable="true"] {
            width: 55%;
            height: 120px;
            border: 3px solid #796969;
            padding: 5px;
            font-family: Tahoma, sans-serif;
        }
    </style>
    </head>
    <body style="background-color:grey">

        <h2>Pagina di ${hisData.Name}</h2>
        <img src="${hisData.picUrl}" alt="profile pic" height="152" width="152">
        <br>
        <br>
        <h2> Posts scritti di recente:</h2>
        `

    function printNota(nota, opts) {
        return `<div>    
            <br><small>${new Date(nota.Date).toLocaleDateString()}</small>
            ${opts.showAuthor ? `<a href="/user/${nota.by.toString()}"> ${nota.ByName} </a>scrive:` : ""}
            <br><div contenteditable="true" id=${nota._id}>${nota.Text}</div> <div style="display:inline;"></div> 
            ${opts.fb ? `<img src="/share_icon.svg" class ="my_share_button" alt="share with facebook" height="20" width="20">` : ""}
            ${opts.goto ? `<img onclick="goto('${nota._id}')" src="/goto_icon.svg" alt="see it" height="20" width="20">` : ""}
            ${opts.modificabile ? `<img class="perModificare" onclick="modificaNota('${nota._id}')" src="/edit_icon.svg" alt="edit" height="20" width="20">` : ""}
            ${opts.con_masto ? `<img src="/toot_icon.svg" data-cosa="${nota._id}" class="masto_share_button" alt="repost on mastodont" height="20" width="20">` : ""}
            <div style="display:inline"></div>
            ${opts.modificabile ? `<img data-post-by="${nota.by}" class="perModificare" onclick="delNota('${nota._id}')" src="/delete_icon.svg" alt="edit" height="20" width="20">` : ""}
            <br>
        </div>`
    }

    if (hisPosts.length)
        hisPosts.forEach(post => {
            // s += `<textarea readonly id=${post._id}> ${post.Text} </textarea> 
            // <div style="display:inline;"</div> <img onclick=goto('${post._id}') src="/goto_icon.svg" alt="see it" height="20" width="20">
            // <br><br>`
            s += printNota(post, { modificabile: false, goto: true, masto: false, fb: false })
        });
    else s += "<i>sembra che l'utente non abbia ancora scritto niente.</i>"


    s += `
            <button onclick="goBack()">Go Back</button>

        </body>
    </html>
    <script>
    goto = chi=> window.location = \`/thread/\${chi}\`  
    
    function goBack() {
        window.history.back();
      }
    </script>
    `;
    return s;
    // link 2 these posts
    // link 2 these posts
};