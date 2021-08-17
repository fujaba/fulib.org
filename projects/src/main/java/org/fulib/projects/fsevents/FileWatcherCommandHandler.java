package org.fulib.projects.fsevents;

import org.eclipse.jetty.websocket.api.Session;
import org.fulib.projects.CommandHandler;
import org.json.JSONObject;

public class FileWatcherCommandHandler implements CommandHandler
{
	private final FileWatcherRegistry fileWatcher;

	public FileWatcherCommandHandler(FileWatcherRegistry fileWatcher)
	{
		this.fileWatcher = fileWatcher;
	}

	@Override
	public boolean handle(String command, String message, JSONObject json, Session session)
	{
		switch (command)
		{
		case "watch":
		{
			final String id = json.getString("id");
			final String path = json.getString("path");
			this.fileWatcher.watch(id, path);
			return true;
		}
		case "unwatch":
		{
			final String id = json.getString("id");
			this.fileWatcher.unwatch(id);
			return true;
		}
		}
		return false;
	}
}
