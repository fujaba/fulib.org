package org.fulib.webapp.projects;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.async.ResultCallback;
import com.github.dockerjava.api.model.Frame;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class ContainerProcess
{
	private final ContainerManager manager;
	private final String[] cmd;
	private final InputStream input;
	private final OutputStream output;

	private Thread thread;

	public ContainerProcess(ContainerManager manager, String[] cmd, InputStream input, OutputStream output)
	{
		this.manager = manager;
		this.cmd = cmd;
		this.input = input;
		this.output = output;
	}

	public String start()
	{
		this.stop();

		final DockerClient client = manager.getDockerClient();
		final String execId = client
			.execCreateCmd(manager.getContainerId())
			.withTty(true)
			.withAttachStdout(true)
			.withAttachStderr(true)
			.withAttachStdin(true)
			.withWorkingDir(manager.getProjectDir())
			.withCmd(cmd)
			.exec()
			.getId();

		this.thread = new Thread(() -> this.run(execId),
		                         String.format("ContainerProcess-%s-%s-%s", manager.getProject().getId(), execId,
		                                       cmd[0]));
		this.thread.start();

		return execId;
	}

	public void stop()
	{
		if (thread == null || !thread.isAlive())
		{
			return;
		}

		thread.interrupt();
		try
		{
			thread.join();
		}
		catch (InterruptedException ignored)
		{
		}
	}

	private void run(String execId)
	{
		final ResultCallback.Adapter<Frame> outputAdapter = new ResultCallback.Adapter<Frame>()
		{
			@Override
			public void onNext(Frame object)
			{
				try
				{
					output.write(object.getPayload());
				}
				catch (IOException e)
				{
					// TODO
					e.printStackTrace();
				}
			}
		};

		try
		{
			manager
				.getDockerClient()
				.execStartCmd(execId)
				.withTty(true)
				.withStdIn(input)
				.exec(outputAdapter)
				.awaitCompletion();
		}
		catch (InterruptedException ignored)
		{
		}
	}
}
