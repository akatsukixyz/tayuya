import { Tayuya } from './TayuyaClient';
export class Event {
  public client!: Tayuya;
  public name!: string;
  public constructor(options: {}) { Object.assign(this, options) };
};