const Discord = require("discord.js");

const ayarlar = require("../ayarlar.json")

const { Aki } = require("aki-api");

const games = new Set();

const attemptingGuess = new Set();

/**

    * @param {Discord.Message} message The Message Sent by the User.

    * @param {Discord.Client} client The Discord Client.

    * @param {"en" | "ar" | "cn" | "de" | "es" | "fr" | "il" | "it" | "jp" | "kr" | "nl" | "pl" | "pt" | "ru" | "tr" | "id"} region (OPTIONAL): The Region/Language Code you want Akinator to Use. Defaults to "en".

    * @returns Discord.js Akinator Game

    * @async

    * @example

    *  const Discord = require("discord.js");

    *  const client = new Discord.Client();

    *  const akinator = require("discord.js-akinator");

    * 

    * const PREFIX = "!";

    * 

    * client.on("message", async message => {

    *     if(message.content.startsWith(`${PREFIX}akinator`)) {

    *         akinator(message, client)

    *     }

    * });

       */

module.exports = async function (message, client, region) {

    try {

        // error handling

        if (!message) return console.log("akinator hatası!");

        if (!client) return console.log("akinator hatası!");

        if (!region) region = "tr"

        if (!message.id || !message.channel || !message.channel.id || !message.author) throw new Error("The Message Object provided was invalid!")

        if (!client.user.id || !client.user) throw new Error("client hatası!")

        if (!message.guild) throw new Error("Dm hatası!")

       

        // defining for easy use

        let usertag = message.author.tag

        let avatar = message.author.displayAvatarURL()

        

        // check if a game is being hosted by the player

        if (games.has(message.author.id)) {

            let alreadyPlayingEmbed = new Discord.MessageEmbed()

                .setAuthor(usertag, avatar)

                .setTitle(`Zaten oyundasın!`)

                .setDescription("**Zaten bu oyunu oynuyorsun `durdur` yazarak oyunu durdur.**")

                .setColor(ayarlar.embed)

            return message.channel.send({ embed: alreadyPlayingEmbed })

        }

       

        // adding the player into the game

        games.add(message.author.id)

        let startingEmbed = new Discord.MessageEmbed()

            .setAuthor(usertag, avatar)

            .setTitle(`Oyunun başlıyor...`)

            .setDescription("**Oyunun 3 saniye içinde başlıyacak.**")

            .setColor(ayarlar.embed)

        let startingMessage = await message.channel.send({ embed: startingEmbed })

        // starts the game

        let aki = new Aki(region)

        await aki.start();

        let notFinished = true;

        let stepsSinceLastGuess = 0;

        let hasGuessed = false;

        let noResEmbed = new Discord.MessageEmbed()

            .setAuthor(usertag, avatar)

            .setTitle(`Oyun bitti`)

            .setDescription(`**${message.author.username}, 1 dakika boyunca aktif olmadığın için oyun sonlandı.**`)

            .setColor(ayarlar.embed)

  

        let akiEmbed = new Discord.MessageEmbed()

            .setAuthor(usertag, avatar)

            .setTitle(`Soru ${aki.currentStep + 1}`)

            .setDescription(`**İlerleme: 0%\n${aki.question}**`)

            .addField("Birşey yazamlısın...", "**E** veya **Evet**\n**H** veya **Hayır**\n**B** veya **Bilmiyorum**\n**M** veya **Muhtemelen**\n**G** veya **Geri**")

            .setFooter(`Oyunu durdurmak için **d** veya **durdur** yazmalısın.`)

            .setColor(ayarlar.embed)

        await startingMessage.delete();

        let akiMessage = await message.channel.send({ embed: akiEmbed });

         

        // if message was deleted, quit the player from the game

        client.on("messageDelete", async deletedMessage => {

            if (deletedMessage.id == akiMessage.id) {

                notFinished = false;

                games.delete(message.author.id)

                attemptingGuess.delete(message.guild.id)

                await aki.win()

                return;

            }

        })

        // repeat while the game is not finished

        while (notFinished) {

            if (!notFinished) return;

            stepsSinceLastGuess = stepsSinceLastGuess + 1

            if (((aki.progress >= 95 && (stepsSinceLastGuess >= 10 || hasGuessed == false)) || aki.currentStep >= 78) && (!attemptingGuess.has(message.guild.id))) {

                attemptingGuess.add(message.guild.id)

                await aki.win();

                stepsSinceLastGuess = 0;

                hasGuessed = true;

                let guessEmbed = new Discord.MessageEmbed()

                    .setAuthor(usertag, avatar)

                    .setTitle(`Ben ${Math.round(aki.progress)}% Olasılıkla Tahmin Ettiğin Karakterim.`)

                    .setDescription(`**${aki.answers[0].name}**\n${aki.answers[0].description}\n\nKarakter doğru mu? **(Evet veya hayır)**`)

                    .addField("Sıralama", `**#${aki.answers[0].ranking}**`, true)

                    .addField("Soru sayısı", `**${aki.currentStep}**`, true)

                    .setImage(aki.answers[0].absolute_picture_path)

                    .setColor(ayarlar.embed)

                await akiMessage.edit({ embed: guessEmbed });

                // valid answers if the akinator sends the last question

                const guessFilter = x => {

                    return (x.author.id === message.author.id && ([

                        "e",

                        "evet",

                        "h",

                        "hayır"

                    ].includes(x.content.toLowerCase())));

                }

                await message.channel.awaitMessages(guessFilter, {

                    max: 1, time: 60000

                })

                    .then(async responses => {

                        if (!responses.size) {

                            return akiMessage.edit({ embed: noResEmbed });

                        }

                        const guessAnswer = String(responses.first()).toLowerCase();

                        await responses.first().delete();

                        attemptingGuess.delete(message.guild.id)

                        // if they answered yes

                        if (guessAnswer == "e" || guessAnswer == "evet") {

                            let finishedGameCorrect = new Discord.MessageEmbed()

                                .setAuthor(usertag, avatar)

                                .setTitle(`Güzel oyun!`)

                                .setDescription(`**${message.author.username}, Bir kere daha doğru tahmin ettim!**`)

                                .addField("Karakter", `**${aki.answers[0].name}**`, true)

                                .addField("Sıralama", `**#${aki.answers[0].ranking}**`, true)

                                .addField("Soru sayısı", `**${aki.currentStep}**`, true)

                                .setColor(ayarlar.embed)

                            await akiMessage.edit({ embed: finishedGameCorrect })

                            notFinished = false;

                            games.delete(message.author.id)

                            return;

                           

                        // otherwise

                        } else if (guessAnswer == "h" || guessAnswer == "hayır") {

                            if (aki.currentStep >= 78) {

                                let finishedGameDefeated = new Discord.MessageEmbed()

                                    .setAuthor(usertag, avatar)

                                    .setTitle(`Güzel oyun!`)

                                    .setDescription(`**${message.author.username}, hmm birdahaki sefere...**`)

                                    .setColor(ayarlar.embed)

                                await akiMessage.edit({ embed: finishedGameDefeated })

                                notFinished = false;

                                games.delete(message.author.id)

                            } else {

                                aki.progress = 50

                            }

                        }

                    });

            }

            if (!notFinished) return;

            let updatedAkiEmbed = new Discord.MessageEmbed()

                .setAuthor(usertag, avatar)

                .setTitle(`Soru ${aki.currentStep + 1}`)

                .setDescription(`**İlerleme: ${Math.round(aki.progress)}%\n${aki.question}**`)

                .addField("Birşeyler yazmalısın...", "**E** veya **Evet**\n**H** veya **Hayır**\n**B** veya **Bilmiyorum**\n**M** veya **Muhtemelen**\n**G** veya **Geri**")

                .setFooter(`Oyunu dururmak için \`d\` veya \`durdur\` yazmalısın.`)

                .setColor(ayarlar.embed)

            akiMessage.edit({ embed: updatedAkiEmbed })

            // all valid answers when answering a regular akinator question

            const filter = x => {

                return (x.author.id === message.author.id && ([

                    "e",

                    "evet",

                    "h",

                    "hayır",

                    "b",

                    "bilmiyorum",

                    "i",

                    "dont know",

                    "don't know",

                    "m",

                    "muhtemelen",

                    "pn",

                    "probably not",

                    "g",

                    "geri",

                    "d",

                    "durdur"

                ].includes(x.content.toLowerCase())));

            }

            await message.channel.awaitMessages(filter, {

                max: 1, time: 60000

            })

                .then(async responses => {

                    if (!responses.size) {

                        await aki.win()

                        notFinished = false;

                        games.delete(message.author.id)

                        return akiMessage.edit({ embed: noResEmbed })

                    }

                    const answer = String(responses.first()).toLowerCase().replace("'", "");

                    // assign points for the possible answers given

                    const answers = {

                        "e": 0,

                        "evet": 0,

                        "y": 0,

                        "yes": 0,

                        "h": 1,

                        "n": 0,

                        "no": 0,

                        "hayır": 1,

                        "b": 2,

                        "bilmiyorum": 2,

                        "don't know": 2,

                        "i": 2,

                        "m": 3,

                        "Muhtemelen": 3,

                        "pn": 4,

                        "probably not": 4,

                    }

                    let thinkingEmbed = new Discord.MessageEmbed()

                        .setAuthor(usertag, avatar)

                        .setTitle(`Soru ${aki.currentStep + 1}`)

                        .setDescription(`**İlerleme: ${Math.round(aki.progress)}%\n${aki.question}**`)

                        .addField("Birşey yazmalısın...", "**E** veya **Evet**\n**H** veya **Hayır**\n**B** veya **Bilmiyorum**\n**M** veya **Muhtemelen**\n**G** veya **Geri**")

                        .setFooter(`Hmm...`)

                        .setColor(ayarlar.embed)

                    await akiMessage.edit({ embed: thinkingEmbed })

                    await responses.first().delete();

                    if (answer == "g" || answer == "geri") {

                        if (aki.currentStep >= 1) {

                            await aki.back();

                        }

                       

                    // stop the game if the user selected to stop

                    } else if (answer == "d" || answer == "durdur") {

                        games.delete(message.author.id)

                        let stopEmbed = new Discord.MessageEmbed()

                            .setAuthor(usertag, avatar)

                            .setTitle(`Oyun bitti`)

                            .setDescription(`**${message.author.username}, oyun başarılı bir şekilde durduruldu.**`)

                            .setColor(ayarlar.embed)

                        await aki.win()

                        await akiMessage.edit({ embed: stopEmbed })

                        notFinished = false;

                    } else {

                        await aki.step(answers[answer]);

                    }

                    if (!notFinished) return;

                });

        }

    } catch (e) {

        // log any errors that come

        attemptingGuess.delete(message.guild.id)

        games.delete(message.guild.id)

        if (e == "DiscordAPIError: Unknown Message") return;

        console.log(`Akinator hatası: ${e}`)

    }

}

