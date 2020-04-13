module.exports = { page: page };
function page(op_id, posts) {
    let s = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${posts[0].Text}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <style>
            .nota{
                background-color:#b5aeae;
            }
        </style>
    </head>
    <body style="background-color:grey">
    `
    posts.forEach(nota => {
        s += `<br><small>${nota.Date.toLocaleDateString()}</small><br>${nota.isOP ? "(OP) " : ""}<a href="/user/${nota.by}"> ${nota.ByName} </a>scrive:<br><br><span class="nota"> ${nota.Text} </span><br>`
    })
    s += `    
    </body>

    <script>
    $(function () {

        $.get("/logged?").then(() => {
            $("body").append("<br><br>reply with: <textarea id=reply></textarea> <input type=button id=DoItNOW value=Pubblica!>")
            $("#DoItNOW").click(()=>{
                $.post("/newReply",{replyTo:"${op_id}" , text:$("#reply").val()})
            });
        });

    });
    </script>

    </html>`;
    return s;
};