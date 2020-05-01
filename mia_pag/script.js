$(async function () {

    getAllThreads();

    var photoId;
    var res = new XMLHttpRequest();
    res.open("get", '/rechaptaPhotos', true);
    res.responseType = "blob";
    res.onload = function (oEvent) {
        var blob = res.response;
        photoId = oEvent.target.getResponseHeader("X-photo-id")
        var imgSrc = URL.createObjectURL(blob);
        var $img = $('<img/>', {
            "alt": "image 4 rechapta",
            "src": imgSrc
        }).appendTo($('#rechapta'));
        window.URL.revokeObjectURL(imgSrc);
    };
    res.send(null);

    $.post("/allUsers").always(utenti => {
        if (utenti)
            utenti.forEach(nota => {
                $("#utenti").append(`<a href="/user/${nota._id.toString()}"> ${nota.Name} </a>`)
            });
    });

    var singleton = true;
    $("#submitLogin").click((id) => {
        if (singleton) {
            let obj = {
                utente: $("#Codice").val().trim(),
                passw: $("#passw").val(),
                mail: $("#mail").val().trim(),
            };
            (window.onpopstate = function () {
                var match,
                    pl = /\+/g,  // Regex for replacing addition symbol with a space
                    search = /([^&=]+)=?([^&]*)/g,
                    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                    query = window.location.search.substring(1);

                while (match = search.exec(query))
                    obj[decode(match[1])] = decode(match[2]);
            })();
            //appendo eventuali parametri dalla querystring della pagina principale '/'
            $.get("/login", obj).always((receivedData, status) => {

                if (status == "success") {
                    if (!receivedData.includes("<script>")) {
                        // onaccessGranted(receivedData.substr(1, receivedData.length - 1)) ????
                        onaccessGranted(receivedData)
                    }
                    else
                        $("body").append(receivedData)//è il redirect a ms-teams
                } else alert("riprova credenziali");
            });
            // singleton = false;
            // PRODUCTION MODE ONLY
        }
    });

    var singleton2 = true;
    $("#submitRegistrati").click(() => {
        if (singleton2) {
            $("#rechapta").show(100)
            singleton2 = false;
        } else {

            $.post("/addUser", {
                utente: $("#Codice").val().trim(),
                passw: $("#passw").val(),
                mail: $("#mail").val().trim(),
                guess: $(":checked:eq(0)").val(),
                photoId
            }).then((mess) => {
                alert(mess)
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                // non chiamo onaccessgranted perchè non potrei fare nulla!
            }).catch((err) => {
                alert(err.responseText)
            });
        }
    });

    $("#nuova_domanda").click(() => {
        $.post("/newQuestion", { domanda: $("#domanda").val() })
            .done(() => {
                ricaricaThreads()
            })
    });


    var singleton3 = true;
    function onaccessGranted(id) {

        if (singleton3) {
            singleton3 = false;
            m_id = id

            console.log(`onaccessGranted`);

            $("#AddMessage").show(1000)
            ricaricaThreads() //così adesso ci saranno i  pulsanti del, mod ecc


            $.get("/myPic").then(picc => {
                console.log("myPic");

                $(".divAccesso").remove()
                // tolgo l'intestazione 
                if ($("#divProfilo")[0] == null) {//onaccessGranted potrebbe essere chiamata dopo nuovo mess con già la foto profilo
                    $("body").prepend(`
                    <div class="row">
                        <div class="col-10">
                        </div>
                        <div class="col-2">
                            <img src="${picc}" id=picture style="border-radius: 50%;width:64px;height:64px">
                            <div id=divProfilo style="display:none;background-color:white;border-radius: 5%"> 
                                <a href="/user/${id.toString()}"> vedi il profilo</a><br>
                                <span id=logout>logout</span><div></div>
                            </div>
                        </div>
                    </div>`);
                    $("#picture").click(() => {
                        $("#divProfilo").toggle(100)
                    });
                    $("#logout").click(() => {
                        $.post("/logout");
                        $("#logout").next().html("OK!").css("background-color", "green");
                        setTimeout(() => {
                            location.reload();
                        }, 1000)
                    });
                }
            });
        } else singleton3 = false
    }

    function ricaricaThreads() {
        // $("#threads").html("");
        getAllThreads();
    }

    function printNota(nota, opts) {
        return `<div class="nota">    
            <br><small>${new Date(nota.Date).toLocaleDateString()}</small>
            ${opts.showAuthor ? `<a href="/user/${nota.by.toString()}"> ${nota.ByName} </a>scrive:` : ""}
            <br><textarea id=${nota._id}>${nota.Text}</textarea> <div style="display:inline;"></div> 
            ${opts.fb ? `<img src="/share_icon.svg" class ="my_share_button" alt="share with facebook" height="20" width="20">` : ""}
            ${opts.goto ? `<img onclick="goto('${nota._id}')" src="/goto_icon.svg" alt="see it" height="20" width="20">` : ""}
            ${opts.modificabile ? `<img class="perModificare" onclick="modificaNota('${nota._id}')" src="/edit_icon.svg" alt="edit" height="20" width="20">` : ""}
            ${opts.con_masto ? `<img src="/toot_icon.svg" data-cosa="${nota._id}" class="masto_share_button" alt="repost on mastodont" height="20" width="20">` : ""}
            <div style="display:inline"></div>
            ${opts.modificabile ? `<img data-post-by="${nota.by}" class="perModificare" onclick="delNota('${nota._id}')" src="/delete_icon.svg" alt="edit" height="20" width="20">` : ""}
            <br>
        </div>`
    }


    function getAllThreads() {
        console.log("getAllThreads");

        $.post("/allQuestions").then((note, textStatus, request) => {

            let con_masto = request.getResponseHeader("x-masto-logged") == "yes"

            let singleton3 = true
            $("#loginWithTG").click(async () => {
                if (singleton3) {
                    singleton3 = false;
                    let id;
                    try {
                        id = await $.get("/getTempId4TG")
                    } catch (error) {
                        console.log(`error`, error)
                    }
                    $("#loginWithTG").html(`Accedi via <a href="t.me/pippofalapizza">telegram bot</a> con id=${id}`);
                }
            });

            logged = request.getResponseHeader("x-logged") != "no"
            if (logged)
                onaccessGranted(request.getResponseHeader("x-logged"))

            if (note != "nulla salvato") {
                $("#threads").html("");
                note.forEach(nota => {
                    $("#threads").append(printNota(nota, { modificabile: logged, goto: true, masto: con_masto, fb: false, showAuthor: true }))
                    // metto FB
                    // metto FB
                    // metto FB
                });

                if (con_masto)
                    $('.masto_share_button').click(function (e) {
                        console.log(e.target)
                        $.post("/tootIt", { testo: $("#" + e.target.getAttribute("data-cosa")).val() }).then(() => {
                            $(e.target).next().html("OK!").css("background-color", "green");
                            setTimeout(() => {
                                $(e.target).next().html("")
                            }, 1000)
                        })
                    });
            }
        });
    }



});


function goto(chi) {
    window.location = "/thread/" + chi
}

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
