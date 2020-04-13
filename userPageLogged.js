module.exports = { page: page };

function editIcon(id) {
    return `<img id="${id}" src="/edit_icon.svg" alt=" edit" height="20" width="20">`
}

function page(uid, hisData, hisPosts) {
    let s = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${hisData.Name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        
        <style>
        span{
            font-size:large;
        }
        </style>
    </head>
    <body style="background-color:grey">

        <b><span>Pagina di ${hisData.Name}</span></b>${editIcon("pic")}<br><br>
        <img src="${hisData.picUrl}" alt="profile pic" height="152" width="152">
        <br>
        <br>
        <h2> Posts scritti di recente:</h2>
        `
    console.log(`hisPosts`, hisPosts);
    if (hisPosts.length)
        hisPosts.forEach(post => {
            s += `<div><textarea id=${post._id}> ${post.Text} </textarea> <div style="display:inline;"</div> <img onclick=goto('${post._id}') src="/goto_icon.svg" alt="see it" height="20" width="20">
        <img onclick="f('${post._id}')" src="/edit_icon.svg" alt=" edit" height="20" width="20">
        <br><br>`
        });
    else s += "<i>sembra che l'utente non abbia ancora scritto niente.</i>"

    s += `
            </body>
    
            <script>
            $(() => {
                $("#pic").click(() => {
                    $("span:eq(0)").html(\`Pagina di 
                    <input type="text" id=nome placeholder=${hisData.Name}>
                    <input type="button" id="nuovoNome" value="vai">
                    \`);
                    $("#nuovoNome").click(() => {
                        $.post("/nuovoNome", { nome: $("#nome").val() }).then(() => {
                            $("span:eq(0)").html(\`<span>Pagina di \${$("#nome").val()}</span>\`);
                        })
                    })
            
                });
            
            })

            function f(chi){
                console.log($("#" + chi).val())
                $.post("/modificaNota", { id: ""+chi, text: $("#" + chi).val() }).then(() => {
                    $("#" + chi).next().html("OK!").css( "background-color", "green" );
                    setTimeout(()=>{
                        $("#" + chi).next().html("");
                    },1000)
                });
            
            }

            function goto(chi) {
                console.log(\`chi\`, chi);
                window.location = "/thread/"+chi
            }
            </script>
        </html>
        `;
    return s
};