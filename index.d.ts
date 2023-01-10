/**
 * @description Only website is currently supported, but you can use another provided values. The result will be the same.
 */
type ClientTypeValue =
  | "website"
  | "web-app"
  | "mobile-app"
  | "desktop-app"
  | "client-test"
  | "unknown-client";

export declare class NotificationClient {
  private timer: NodeJS.Timeout;
  private minTime: number;
  private serverKeyLength: number;
  private serverTimeout: number;
  private clientId: string;
  private message: string;
  private b: {
    credentials: Record<string, any>;
    endpoint: string;
    head: Record<string, any>;
    payload: Record<string, any>;
    reserved: {
      clientId: string;
      clientType: string;
      messageHead: string;
    };
  };
  private url: string;
  private listeners: Record<string, Function>;
  private es: EventSource;

  /**
   * @constructor
   * @param { string } host - Must be a valid hos url.
   * @param {{ clientType: ClientTypeValue; eventPath: string; }} options
   */
  constructor(
    host: string,
    options: {
      clientType?: ClientTypeValue;
      eventPath?: string;
      minTime?: number;
    }
  );

  private api<T, A>(config: { body: A }): Promise<T>;
  private computeUrl(): string;
  private createEventSource(): EventSource;
  private send<T>(
    eventName: string,
    options: { body: Record<string, any>; headers: Record<string, any> }
  ): Promise<T>;
  private receive(
    _es: EventSource,
    eventName: string,
    eventCallback: (message: MessageEvent) => void
  ): void;
  private startHiTimer(): void;
  /**
   * @param { string } data - Stringified data
   */
  private onResetConnection(data: string): void;
  /**
   * @param { string } data - Stringified data
   */
  private onReconnection(data: string): void;
  private loadEventSource(): void;
  private generateTimeoutValue(): number;
  public addEventListener(
    eventListened: string,
    callback: (data: {
      send<T>(
        eventName: string,
        options: { body: Record<string, any>; headers: Record<string, any> }
      ): Promise<T>;
      receive(
        eventName: string,
        eventCallback: (message: MessageEvent) => void
      ): void;
    }) => void
  ): void;
}
