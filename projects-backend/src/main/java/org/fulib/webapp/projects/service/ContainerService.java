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

	public Container find(Project project)
	{
		return this.dockerContainerProvider.find(project);
	}

	public Container create(Project project) throws TimeoutException
	{
		Container container = this.dockerContainerProvider.find(project);
		if (container == null)
		{
			container = this.dockerContainerProvider.start(project);
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
				this.dockerContainerProvider.stop(container);
				container = this.dockerContainerProvider.start(project);
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
		this.dockerContainerProvider.stop(container);
	}
}
