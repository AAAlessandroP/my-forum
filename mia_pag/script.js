$(function () {

    var singleton = true;
    $("#submitLogin").click(() => {
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
            //appendo eventuali parametri dalla querystring della pagina principale /
            $.get("/login", obj).always((receivedData, status) => {
                console.log(`status`, status);

                if (status == "success") {
                    if (!receivedData.includes("<script>")) {
                        $("#showAdd").show(1000)
                        m_sessid = receivedData;
                    }
                    else
                        $("body").append(receivedData)
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