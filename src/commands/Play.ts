import { Message, VoiceChannel} from 'discord.js';
import { Command } from '../structures/Command';
import * as ytdl from 'ytdl-core';
import { Tayuya } from '../structures/TayuyaClient';
import * as youtubeSearch from 'youtube-search';
import { stringify } from 'querystring';
const Queue = require('../base/models/Queue');
module.exports = class Play extends Command {
  constructor(client: Tayuya){
    super({
      name: 'Play',
      description: 'Play command',
      usage: `\`${client.prefix}play\``,
      aliases: ['`playsong`'],
      category: 'music',
      senderPerms: ['SEND_MESSAGES'],
      clientPerms: ['SPEAK', 'CONNECT'],
      ownerOnly: true
    });
    this.client = client;
  }
  async findSong(song: string) {
    const search = (query: string, options: youtubeSearch.YouTubeSearchOptions) => {
      return new Promise((resolve, reject) => {
        youtubeSearch(query, options, (err, results) => { if(err) reject(err); else resolve(results); });
      });
    }; 
   const opts: youtubeSearch.YouTubeSearchOptions = { maxResults: 1, key: process.env.YOUTUBE };
    if(new RegExp(/https:\/\/www\.youtube\.com/, 'i').test(song)) {
      const info = await ytdl.getInfo(song);
      if(!info) return null;
      return info;
    } else {
      var results = await search(song, opts);
      const info = await ytdl.getInfo(results[0].link);
      return info;
    }
  }
  async playSong(url: string, channel: VoiceChannel){
    const connection = await channel.join();
    try { var dispatcher = await connection.play(ytdl(url)) }
    catch(e) { return null; };
    return [connection, dispatcher];
  }
  async pushQueue(client: Tayuya, obj: {guild: string, channel: string, name: string, url: string, ID: string, author: string}) {
    client.queue.emit('pushQueue', obj);
  };
  async finish(client: Tayuya, message: Message, args: string[]) {
    const doc = await Queue.findOne({ guild: message.guild.id });
    if(!message.member.voice.channel) return await message.channel.send(`You are not in a voice channel any longer. Music stopped.`);
    if(!doc.songs[0]) {
       await message.channel.send(`Queue has ended. Leaving voice channel.`);
       return await client.connections.get(message.guild.id).disconnect();
    }
    return await this.play(client, [doc.songs[0].url], message);
  }
  async play(client: Tayuya, args: string[], message: Message) {
    this.client.queue.on('pushQueue', async obj => { return await this.play(this.client, [obj.url], message); });
    const validate = await this.findSong(args.join(' '));
    if(!validate) return await message.channel.send(`Error: Invalid arguments provided. Please enter a valid song name or URL.`);
    if(client.dispatchers.get(message.guild.id)) {
      if(!client.dispatchers.get(message.guild.id).paused) {
        await this.pushQueue(client, {guild: message.guild.id, channel: message.member.voice.channelID, name: validate.title, url: validate.video_url, ID: validate.cid, author: message.author.id });
        return await message.channel.send(`Added \`${validate.title}\` to the queue.`);
      } else if(!message.guild.me.voice.channel){
        const [connection, dispatcher]: any = await this.playSong(validate.video_url, message.member.voice.channel);
        if(!connection || !dispatcher) return await message.channel.send(`Error: The video is unavailable.`);
        await this.pushQueue(client, {guild: message.guild.id, channel: connection.channel.id, name: validate.title, url: validate.video_url, ID: validate.cid, author: message.author.id });
        client.connections.set(message.guild.id, connection);
        client.dispatchers.set(message.guild.id, dispatcher);
        await message.channel.send(`Added \`${validate.title}\` to the queue.`);
        await this.pushQueue(client, {guild: message.guild.id, channel: connection.channel.id, name: validate.title, url: validate.video_url, ID: validate.vid, author: message.author.id });
        dispatcher.once('finish', async () => {
          const { songs } = await Queue.findOne({ guild: message.guild.id });
          songs.shift();
          await Queue.findOneAndUpdate({ guild: message.guild.id }, { $set: { songs: songs } } ).then(console.log);
          await this.finish(client, message, args);
        });
      }
    }
    const [connection, dispatcher]: any = await this.playSong(validate.video_url, message.member.voice.channel);
    if(!connection || !dispatcher) return await message.channel.send(`Error: The video is unavailable.`);
    client.connections.set(message.guild.id, connection);
    client.dispatchers.set(message.guild.id, dispatcher);
    await message.channel.send(`Added \`${validate.title}\` to the queue.`);
    await this.pushQueue(client, {guild: message.guild.id, channel: connection.channel.id, name: validate.title, url: validate.video_url, ID: validate.vid, author: message.author.id });
    dispatcher.once('finish', async () => {
      const { songs } = await Queue.findOne({ guild: message.guild.id });
      songs.shift();
      await Queue.findOneAndUpdate({ guild: message.guild.id }, { $set: { songs: songs } } ).then(console.log);
      await this.finish(client, message, args);
    });
  }
  async execute(message: Message, args: string[]) {
    if(!message.member.voice.channel) return await message.channel.send(`Error: You must be connected to a voice channel!`);
    if(!args[0]) return await message.channel.send(`Error: Incorrect usage. ${this.usage}`);
    await this.play(this.client, args, message);
  }
}