module.exports = { page: page };
function page(op_id, posts, IDUtente, con_masto) {
    // IDUtente c'è se user è loggato
    let s = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${posts[0].Text}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <style>
        .nota {
            font-family: roboto condensed, serif;
        }

        div[contenteditable="true"] {
            background-color: bisque;
            width: 55%;
            height: 120px;
            border: 3px solid #796969;
            padding: 5px;
            font-family: Tahoma, sans-serif;
        }
    </style>
    </head>
    <body style="background-color:grey">
    <div id="fb-root"></div>
    `;

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


    posts.forEach(nota => {
        // IDUtente c'è se user è loggato
        s += printNota(nota, { goto: false, fb: true, showAuthor: true, masto: con_masto, modificabile: IDUtente == nota.by })
    })

    s += `    

        <br><br>reply with: <textarea id=reply></textarea> <input type=button id=Pubblica value=Pubblica!>
    <br><br><br>
        <button type="button" class="btn btn-info" onclick="goBack()">Go Back</button>
    </body>
</html>

    <script>
        window.fbAsyncInit = function() {
        FB.init({appId: '2546945782289657', status: true, cookie: true,
        xfbml: true});
        };
        (function() {
        var e = document.createElement('script'); e.async = true;
        e.src = document.location.protocol +
        '//connect.facebook.net/en_US/all.js';
        document.getElementById('fb-root').appendChild(e);
        }());
        
    </script>

    <script>
    $(function () {

        $('.my_share_button').click(function(e){
            try{
                e.preventDefault();
                FB.ui(
                {
                method: 'feed',
                name: 'This is the content of the "name" field.',
                link: 'https://my-forum.glitch.me/thread/${op_id}',
                picture: 'https://cdn.glitch.com/8f696785-3177-4609-b393-3252e90ccbf5%2Fshare_icon.svg?v=1586891390886',
                caption: 'caption',
                description: "descr",
                message: "message"
                });
            }catch(error){
                alert("probabilmente hai estensioni/impostazioni che bloccano il popup di facebook")
            }
        });

        ${con_masto ? `
        $('.masto_share_button').click(function (e) {
            console.log(e.target)
            $.post("/tootIt", { testo: $("#" + e.target.getAttribute("data-cosa")).val() }).then(() => {
                $(e.target).next().html("OK!").css("background-color", "green");
                setTimeout(() => {
                    $(e.target).next().html("")
                }, 1000)
            })
        });
        `: ""}

        $("#Pubblica").click(async()=>{
            await $.post("/newReply",{replyTo:"${op_id}" , text:$("#reply").val()})
            window.location.reload()
        });

       
        
    });


    function goBack() {
        window.history.back();
    }

    function modificaNota(chi) {
        console.log($("#" + chi).text())
        $.post("/modificaNota", { id: "" + chi, text: $("#" + chi).text() }).then(() => {
            $("#" + chi).next().html("OK!").css("background-color", "green");
            setTimeout(() => {
                $("#" + chi).next().html("");
            }, 1000)
        });
    
    }

    function delNota(chi) {
        console.log($("#" + chi).text())
        $.post("/delNota", { id: "" + chi }).then(() => {
            $("#" + chi).next().html("OK!").css("background-color", "green");
            setTimeout(() => {
                $("#" + chi).parent().remove()
            }, 500)
        });
    }

    </script>`;
    return s;
};