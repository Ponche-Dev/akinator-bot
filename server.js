const Discord = require('discord.js');

const akinator = require('./aki/akinator.js')

const client = new Discord.Client();

const ayarlar = require('./ayarlar.json');

const chalk = require('chalk');

const fs = require('fs');

const moment = require('moment');

require('./util/eventLoader.js')(client);

var prefix = ayarlar.prefix;

const log = message => {

    console.log(`${message}`);

};

//////////////////

client.commands = new Discord.Collection();

client.aliases = new Discord.Collection();

fs.readdir('./komutlar/', (err, files) => {

    if (err) console.error(err);

    log(`${files.length} komut yüklenecek.`);

    files.forEach(f => {

        let props = require(`./komutlar/${f}`);

        log(`Yüklenen komut: ${props.help.name}.`);

        client.commands.set(props.help.name, props);

        props.conf.aliases.forEach(alias => {

            client.aliases.set(alias, props.help.name);

        });

    });

});

///////////////////////////

client.on("message", async message => {

    if(message.content.startsWith(`${ayarlar.prefix}akinator`)) {

        akinator(message, client, "tr"); 

    }

});

client.login(ayarlar.token); 

