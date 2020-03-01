$(function () {



    $.post("/allThreads").always(note => {
        if (note != "nulla salvato")
            note.forEach(nota => {
                $("#threads").append("<div>" + nota + "</div>")
            });
    });


    $.post("/allUsers").always(utenti => {
        console.log(`utenti`, utenti);
        if (utenti)
            utenti.forEach(nota => {
                $("#utenti").append(`<a href="/user/=${nota._id}"> ${nota.Name} </a>`)
            });
    });

});