$(function () {

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
                    $("#showAdd").show(1000)
                    // $(".container:eq(1)").show(1000);
                    getAllNotes();
                    getAllDomUser();
                } else alert("riprova credenziali");
            });
            // singleton = false;
            // PRODUCTION MODE ONLY
        }
    });

    $.post("/allThreads").always(note => {
        if (note != "nulla salvato")
            note.forEach(nota => {
                $("#threads").append(`<br><a href="/user/${nota.By}"> ${nota.ByName} </a>scrive:<br><textarea id=${nota._id} onclick=f(this) readonly>${nota.Text}</textarea>`)
            });

    });


    $.post("/allUsers").always(utenti => {
        if (utenti)
            utenti.forEach(nota => {
                $("#utenti").append(`<a href="/user/${nota._id}"> ${nota.Name} </a>`)
            });
    });

});
function f(chi) {
    console.log(`chi`, chi.id);
    window.location = `https://my-forum.glitch.me/thread/${chi.id}`
}