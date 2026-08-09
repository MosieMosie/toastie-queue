import type {ServerResponse} from "node:http";

interface Client {
  id: string;
  res: ServerResponse;
}

const clients = new Set<Client>();

export function subscribe(id: string, res: ServerResponse) {
  const client: Client = {id, res};
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-store",
    "connection": "keep-alive",
  });
  res.write(": hi\n\n");
  clients.add(client);
  return () => clients.delete(client);
}

export function publish(event: string, data: unknown, except?: string) {
  const frame = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    if (client.id !== except) {
      client.res.write(frame);
    }
  }
}

setInterval(() => {
  for (const client of clients) {
    client.res.write(": ping\n\n");
  }
}, 25_000).unref();
