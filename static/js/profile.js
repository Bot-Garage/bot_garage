$("form[name='user_profile_settings']").submit((event) => {
    event.preventDefault();

    // Send AJAX Request
    $.ajax({
        url: "/api/0/user/",
        type: "PATCH",
        contentType: "application/JSON",
        data: JSON.stringify({
            id: $(event.currentTarget).attr("user_id"),
            name: $(event.currentTarget).find("input[name='name']").val(),
            email: $(event.currentTarget).find("input[name='email']").val()
        }),
        success: (res) => {
            Swal.fire({
                title: (res.success ? "Success!" : "Error!"),
                text: res.message,
                icon: (res.success ? "success" : "error")
            }).then(() => {
                window.location.reload();
            });
        }
    })
});

$("form[name='user_change_password']").submit((event) => {
    event.preventDefault();

    const new_password = $(event.currentTarget).find("input[name='password']").val();
    const new_password_confirm = $(event.currentTarget).find("input[name='password_confirmation']").val();

    if(new_password != new_password_confirm){
        return Swal.fire({
            title: "Error!",
            text: "Passwords do not match.",
            icon: "error"
        });
    }

    // Send AJAX Request
    $.ajax({
        url: "/api/0/user/",
        type: "PATCH",
        contentType: "application/JSON",
        data: JSON.stringify({
            id: $(event.currentTarget).attr("user_id"),
            password: new_password,
        }),
        success: (res) => {
            Swal.fire({
                title: (res.success ? "Success!" : "Error!"),
                text: res.message,
                icon: (res.success ? "success" : "error")
            }).then(() => {
                window.location.reload();
            });
        }
    })
});