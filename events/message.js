const ayarlar = require("../ayarlar.json");

module.exports = message => {

    let client = message.client;

    if (!message.content.startsWith(ayarlar.prefix)) return;

    let command = message.content.toLowerCase().split(" ")[0].slice(ayarlar.prefix.length)

    let params = message.content.split(" ").slice(1)

   /* let cmd;

    if (client.commands.has(command)) {

        cmd = client.commands.get(command);

    } else if (client.aliases.has(command)) {

        cmd = client.commands.get(client.aliases.get(command));

    };*/

    

};

//----------BURAYI KURCALAMA------------------

