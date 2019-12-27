$(function () {
    $("#output").val("")// pulisco per f5
    var m_sessid = "dummy";
    $(".container:eq(1)").hide();

    $("#submitLogin").click(() => {
        console.log("submitLogin");

        $.post("/login",
            {
                utente: $("#Codice").val(),
                passw: $("#passw").val()
            }).always((receivedData, status) => {
                console.log(`status`, status);

                if (status == "success") {
                    m_sessid = receivedData
                    $(".container:eq(1)").show(1000);
                }
                else alert("riprova credenziali")
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
