var m_sessid = "dummy";

$(function () {
    $("#output").val(""); // pulisco per f5
    $(".container:eq(1)").hide();

    function getAllNotes() {
        $.post("/allNoteDominio", { sessid: m_sessid }).always(note => {
            console.log(`note`, note);
            if (note != "nulla salvato")
                note.forEach(nota => {
                    if (nota.tipo == "Semplice")
                        $(".row:eq(2)").append(protoNotaSemplice(nota.nome, nota.testo, nota.IDNota));
                    else if (nota.tipo == "scheda con scadenza")
                        $(".row:eq(2)").append(protoNotaConScadenza(nota.nome, nota.testo, nota.IDNota, nota.Scadenza));

                    $(`#${nota.IDNota} .modifica`)[0].onclick = () => {
                        modifica($(`#${nota.IDNota}`)[0]);
                    };
                    $(`#${nota.IDNota} .cancella`)[0].onclick = () => {
                        cancella($(`#${nota.IDNota}`)[0]);
                    };
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

                $(".row:eq(2)").append(
                    protoNotaSemplice($("#nome").val(), $("#texttoadd")[0].value, IDNotaNuova)
                );
                $(`#${IDNotaNuova} .modifica`)[0].onclick = () => {
                    modifica($(`#${IDNotaNuova}`)[0]);
                };
                $(`#${IDNotaNuova} .cancella`)[0].onclick = () => {
                    cancella($(`#${IDNotaNuova}`)[0]);
                };
                $("#nome").val("");
                $("#texttoadd")[0].value = "";
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



    $("fieldset #submitAll").click(() => {
        $.post("/all", {
            sessid: m_sessid
        }).always((receivedData, status) => {
            console.log(`status`, status);

            if (status == "success") {
                $("fieldset:eq(3) div textarea").val(
                    $("fieldset:eq(3) div textarea").val() + receivedData + "\n"
                );
            } else alert("ops");
        });
    });

});

function modifica(chi) {
    // console.log(`chi`, chi);
    // console.log(`chi`, chi.children[0].children[1].children[0].value)
    $.post("/modificaNota", {
        sessid: m_sessid,
        IDNota: chi.id,
        titoloNuovo: chi.children[0].children[1].children[0].value,
        testoNuovo: chi.children[0].children[2].children[0].value
    }).always((receivedData, status) => {
        console.log(`status`, status);

        if (status == "success") {
            $(chi).append("<span style='background-color:green'>OK</span>");
            setTimeout(() => {
                console.log(`chi`, chi);
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
