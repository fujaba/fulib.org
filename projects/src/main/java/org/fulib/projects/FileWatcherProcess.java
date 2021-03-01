package org.fulib.projects;

import name.pachler.nio.file.*;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static name.pachler.nio.file.StandardWatchEventKind.*;
import static name.pachler.nio.file.ext.ExtendedWatchEventKind.ENTRY_RENAME_FROM;
import static name.pachler.nio.file.ext.ExtendedWatchEventKind.ENTRY_RENAME_TO;
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

	public void watch(String id, String path)
	{
		final WatchKey key = this.watchKeys.computeIfAbsent(id, _id -> {
			try
			{
				return Paths.get(path).register(this.watchService, EVENT_KINDS, EVENT_MODIFIERS);
			}
			catch (IOException exception)
			{
				exception.printStackTrace();
				return null;
			}
		});
		this.watchPaths.put(key, path);
	}

	public void unwatch(String id)
	{
		final WatchKey watchKey = this.watchKeys.remove(id);
		if (watchKey != null)
		{
			this.watchPaths.remove(watchKey);
			watchKey.cancel();
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
					final WatchEvent<Path> ev = (WatchEvent<Path>) event;
					handleEvent(key, ev);
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

	private void handleEvent(WatchKey key, WatchEvent<Path> ev)
	{
		final String dir = this.watchPaths.get(key);
		final WatchEvent.Kind<Path> kind = ev.kind();
		final String filename = dir + ev.context().toString();

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
