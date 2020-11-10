package org.fulib.webapp.projects.model;

import java.time.Instant;

public class File
{
	// =============== Constants ===============

	public static final String PROPERTY_ID = "id";
	public static final String PROPERTY_USER_ID = "userId";
	public static final String PROPERTY_PROJECT_ID = "projectId";
	public static final String PROPERTY_PARENT_ID = "parentId";

	public static final String PROPERTY_NAME = "name";

	public static final String PROPERTY_CREATED = "created";
	public static final String PROPERTY_MODIFIED = "modified";

	// =============== Fields ===============

	private final String id;
	private String userId;
	private String projectId;
	private String parentId;

	private String name;

	private Instant created;
	private Instant modified;

	// =============== Constructors ===============

	public File(String id)
	{
		this.id = id;
	}

	// =============== Properties ===============

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

	public Instant getCreated()
	{
		return created;
	}

	public void setCreated(Instant created)
	{
		this.created = created;
	}

	public Instant getModified()
	{
		return modified;
	}

	public void setModified(Instant modified)
	{
		this.modified = modified;
	}
}
