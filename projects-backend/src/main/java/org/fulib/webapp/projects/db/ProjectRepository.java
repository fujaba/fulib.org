package org.fulib.webapp.projects.db;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Indexes;
import org.fulib.webapp.projects.model.Project;

import java.util.ArrayList;
import java.util.List;

public class ProjectRepository
{
	public static final String PROJECT_COLLECTION_NAME = "projects";

	private final MongoCollection<Project> projects;

	public ProjectRepository(Mongo mongo)
	{
		this.projects = mongo
			.getDatabase()
			.getCollection(PROJECT_COLLECTION_NAME, Project.class)
			.withCodecRegistry(mongo.getCodecRegistry());
		this.projects.createIndex(Indexes.ascending(Project.PROPERTY_ID));
		this.projects.createIndex(Indexes.ascending(Project.PROPERTY_USER_ID));
		this.projects.createIndex(Indexes.ascending(Project.PROPERTY_NAME));
	}

	public Project find(String id)
	{
		return this.projects.find(Filters.eq(Project.PROPERTY_ID, id)).first();
	}

	public List<Project> findByUser(String user)
	{
		return this.projects.find(Filters.eq(Project.PROPERTY_USER_ID, user)).into(new ArrayList<>());
	}

	public void save(Project project)
	{
		Mongo.upsert(this.projects, project, Project.PROPERTY_ID, project.getId());
	}

	public void delete(String id)
	{
		this.projects.deleteOne(Filters.eq(Project.PROPERTY_ID, id));
	}
}
