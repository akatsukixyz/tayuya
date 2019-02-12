import { Message, MessageEmbed, VoiceChannel } from 'discord.js';
import { Command } from '../structures/Command';
import * as ytdl from 'ytdl-core';
import { Tayuya } from '../structures/TayuyaClient';
import * as youtubeSearch from 'youtube-search';
const Song = require('../base/models/Song'),
  Queue = require('../base/models/Queue');
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
      return info;
    } else {
      var results = await search(song, opts);
      const info = await ytdl.getInfo(results[0].link);
      return info;
    }
  }
  async playSong(url: string, channel: VoiceChannel){
    const connection = await channel.join();
    return await connection.play(ytdl(url));
  }
  async pushQueue(obj: {guild: string, name: string, url: string, ID: string, author: string}) {
    await new Song(obj).save();
    await Queue.findOneAndUpdate({
      guild: obj.guild
    }, {
      $push: {
        songs: obj
      }
    });
  };
  async finish(client: Tayuya, message: Message, args: string[]) {
    const doc = await Queue.findOne({ guild: message.guild.id });
    if(!message.member.voice.channel) return await message.channel.send(`You are not in a voice channel any longer. Music stopped.`);
    await this.play(client, [doc.songs[0].url], message);
  }
  async play(client: Tayuya, args: string[], message: Message) {
    const validate = await this.findSong(args.join(' '));
    if(!validate) return null; 
    const dispatcher = await this.playSong(validate.video_url, message.member.voice.channel);
    const queue = await Queue.findOne({guild: message.guild.id}),
     size = queue ? queue.songs.length : 0;
    if(size === 0) await message.channel.send(`Now playing \`${validate.title}...\``);
    else await message.channel.send(`Added \`${validate.title}\` to the queue.`);
    await this.pushQueue({guild: message.guild.id, name: validate.title, url: validate.video_url, ID: validate.vid, author: message.author.id });
    dispatcher.once('finish', async _ => {
      await Queue.findOneAndUpdate({
        guild: message.guild.id
      }, {
        $splice: {
          songs: 1
        }
      });
      await this.finish(client, message, args);
    });
   }
  async execute(message: Message, args: string[]) {
    if(!message.member.voice.channel) return await message.channel.send(`Error: You must be connected to a voice channel!`);
    if(!args[0]) return await message.channel.send(`Error: Incorrect usage. ${this.usage}`);
    this.play(this.client, args, message);
  }
}