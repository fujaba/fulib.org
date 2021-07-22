package org.fulib.projects.terminal;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

public class TerminalService
{
	private final Map<String, TerminalProcess> processes = new ConcurrentHashMap<>();

	public TerminalProcess get(String id)
	{
		return processes.get(id);
	}

	public Collection<TerminalProcess> getAll()
	{
		return processes.values();
	}

	public TerminalProcess getOrCreate(String id, Function<? super String, ? extends TerminalProcess> creator)
	{
		return processes.computeIfAbsent(id, creator);
	}

	public void stop()
	{
		for (final TerminalProcess process : this.processes.values())
		{
			process.interrupt();
		}
	}

	public TerminalProcess kill(String id)
	{
		final TerminalProcess process = processes.remove(id);
		if (process != null)
		{
			process.interrupt();
		}
		return process;
	}
}
