$(function () {

    $("#output").val("")// pulisco per f5
    var m_sessid = "dummy";
    $(".container:eq(1)").hide();

    function getAllNotes() {

        $.post("/allNote", { sessid: m_sessid }).always((note) => {
            console.log(`note`, note);
            note.forEach(nota => {
                $(".row:eq(2)").append(proto(nota.nome, nota.testo));
            });
        });
    }

    let arr = ["coral", "magenta", "cyan", "AntiqueWhite", "Chartreuse", "DarkSeaGreen "]

    function proto(nome, txt, _id) {

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

                <input class="modifica btn btn-dark" type="button" value="modifica" class="modifica">
            </fieldset>
        </div>`;
    }

    $("#submitAdd").click(() => {
        $.post("/newActivity", { sessid: m_sessid, nome: $("#nome").val(), testo: $("#texttoadd")[0].value }).always(IDNotaNuova => {
            $(".row:eq(2)").append(proto($("#nome").val(), $("#texttoadd")[0].value, IDNotaNuova))
            $("#nome").val("")
            $("#texttoadd")[0].value = ""
            $("input.modifica").click(() => {
                console.log("modifica");

            });
        })

    })


    $("#submitLogin").click(() => {

        $.post("/login",
            {
                utente: $("#Codice").val(),
                passw: $("#passw").val()
            }).always((receivedData, status) => {
                console.log(`status`, status);

                if (status == "success") {
                    m_sessid = receivedData
                    $(".container:eq(1)").show(1000);
                    getAllNotes()
                }
                else alert("riprova credenziali")
            });
    });

    $("#submitRegistrati").click(() => {

        $.post("/addUser",
            {
                utente: $("#Codice").val(),
                passw: $("#passw").val()
            }).always((receivedData, status) => {
                console.log(`status`, status);

                if (status == "success") {
                    m_sessid = receivedData
                    getAllNotes()
                    $(".container:eq(1)").show(1000);
                }
                else alert("oopsie doopsie")
            });
    });

    $("fieldset #submitCerca").click(() => {

        var str = $("fieldset #tosearch").val()
        $.post("/decritta",
            {
                cosa: str,
                sessid: m_sessid
            },
            whenGetDone);
    });

    function addFile(sicuro) {

        var nomefile = $("fieldset #nomefile").val()
        var testo = $("fieldset #texttoadd").val()
        var query = { nome: nomefile, dato: testo, sessid: m_sessid };
        // console.log(query);
        if (sicuro) {
            query.conferma = true;
            $("#conferma").remove()
        }
        $.post("/addDoc", query, whenPostDone)
    }

    $("fieldset #submitAdd").click(() => {
        addFile(false);
    });

    $("fieldset #submitAll").click(() => {
        $.post("/all",
            {
                sessid: m_sessid
            }).always((receivedData, status) => {
                console.log(`status`, status);

                if (status == "success") {
                    $("fieldset:eq(3) div textarea").val($("fieldset:eq(3) div textarea").val() + receivedData + "\n");
                }
                else alert("ops")
            });

    });

    function whenGetDone(receivedData, status) {
        // scrivo il ricevuto da GET "/search/foo"
        $("fieldset:eq(3) div textarea").val($("fieldset:eq(3) div textarea").val() + receivedData + "\n");
    }

    function whenPostDone(receivedData, status) {
        //console.log(receivedData);
        if (receivedData == "sicuro?") {
            $("fieldset:eq(0)").append(`<div id="conferma">
            c'è già questo doc. Sovrascriverlo?
            <input class="btn btn-dark" type="button" value="sono sicuro" id="sicuro"><br>
            <input class="btn btn-dark" type="button" value="ok no" id="nonsicuro">
            `);

            $("#sicuro").click(() => addFile(true));
            $("#nonsicuro").click(() => $("#conferma").remove());
        }
        else
            $("fieldset:eq(3) div textarea").val($("fieldset:eq(3) div textarea").val() + receivedData + "\n");

    }
});
