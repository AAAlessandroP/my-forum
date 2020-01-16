console.log(`newObj`, newObj);
    $.post("/modificaNota", newObj).always((receivedData, status) => {

        if (status == "success") {
            $(chi).append("<span style='background-color:green'>OK</span>");
            setTimeout(() => {
                $(chi)
                    .children()
                    .filter(":last")
                    .remove();
            }, 1000);
        } else alert("ops");
    });