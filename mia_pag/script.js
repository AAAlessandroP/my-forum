$(function () {



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
function f(chi){
    console.log(`chi`, chi.id);
    windows.location = 
}