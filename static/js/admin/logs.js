$("#DeleteAllBtn").click(function(event){
    event.preventDefault();

    $.ajax({
        url: "/api/0/logs",
        type: "DELETE",
        contentType: "application/JSON",
        data: JSON.stringify({
            id: -1
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