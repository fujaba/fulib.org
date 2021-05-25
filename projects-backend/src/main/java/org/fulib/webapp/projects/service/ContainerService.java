package org.fulib.webapp.projects.service;

import org.fulib.webapp.projects.container.DockerContainerProvider;
import org.fulib.webapp.projects.model.Container;
import org.fulib.webapp.projects.model.Project;

import javax.inject.Inject;
import java.net.HttpURLConnection;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.util.concurrent.TimeoutException;

public class ContainerService
{
	@Inject
	DockerContainerProvider dockerContainerProvider;

	@Inject
	public ContainerService()
	{
	}

	public Container find(String projectId)
	{
		return this.dockerContainerProvider.find(projectId);
	}

	public Container create(Project project) throws TimeoutException
	{
		Container container = this.dockerContainerProvider.find(project.getId());
		if (container == null)
		{
			container = this.dockerContainerProvider.start(project);
		}

		final int retries = 10;
		final int restartEvery = 5;
		for (int retry = 0; retry < retries; retry++)
		{
			final int responseCode = healthCheck(container);
			if (responseCode == 200)
			{
				return container;
			}
			else if (responseCode == 502 && (retry + 1) % restartEvery == 0)
			{
				// container is down, restart
				this.dockerContainerProvider.stop(container);
				container = this.dockerContainerProvider.start(project);
			}
			else
			{
				try
				{
					Thread.sleep(500);
				}
				catch (InterruptedException ignored)
				{
				}
			}
		}

		throw new TimeoutException("failed to launch healthy container after " + retries + " tries");
	}

	private int healthCheck(Container container)
	{
		try
		{
			final URL url = new URL(container.getUrl() + "/health");
			final HttpURLConnection connection = (HttpURLConnection) url.openConnection();
			connection.setConnectTimeout(500);
			connection.setReadTimeout(500);
			return connection.getResponseCode();
		}
		catch (SocketTimeoutException | SocketException timeoutException)
		{
			return 0;
		}
		catch (Exception e)
		{
			e.printStackTrace();
			return 0;
		}
	}

	public void stop(Container container)
	{
		this.dockerContainerProvider.stop(container);
	}
}
