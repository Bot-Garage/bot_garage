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


// +------------------------------------------------------+
// |   User Email Verfication Code Regen Button - Click   |
// +------------------------------------------------------+
$("a[data-action='user-regen-email-verfify']").click(function(event){
    event.preventDefault();

    const user_id = $(event.target).attr("data-user-id");
    Swal.fire({
        title: "Generate a new verification ID?",
        text: "User ID: '" + user_id + "'?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Generate",
        confirmButtonColor: "#ff3c1a"
    }).then(function(res){
        if(res.isConfirmed){
            $.ajax({
                url: "/api/0/user/regen_email_verification_code/",
                type: "POST",
                contentType: "application/JSON",
                data: JSON.stringify({ id: user_id }),
                success: function(res){
                    Swal.fire({
                        title: (res.success ? "Success!" : "Failure!"),
                        text: res.message,
                        icon: (res.success ? "success" : "error")
                    });
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

    Swal.fire({
        title: "Change Password",
        input: "password",
        text: "Enter the new password for: '" + event.currentTarget.attr("data-user-id") + "'.",
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
                data: JSON.stringify({ id: event.currentTarget.attr("data-user-id") }),
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