$(async function () {

    var singleton = true;
    $("#submitLogin").click((id) => {
        if (singleton) {
            let obj = {
                utente: $("#Codice").val(),
                passw: $("#passw").val()
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
                        onaccessGranted(receivedData.substr(1, receivedData.length - 1))
                    }
                    else
                        $("body").append(receivedData)//è il redirect a ms-teams
                } else alert("riprova credenziali");
            });
            // singleton = false;
            // PRODUCTION MODE ONLY
        }
    });

    $("#submitRegistrati").click(() => {
        $.post("/addUser", {
            utente: $("#Codice").val(),
            passw: $("#passw").val()
        }).then((id) => {
            onaccessGranted(id.substr(1, id.length - 1))
        }).catch(() => {
            alert("username already taken")
        });
    });

    getAllThreads();

    $.get("/logged?").then((id) => onaccessGranted(id));

    $.post("/allUsers").always(utenti => {
        if (utenti)
            utenti.forEach(nota => {
                $("#utenti").append(`<a href="/user/${nota._id.toString()}"> ${nota.Name} </a>`)
            });
    });

    $("#nuova_domanda").click(() => {
        $.post("/newQuestion", { domanda: $("#domanda").val() })
            .done(() => {

                $("#threads").val("");
                getAllThreads();
            })
    });

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

function onaccessGranted(id) {
    console.log(`id`, id);
    $("#AddMessage").show(1000)
    // $(".container:eq(1)").prepend("<input style='right: 150px;' type=button value=logout id=logout><br>")

    $.get("/myPic").then(picc => {
        $(".divAccesso").remove()
        $("body").prepend(`
        <div class="row">
            <div class="col-10">
            </div>
            <div class="col-2">
                <img src="${picc}" id=picture style="border-radius: 50%;width:64px;height:64px">
                <div id=divProfilo style="display:none;background-color:white;border-radius: 5%"> 
                    <a href="/user/${id.toString()}"> vedi il profilo</a><br>
                    <span id=logout>logout</span>
                </div>
            </div>
        </div>`);
        $("#picture").click(() => {

            $("#divProfilo").toggle(100)
        });
        $("#logout").click(() => {
            $.post("/logout");
        });

    });
}


function getAllThreads() {
    $.post("/allQuestions").always(note => {
        if (note != "nulla salvato")
            note.forEach(nota => {
                $("#threads").append(`<br><a href="/user/${nota.by.toString()}"> ${nota.ByName} </a>scrive:
                <br><textarea id=${nota._id} readonly>${nota.Text}</textarea> <div style="display:inline;"></div> 
                <img onclick="goto('${nota._id}')" src="/goto_icon.svg" alt="see it" height="20" width="20">
                <img onclick="modificaNota('${nota._id}')" src="/edit_icon.svg" alt=" edit" height="20" width="20">
                `)
            });

    });
}
