package org.fulib.webapp.assignment.model;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

public class Assignment
{
	// =============== Fields ===============

	private final String id;

	private String        title;
	private String        description;
	private String        author;
	private String        email;
	private ZonedDateTime deadline;

	private List<Task> tasks = new ArrayList<>();
	private String     solution;

	// =============== Constructors ===============

	public Assignment(String id)
	{
		this.id = id;
	}

	// =============== Properties ===============

	public String getID()
	{
		return this.id;
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

	public ZonedDateTime getDeadline()
	{
		return this.deadline;
	}

	public void setDeadline(ZonedDateTime deadline)
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
