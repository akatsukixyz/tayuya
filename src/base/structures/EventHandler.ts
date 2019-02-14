import { resolve } from 'path';
import { BaseClient } from '../../base/structures/Client';
import { readdir } from 'fs';

export class EventHandler {
  public client!: BaseClient;
  constructor(client: BaseClient) { this.client = client; };
  load(): any {
    readdir(resolve(`.../../dist/${this.client.eventsDir}`), (err, files) => {
      if (err) throw new Error(`Events Error: ${err}`);
      for (const file of files) { 
        if (!file.endsWith('.js')) continue;
        const event = new (require(resolve(`.../../dist/${this.client.eventsDir}/${file}`))); 
        this.client.on(event.name, (...params) => event.execute(this.client, ...params));
      } 
    }); 
  }
}