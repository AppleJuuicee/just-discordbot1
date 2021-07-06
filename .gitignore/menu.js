const Discord = require("discord.js");
const { listenerCount } = require("events");
const { connect } = require("http2");
const ytdl = require("ytdl-core");

const Client = new Discord.Client;

Client.on("ready", async () =>{ 
    Client.user.setStatus("online")
    Client.user.setActivity("&help")
})

const prefix = "&";

var list = [];

Client.on("ready", () => {
    console.log("Bot Ready !");
});

Client.on("guildMemberAdd", member => {
    console.log("Un nouveau membre est arrivé");
    member.guild.channels.cache.find(channel => channel.id === "856525822009278500").send(member.displayName + "**__Bienvenue à toi !__**\nNous sommes actuellement **" + member.guild.memberCount + "** sur le serveur !");
    member.roles.add("856525822000627735");
});

Client.on("guildMemberRemove", member => {
    console.log("Un membre nous a quitté");
    member.guild.channels.cache.find(channel => channel.id === "856525822009278500").send(member.displayName + "**nous a __quitté__ :sob:**");   
});


function playMusic(connection){
    let dispatcher = connection.play(ytdl(list[0], { quality: "highestaudio"}));

    dispatcher.on("finish", () => {
        list.shift();
        dispatcher.destroy();

        if(list.length > 0){
            playMusic(connection);
        }
        else {
            connection.disconnect();
        }
    });

    dispatcher.on("error", err => {
        console.log("erreur de dispatcher : " + err);
        dispatcher.destroy();
        connection.disconnect();
    })
}


Client.on("message", async message => {
    if(message.author.bot) return;
    if(message.channel.type == "dm") return; 

    if(message.content === prefix + "playlist"){
        let msg = "**FILE D'ATTENTE !**\n";
        for(var i = 0;i < list.length;i++){
            let name;
           let getinfo = await
           ytdl.getBasicInfo(list[i]);
           name = getinfo.videoDetails.title;

            msg += "> " + i + " - " + name + "\n";
        }
        message.channel.send(msg);
    }

    else if(message.content.startsWith(prefix + "play")){
        if(message.member.voice.channel){
            let args = message.content.split(" ");

            if(args[1] == undefined || !args[1].startsWith("https://www.youtube.com/watch?v=")){
                message.reply("Impossible de lire la vidéo.");
            }
            else{
                if(list.length > 0){
                    list.push(args[1]);
                    message.reply("Vidéo ajouté à la liste.");
                }
                else{
                    list.push(args[1]);
                    message.reply("Vidéo ajouté à la liste.")

                    message.member.voice.channel.join().then(connection => {
                        playMusic(connection);

                        connection.on("disconnect", () => {
                            list = [];
                        })
                    
                    }).catch(err => {
                        message.reply("Erreur lors de la connexion : " + err);
                    })
                }
            }
        }
    }


    //&help
    if(message.content == prefix + "help"){
        message.channel.send("Alors tout d'abord j'ai étais créé par **__AppleJuuicee__**,\nmon préfix est &.\nVoici la liste de mes commandes :\n**__&just__** \n**__&stream__** \n**__&play__** \n**__&playlist__** \n(Des autres sont en cours ^^) ")
    }

    //&stream
    if(message.content == prefix + "stream"){
        message.channel.send("**Voici le listes des streamers Just : \nJustSam59Tv : https://www.twitch.tv/justsam59tv \nJustSlimTv : https://www.twitch.tv/justslimtv \nJustMortaTv : https://www.twitch.tv/justmortatv **")
    }
    
    //&just
    if(message.content == prefix + "just"){
        message.channel.send("Les Just sont un groupe de pote streamer, tu trouveras tout type de contenu, alors va voir leurs lives !");
    }

    if(message.content == "Bien et toi"){
        message.channel.send("Bien, je continue d'évoluer tel un pokémon xD")
    }

    if(message.content == "Tu fait quoi ?"){
        message.channel.send("Moi ? J'attend, mon développeur est en train de m'améliorer ^^")
    }

    if(message.content == "Salut"){
        message.reply("Hey !");
        message.channel.send("Comment ça va ?");
    }    
});


Client.login(process.env.TOKEN);
