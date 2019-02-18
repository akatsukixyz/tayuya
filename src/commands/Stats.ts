import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../structures/Command';
import { totalmem } from 'os';
import { Tayuya } from '../structures/TayuyaClient';
module.exports = class Stats extends Command {
  constructor(client: Tayuya){
    super({
      name: 'Stats',
      description: 'Stats command',
      usage: `\`${client.prefix}stats\``,
      aliases: ['`statistics`'],
      category: 'util',
      senderPerms: ['SEND_MESSAGES'],
      clientPerms: ['SEND_MESSAGES'],
      ownerOnly: false
    });
    this.client = client;
  }
  async execute(message: Message, args: string[]) {
    const usage: any = Math.round(process.memoryUsage().heapUsed / 100 / 1024),
     total: any = Math.round(totalmem() / 1024 / 1024),
     percent = Math.round(((usage / total) * 100));
    const embed = new MessageEmbed()
      .setAuthor('Stats', this.client.user.displayAvatarURL())
      .addField('Memory Usage', `${usage} / ${total} MB (${percent}%)`, true)
      .addField('API Latency', `${Math.round(this.client.ws.ping)} ms`, true)
      .addField('Servers', `${this.client.guilds.size} servers`, true)
      .addField('Users', `${this.client.users.size} users`, true)
      .addField('Shards', `${this.client.shard ? this.client.shard.count : 0} (#${this.client.shard ? this.client.shard.id : 0})`, true)
      .addField('Connections', `${this.client.voiceConnections.size} total`)
      .setColor(this.client.color);
    return await message.channel.send(embed);
  }
}