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
		processes.values().removeIf(p -> !p.isAlive());
		return processes.values();
	}

	public TerminalProcess getOrCreate(String id, Function<? super String, ? extends TerminalProcess> creator)
	{
		return processes.compute(id,
			(k, existing) -> existing != null && existing.isAlive() ? existing : creator.apply(k));
	}

	public void stop()
	{
		for (final TerminalProcess process : processes.values())
		{
			process.interrupt();
		}
		processes.clear();
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
