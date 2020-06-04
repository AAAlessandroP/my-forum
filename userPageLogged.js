module.exports = { page: page };//pagina dell'utente vista da lui (loggato)

function editIcon(id) {
    return `<img id="${id}" src="/edit_icon.svg" alt=" edit" height="20" width="20">`
}
function delIcon(id) {
    return `<img id="${id}" src="/delete_icon.svg" alt=" edit" height="20" width="20">`
}

function page(id, hisData, hisPosts, con_masto, formula_post) {
    let s = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Pagina di ${hisData.Name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">        
        <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js"></script>
        <style>
        span{
            font-size:large;
        }
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

        <div class="row">
            <div class="col-10">
            </div>
            <div class="col-2">
                <div id=divProfilo style="display:none;background-color:white;border-radius: 5%"> 
                    <a href="/user/${id}"> vedi il profilo</a><br>
                    <span id=logout>logout</span><div></div>
                </div>
            </div>
        </div>
        <br>
        <div class="row">
            <div class="col-lg" style="background-color:rgb(11, 145, 11)">
                <div id="AddMessage">
                    <div>
                        <br>
                        fai una nuova domanda:
                        <input type="text" placeholder="fai una nuova domanda" id="domanda">
                        <input type="button" id="nuova_domanda" value="vai">
                        <br>
                        <br>
                    </div>
                </div>
            </div>
        </div>

        <b><span>Pagina di ${hisData.Name}</span></b>${editIcon("pic")}<br><br>
        <img src="/user/${id}/pic" alt="profile pic" height="152" width="152">
        <br>
        <iframe id="upload_target" name="upload_target" src="#" style="width:0;height:0;border:0px solid #fff;"></iframe>                 
        <form action="/modificaPic" target="upload_target" enctype="multipart/form-data" id=modificaPic method=post>
            Carica nuova immagine:
            <input type="file" name="newPicc" id="fileToUpload"><br> o il link a questa:
            <input type="text" name=newPicUrl><br>
            <input type="submit" value="carica">
        </form>
        <br>
        Elimina profilo: ${delIcon("delIco")}
        <br>
        <h2> Posts scritti di recente:</h2>
        `
    var data = {};
    hisPosts.forEach(element => {
        let gg = Math.floor(element.Date / 8.64e7);//giorni dal 1970
        if (data[gg] === undefined)
            data[gg] = 1
        else
            data[gg]++
    });
    // console.log(`data`, data);// data { '202064': 1, '2020530': 2 }
    var dataArray = []
    Object.keys(data).forEach(key => {
        dataArray.push([new Date(Number(key) * 24 * 60 * 60 * 1000).toLocaleDateString(), data[key]])// [ [ieri,2], [oggi, 3], ...]
    })
    // console.log(`dataArray`, dataArray);

    function printNota(nota, opts) {
        return `<div>    
            <br><small>${new Date(nota.Date).toLocaleDateString()}</small>
            ${opts.showAuthor ? `<a href="/user/${nota.by.toString()}"> ${nota.ByName} </a>scrive:` : ""}
            <br><div contenteditable="true"  id=${nota._id}>${nota.Text}</div> <div style="display:inline;"></div> 
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
        hisPosts.forEach(nota => {
            s += printNota(nota, { modificabile: true, goto: true, masto: con_masto, fb: false })
        });
    else s += "<i>sembra che l'utente non abbia ancora scritto niente.</i>"

    s += `<div>`;
    if (hisPosts.length)
        s += `<canvas style="width:50%;" id="grafico"></canvas>
                </div>
                <h5>Formula approssimata: ${formula_post}</h5>`;

    s += `   <br><br><input type="button" value=showissueMaker id=showissueMaker><br>

                <div id=issueMaker style="display:none">
                    <br>
                    <form id=newIssueForm action="newIssue" method=post>
                        title:<input type="text" name=title><br>
                        body:<input type="text" name=body><br>  
                        this ticket is a:<br>                      
                        bug:<input type="checkbox" name="labels[]" value="bug" ><br>
                        duplicate:<input type="checkbox" name="labels[]" value="duplicate" ><br>
                        question:<input type="checkbox" name="labels[]" value="question" ><br>
                        enhancement:<input type="checkbox" name="labels[]" value="enhancement" ><br>
                        help wanted:<input type="checkbox" name="labels[]" value="help wanted" ><br>
                        <input type="submit" value="carica">
                    </form>                
                </div>


                <center><button type="button" class="btn btn-info" onclick="goBack()">Go Back</button></center>
            </body>
    
            <script>

            function goBack() {
                window.history.back();
            }
            
            $(() => {


                $("#showissueMaker").click(()=>$("#issueMaker").toggle(100))
                $("#newIssueForm").submit(function(e){
                    e.preventDefault();
                    $.ajax({
                        type : 'POST',
                        url:"/newIssue",
                        data: $("#newIssueForm").serialize()
                    });
                    
                });

                $("#nuova_domanda").click(() => {
                    $.post("/newQuestion", { domanda: $("#domanda").val() })
                        .done(() => {
                            location.reload();                        
                        })
                });
                
                $("#logout").click(() => {
                    $.post("/logout");
                    $("#logout").next().html("OK!").css("background-color", "green");
                    setTimeout(() => {
                        location.reload();
                    }, 1000)
                });

               


                    $("#modificaPic").submit(()=>alert("ricarica la pagina per vedere la nuova pic"))


    // todo picUrl non da richiedere ma prevedibile /user/123/picc con 302 magari
                    $("#pic").click(() => {
                        $("span:eq(0)").html(\`Pagina di 
                        <input type="text" id=nome placeholder=${hisData.Name}>
                        <input type="button" id="nuovoNome" value="vai">
                        \`);
                        $("#nuovoNome").click(() => {
                            $.post("/nuovoNome", { nome: $("#nome").text() }).then(() => {
                                $("span:eq(0)").html(\`<span>Pagina di \${$("#nome").text()}</span>\`);
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

            function goto(chi) {
                console.log(\`chi\`, chi);
                window.location = "/thread/"+chi
                }


                window.chartColors = {
                    red: "rgb(255, 99, 132)",
                    orange: "rgb(255, 159, 64)",
                    yellow: "rgb(255, 205, 86)",
                    green: "rgb(75, 192, 192)",
                    blue: "rgb(54, 162, 235)",
                    purple: "rgb(153, 102, 255)",
                    grey: "rgb(201, 203, 207)"
                  };
                
                  var config = {
                    type: "line",
                    data: {
                      labels: ${JSON.stringify(dataArray.map(ele => ele[0]))}
                      ,
                      datasets: [
                        {
                          label: "numero post al giorno",
                          backgroundColor: window.chartColors.red,
                          borderColor: window.chartColors.red,
                          fill: false,
                          data: ${JSON.stringify(dataArray.map(ele => ele[1]))}
                        }
                      ]
                    },
                    options: {
                      responsive: true,
                      title: {
                        display: true,
                        text: "MyForum Usage History"
                      },
                      scales: {
                        xAxes: [
                          {
                            display: true
                          }
                        ],
                        yAxes: [
                          {
                            display: true
                            // type: 'logarithmic',
                          }
                        ]
                      }
                    }
                  };
                
                  if(document.getElementById("grafico")){//se 0 post non c'è
                  var ctx = document.getElementById("grafico").getContext("2d");
                  window.myLine = new Chart(ctx, config);     
                  }
            </script>
        </html>
        `;
    return s
};
