// +------------------------------------------+
// |   Function - UpdateBotDataById(bot_id)   |
// +------------------------------------------+
function UpdateBotDataById(bot_id){
    $.ajax({
        url: "/api/0/bot/" + bot_id + "/",
        method: "GET",
        success: res => {
            if(res.success) UpdateBotData(res.bot)
        }
    })
}


// +-----------------------------------+
// |   Function - UpdateBotData(bot)   |
// +-----------------------------------+
function UpdateBotData(bot){
    // Update Bot Information - Unhide Window
    $("#BotInfo").removeClass("hidden");

    // Update Bot Information - Bot Name
    $("#BotName").html(bot.name);

    // Bot Information - Bot Status ID
    $("#BotStatus").attr("data-bot-id", bot._id);

    // Bot Status - Update Data
    $(`.bot-status[data-bot-id='${bot._id}']`).attr("data-running", bot.started);
    
    // Update Bot Actions - Bot ID
    $("#BotActions a").attr("data-bot-id", bot._id);

    
    // General Settings - Form Bot ID
    $("form[name='bot_general_settings']").attr("data-bot-id", bot._id);

    // General Settings - Name
    $("form[name='bot_general_settings'] input[name='name']").val(bot.name);
    
    // General Settings - Personality
    $("form[name='bot_general_settings'] select[name='personality']").val(bot.personality);
    
    
    // Discord Settings - Form Bot ID
    $("form[name='bot_discord_settings']").attr("data-bot-id", bot._id);
    
    // Discord Settings - Discord Client Token
    $("form[name='bot_discord_settings'] input[name='discord_client_token']").val(bot.discord_client_token);
    
    // Discord Settings - Discord App ID
    $("form[name='bot_discord_settings'] input[name='discord_app_id']").val(bot.discord_app_id);

    
    // OpenAI Settings - Form Bot ID
    $("form[name='bot_openai_settings']").attr("data-bot-id", bot._id);

    // OpenAI Settings - API Key
    $("form[name='bot_openai_settings'] input[name='openai_api_key']").val(bot.openai_api_key);
    
    // OpenAI Settings - Org ID
    $("form[name='bot_openai_settings'] input[name='openai_org_id']").val(bot.openai_org_id);
}


// +-----------------------------------+
// |   Event: Bot List - Bot - Click   |
// +-----------------------------------+
$("#bot-list .bot").click(function(event){
    event.preventDefault();

    $.ajax({
        url: "/api/0/bot/" + $(event.currentTarget).attr("data-bot-id"),
        type: "GET",
        success: function(res){
            if(res.success) UpdateBotData(res.bot);
            else Swal.fire({
                title: "Error!",
                text: "Failed to get bot information. Please try again later.",
                icon: "error"
            });
        }
    });
});



// +----------------------------------+
// |   Event: New Bot Form - Submit   |
// +----------------------------------+
$("form[name='BotCreate']").submit(function(e){
    e.preventDefault();

    const bot_name = $(this).children("input[name='bot_name']").val();

    $.ajax({
        url: "/api/0/bot/",
        type: "POST",
        contentType: "application/JSON",
        data: JSON.stringify({
            name: bot_name
        }),
        success: function(res){
            if(res.success){
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: res.message
                  }).then(function(){
                      location.reload();
                  });
            }else{
                $("#BotSettingsHint").removeClass("hidden").html(res.message);
            }
        },
        error: function(res){
            console.log(res);
        }
    });
});


// +------------------------------------+
// |   Event - Action Buttons - Click   |
// +------------------------------------+
$("#BotActions a").click(function(e){
    e.preventDefault();

    // Validation: Action attribute
    const bot_id = $(this).attr("data-bot-id");
    if(!bot_id) return;

    // Validation: Action attribute
    const requested_action = $(this).attr("data-action");
    if(!requested_action) return;

    // Action - Delete - Delete the bot
    if(requested_action == "delete"){
        Swal.fire({
            icon: "warning",
            title: "Warning!",
            text: "Are you sure you want to delete this bot?",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#dd3333",
            confirmButtonText: "Delete it!"
        }).then(function(res){
            if(res.isConfirmed){
                $.ajax({
                    url: "/api/0/bot/",
                    type: "DELETE",
                    contentType: "application/JSON",
                    data: JSON.stringify({
                        bot_id: bot_id
                    }),
                    success: function(res){
                        if(!res.success){
                            Swal.fire({
                                title: "Failed!",
                                text: res.message,
                                icon: "error"
                            }).then(function(res){
                                location.reload();
                            });
                        }else{
                            Swal.fire({
                                title: "Success!",
                                text: res.message,
                                icon: "success"
                            }).then(function(res){
                                location.reload();
                            });
                        }
                    }
                });
            }
        })
    }else if(requested_action == "start" || requested_action == "stop"){
        $.ajax({
            url: "/api/0/bot/actions/",
            type: "POST",
            contentType: "application/JSON",
            data: JSON.stringify({
                bot_id: bot_id,
                action: requested_action
            }),
            success: function(res){
                // Failed to start / stop bot
                if(!res.success){
                    Swal.fire({
                        title: "Failed!",
                        text: res.message,
                        icon: "error"
                    });
                }

                // Bot started / stopped successfully, update bot data and continue.
                UpdateBotDataById(bot_id);
            }
        });
    }
});


// +--------------------------------+
// |   Event - Form - Submit        |
// |                                |
// |   Form: bot_general_settings   |
// +--------------------------------+
$("form[name='bot_general_settings']").submit((event) => {
    event.preventDefault();

    $.ajax({
        url: "/api/0/bot/",
        type: "PATCH",
        contentType: "application/JSON",
        data: JSON.stringify({
            bot_id: $(event.currentTarget).attr("data-bot-id"),
            name: $(event.currentTarget).children("input[name='name']").val(),
            personality: $(event.currentTarget).children("form[name='bot_general_settings'] select[name='personality']").val(),
        }),
        success: (res) => {
            if(res.success == true){
                Swal.fire({
                    title: "Success",
                    text: "Bot General Settings have been saved.",
                    icon: "success"
                }).then((swal_res) => {
                    UpdateBotDataById(res.bot._id);
                });
            }else{
                Swal.fire({
                    title: "Failed!",
                    text: res.message,
                    icon: "error"
                });
            }
        }
    });
});


// +--------------------------------+
// |   Event - Form - Submit        |
// |                                |
// |   Form: bot_discord_settings   |
// +--------------------------------+
$("form[name='bot_discord_settings']").submit((event) => {
    event.preventDefault();

    $.ajax({
        url: "/api/0/bot/",
        type: "PATCH",
        contentType: "application/JSON",
        data: JSON.stringify({
            bot_id: $(this).attr("data-bot-id"),
            discord_client_token: $(this).children("input[name=discord_client_token]").val(),
            discord_app_id: $(this).children("input[name=discord_app_id]").val()
        }),
        success: function(res){
            if(res.success == true){
                Swal.fire({
                    title: "Success",
                    text: "Bot Discord Settings have been saved.",
                    icon: "success"
                }).then(function(res){
                    UpdateBotData(res.bot._id);
                });
            }else{
                Swal.fire({
                    title: "Failed!",
                    text: res.message,
                    icon: "error"
                });
            }
        }
    });
});


// +-------------------------------+
// |   Event - Form - Submit       |
// |                               |
// |   Form: bot_openai_settings   |
// +-------------------------------+
$("form[name='bot_openai_settings']").submit(function(event){
    event.preventDefault();

    $.ajax({
        url: "/api/0/bot/",
        type: "PATCH",
        contentType: "application/JSON",
        data: JSON.stringify({
            bot_id: $(this).attr("data-bot-id"),
            openai_api_key: $(this).children("input[name=openai_api_key]").val(),
            openai_org_id: $(this).children("input[name=openai_org_id]").val(),
        }),
        success: function(res){
            if(res.success == true){
                Swal.fire({
                    title: "Success",
                    text: "Bot OpenAI Settings have been saved.",
                    icon: "success"
                }).then(function(res){
                    UpdateBotData(res.bot._id);
                });
            }else{
                Swal.fire({
                    title: "Failed!",
                    text: res.message,
                    icon: "error"
                });
            }
        }
    });
});