package org.fulib.webapp.projects.service;

import org.fulib.webapp.projects.container.DockerContainerProvider;
import org.fulib.webapp.projects.db.ProjectRepository;
import org.fulib.webapp.projects.model.Container;
import org.fulib.webapp.projects.model.Project;

import javax.inject.Inject;
import java.io.IOException;
import java.util.List;

public class ProjectService
{
	@Inject
	ProjectRepository projectRepository;
	@Inject
	DockerContainerProvider dockerContainerProvider;
	@Inject
	ProjectGenerator projectGenerator;

	@Inject
	public ProjectService()
	{
	}

	public Project find(String id)
	{
		return this.projectRepository.find(id);
	}

	public List<Project> findByUser(String user)
	{
		return this.projectRepository.findByUser(user);
	}

	public void create(Project project) throws IOException
	{
		this.projectRepository.create(project);
	}

	public void update(Project project)
	{
		this.projectRepository.update(project);
	}

	public void delete(Project project)
	{
		final Container container = this.dockerContainerProvider.find(project.getId());
		if (container != null)
		{
			this.dockerContainerProvider.kill(container);
		}

		this.projectRepository.delete(project.getId());
		// TODO delete project files
	}
}
