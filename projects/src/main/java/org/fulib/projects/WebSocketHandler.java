package org.fulib.projects;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.json.JSONObject;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@WebSocket
public class WebSocketHandler implements FileEventHandler
{
	private final Runnable resetShutdownTimer;

	private final Map<Session, Map<String, ExecProcess>> processes = new ConcurrentHashMap<>();

	public WebSocketHandler(Runnable resetShutdownTimer)
	{
		this.resetShutdownTimer = resetShutdownTimer;
	}

	@OnWebSocketConnect
	public void connected(Session session)
	{
		processes.put(session, new ConcurrentHashMap<>());
	}

	@OnWebSocketMessage
	public void message(Session session, String message) throws IOException
	{
		final JSONObject json = new JSONObject(message);
		final String command = json.getString("command");

		switch (command)
		{
		case "exec":
		{
			final String[] cmd = json.getJSONArray("cmd").toList().toArray(new String[0]);
			final ExecProcess process = new ExecProcess(cmd, session);
			this.processes.get(session).put(process.getExecId(), process);
			process.start();
			return;
		}
		case "input":
		{
			final String input = json.getString("text");
			final String execId = json.getString("process");
			final Map<String, ExecProcess> map = this.processes.get(session);
			final ExecProcess exec = map.get(execId);

			exec.getOutputStream().write(input.getBytes(StandardCharsets.UTF_8));
			exec.getOutputStream().flush();
			return;
		}
		case "keepAlive":
			this.resetShutdownTimer.run();
			return;
		default:
			session.getRemote().sendString(new JSONObject().put("error", "invalid command: " + command).toString());
			return;
		}
	}

	@OnWebSocketClose
	public void disconnected(Session session, int status, String reason)
	{
		final Map<String, ExecProcess> execMap = processes.remove(session);
		for (final ExecProcess value : execMap.values())
		{
			value.interrupt();
		}
	}

	@Override
	public void modify(String path)
	{
		broadcast(new JSONObject().put("event", "modified").put("path", path));
	}

	@Override
	public void createFile(String path)
	{
		broadcast(new JSONObject().put("event", "created").put("path", path));
	}

	@Override
	public void createDirectory(String path)
	{
		broadcast(new JSONObject().put("event", "created").put("path", path).put("directory", true));
	}

	@Override
	public void delete(String path)
	{
		broadcast(new JSONObject().put("event", "deleted").put("path", path));
	}

	@Override
	public void move(String oldPath, String newPath)
	{
		broadcast(new JSONObject().put("event", "moved").put("from", oldPath).put("to", newPath));
	}

	private void broadcast(JSONObject obj)
	{
		final String message = obj.toString();
		for (final Session session : this.processes.keySet())
		{
			session.getRemote().sendString(message, null);
		}
	}
}
