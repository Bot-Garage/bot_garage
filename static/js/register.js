$("form[name='register']").submit(function(e){
    e.preventDefault();

    $.ajax({
        url: "/api/0/register",
        type: "POST",
        contentType: "application/JSON",
        data: JSON.stringify({
            name: $(this).children("input[name='username']").val(),
            email_address: $(this).children("input[name='email_address']").val(),
            password: $(this).children("input[name='password']").val(),
            password_confirmation: $(this).children("input[name='password_confirmation']").val()
        }),
        success: function(res){
            alert(res.message);
        }
    });
});