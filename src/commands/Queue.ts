import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../structures/Command';
import { Tayuya } from '../structures/TayuyaClient';
module.exports = class Queue extends Command {
  constructor(client: Tayuya){
    super({
      name: 'Queue',
      description: 'Queue command',
      usage: `\`${client.prefix}queue\``,
      aliases: ['`q`', '`songs`', '`now`'],
      category: 'music',
      senderPerms: ['SEND_MESSAGES'],
      clientPerms: ['SEND_MESSAGES', 'CONNECT', 'SPEAK'],
      ownerOnly: false
    });
    this.client = client;
  }
  async execute(message: Message, args: string[]) {
    const Queue = require('../base/models/Queue');
      async function sendDefault(client: Tayuya) {
        const { now, songs } = await Queue.findOne({ guild: message.guild.id });
        const embed = new MessageEmbed()
            .setAuthor(`Queue`, message.guild.iconURL())
            .setColor(client.color)
            .addField(`Now Playing: ${now.name}`, `URL: ${now.url}\nRequester: <@${now.author}>`);
        for(let i = 0; i < songs.length; i++) embed.addField(`#${i+1} | \`${songs[i].name}\``, `URL: ${songs[i].url}\nRequester: <@${songs[i].author}>`, true);
        return await message.channel.send(embed);
      } 
      if(!args[0]) return await sendDefault(this.client);
      if(args[0].toLowerCase() === 'clear') {
          await Queue.findOneAndUpdate({ guild: message.guild.id }, { $set: { songs: [] } });
          return await message.channel.send(`Successfully cleared the queue.`);
      }
   };
}