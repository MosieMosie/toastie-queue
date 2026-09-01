import type {ServerResponse} from "node:http";

const clients = new Set<ServerResponse>();

export function subscribe(res: ServerResponse) {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-store",
    "connection": "keep-alive",
  });
  res.write(": hi\n\n");
  clients.add(res);
  return () => clients.delete(res);
}

/** every client gets every event: senders recognise their own echo by revision */
export function publish(event: string, data: unknown) {
  const frame = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    res.write(frame);
  }
}

// a real event, not an SSE comment: EventSource never surfaces comments, so a
// comment ping left clients unable to tell a silently dead connection from a
// quiet one
setInterval(() => {
  publish("ping", 0);
}, 25_000).unref();
