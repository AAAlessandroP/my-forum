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
                    attachHandlersTo(nota.IDNota)
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
                carica allegato: <input class="carica btn btn-dark" name="foo" type="file" />
                <input class="cancella btn btn-dark" type="button" value="cancella">

                <input type="hidden" name="tipo" value="Semplice">
                </fieldset>
        </div>`;
    }

    function attachHandlersTo(IDNotaNuova) {

        $(`#${IDNotaNuova} .modifica`)[0].onclick = () => {
            modifica($(`#${IDNotaNuova}`)[0]);
        };
        $(`#${IDNotaNuova} .cancella`)[0].onclick = () => {
            cancella($(`#${IDNotaNuova}`)[0]);
        };
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
                carica allegato: <input class="carica btn btn-dark" name="foo" type="file" />
                <input class="cancella btn btn-dark" type="button" value="cancella">

                <input type="hidden" name="tipo" value="scheda con scadenza">
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

        var params = { sessid: m_sessid, tipo: type }

        if (type == "Semplice") {
            params["nome"] = $("#nome").val()
            params["testo"] = $("#texttoadd")[0].value
        } else
            if (type == "scheda con scadenza") {
                params["nome"] = $("#nomeAddATempo").val()
                params["testo"] = $("#txtAddATempo")[0].value
                params["scadenza"] = $("#scadenzaAddATempo").val()
            }

        console.log(`params`, params);

        $.post("/newActivity", params)
            .always(IDNotaNuova => {

                if (type == "Semplice") {
                    $("#appendino").append(
                        protoNotaSemplice($("#nome").val(), $("#texttoadd")[0].value, IDNotaNuova)
                    );
                    $("#nome").val("");
                    $("#texttoadd").val("");
                }
                else if (type == "scheda con scadenza") {
                    $("#appendino").append(
                        protoNotaConScadenza($("#nomeAddATempo").val(), $("#txtAddATempo")[0].value, IDNotaNuova, $("#scadenzaAddATempo")[0].value)
                    );
                    $("#scadenzaAddATempo")[0].value = "";
                    $("#txtAddATempo")[0].value = "";
                    $("#nomeAddATempo").val("");
                }
                attachHandlersTo(IDNotaNuova)
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
    if (chi.children[0].children["tipo"].val() == "scheda con scadenza")
        newObj.dataNuova = chi.children[0].children[4].children[0].value

    newObj["foo"] = $(`#${chi.id} input[type=file]`).prop('files')[0]

    // TODO input nascosto che mi dice il tipo
    // TODO input nascosto che mi dice il tipo
    // TODO input nascosto che mi dice il tipo
    // TODO input nascosto che mi dice il tipo
    // TODO input nascosto che mi dice il tipo
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
