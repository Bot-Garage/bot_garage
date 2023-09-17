$("form[name='create_personality']").submit((event) => {
    event.preventDefault();

    $.ajax({
        url: "/api/0/personality/",
        type: "POST",
        contentType: "application/JSON",
        data: JSON.stringify({
            name: $(event.target).children("input[name='personality_name']").val()
        }),
        success: (res) => {
            Swal.fire({
                title: (res.success ? "Success!" : "Failure!"),
                text: res.message,
                icon: (res.success ? "success" : "error")
            }).then(() => {
                window.location.reload();
            });
        }
    });
});


$("a[data-action='personality-edit-name']").click((event) => {
    event.preventDefault();

    Swal.fire({
        title: "Change Personality Name",
        text: "Enter the new name:",
        input: "text",
        inputValue: $(event.target).parent().text(),
        showCancelButton: true,
        preConfirm: async (new_name) => {
            var response;
            await $.ajax({
                url: "/api/0/personality/",
                type: "PATCH",
                contentType: "application/JSON",
                data: JSON.stringify({
                    id: $(event.target).attr("data-id"),
                    name: new_name
                }),
                success: (res) => {
                    response = res;
                }
            });
            return response;
        }
    }).then((res) => {
        if(res.isConfirmed){
            Swal.fire({
                title: (res.value.success ? "Success!" : "Failure!"),
                text: res.value.message || "Unknown failure",
                icon: (res.value.success ? "success" : "error")
            }).then(() => {
                window.location.reload();
            });
        }
    });
});


$("a[data-action='personality-edit-content']").click((event) => {
    event.preventDefault();

    Swal.fire({
        title: "Change Personality Content",
        input: "textarea",
        inputValue: $(event.target).parent().text(),
        showCancelButton: true,
        preConfirm: async (new_content) => {
            var response;
            await $.ajax({
                url: "/api/0/personality/",
                type: "PATCH",
                contentType: "application/JSON",
                data: JSON.stringify({
                    id: $(event.target).attr("data-id"),
                    content: new_content
                }),
                success: (res) => {
                    response = res;
                }
            });
            return response;
        }
    }).then((res) => {
        if(res.isConfirmed){
            Swal.fire({
                title: (res.value.success ? "Success!" : "Failure!"),
                text: res.value.message || "Unknown failure",
                icon: (res.value.success ? "success" : "error")
            }).then(() => {
                window.location.reload();
            });
        }
    });
});


$("a[data-action='personality-delete']").click((event) => {
    event.preventDefault();

    Swal.fire({
        title: "Confirmation.",
        text: "Are you sure you want to delete this personality?",
        icon: "warning",
        showCancelButton: true,
        preConfirm: async (new_content) => {
            var response;
            await $.ajax({
                url: "/api/0/personality/",
                type: "DELETE",
                contentType: "application/JSON",
                data: JSON.stringify({
                    id: $(event.target).attr("data-id")
                }),
                success: (res) => {
                    response = res;
                }
            });
            return response;
        }
    }).then((res) => {
        if(res.isConfirmed){
            Swal.fire({
                title: (res.value.success ? "Success!" : "Failure!"),
                text: res.value.message || "Unknown failure",
                icon: (res.value.success ? "success" : "error")
            }).then(() => {
                window.location.reload();
            });
        }
    });
});