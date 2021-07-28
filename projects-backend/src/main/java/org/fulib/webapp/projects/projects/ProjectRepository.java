package org.fulib.webapp.projects.projects;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Indexes;
import org.bson.BsonValue;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.fulib.webapp.projects.db.Mongo;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

public class ProjectRepository
{
	public static final String PROJECT_COLLECTION_NAME = "projects";

	private final MongoCollection<Project> projects;

	@Inject
	public ProjectRepository(Mongo mongo)
	{
		this.projects = mongo
			.getDatabase()
			.getCollection(PROJECT_COLLECTION_NAME, Project.class)
			.withCodecRegistry(mongo.getCodecRegistry());
		this.projects.createIndex(Indexes.ascending(Project.PROPERTY_USER_ID));
		this.projects.createIndex(Indexes.ascending(Project.PROPERTY_NAME));
	}

	public Project find(String id)
	{
		return this.projects.find(buildIdFilter(id)).first();
	}

	public List<Project> findByUser(String user)
	{
		return this.projects.find(Filters.eq(Project.PROPERTY_USER_ID, user)).into(new ArrayList<>());
	}

	public void create(Project project)
	{
		final BsonValue insertedId = this.projects.insertOne(project).getInsertedId();
		assert insertedId != null;
		final String id = insertedId.asObjectId().getValue().toHexString();
		project.setId(id);
	}

	public void update(Project project)
	{
		this.projects.replaceOne(buildIdFilter(project.getId()), project);
	}

	public void delete(String id)
	{
		this.projects.deleteOne(buildIdFilter(id));
	}

	private Bson buildIdFilter(String id)
	{
		return Filters.eq("_id", new ObjectId(id));
	}
}
