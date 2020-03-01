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
                $("#utenti").append(`<input class="btn btn-dark" type="button" value="${nota.Name}">`)
            });
    });

});