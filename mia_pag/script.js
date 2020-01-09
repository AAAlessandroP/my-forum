var m_sessid = "dummy";

$(function () {


    function getAllNotes() {//solo dopo login ok

        $.post("/allNoteDominio", { sessid: m_sessid }).always(note => {
            console.log(`note`, note);
            if (note != "nulla salvato")
                note.forEach(nota => {

                    if (nota.Tipo == "Semplice")
                        $("#appendino").append(protoNotaSemplice(nota.nome, nota.testo, nota.IDNota));
                    else if (nota.Tipo == "scheda con scadenza")
                        $("#appendino").append(protoNotaConScadenza(nota.nome, nota.testo, nota.IDNota, nota.ScadeIL));
                    else alert("ops")
                    $(`#${nota.IDNota} .modifica`)[0].onclick = () => {
                        modifica($(`#${nota.IDNota}`)[0]);
                    };
                    $(`#${nota.IDNota} .cancella`)[0].onclick = () => {
                        cancella($(`#${nota.IDNota}`)[0]);
                    };
                });
        });
    }

    function getAllDomUser() {//solo dopo login ok

        $.post("/allDomUsers", { sessid: m_sessid }).always(utenti => {
            console.log(`utenti`, utenti);
            if (utenti)
                utenti.forEach(nota => {
                    $(".row:eq(2) div").append(`<input class="btn btn-dark" type="button" value="${nota.Name}">`)

                });
        });
    }

    let arr = [
        "coral",
        "magenta",
        "cyan",
        "AntiqueWhite",
        "Chartreuse",
        "DarkSeaGreen "
    ];

    function protoNotaSemplice(nome, txt, _id) {
        let randColor = arr[Math.floor(Math.random() * arr.length)];
        return `
        <div class="col-3" id="${_id}" style="background-color:${randColor}">
            <fieldset>
                <legend>nota</legend>
                <div class="input-group mt-2 mb-2">
                    <input type="text" class="form-control" value="${nome}">
                </div>
                <div class="input-group mt-2 mb-2">

                    <textarea class="form-control" rows="3">${txt}</textarea>
                </div>

                <input class="modifica btn btn-dark" type="button" value="modifica">
                <input class="cancella btn btn-dark" type="button" value="cancella">

                </fieldset>
        </div>`;
    }

    function protoNotaConScadenza(nome, txt, _id, data) {
        let randColor = arr[Math.floor(Math.random() * arr.length)];
        return `
        <div class="col-3" id="${_id}" style="background-color:${randColor}">
            <fieldset>
                <legend>nota</legend>
                <div class="input-group mt-2 mb-2">
                    <input type="text" class="form-control" value="${nome}">
                </div>
                <div class="input-group mt-2 mb-2">
                    <textarea class="form-control" rows="3">${txt}</textarea>
                </div>
                <div class="input-group mt-2 mb-2">
                    <label>scadenza:</label>
                </div>
                <div class="input-group mt-2 mb-2">
                    <input type="date" class="form-control" value="${data}">
                </div>
                <input class="modifica btn btn-dark" type="button" value="modifica">
                <input class="cancella btn btn-dark" type="button" value="cancella">

                </fieldset>
        </div>`;
    }

    $("#submitAddSemplice").click(() => {
        add("Semplice");
    });

    $("#submitAddATempo").click(() => {
        add("scheda con scadenza");
    });

    function add(type) {

        var params = { sessid: m_sessid, nome: $("#nome").val(), testo: $("#texttoadd")[0].value }
        params["tipo"] = type

        if (type == "scheda con scadenza") {
            params["scadenza"] = $("#scadenzaAddATempo").val()
        }

        $.post("/newActivity", params)
            .always(IDNotaNuova => {

                if (type == "Semplice")
                    $("#appendino").append(
                        protoNotaSemplice($("#nome").val(), $("#texttoadd")[0].value, IDNotaNuova)
                    );
                else if (type == "scheda con scadenza")
                    $("#appendino").append(
                        protoNotaConScadenza($("#nomeAddATempo").val(), $("#txtAddATempo")[0].value, IDNotaNuova, $("#scadenzaAddATempo")[0].value)
                    );

                $(`#${IDNotaNuova} .modifica`)[0].onclick = () => {
                    modifica($(`#${IDNotaNuova}`)[0]);
                };
                $(`#${IDNotaNuova} .cancella`)[0].onclick = () => {
                    cancella($(`#${IDNotaNuova}`)[0]);
                };
                $("#nome").val("");
                $("#nomeAddATempo").val("");
                $("#nome").val("");
                $("#txtAddATempo")[0].value = "";
                $("#scadenzaAddATempo")[0].value = "";
            });
    }

    var singleton = true;
    $("#submitLogin").click(() => {
        if (singleton) {
            $.post("/login", {
                utente: $("#Codice").val(),
                dom: $("#dom").val(),
                passw: $("#passw").val()
            }).always((receivedData, status) => {
                console.log(`status`, status);

                if (status == "success") {
                    m_sessid = receivedData;
                    $(".container:eq(1)").show(1000);
                    getAllNotes();
                    getAllDomUser();
                } else alert("riprova credenziali");
            });
            // singleton = false;
            // PRODUCTION MODE ONLY
            // PRODUCTION MODE ONLY
            // PRODUCTION MODE ONLY
        }
    });

    $("#submitRegistrati").click(() => {
        $.post("/addUser", {
            utente: $("#Codice").val(),
            passw: $("#passw").val(),
            dom: $("#dom").val()
        }).always((receivedData, status) => {
            console.log(`status`, status);

            if (status == "success" && receivedData != "username already taken") {
                m_sessid = receivedData;
                getAllNotes();
                $(".container:eq(1)").show(1000);
            } else if (receivedData == "username already taken") alert(receivedData);
            else alert("ops");
        });
    });



    

});

function modifica(chi) {
    console.log(`chi`, chi);
    var newObj = {
        sessid: m_sessid,
        IDNota: chi.id,
        titoloNuovo: chi.children[0].children[1].children[0].value,
        testoNuovo: chi.children[0].children[2].children[0].value
    };
    if (chi.children[0].children[6])//il 4o c'è anche nelle semplici, è del
        newObj.dataNuova = chi.children[0].children[4].children[0].value

    $.post("/modificaNota", newObj).always((receivedData, status) => {

        if (status == "success") {
            $(chi).append("<span style='background-color:green'>OK</span>");
            setTimeout(() => {
                $(chi)
                    .children()
                    .filter(":last")
                    .remove();
            }, 1000);
        } else alert("ops");
    });
}

function cancella(chi) {
    $.post("/delNota", { sessid: m_sessid, IDNota: chi.id }).always(
        (receivedData, status) => {
            console.log(`status`, status);

            if (status == "success") {
                $(chi).remove();
            } else alert("ops");
        }
    );
}
