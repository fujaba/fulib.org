package org.fulib.webapp.projects.service;

import org.fulib.webapp.projects.docker.ContainerManager;
import org.fulib.webapp.projects.model.Container;
import org.fulib.webapp.projects.model.Project;

import java.net.HttpURLConnection;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.util.concurrent.TimeoutException;

public class ContainerService
{
	private final ContainerManager containerManager;

	public ContainerService(ContainerManager containerManager)
	{
		this.containerManager = containerManager;
	}

	public Container find(Project project)
	{
		return this.containerManager.getContainer(project);
	}

	public Container create(Project project) throws TimeoutException
	{
		Container container = this.containerManager.getContainer(project);
		if (container == null)
		{
			container = this.containerManager.start(project);
		}

		for (int retry = 0; retry < 10; retry++)
		{
			try
			{
				final URL url = new URL(container.getUrl() + "/health");
				final HttpURLConnection connection = (HttpURLConnection) url.openConnection();
				connection.setConnectTimeout(500);
				connection.setReadTimeout(500);
				final int responseCode = connection.getResponseCode();
				if (responseCode == 200)
				{
					return container;
				}

				// nginx is up, but project server is not ready
				Thread.sleep(500);
			}
			catch (SocketTimeoutException timeoutException)
			{
				// retry
			}
			catch (SocketException socketException)
			{
				// container is down, restart
				this.containerManager.stop(container);
				container = this.containerManager.start(project);
			}
			catch (Exception e)
			{
				e.printStackTrace();
			}
		}

		throw new TimeoutException("failed to launch healthy container after 10 tries");
	}

	public void stop(Container container)
	{
		this.containerManager.uploadFilesFromContainer(container);
		this.containerManager.stop(container);
	}
}
