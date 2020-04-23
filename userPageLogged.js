module.exports = { page: page };

function editIcon(id) {
    return `<img id="${id}" src="/edit_icon.svg" alt=" edit" height="20" width="20">`
}
function delIcon(id) {
    return `<img id="${id}" src="/delete_icon.svg" alt=" edit" height="20" width="20">`
}

function page(uid, hisData, hisPosts, con_masto) {
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
        ${delIcon("delIco")}
        <br>
        <h2> Posts scritti di recente:</h2>
        `
    // console.log(`hisPosts`, hisPosts);
    if (hisPosts.length)
        hisPosts.forEach(nota => {
            s += `<div><br><small>${nota.Date.toLocaleDateString()}</small><br>
            <textarea id=${nota._id}>${nota.Text}</textarea><div style="display:inline;"></div> 
            <img onclick=goto('${nota._id}') src="/goto_icon.svg" alt="see it" height="20" width="20">
            <img class="perModificare"  onclick="modificaNota('${nota._id}')" src="/edit_icon.svg" alt="edit" height="20" width="20">
            <img src="/share_icon.svg" class ="my_share_button" alt="share with facebook" height="20" width="20">
            ${con_masto ? `<img src="/toot_icon.svg" data-cosa="${nota._id}" class="masto_share_button" alt="repost on mastodont" height="20" width="20">` : ""}
            <div style="display:inline"></div>
            <img data-post-by="${nota.by}" class="perModificare" onclick="delNota('${nota._id}')" src="/delete_icon.svg" alt="edit" height="20" width="20">                
            </div><br>`;
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
            
                $("#delIco").click(async ()=>{
                    let ok = confirm("sicuro?")
                    if(ok) {
                        await $.post("/delProfile")
                        await $.post("/logout")
                        alert("ok fatto")
                        setTimeout(()=>{window.location="/"},1000)
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

            function goto(chi) {
                console.log(\`chi\`, chi);
                window.location = "/thread/"+chi
            }
            </script>
        </html>
        `;
    return s
};