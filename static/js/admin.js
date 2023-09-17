// +-------------------------------+
// |   User Create Form - Submit   |
// +-------------------------------+
$("#formCreateUser").submit(function(e){
    e.preventDefault();

    $.ajax({
        url: "/api/0/user",
        type: "POST",
        contentType: "application/JSON",
        data: JSON.stringify({
            username: $(this).children("input[name='username']").val(),
            email_address: $(this).children("input[name='email_address']").val(),
            password: $(this).children("input[name='password']").val()
        }),
        success: function(res){
            if(!res.success){
                Swal.fire({
                    title: "Failed!",
                    text: res.message,
                    icon: "error"
                });
            }else{
                Swal.fire({
                    title: "Success!",
                    text: res.message,
                    icon: "success"
                }).then(function(){
                    window.location.reload();
                });
            }
        }
    });
});


// +--------------------------------+
// |   User Delete Button - Click   |
// +--------------------------------+
$("a[data-action='user-delete']").click(function(event){
    event.preventDefault();

    const user_id = $(this).attr("data-user-id");
    Swal.fire({
        title: "Delete the following user?",
        text: "User ID: '" + user_id + "'?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Delete",
        confirmButtonColor: "#ff3c1a"
    }).then(function(res){
        if(res.isConfirmed){
            $.ajax({
                url: "/api/0/user/",
                type: "DELETE",
                contentType: "application/JSON",
                data: JSON.stringify({ id: user_id }),
                success: function(res){
                    if(!res.success){
                        Swal.fire({
                            title: "Failure!",
                            text: "Failed to delete user, please try again later.",
                            icon: "error"
                        });
                    }else{
                        Swal.fire({
                            title: "Success!",
                            text: "User has been delete successfully.",
                            icon: "success"
                        }).then(function(){
                            window.location.reload();
                        });
                    }
                }
            });
        }
    });
});


// +-----------------------------------------+
// |   User Change Password Button - Click   |
// +-----------------------------------------+
$("a[data-action='user-change-password']").click(function(event){
    event.preventDefault();

    const user_id = $(this).attr("data-user-id");
    Swal.fire({
        title: "Change Password",
        input: "password",
        text: "Enter the new password for: '" + user_id + "'.",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Change",
        confirmButtonColor: "#37d3ff",
        preConfirm: async (new_password) => {
            var response;
            await $.ajax({
                url: "/api/0/user/",
                type: "PATCH",
                contentType: "application/JSON",
                data: JSON.stringify({ id: user_id, password: new_password }),
                success: function(res){
                    response = res;
                }
            });

            return response;
        }
    }).then(function(res){
        if(res.isConfirmed){
            Swal.fire({
                title: res.value.success ? "Success" : "Failed",
                text: res.value.message,
                icon: res.value.success ? "success" : "error"
            });
        }
    });
});


// +-------------------------------+
// |   Bot Delete Button - Click   |
// +-------------------------------+
$("a[data-action='bot-delete']").click(function(event){
    event.preventDefault();

    const bot_id = $(this).attr("data-id");
    Swal.fire({
        title: "Delete the following user?",
        text: "Bot ID: '" + bot_id + "'?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Delete",
        confirmButtonColor: "#ff3c1a"
    }).then(function(res){
        if(res.isConfirmed){
            $.ajax({
                url: "/api/0/bot/",
                type: "DELETE",
                contentType: "application/JSON",
                data: JSON.stringify({ id: bot_id }),
                success: function(res){
                    if(!res.success){
                        Swal.fire({
                            title: "Failure!",
                            text: res.message,
                            icon: "error"
                        });
                    }else{
                        Swal.fire({
                            title: "Success!",
                            text: res.message,
                            icon: "success"
                        }).then(function(){
                            window.location.reload();
                        });
                    }
                }
            });
        }
    });
});