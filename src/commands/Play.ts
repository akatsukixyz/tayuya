import { Message, VoiceChannel, VoiceConnection, StreamDispatcher } from 'discord.js';
import { Command } from '../structures/Command';
import * as ytdl from 'ytdl-core';
import { Tayuya } from '../structures/TayuyaClient';
import * as youtubeSearch from 'youtube-search';
import { QueueType } from '../base/types/Queue';
const Queue = require('../base/models/Queue');
module.exports = class Play extends Command {
  public client: Tayuya;
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
  };
  async finish(guild: string): Promise<any> {
    const queue = await Queue.findOne({ guild }),
      songs: QueueType[] = queue.songs;
    if(songs.length === 0) {
      await this.client.vchannels.get(guild).leave();
      this.client.vchannels.delete(guild);
      this.client.dispatchers.delete(guild);
      this.client.connections.delete(guild);
      await Queue.findOneAndUpdate({ guild }, { $unset: { now: '' } });
      return;
    };
    const songQuery = await this.findSong(songs[0].url || songs[0].name),
      connection = this.client.connections.get(guild),
      [channel, dispatcher] = await this.playSong(songQuery.video_url, connection),
      song: QueueType = songs[0];
    dispatcher.once('finish', async () => this.finish(guild));
    this.client.connections.set(guild, connection);
    this.client.dispatchers.set(guild, dispatcher);
    this.client.vchannels.set(guild, channel);

    await Queue.findOneAndUpdate({ guild }, { $set: { now: song } });
    songs.shift();
    await Queue.findOneAndUpdate({ guild }, { $set: { songs } });
    return;
  }
  async findSong(song: string): Promise<ytdl.videoInfo> {
    const search = (query: string, options: youtubeSearch.YouTubeSearchOptions): Promise<any> => { 
      return new Promise((resolve, reject) => { youtubeSearch(query, options, (err, results) => { if(err) reject(err); else resolve(results); }); }); 
    }; 
   const opts: youtubeSearch.YouTubeSearchOptions = { maxResults: 1, key: process.env.YOUTUBE };
    if(new RegExp(/(https:\/\/(www)?\.youtube\.com|https:\/\/(www)?youtu\.be)/, 'i').test(song)) return await ytdl.getInfo(song) || null;
    try{ var results = await search(song, opts); } catch(e) { console.log(e); };
    return await ytdl.getInfo(results[0].link) || null;
  };
  async playSong(url: string, connection: VoiceConnection): Promise<[VoiceChannel, StreamDispatcher]> {
    try { var dispatcher: StreamDispatcher = await connection.play(ytdl(url)) }
    catch(e) { return null; };
    return [connection.channel, dispatcher];
  };
  async pullThrough(connection: VoiceConnection, dispatcher: StreamDispatcher, results: ytdl.videoInfo, guild: string, author: string): Promise<any> {
    if(!this.client.connections.has(guild)) this.client.connections.set(guild, connection);
    if(!this.client.dispatchers.has(guild)) this.client.dispatchers.set(guild, dispatcher);
    if(!this.client.vchannels.has(guild)) this.client.vchannels.set(guild, connection.channel);
    const queue = await Queue.findOne({ guild }),
      songs: QueueType[] = queue.songs;
    const song: QueueType = { name: results.title, url: results.video_url, author: author };
    if(songs.length === 0 && !queue.now) return await Queue.findOneAndUpdate({ guild }, { $set: { now: song } });
    else if (queue.now) return await this.client.pushQueue(song, guild);
  };
  async execute(message: Message, args: string[]) {
    if(!message.member.voice.channel) return await message.channel.send(`Error: You must be connected to a voice channel!`);
    if(!args[0]) return await message.channel.send(`Error: Incorrect usage. ${this.usage}`);
    const results = await this.findSong(args.join(' ').trim());
    if(!results) return await message.channel.send(`Error: No video found.`);
    var connection = this.client.connections.get(message.guild.id) || await message.member.voice.channel.join();
    const [, dispatcher] = await this.playSong(results.video_url, connection);
    dispatcher.once('finish', async () => await this.finish(message.guild.id));
    await this.pullThrough(connection, dispatcher, results, message.guild.id, message.author.id);
  };
};