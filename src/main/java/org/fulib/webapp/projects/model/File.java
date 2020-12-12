package org.fulib.webapp.projects.model;

import org.bson.codecs.pojo.annotations.BsonCreator;
import org.bson.codecs.pojo.annotations.BsonIgnore;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class File
{
	// =============== Constants ===============

	public static final String PROPERTY_ID = "id";
	public static final String PROPERTY_USER_ID = "userId";
	public static final String PROPERTY_PROJECT_ID = "projectId";
	public static final String PROPERTY_PARENT_ID = "parentId";

	public static final String PROPERTY_NAME = "name";
	public static final String PROPERTY_DIRECTORY = "directory";

	public static final String PROPERTY_CREATED = "created";
	public static final String PROPERTY_REVISIONS = "revisions";

	// =============== Fields ===============

	private final String id;
	private String userId;
	private String projectId;
	private String parentId;

	private String name;

	private boolean directory;

	private Instant created;
	private final List<Revision> revisions = new ArrayList<>();

	// =============== Constructors ===============

	@BsonCreator
	public File(@BsonProperty(PROPERTY_ID) String id)
	{
		this.id = id;
	}

	// =============== Properties ===============

	@BsonProperty(PROPERTY_ID)
	public String getId()
	{
		return this.id;
	}

	public String getUserId()
	{
		return userId;
	}

	public void setUserId(String userId)
	{
		this.userId = userId;
	}

	public String getProjectId()
	{
		return projectId;
	}

	public void setProjectId(String projectId)
	{
		this.projectId = projectId;
	}

	public String getParentId()
	{
		return parentId;
	}

	public void setParentId(String parentId)
	{
		this.parentId = parentId;
	}

	public String getName()
	{
		return name;
	}

	public void setName(String name)
	{
		this.name = name;
	}

	public boolean isDirectory()
	{
		return directory;
	}

	public void setDirectory(boolean directory)
	{
		this.directory = directory;
	}

	public Instant getCreated()
	{
		return created;
	}

	public void setCreated(Instant created)
	{
		this.created = created;
	}

	@BsonIgnore
	public List<Revision> getRevisions()
	{
		return revisions;
	}
}
