import { Message, StreamDispatcher } from 'discord.js';
import { Command } from '../structures/Command';
import { Tayuya } from '../structures/TayuyaClient';
import { QueueType } from '../base/types/Queue';
const Queue = require('../base/models/Queue');
module.exports = class Skip extends Command {
  constructor(client: Tayuya){
    super({
      name: 'Skip',
      description: 'Skip command',
      usage: `\`${client.prefix}skip\``,
      aliases: ['`s`'],
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
    const dispatcher: StreamDispatcher = this.client.dispatchers.get(message.guild.id);
    if(!dispatcher) return await message.channel.send(`Error: There is no song currently playing.`);
    const res = await Queue.findOne({ guild: message.guild.id }),
        song: QueueType = res.now,
        songs: QueueType[] = res.songs;
    if(!song) return await message.channel.send(`Error: There is no song currently playing.`);
    if(songs.length === 0) return await message.channel.send(`Error: There is are no songs in the queue.`);
    const m: any = await message.channel.send(`Skipping ${song.name}...`);
    dispatcher.emit('finish');
    return await m.edit(`Skipped ${song.name}. Now playing ${res.songs[0].name}`);
  }
}