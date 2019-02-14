import { Message } from 'discord.js';
import { Command } from '../structures/Command';
import { Tayuya } from '../structures/TayuyaClient';
module.exports = class Leave extends Command {
  constructor(client: Tayuya){
    super({
      name: 'Leave',
      description: 'Leave command',
      usage: `\`${client.prefix}leave\``,
      aliases: ['`leavechannel`', '`l`'],
      category: 'music',
      senderPerms: ['SEND_MESSAGES'],
      clientPerms: ['SPEAK', 'CONNECT'],
      ownerOnly: true
    });
    this.client = client;
  }
  async execute(message: Message, args: string[]) {
    const chan = message.guild.me.voice.channel;
    if(!chan) return await message.channel.send(`Error: I'm not connected to a voice channel!`);
    if(!message.member.voice.channel || message.member.voice.channel !== chan) return await message.channel.send(`Error: You must be connected to the same voice channel!`);
    if(this.client.vchannels.get(message.guild.id) !== chan) return await message.channel.send(`Error: I'm connected to a different voice channel!`);
    const m: any = await message.channel.send(`Leaving ${chan.name}...`);
    await message.guild.me.voice.channel.leave();
    if(this.client.dispatchers.has(message.guild.id)) this.client.dispatchers.delete(message.guild.id);
    if(this.client.vchannels.has(message.guild.id)) this.client.vchannels.delete(message.guild.id);
    if(this.client.connections.has(message.guild.id)) this.client.connections.delete(message.guild.id);
    return await m.edit(`Left ${chan.name}`);
  }
}