package org.fulib.projects.terminal;

import com.pty4j.PtyProcess;
import com.pty4j.PtyProcessBuilder;
import com.pty4j.WinSize;
import org.eclipse.jetty.websocket.api.Session;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class TerminalProcess extends Thread
{
	private final String id;
	private final Set<Session> sessions = ConcurrentHashMap.newKeySet();
	private final String[] cmd;
	private final String workingDirectory;
	private final Map<String, String> environment;

	private int columns;
	private int rows;

	private PtyProcess process;

	public TerminalProcess(String id, String[] cmd, String workingDirectory, Map<String, String> environment)
	{
		this.id = id;
		this.cmd = cmd;
		this.workingDirectory = workingDirectory;
		this.environment = environment;
	}

	public String getExecId()
	{
		return id;
	}

	public String[] getCmd()
	{
		return cmd;
	}

	public String getWorkingDirectory()
	{
		return workingDirectory;
	}

	public Map<String, String> getEnvironment()
	{
		return environment;
	}

	public Set<Session> getSessions()
	{
		return sessions;
	}

	public void input(String text) throws IOException
	{
		if (process != null && process.isRunning())
		{
			final OutputStream outputStream = process.getOutputStream();
			outputStream.write(text.getBytes(StandardCharsets.UTF_8));
			outputStream.flush();
		}
	}

	public void resize(int columns, int rows)
	{
		this.rows = rows;
		this.columns = columns;
		if (process != null && process.isRunning())
		{
			process.setWinSize(new WinSize(columns, rows));
		}
	}

	void toJson(JSONObject json)
	{
		json.put("process", process);
		json.put("cmd", cmd);
		json.put("workingDirectory", workingDirectory);
		json.put("environment", environment);
	}

	@Override
	public void run()
	{
		try
		{
			final PtyProcessBuilder processBuilder = new PtyProcessBuilder(cmd);
			processBuilder.setRedirectErrorStream(true);
			processBuilder.setEnvironment(this.environment);
			processBuilder.setDirectory(this.workingDirectory);
			if (columns != 0)
			{
				processBuilder.setInitialColumns(columns);
			}
			if (rows != 0)
			{
				processBuilder.setInitialRows(rows);
			}
			process = processBuilder.start();

			final JSONObject startedEvent = new JSONObject();
			startedEvent.put("event", "started");
			toJson(startedEvent);
			broadcast(startedEvent.toString());

			try (final InputStream input = process.getInputStream())
			{
				byte[] buf = new byte[4096];
				int read;
				while ((read = input.read(buf)) >= 0)
				{
					if (read <= 0)
					{
						continue;
					}

					final JSONObject outputEvent = new JSONObject();
					outputEvent.put("event", "output");
					outputEvent.put("process", id);
					outputEvent.put("text", new String(buf, 0, read));
					broadcast(outputEvent.toString());
				}
			}

			final int returnCode = process.waitFor();

			final JSONObject exitedEvent = new JSONObject();
			exitedEvent.put("event", "exited");
			exitedEvent.put("process", id);
			exitedEvent.put("exitCode", returnCode);
			broadcast(exitedEvent.toString());
		}
		catch (IOException exception)
		{
			exception.printStackTrace();
		}
		catch (InterruptedException ignored)
		{
			process.destroyForcibly();
		}
	}

	private void broadcast(String message)
	{
		for (final Session session : sessions)
		{
			session.getRemote().sendString(message, null);
		}
	}
}
