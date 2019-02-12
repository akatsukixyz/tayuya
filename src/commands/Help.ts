import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../structures/Command';
import { Tayuya } from '../structures/TayuyaClient';
module.exports = class Help extends Command {
  constructor(client: Tayuya){
    super({
      name: 'Help',
      description: 'Help command',
      usage: `\`${client.prefix}help\``,
      aliases: ['`helpme`'],
      category: 'misc',
      senderPerms: ['SEND_MESSAGES'],
      clientPerms: ['SEND_MESSAGES'],
      ownerOnly: true
    });
    this.client = client;
  }
  async execute(message: Message, args: string[]) {
    async function sendNormal(client: Tayuya){
        const embed = new MessageEmbed();
        const categoriesMap: {[key: string]: string[]} = {};
        for (const command of client.commands.array()) {
          const { category } = command;
          if (!(category in categoriesMap)) categoriesMap[category] = [];
          if(!categoriesMap[category].includes(command.name)) categoriesMap[category].push(command.name);
        }
        for (const category in categoriesMap) embed.addField(category.replace(category[0], category[0].toUpperCase()), categoriesMap[category].join(', '));
        embed.setColor(client.color);
        return await message.channel.send(embed);
    }
    if(args[0]) {
        const cmd = this.client.commands.get(args[0].toLowerCase());
        if(!cmd) return await sendNormal(this.client);
        const embed = new MessageEmbed()
            .setAuthor(`Help: ${cmd.name}`, this.client.user.displayAvatarURL())
            .addField(`Description`, cmd.description, true)
            .addField(`Usage`, cmd.usage, true)
            .addField(`Aliases`, cmd.aliases.join(', '), true)
            .addField(`Category`, cmd.category, true)
            .addField(`Permissions`, cmd.senderPerms.join(', '), true)
            .setColor(this.client.color);
        return await message.channel.send(embed);
    }
    return await sendNormal(this.client);
  }
}