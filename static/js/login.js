$("#loginForm").submit(function(e){
    e.preventDefault();

    $.ajax({
        url: "/api/0/login",
        type: "POST",
        contentType: "application/JSON",
        data: JSON.stringify({
            username: $(this).children("input[name='username']").val(),
            password: $(this).children("input[name='password']").val()
        }),
        success: function(res){
            if(res.message){
                $("#loginHint").removeClass("hidden");
                $("#loginHint").html(res.message);
            }

            if(res.success){
                window.location.href = "/";
            }
        }
    });
});