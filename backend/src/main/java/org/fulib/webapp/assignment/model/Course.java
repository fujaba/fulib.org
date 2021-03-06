package org.fulib.webapp.assignment.model;

import org.bson.codecs.pojo.annotations.BsonCreator;
import org.bson.codecs.pojo.annotations.BsonIgnore;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.util.List;
import java.util.stream.Collectors;

public class Course
{
	public static final String PROPERTY_id = "id";
	public static final String PROPERTY_userId = "userId";
	public static final String PROPERTY_title = "title";
	public static final String PROPERTY_description = "description";
	public static final String PROPERTY_descriptionHtml = "descriptionHtml";
	public static final String PROPERTY_assignments = "assignments";
	public static final String PROPERTY_assignmentIds = "assignmentIds";

	// =============== Fields ===============

	private final String id;
	private String userId;
	private String title;
	private String description;
	private String descriptionHtml;
	private List<Assignment> assignments;

	// =============== Constructors ===============

	@BsonCreator
	public Course(@BsonProperty(PROPERTY_id) String id)
	{
		this.id = id;
	}

	// =============== Properties ===============

	@BsonProperty(PROPERTY_id)
	public String getId()
	{
		return this.id;
	}

	public String getUserId()
	{
		return this.userId;
	}

	public void setUserId(String userId)
	{
		this.userId = userId;
	}

	public String getTitle()
	{
		return this.title;
	}

	public void setTitle(String title)
	{
		this.title = title;
	}

	public String getDescription()
	{
		return this.description;
	}

	public void setDescription(String description)
	{
		this.description = description;
	}

	public String getDescriptionHtml()
	{
		return this.descriptionHtml;
	}

	public void setDescriptionHtml(String descriptionHtml)
	{
		this.descriptionHtml = descriptionHtml;
	}

	@BsonIgnore
	public List<Assignment> getAssignments()
	{
		return this.assignments;
	}

	@BsonProperty
	public List<String> getAssignmentIds()
	{
		return this.assignments.stream().map(Assignment::getID).collect(Collectors.toList());
	}

	@BsonProperty
	public void setAssignmentIds(List<String> assignmentIds)
	{
		this.assignments = assignmentIds.stream().map(Assignment::new).collect(Collectors.toList());
	}
}
