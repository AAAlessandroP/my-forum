var m_sessid = "dummy";

$(function () {

    $("#showAdd").click(function () {
        $("#perAggiungereNote").toggle(1000)
        if ($(this).val() == "togli aggiungi")
            $(this).val("aggiungi nota")
        else
            $(this).val("togli aggiungi")
    })

    function getAllNotes() {//solo dopo login ok

        $.post("/allNoteDominio", { sessid: m_sessid }).always(note => {
            if (note != "nulla salvato")
                note.forEach(nota => {
                    var allegati = []
                    if (nota.allegati)
                        nota.allegati.forEach(element => {
                            allegati.push()
                        });
                    else nota.allegati = []

                    console.log('nota.allegati', nota.allegati);
                    console.log('nota.nome, nota.testo, nota.IDNota, nota.allegati.map(f => JSON.parse(f))', nota.nome, nota.testo, nota.IDNota, nota.allegati.map(f => JSON.parse(f)));
                    if (nota.Tipo == "Semplice")
                        $("#appendino").append(protoNotaSemplice(nota.nome, nota.testo, nota.IDNota, nota.allegati.map(f => JSON.parse(f))))
                    else if (nota.Tipo == "scheda con scadenza")
                        $("#appendino").append(protoNotaConScadenza(nota.nome, nota.testo, nota.IDNota, nota.ScadeIL, nota.allegati.map(f => JSON.parse(f))));
                    else alert("ops")
                });
        });
    }

    function getAllDomUser() {//solo dopo login ok

        $.post("/allDomUsers", { sessid: m_sessid }).always(utenti => {
            console.log(`utenti`, utenti);
            if (utenti)
                utenti.forEach(nota => {
                    $(".row:eq(2) div").append(`<input class="btn btn-dark" type="button" value="${nota.Name}">`)
                });
        });
    }

    let arr = [
        "coral",
        "magenta",
        "cyan",
        "AntiqueWhite",
        "Chartreuse",
        "DarkSeaGreen "
    ];

    {
        //     function protoNotaSemplice(nome, txt, _id, allegati) {
        //         console.log('allegati', allegati);

        //         let randColor = arr[Math.floor(Math.random() * arr.length)];
        //         let s = `
        //             <div class="col-3" id="${_id}" style="background-color:${randColor}">
        //                 <fieldset>
        //                     <legend>nota</legend>
        //                     <div class="input-group mt-2 mb-2">
        //                         <input type="text" class="form-control" value="${nome}">
        //                     </div>
        //                     <div class="input-group mt-2 mb-2">
        //                         <textarea class="form-control" rows="3">${txt}</textarea>
        //                     </div>`;

        //         if (allegati)
        //             allegati.forEach(element => {
        //                 s += "<p>" + element + "</p>"
        //             });
        //         s += `
        //                     carica allegato: <input class="carica btn btn-dark" name="docs" type="file" multiple/>
        //                     <input class="modifica btn btn-dark" type="button" value="modifica">                
        //                     <input class="cancella btn btn-dark" type="button" value="cancella">

        //                     <input type="hidden" name="tipo" value="Semplice">
        //                     </fieldset>
        //             </div>`;
        //         return s;
        //     }

        //     function attachHandlersTo(IDNotaNuova) {

        //         $(`#${IDNotaNuova} .modifica`)[0].onclick = () => {
        //             modifica($(`#${IDNotaNuova}`)[0]);
        //         };
        //         $(`#${IDNotaNuova} .cancella`)[0].onclick = () => {
        //             cancella($(`#${IDNotaNuova}`)[0]);
        //         };
        //     }

        //     function protoNotaConScadenza(nome, txt, _id, data, allegati) {

        //         console.log('allegati', allegati);
        //         let randColor = arr[Math.floor(Math.random() * arr.length)];
        //         let s = `
        //             <div class="col-3" id="${_id}" style="background-color:${randColor}">
        //                 <fieldset>
        //                     <legend>nota</legend>
        //                     <div class="input-group mt-2 mb-2">
        //                         <input type="text" class="form-control" value="${nome}">
        //                     </div>
        //                     <div class="input-group mt-2 mb-2">
        //                         <textarea class="form-control" rows="3">${txt}</textarea>
        //                     </div>
        //                     <div class="input-group mt-2 mb-2">
        //                         <label>scadenza:</label>
        //                     </div>
        //                     <input name="data" type="date" class="form-control" value="${data}">
        //                     `;

        //         if (allegati)
        //             allegati.forEach(element => {
        //                 s += "<p>" + element + "</p>"
        //             });
        //         s += `
        //                     carica allegato: <input class="carica btn btn-dark" name="docs" type="file" multiple/>
        //                     <input class="modifica btn btn-dark" type="button" value="modifica">
        //                     <input class="cancella btn btn-dark" type="button" value="cancella">

        //                     <input type="hidden" name="tipo" value="scheda con scadenza">
        //                     </fieldset>
        //             </div>`;
        //         return s;
        //     }
    }


    function protoNotaSemplice(nome, txt, _id, allegati) {
        console.log('...args', nome, txt, _id, allegati);
        {
            // console.log('allegati', allegati);

            // let randColor = arr[Math.floor(Math.random() * arr.length)];
            // let s = `
            //     <div class="col-3" id="${_id}" style="background-color:${randColor}">
            //         <fieldset>
            //             <legend>nota</legend>
            //             <div class="input-group mt-2 mb-2">
            //                 <input type="text" class="form-control" value="${nome}">
            //             </div>
            //             <div class="input-group mt-2 mb-2">
            //                 <textarea class="form-control" rows="3">${txt}</textarea>
            //             </div>`;

            // if (allegati)
            //     allegati.forEach(element => {
            //         s += "<p>" + element + "</p>"
            //     });
            // s += `
            //             carica allegato: <input class="carica btn btn-dark" name="docs" type="file" multiple/>
            //             <input class="modifica btn btn-dark" type="button" value="modifica">                
            //             <input class="cancella btn btn-dark" type="button" value="cancella">

            //             <input type="hidden" name="tipo" value="Semplice">
            //             </fieldset>
            //     </div>`;
            // return s;
        }
        let randColor = arr[Math.floor(Math.random() * arr.length)];
        let s = `<div class="col-3" id="${_id}" style="background-color:${randColor}">
            <fieldset>
                <legend> Nota:</legend>
                <form action="/dummy" method="post" encType="multipart/form-data">

                    <input type="text" class="form-control" placeholder="nome" name="nome" value="${nome}">
                    <textarea class="form-control" value="${txt}" placeholder="testo della nota" rows="3" name="testo"></textarea>
                    `;

        if (allegati)
            allegati.forEach(element => {
                s += `<a download='${element.name}' href='data:text/plain;charset=utf-8,${encodeURIComponent(element.data.data)}'> ${element.name} </a>`
            });
        s += `
                        seleziona allegati: <input class="carica" name="docs" type="file" multiple>
                        <input class="btn btn-dark" type="button" onclick="modifica('${_id}')" value="modifica">
                        <input class="btn btn-danger" onclick="cancella('${_id}')" type="button" value="cancella">
                        <input type="hidden" name="tipo" value="Semplice">
                    </form>
                </fieldset>
            </div>`;
        return s;
    }

    function protoNotaConScadenza(nome, txt, _id, data, allegati) {
        {
            // console.log('allegati', allegati);
            // let randColor = arr[Math.floor(Math.random() * arr.length)];
            // let s = `
            //     <div class="col-3" id="${_id}" style="background-color:${randColor}">
            //                         <fieldset>
            //                             <legend>nota</legend>
            //                             <div class="input-group mt-2 mb-2">
            //                                 <input type="text" class="form-control" value="${nome}">
            //             </div>
            //                                 <div class="input-group mt-2 mb-2">
            //                                     <textarea class="form-control" rows="3">${txt}</textarea>
            //                                 </div>
            //                                 <div class="input-group mt-2 mb-2">
            //                                     <label>scadenza:</label>
            //                                 </div>
            //                                 <input name="data" type="date" class="form-control" value="${data}">
            //                                     `;

            // if (allegati)
            //     allegati.forEach(element => {
            //         s += "<p>" + element + "</p>"
            //     });
            // s += `
            //             carica allegato: <input class="carica btn btn-dark" name="docs" type="file" multiple />
            //                                     <input class="modifica btn btn-dark" type="button" value="modifica">
            //                                         <input class="cancella btn btn-dark" type="button" value="cancella">

            //                                             <input type="hidden" name="tipo" value="scheda con scadenza">
            //             </fieldset>
            //     </div>`;
            // return s;
        }
        console.log('allegati', allegati);
        let randColor = arr[Math.floor(Math.random() * arr.length)];
        let s = `<div class="col-3" id="${_id}" style="background-color:${randColor}">
            <fieldset>
                <legend> Nota:</legend>
                <form action="/dummy" method="post" encType="multipart/form-data">

                <input type="text" class="form-control" placeholder="nome" name="nome" value="${nome}">
                <textarea class="form-control" value="${txt}" placeholder="testo della nota" rows="3" name="testo"></textarea>
                `;

        if (allegati)
            allegati.forEach(element => {
                s += `<a download='${element.name}' href='data:text/plain;charset=utf-8,${encodeURIComponent("element.data.data")}'> ${element.name} </a>`
            });
        s += `
                        <input type="date" class="form-control" name="scadenza">
                        seleziona allegati: <input class="carica" name="docs" type="file" multiple>
                        <input class="btn btn-dark" type="button" onclick="modifica('${_id}')" value="modifica">
                        <input class="btn btn-danger" onclick="cancella('${_id}')" type="button" value="cancella">
                        <input type="hidden" name="tipo" value="nota con scadenza">
                    </form>
                </fieldset>
            </div>`;
        return s;
    }



    $("#submitAddSemplice").click(() => {
        add("Semplice");
    });

    $("#submitAddATempo").click(() => {
        add("scheda con scadenza");
    });

    $("form").submit((event) => {
        event.preventDefault()
        formdata = new FormData(event.currentTarget);//event.currentTarget È QUEL <FORM>
        formdata.append("sessid", m_sessid)
        $.ajax({
            url: '/newActivity',
            data: formdata ? formdata : form.serialize(),
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function (IDNotaNuova, textStatus, jqXHR) {
                console.log('formdata.get("docs")', formdata.get("docs"));
                if (formdata.get("tipo") == "Semplice") {
                    $("#appendino").append(
                        protoNotaSemplice(formdata.get("nome"), formdata.get("testo"), IDNotaNuova, Array.from(formdata.get("docs")))
                    );
                }
                else if (formdata.get("tipo") == "scheda con scadenza") {
                    $("#appendino").append(
                        protoNotaConScadedenza(formdata.get("nome"), formdata.get("testo"), IDNotaNuova, formdata.get("scadenza"), Array.from(formdata.get("docs")))
                    );
                }
            }
        });
    })

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
            // PRODUCTION MODE ONLY
            // PRODUCTION MODE ONLY
        }
    });

    $("#submitRegistrati").click(() => {
        $.post("/addUser", {
            utente: $("#Codice").val(),
            passw: $("#passw").val(),
            dom: $("#dom").val()
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

});


async function modifica(chi) {
    console.log(`chi`, $("#" + chi)[0].children[0].children[1]);
    {
        // var newObj = {
        //     sessid: m_sessid,
        //     IDNota: chi.id,
        //     titoloNuovo: chi.children[0].children[1].children[0].value,
        //     testoNuovo: chi.children[0].children[2].children[0].value,
        //     docs: []
        // };
        // if (chi.children[0].children["tipo"].value == "scheda con scadenza")
        //     newObj.dataNuova = chi.children[0].children["data"].value


        // var files = $(`#${chi.id} input[type=file]`).prop('files');
        // var promises = []

        // for (let i = 0; i < files.length; i++) {

        //     promises.push(
        //         new Promise(function (resolve, reject) {
        //             var fileReader = new FileReader();
        //             fileReader.onload = async () => {
        //                 newObj["docs"].push(fileReader.result)
        //                 resolve("done")
        //             }
        //             fileReader.readAsDataURL(files[i]);
        //         })
        //     );
        // }

        // Promise.all(promises).then((values) => {
        //     console.log(`newObj`, newObj);
        //     $.post("/modificaNota", newObj).always((receivedData, status) => {

        //         if (status == "success") {
        //             $(chi).append("<span style='background-color:green'>OK</span>");
        //             setTimeout(() => {
        //                 $(chi)
        //                     .children()
        //                     .filter(":last")
        //                     .remove();
        //             }, 1000);
        //         } else alert("ops");
        //     });
        // });
    }
    formdata = new FormData($("#" + chi)[0].children[0].children[1]);
    formdata.append("sessid", m_sessid)
    formdata.append("IDNota", chi)
    $.ajax({
        url: '/modificaNota',
        data: formdata ? formdata : form.serialize(),
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function (IDNotaNuova, textStatus, jqXHR) {

        }

    });
}

function cancella(chi) {
    $.post("/delNota", { sessid: m_sessid, IDNota: chi })
        .done(() => $("#" + chi).remove())
        .fail(() => alert("ops"))

}
