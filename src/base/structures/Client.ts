import { Client, ClientOptions, Collection } from 'discord.js';
import { BaseOptions } from '../types/BaseOptions';
import { EventHandler } from './EventHandler';
import { CommandHandler } from './CommandHandler';
import * as mongoose from 'mongoose';
import * as path from 'path';
import { Command } from '../../structures/Command';
const { createClient } = require('async-redis');
export class BaseClient extends Client {
  public readonly token: string | null;
  public readonly commandsDir: string | null;
  public readonly eventsDir: string | null;
  public readonly owner: string | null;
  public readonly eventHandler: EventHandler;
  public readonly commandHandler : CommandHandler;
  public readonly prefix : string;
  public readonly color : string;
  public commands: Collection<string, Command>;
  public readonly redis : any;
  public constructor(options: BaseOptions, clientOptions: ClientOptions) { 
    super(clientOptions);
    this.commands = new Collection(); 
    this.commandsDir = options.commandsDir ? path.resolve(options.commandsDir!) : null;
    this.eventsDir = options.eventsDir ? path.resolve(options.eventsDir!) : null;
    this.eventHandler = new EventHandler(this);
    this.eventHandler.load();
    this.commandHandler = new CommandHandler(this);
    this.commandHandler.load();
    this.on('error', console.log);
    this.token = options.token;
    this.prefix = options.prefix;
    this.owner = options.owner;
    this.color = options.color;
    this.redis = createClient();
    this.redis.on('error', console.log);
  }; 
  public async start(): Promise <void> { 
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useFindAndModify: false
    });
    await this.login(this.token); 
  };
};