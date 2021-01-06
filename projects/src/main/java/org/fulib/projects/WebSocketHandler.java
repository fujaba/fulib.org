package org.fulib.projects;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

@WebSocket
public class WebSocketHandler
{
	@OnWebSocketConnect
	public void connected(Session session)
	{
	}

	@OnWebSocketMessage
	public void message(Session session, String message)
	{
	}

	@OnWebSocketClose
	public void disconnected(Session session, int status, String reason)
	{
	}
}
