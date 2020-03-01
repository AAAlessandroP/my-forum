$(function () {



    $.post("/allThreads").always(note => {
        if (note != "nulla salvato")
            note.forEach(nota => {
                $("body").append("<div>" + nota + "</div>")
            });
    });


    $.post("/allUsers").always(utenti => {
        console.log(`utenti`, utenti);
        if (utenti)
            utenti.forEach(nota => {
                $(".row:eq(2) div").append(`<input class="btn btn-dark" type="button" value="${nota.Name}">`)
            });
    });

});