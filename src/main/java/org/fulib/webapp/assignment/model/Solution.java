package org.fulib.webapp.assignment.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Solution
{
	// =============== Constants ===============

	public static final String PROPERTY_id = "id";
	public static final String PROPERTY_token = "token";
	public static final String PROPERTY_assignment = "assignment";
	public static final String PROPERTY_name = "name";
	public static final String PROPERTY_studentID = "studentID";
	public static final String PROPERTY_email = "email";
	public static final String PROPERTY_solution = "solution";
	public static final String PROPERTY_timeStamp = "timeStamp";
	public static final String PROPERTY_results = "results";
	public static final String PROPERTY_assignee = "assignee";

	// =============== Fields ===============

	private final String id;
	private String token;

	private Assignment assignment;

	private String name;
	private String studentID;
	private String email;
	private String solution;
	private Instant timeStamp;

	private List<TaskResult> results = new ArrayList<>();

	private String assignee;

	// =============== Constructors ===============

	public Solution(String id)
	{
		this.id = id;
	}

	// =============== Properties ===============

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

	public Assignment getAssignment()
	{
		return this.assignment;
	}

	public void setAssignment(Assignment assignment)
	{
		this.assignment = assignment;
	}

	public String getName()
	{
		return this.name;
	}

	public void setName(String name)
	{
		this.name = name;
	}

	public String getStudentID()
	{
		return this.studentID;
	}

	public void setStudentID(String studentID)
	{
		this.studentID = studentID;
	}

	public String getEmail()
	{
		return this.email;
	}

	public void setEmail(String email)
	{
		this.email = email;
	}

	public String getSolution()
	{
		return this.solution;
	}

	public void setSolution(String solution)
	{
		this.solution = solution;
	}

	public Instant getTimeStamp()
	{
		return this.timeStamp;
	}

	public void setTimeStamp(Instant timeStamp)
	{
		this.timeStamp = timeStamp;
	}

	public List<TaskResult> getResults()
	{
		return this.results;
	}

	public String getAssignee()
	{
		return this.assignee;
	}

	public void setAssignee(String assignee)
	{
		this.assignee = assignee;
	}
}
