import { Message, StreamDispatcher } from 'discord.js';
import { Command } from '../structures/Command';
import { Tayuya } from '../structures/TayuyaClient';
import { QueueType } from '../base/types/Queue';
const Queue = require('../base/models/Queue');
module.exports = class Pause extends Command {
  constructor(client: Tayuya){
    super({
      name: 'Pause',
      description: 'Pause command',
      usage: `\`${client.prefix}pause\``,
      aliases: ['`pa`'],
      category: 'music',
      senderPerms: ['SEND_MESSAGES'],
      clientPerms: ['SPEAK', 'CONNECT'],
      ownerOnly: false
    });
    this.client = client;
  }
  async execute(message: Message, args: string[]) {
    const chan = message.guild.me.voice.channel;
    if(!chan) return await message.channel.send(`Error: I'm not connected to a voice channel!`);
    if(!message.member.voice.channel) return await message.channel.send(`Error: You must be connected to the same voice channel!`);
    const dispatcher: StreamDispatcher = this.client.dispatchers.get(message.guild.id);
    if(!dispatcher) return await message.channel.send(`Error: There is no song currently playing.`);
    const res = await Queue.findOne({ guild: message.guild.id }),
        song: QueueType = res.now;
    if(!song) return await message.channel.send(`Error: There is no song currently playing.`);
    const m: any = await message.channel.send(`Pausing ${song.name}...`);
    dispatcher.pause(true);
    return await m.edit(`Paused ${song.name}.`);
  }
}