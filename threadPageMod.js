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
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    </head>
    <body style="background-color:grey">
    <div id="fb-root"></div>
    `;

    posts.forEach(nota => {
        s += `<div><br><small>${nota.Date.toLocaleDateString()}</small><br>${nota.isOP ? "(OP) " : ""}<a href="/user/${nota.by}"> ${nota.ByName} </a>scrive:<br>
        <textarea id=${nota._id}>${nota.Text}</textarea><div style="display:inline;"></div> 
        <img class="perModificare"  style="display:${IDUtente == nota.by ? "inline" : "none"}" onclick="modificaNota('${nota._id}')" src="/edit_icon.svg" alt="edit" height="20" width="20">
        <img src="/share_icon.svg" class ="my_share_button" alt="share with facebook" height="20" width="20">
        ${con_masto ? `<img src="/toot_icon.svg" data-cosa="${nota._id}" class="masto_share_button" alt="repost on mastodont" height="20" width="20">` : ""}
        <div style="display:inline"></div>
        <img data-post-by="${nota.by}" class="perModificare" onclick="delNota('${nota._id}')" style="display:${IDUtente == nota.by ? "inline" : "none"}" src="/delete_icon.svg" alt="edit" height="20" width="20">                
        </div><br>`;
    })

    s += `    

    <br><br>reply with: <textarea id=reply></textarea> <input type=button id=Pubblica value=Pubblica!>

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
// SHARE ANCHE RISPOSTE
// SHARE ANCHE RISPOSTE
// SHARE ANCHE RISPOSTE
// SHARE ANCHE RISPOSTE
// SHARE ANCHE RISPOSTE
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

        $("#Pubblica").click(()=>{
            $.post("/newReply",{replyTo:"${op_id}" , text:$("#reply").val()})
            //la vedo
            //la vedo
            //la vedo
        });
        
    });



    function modificaNota(chi) {
        console.log($("#" + chi).val())
        $.post("/modificaNota", { id: "" + chi, text: $("#" + chi).val() }).then(() => {
            $("#" + chi).next().html("OK!").css("background-color", "green");
            setTimeout(() => {
                $("#" + chi).next().html("");
            }, 1000)
        });
    
    }

    function delNota(chi) {
        console.log($("#" + chi).val())
        $.post("/delNota", { id: "" + chi, text: $("#" + chi).val() }).then(() => {
            $("#" + chi).next().html("OK!").css("background-color", "green");
            setTimeout(() => {
                $("#" + chi).parent().remove()
            }, 500)
        });
    }

    </script>`;
    return s;
};