package org.fulib.projects.editor;

import org.eclipse.jetty.websocket.api.Session;
import org.fulib.projects.CommandHandler;
import org.json.JSONObject;

public class EditorCommandHandler implements CommandHandler
{
	private final EditorService editorService;

	public EditorCommandHandler(EditorService editorService)
	{
		this.editorService = editorService;
	}

	@Override
	public boolean handle(String command, String message, JSONObject json, Session session)
	{
		final String editorId = json.optString("editorId");

		switch (command)
		{
		case "editor.cursor":
		case "editor.change":
			this.editorService.broadcast(editorId, message);
			return true;
		case "editor.save":
			this.editorService.broadcast(editorId, message);
			this.editorService.save(json.getString("path"));
			return true;
		case "editor.open":
			this.editorService.broadcast(editorId, message);
			this.editorService.open(editorId, json.getString("path"), session);
			return true;
		case "editor.close":
			this.editorService.broadcast(editorId, message);
			this.editorService.close(editorId);
			return true;
		}

		return false;
	}
}
