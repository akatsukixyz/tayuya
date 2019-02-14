import { BaseClient } from '../base/structures/Client';
import { StreamDispatcher, VoiceConnection, Collection, VoiceChannel } from 'discord.js';
import { EventEmitter } from 'events';
import { QueueType } from '../base/types/Queue';
const Queue = require('../base/models/Queue');  
export class Tayuya extends BaseClient {
  public prefix: string;
  public connections: Collection<string, VoiceConnection>;
  public dispatchers: Collection<string, StreamDispatcher>;
  public vchannels: Collection<string, VoiceChannel>;
  public queue: EventEmitter;
  public constructor(token, options) {
    super({
      token: token,
      prefix: 't',
      color: '#a64f59',
      owner: '517016133694521374',
      commandsDir: `./dist/commands`,
      eventsDir: `./dist/events`
      }, options);
      this.connections = new Collection();
      this.dispatchers = new Collection();
      this.vchannels = new Collection();
  };
  public ensurePlaying() {
    // setInterval(async () => {
    //   const { songs } = await Queue.find();
    //   if(songs.length <= 0) return;
    // });
  };
  public async pushQueue(song: QueueType, guild: string) {
    return await Queue.findOneAndUpdate({ guild }, { $push: { songs: song } });
  };
};