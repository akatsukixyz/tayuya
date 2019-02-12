import { BaseClient } from '../base/structures/Client';
export class Tayuya extends BaseClient {
  public prefix: string;
  public constructor(token, options) {
    super({
      token: token,
      prefix: 't',
      color: '#a64f59',
      owner: '517016133694521374',
      commandsDir: `./dist/commands`,
      eventsDir: `./dist/events`
      }, options);
  };
  public getQueue() {

  };
};