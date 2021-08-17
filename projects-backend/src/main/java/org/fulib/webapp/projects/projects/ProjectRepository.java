package org.fulib.webapp.projects.projects;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Indexes;
import com.mongodb.client.model.Sorts;
import org.bson.BsonValue;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.fulib.webapp.projects.db.Mongo;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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

	public List<Project> findByIds(Stream<String> ids)
	{
		return find(buildIdsFilter(ids));
	}

	public List<Project> findByUser(String user)
	{
		return find(buildUserFilter(user));
	}

	public List<Project> findByIdsOrUser(Stream<String> ids, String user)
	{
		return find(Filters.or(buildUserFilter(user), buildIdsFilter(ids)));
	}

	private List<Project> find(Bson bson)
	{
		return projects.find(bson).sort(Sorts.ascending(Project.PROPERTY_NAME)).into(new ArrayList<>());
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

	private Bson buildUserFilter(String user)
	{
		return Filters.eq(Project.PROPERTY_USER_ID, user);
	}

	private Bson buildIdsFilter(Stream<String> ids)
	{
		final List<ObjectId> objectIds = ids.map(ObjectId::new).collect(Collectors.toList());
		return Filters.in("_id", objectIds);
	}

	private Bson buildIdFilter(String id)
	{
		return Filters.eq("_id", new ObjectId(id));
	}
}
