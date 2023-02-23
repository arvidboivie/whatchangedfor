import fetch from "node-fetch";

export class FetchService {
  public async fetch<T = unknown>(url: string): Promise<T> {
    return (await fetch(url)).json();
  }
}
