package org.fulib.projects;

import org.eclipse.jetty.websocket.api.Session;
import org.json.JSONObject;

public interface CommandHandler
{
	boolean handle(String command, String message, JSONObject json, Session session) throws Exception;
}
