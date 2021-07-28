package org.fulib.webapp.projects.containers;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.async.ResultCallback;
import com.github.dockerjava.api.command.CreateContainerCmd;
import com.github.dockerjava.api.exception.NotFoundException;
import com.github.dockerjava.api.exception.NotModifiedException;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.api.model.WaitResponse;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import org.fulib.webapp.projects.projects.Project;

import javax.inject.Inject;
import java.io.File;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DockerContainerProvider
{
	private static final String BIND_PREFIX = new File(System.getenv("FULIB_PROJECTS_DATA_DIR")).getAbsolutePath();
	private static final String PROJECTS_DIR = "/projects/";
	private static final String CONTAINER_IMAGE = System.getenv("FULIB_PROJECTS_CONTAINER_IMAGE");
	private static final String PROXY_HOST = System.getenv("FULIB_PROJECTS_PROXY_URL");
	private static final String NETWORK_NAME = "fulib-projects";

	private final DockerClient dockerClient;

	@Inject
	public DockerContainerProvider()
	{
		final DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder().build();
		final DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
			.dockerHost(config.getDockerHost())
			.sslConfig(config.getSSLConfig())
			.build();
		dockerClient = DockerClientImpl.getInstance(config, httpClient);
	}

	public Container find(String projectId)
	{
		final List<com.github.dockerjava.api.model.Container> containers = dockerClient
			.listContainersCmd()
			.withLabelFilter(Collections.singletonMap("org.fulib.project", projectId))
			.exec();
		if (containers.isEmpty())
		{
			return null;
		}

		final com.github.dockerjava.api.model.Container dockerContainer = containers.get(0);
		final String containerId = dockerContainer.getId();

		final Container result = new Container();
		result.setId(containerId);
		result.setProjectId(projectId);
		result.setUrl(getContainerUrl(containerId));
		return result;
	}

	public Container start(Project project)
	{
		final String id = project.getId();

		final Map<String, String> labels = new HashMap<>();
		labels.put("org.fulib.project", id);

		final CreateContainerCmd cmd = dockerClient
			.createContainerCmd(CONTAINER_IMAGE)
			.withTty(true)
			.withNetworkMode(NETWORK_NAME)
			.withEnv("PROJECT_ID=" + id)
			.withLabels(labels);

		if (!project.isLocal())
		{
			final String bindDir = BIND_PREFIX + PROJECTS_DIR + getIdBin(project) + '/' + id;
			cmd.withBinds(Bind.parse(bindDir + ':' + PROJECTS_DIR + id));
		}

		final String containerId = cmd.exec().getId();
		dockerClient.startContainerCmd(containerId).exec();

		final Container container = new Container();
		container.setId(containerId);
		container.setProjectId(id);
		container.setUrl(getContainerUrl(containerId));
		return container;
	}

	private String getContainerUrl(String containerId)
	{
		return PROXY_HOST + "/containers/" + containerId.substring(0, 12);
	}

	public void copyFilesToContainer(Container container, InputStream tarInputStream)
	{
		dockerClient
			.copyArchiveToContainerCmd(container.getId())
			.withRemotePath(PROJECTS_DIR + container.getProjectId() + "/")
			.withTarInputStream(tarInputStream)
			.exec();
	}

	public void stop(Container container)
	{
		try
		{
			this.dockerClient.stopContainerCmd(container.getId()).exec();
		}
		catch (NotFoundException ignored)
		{
			return;
		}
		catch (NotModifiedException ignored)
		{
		}

		try
		{
			this.dockerClient.removeContainerCmd(container.getId()).withRemoveVolumes(true).exec();
		}
		catch (NotFoundException ignored)
		{
		}
	}

	public void kill(Container container)
	{
		try
		{
			this.dockerClient.removeContainerCmd(container.getId()).withForce(true).withRemoveVolumes(true).exec();
		}
		catch (NotFoundException ignored)
		{
		}
	}

	public void delete(Project project)
	{
		if (project.isLocal())
		{
			return;
		}

		final CreateContainerCmd cmd = dockerClient
			.createContainerCmd(CONTAINER_IMAGE)
			.withBinds(Bind.parse(BIND_PREFIX + PROJECTS_DIR + getIdBin(project) + ':' + PROJECTS_DIR))
			.withCmd("rm", "-rf", PROJECTS_DIR + project.getId());
		final String id = cmd.exec().getId();
		dockerClient.startContainerCmd(id).exec();
		dockerClient.waitContainerCmd(id).exec(new ResultCallback.Adapter<WaitResponse>()
		{
			@Override
			public void onComplete()
			{
				dockerClient.removeContainerCmd(id).exec();
			}
		});
	}

	private String getIdBin(Project project)
	{
		return project.getId().substring(project.getId().length() - 2);
	}
}
