package org.fulib.projects;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class FileWatcherProcess extends Thread
{
	private final FileEventHandler handler;

	private String source;

	public FileWatcherProcess(FileEventHandler handler)
	{
		this.handler = handler;
	}

	private String[] getInotifyCmd()
	{
		return new String[] {
			"inotifywait", "--monitor", "--recursive", //
			"--format", "%e\t%w%f", //
			"--event", "modify", //
			"--event", "move", //
			"--event", "create", //
			"--event", "delete", //
			"/projects/"
		};
	}

	@Override
	public void run()
	{
		try
		{
			Process process = Runtime.getRuntime().exec(getInotifyCmd());
			try (final BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream())))
			{
				String line;
				while ((line = reader.readLine()) != null)
				{
					this.readLine(line);
				}
			}
		}
		catch (IOException exception)
		{
			exception.printStackTrace();
		}
	}

	private void readLine(String line)
	{
		final int tabIndex = line.indexOf('\t');
		if (tabIndex < 0)
		{
			return;
		}

		final String command = line.substring(0, tabIndex);
		final String fileName = line.substring(tabIndex + 1);

		switch (command)
		{
		case "CREATE":
			this.handler.create(fileName);
			return;
		case "CREATE,ISDIR":
			this.handler.create(fileName + "/");
			return;
		case "MODIFY":
			this.handler.modify(fileName);
			return;
		case "DELETE":
			this.handler.delete(fileName);
			return;
		case "DELETE,ISDIR":
			this.handler.delete(fileName + "/");
			return;
		case "MOVED_FROM":
			this.source = fileName;
			return;
		case "MOVED_FROM,ISDIR":
			this.source = fileName + "/";
			return;
		case "MOVED_TO":
			this.handler.move(this.source, fileName);
			this.source = null;
			return;
		case "MOVED_TO,ISDIR":
			this.handler.move(this.source, fileName + "/");
			this.source = null;
			return;
		}
	}
}
