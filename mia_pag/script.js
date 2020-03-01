$(function () {



    $.post("/allThreads").always(note => {
        if (note != "nulla salvato")
            note.forEach(nota => {
                $("#threads").append("<textarea disabled>" + nota.Text + "</textarea>")
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