package org.fulib.projects;

import name.pachler.nio.file.*;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static name.pachler.nio.file.StandardWatchEventKind.*;
import static name.pachler.nio.file.ext.ExtendedWatchEventKind.*;
import static name.pachler.nio.file.ext.ExtendedWatchEventModifier.ACCURATE;

public class FileWatcherProcess extends Thread
{
	private static final WatchEvent.Kind[] EVENT_KINDS = {
		ENTRY_CREATE, ENTRY_MODIFY, ENTRY_DELETE, ENTRY_RENAME_FROM, ENTRY_RENAME_TO,
	};
	private static final WatchEvent.Modifier[] EVENT_MODIFIERS = {
		ACCURATE,
	};

	private final FileEventHandler handler;

	private String source;

	private final WatchService watchService;
	private final Map<String, WatchKey> watchKeys = new ConcurrentHashMap<>();
	private final Map<WatchKey, String> watchPaths = new ConcurrentHashMap<>();

	public FileWatcherProcess(FileEventHandler handler)
	{
		this.handler = handler;
		this.watchService = FileSystems.getDefault().newWatchService();
	}

	public void watch(String path)
	{
		final WatchKey key = this.watchKeys.computeIfAbsent(path, _path -> {
			try
			{
				return Paths.get(_path).register(this.watchService, EVENT_KINDS, EVENT_MODIFIERS);
			}
			catch (IOException exception)
			{
				exception.printStackTrace();
				return null;
			}
		});
		this.watchPaths.put(key, path);
	}

	public void unwatch(String path)
	{
		final WatchKey watchKey = this.watchKeys.remove(path);
		if (watchKey != null)
		{
			this.watchPaths.remove(watchKey);
			if (watchKey.isValid())
			{
				watchKey.cancel();
			}
		}
	}

	@Override
	public void run()
	{
		try (final WatchService watchService = this.watchService)
		{
			while (true)
			{
				final WatchKey key = watchService.take();

				for (WatchEvent<?> event : key.pollEvents())
				{
					handleEvent(key, event);
				}

				key.reset();
			}
		}
		catch (InterruptedException ignored)
		{
		}
		catch (Exception ex)
		{
			ex.printStackTrace();
		}
	}

	private void handleEvent(WatchKey key, WatchEvent<?> ev)
	{
		final String dir = this.watchPaths.get(key);
		final WatchEvent.Kind<?> kind = ev.kind();
		if (kind == KEY_INVALID)
		{
			return;
		}

		final Object context = ev.context();
		if (context == null)
		{
			return;
		}

		final String filename = dir + context;

		if (kind == ENTRY_CREATE)
		{
			this.handler.create(filename);
		}
		else if (kind == ENTRY_MODIFY)
		{
			this.handler.modify(filename);
		}
		else if (kind == ENTRY_DELETE)
		{
			this.handler.delete(filename);
		}
		else if (kind == ENTRY_RENAME_FROM)
		{
			this.source = filename;
		}
		else if (kind == ENTRY_RENAME_TO)
		{
			this.handler.move(this.source, filename);
		}
	}
}
