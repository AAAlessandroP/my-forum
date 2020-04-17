module.exports = { page: page };
function page(op_id, posts, IDUtente) {
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
        s += `<br><small>${nota.Date.toLocaleDateString()}</small><br>${nota.isOP ? "(OP) " : ""}<a href="/user/${nota.by}"> ${nota.ByName} </a>scrive:<br>
        <textarea id=${nota._id}>${nota.Text}</textarea><div style="display:inline;"></div> 
        <img class="perModificare"  style="display:${IDUtente == nota.by ? "inline" : "none"}" onclick="modificaNota('${nota._id}')" src="/edit_icon.svg" alt="edit" height="20" width="20">
        <img src="/share_icon.svg" id ="my_share_button" alt="share with facebook" height="20" width="20">
        <img src="/toot_icon.svg" data-cosa="${nota._id}" id="masto_share_button" style="display:${IDUtente == nota.by ? "inline" : "none"}" alt="repost on mastodont" height="20" width="20"><br>`;
    })
    s += `    
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

        $('#my_share_button').click(function(e){
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

        $('#masto_share_button').click(function(e){
            console.log(e)
            $.post("/tootIt",{ id: e.target.getAttribute("data-cosa") }).then(()=>{
                $("#" + chi).next().html("OK!").css("background-color", "green");
                setTimeout(() => {
                    $("#" + chi).next().html("");
                }, 1000)
            })
        });
            

        $.get("/logged?").then(() => {
            $("body").append("<br><br>reply with: <textarea id=reply></textarea> <input type=button id=DoItNOW value=Pubblica!>")
            $("#DoItNOW").click(()=>{
                $.post("/newReply",{replyTo:"${op_id}" , text:$("#reply").val()})
                //la vedo
                //la vedo
                //la vedo
            });
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
    </script>`;
    return s;
};