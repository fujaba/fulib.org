package org.fulib.projects;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.*;
import org.fulib.projects.fsevents.FileEventHandler;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

@WebSocket
public class WebSocketHandler implements FileEventHandler
{
	private final List<CommandHandler> commandHandlers = new ArrayList<>();

	private final Collection<Session> sessions = new ConcurrentLinkedQueue<>();

	public WebSocketHandler()
	{
	}

	public List<CommandHandler> getCommandHandlers()
	{
		return commandHandlers;
	}

	@OnWebSocketConnect
	public void connected(Session session)
	{
		this.sessions.add(session);
	}

	@OnWebSocketMessage
	public void message(Session session, String message) throws Exception
	{
		final JSONObject json = new JSONObject(message);
		final String command = json.optString("command");
		if (command == null)
		{
			return;
		}

		for (final CommandHandler handler : this.commandHandlers)
		{
			if (handler.handle(command, message, json, session))
			{
				return;
			}
		}

		session.getRemote().sendString(new JSONObject().put("error", "invalid command: " + command).toString());
	}

	@OnWebSocketError
	public void error(Session session, Throwable error)
	{
		error.printStackTrace();
		final String text = new JSONObject().put("event", "error").put("message", error.getMessage()).toString();
		session.getRemote().sendString(text, null);
	}

	@OnWebSocketClose
	public void disconnected(Session session, int status, String reason)
	{
		this.sessions.remove(session);
	}

	@Override
	public void modify(String path)
	{
		broadcast(new JSONObject().put("event", "modified").put("path", path));
	}

	@Override
	public void create(String path)
	{
		broadcast(new JSONObject().put("event", "created").put("path", path));
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
		for (final Session session : this.sessions)
		{
			session.getRemote().sendString(message, null);
		}
	}
}
