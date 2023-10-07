$("form[name='admin_user_create']").submit(function(event){
    event.preventDefault();

    $.ajax({
        url: "/api/0/user",
        type: "POST",
        contentType: "application/JSON",
        data: JSON.stringify({
            username: $(event.currentTarget).children("input[name='name']").val(),
            email_address: $(event.currentTarget).children("input[name='email']").val(),
            password: $(event.currentTarget).children("input[name='password']").val(),
            admin: $(event.currentTarget).children("input[name='admin']").prop("checked")
        }),
        success: function(res){
            Swal.fire({
                title: res.success ? "Success!" : "Failed!",
                text: res.message,
                icon: res.success ? "success" : "error"
            }).then(function(){
                if(res.success) window.location.reload()
            });
        }
    });
});