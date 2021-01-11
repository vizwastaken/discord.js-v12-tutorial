const {Collection, Client, Discord} = require('discord.js')
const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const ms = require('ms')
const client = new Client()

const config = require('./config.json')
const prefix = config.prefix
const token = config.token

client.config = config;
client.commands = new Collection(); 
client.aliases = new Collection();
client.categories = fs.readdirSync("./commands/");
["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});
client.on('ready', () => {
   client.user.setActivity(`${prefix}help`)
   console.log(`${client.user.username} Successfully Logged in!`)
})

//we will make the system first otherwise it wont works
client.snipes = new Map();
client.on('messageDelete', function(message, channel) {
      if (message.author.bot) return;
      client.snipes.set(message.channel.id, {
         content: message.content,
         profilephoto: message.author.displayAvatarURL({ dynamic : true }),
         author: message.author.tag,
         date: message.createdTimestamp,
         image: message.attachments.first() ? message.attachments.first().proxyURL : null
      }) // that should be done...
      // now let make utility folder and snipe files
})

module.exports = client;
const { GiveawaysManager } = require('discord-giveaways'); //npm i discord-giveaways
client.giveaways = new GiveawaysManager(client, {
   storage: './give.json',
   updateCountdownEvery: 5000, // 5000 in seconds is 5 seconds
   default: {
      botsCanWin: false,
      embedColor: '#FF0000',
      reaction: '🎉'
   }
})

client.on('message', async message => {

     const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
     if (message.content.match(prefixMention)) {
     return message.channel.send(`Hii! <@${message.author.id}>, My prefix is \`${prefix}\``); //if you dont know what prefix of your bot, just ping it!
  }
     if(message.author.bot || message.channel.type === "dm") return;
     if (!message.content.startsWith(prefix)) return;
     if (!message.guild) return;
     if (!message.member) message.member = await message.guild.fetchMember(message);
     const args = message.content.slice(prefix.length).trim().split(/ +/g);
     const cmd = args.shift().toLowerCase();
     if (cmd.length == 0) return;
     let command = client.commands.get(cmd)
     if (!command) command = client.commands.get(client.aliases.get(cmd));
     if (command) command.run(client, message, args)
   })

client.login(token)
