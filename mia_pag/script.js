$(function () {

    var singleton = true;
    $("#submitLogin").click(() => {
        if (singleton) {
            $.get("/login", {
                utente: $("#Codice").val(),
                passw: $("#passw").val()
            }).always((receivedData, status) => {
                console.log(`status`, status);

                if (status == "success") {
                    m_sessid = receivedData;
                    $("#showAdd").show(1000)
                    // $(".container:eq(1)").show(1000);
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