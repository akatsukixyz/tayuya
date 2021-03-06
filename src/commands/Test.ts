import { Message } from 'discord.js';
import { Command } from '../structures/Command';
import { Tayuya } from '../structures/TayuyaClient';
module.exports = class Test extends Command {
  constructor(client: Tayuya){
    super({
      name: 'Test',
      description: 'Test command',
      usage: `\`${client.prefix}test\``,
      aliases: ['`tester`'],
      category: 'misc',
      senderPerms: ['SEND_MESSAGES'],
      clientPerms: ['SEND_MESSAGES'],
      ownerOnly: false
    });
    this.client = client;
  }
  async execute(message: Message, args: string[]) { return console.log(message.guild.me.voice.speaking); };
}