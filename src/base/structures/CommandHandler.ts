import { readdir } from 'fs';
import { resolve } from 'path';
import { BaseClient } from '../../base/structures/Client';

export class CommandHandler {
  public client!: BaseClient;
    constructor(client: BaseClient) { this.client = client; };
    load(): any {
        readdir(resolve(this.client.commandsDir), (err, files) => { 
          if(err) throw new Error(`Command Error: ${err}`);
          for (const file of files) {
            if (!file.endsWith('.js')) continue;
            const classThing = require(resolve(`${this.client.commandsDir}/${file}`));
            const Command = new classThing(this.client);
            this.client.commands.set(Command.name.toLowerCase(), Command);
            Command.aliases.forEach(alias => {
              this.client.commands.set(alias.slice(1, -1), Command);
            });
          };
        });
    };
};