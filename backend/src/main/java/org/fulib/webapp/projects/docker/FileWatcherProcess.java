package org.fulib.webapp.projects.docker;

import org.apache.commons.io.input.NullInputStream;
import org.apache.commons.io.output.WriterOutputStream;

import java.io.Writer;
import java.nio.charset.StandardCharsets;

public class FileWatcherProcess extends ContainerProcess
{
	public FileWatcherProcess(ContainerManager manager, FileEventHandler handler)
	{
		super(manager, getInotifyCmd(manager), new NullInputStream(),
		      new WriterOutputStream(new InotifyWatcher(handler), StandardCharsets.UTF_8, 1024, true));
	}

	private static String[] getInotifyCmd(ContainerManager manager)
	{
		return new String[] {
			"inotifywait", "--monitor", "--recursive", //
			"--format", "%e\t%w%f", //
			"--event", "modify", //
			"--event", "move", //
			"--event", "create", //
			"--event", "delete", //
			manager.getProjectDir()
		};
	}
}

class InotifyWatcher extends Writer
{
	private final FileEventHandler handler;

	public InotifyWatcher(FileEventHandler handler)
	{
		this.handler = handler;
	}

	@Override
	public void write(char[] cbuf, int off, int len)
	{
		final String input = new String(cbuf, off, len);
		processEvent(input);
	}

	private void processEvent(String input)
	{
		final int tabIndex = input.indexOf('\t');
		if (tabIndex < 0)
		{
			return;
		}

		final int newlineIndex = input.indexOf('\n', tabIndex);
		if (newlineIndex < 0)
		{
			return;
		}

		final String command = input.substring(0, tabIndex);
		final String fileName = input.substring(tabIndex + 1, newlineIndex);

		switch (command)
		{
		case "CREATE":
			this.handler.createFile(fileName);
			return;
		case "CREATE,ISDIR":
			this.handler.createDirectory(fileName);
			return;
		case "MODIFY":
			this.handler.modify(fileName);
			return;
		case "DELETE":
		case "DELETE,ISDIR":
			this.handler.delete(fileName);
			return;
		case "MOVED_FROM":
		case "MOVED_FROM,ISDIR":
			final int tabIndex2 = input.indexOf('\t', newlineIndex);
			if (tabIndex2 < 0 || !input.startsWith("MOVED_TO", newlineIndex + 1))
			{
				return;
			}

			final int newlineIndex2 = input.indexOf('\n', tabIndex2);
			if (newlineIndex2 < 0)
			{
				return;
			}

			final String fileName2 = input.substring(tabIndex2 + 1, newlineIndex2);
			this.handler.move(fileName, fileName2);
			return;
		}
	}

	@Override
	public void flush()
	{
	}

	@Override
	public void close()
	{
	}
}
