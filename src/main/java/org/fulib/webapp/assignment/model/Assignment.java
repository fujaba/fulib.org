package org.fulib.webapp.assignment.model;

import org.bson.codecs.pojo.annotations.BsonCreator;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Assignment
{
	// =============== Constants ===============

	public static final String PROPERTY_id = "id";
	public static final String PROPERTY_token = "token";
	public static final String PROPERTY_title = "title";
	public static final String PROPERTY_description = "description";
	public static final String PROPERTY_descriptionHtml = "descriptionHtml";
	public static final String PROPERTY_author = "author";
	public static final String PROPERTY_email = "email";
	public static final String PROPERTY_deadline = "deadline";
	public static final String PROPERTY_tasks = "tasks";
	public static final String PROPERTY_solution = "solution";

	// =============== Fields ===============

	private final String id;
	private String token;

	private String title;
	private String description;
	private String descriptionHtml;
	private String author;
	private String email;
	private Instant deadline;

	private List<Task> tasks = new ArrayList<>();
	private String solution;

	// =============== Constructors ===============

	@BsonCreator
	public Assignment(@BsonProperty(PROPERTY_id) String id)
	{
		this.id = id;
	}

	// =============== Properties ===============

	@BsonProperty(PROPERTY_id)
	public String getID()
	{
		return this.id;
	}

	public String getToken()
	{
		return this.token;
	}

	public void setToken(String token)
	{
		this.token = token;
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

	public String getAuthor()
	{
		return this.author;
	}

	public void setAuthor(String author)
	{
		this.author = author;
	}

	public String getEmail()
	{
		return this.email;
	}

	public void setEmail(String email)
	{
		this.email = email;
	}

	public Instant getDeadline()
	{
		return this.deadline;
	}

	public void setDeadline(Instant deadline)
	{
		this.deadline = deadline;
	}

	public List<Task> getTasks()
	{
		return this.tasks;
	}

	public int getTotalPoints()
	{
		return this.tasks.stream().mapToInt(Task::getPoints).sum();
	}

	public String getSolution()
	{
		return this.solution;
	}

	public void setSolution(String solution)
	{
		this.solution = solution;
	}
}
