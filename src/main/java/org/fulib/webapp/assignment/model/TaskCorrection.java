package org.fulib.webapp.assignment.model;

import java.time.Instant;

public class TaskCorrection
{
	// =============== Constants ===============

	public static final String PROPERTY_solutionID = "solutionID";
	public static final String PROPERTY_taskID = "taskID";

	public static final String PROPERTY_timeStamp = "timeStamp";
	public static final String PROPERTY_author = "author";
	public static final String PROPERTY_note = "note";
	public static final String PROPERTY_points = "points";

	// =============== Fields ===============

	private final String solutionID;
	private final int taskID;

	private Instant timeStamp;
	private String author;
	private String note;
	private int points;

	// =============== Constructors ===============

	public TaskCorrection(String solutionID, int taskID)
	{
		this.solutionID = solutionID;
		this.taskID = taskID;
	}

	// =============== Properties ===============

	public String getSolutionID()
	{
		return this.solutionID;
	}

	public int getTaskID()
	{
		return this.taskID;
	}

	public Instant getTimeStamp()
	{
		return this.timeStamp;
	}

	public void setTimeStamp(Instant timeStamp)
	{
		this.timeStamp = timeStamp;
	}

	public String getAuthor()
	{
		return this.author;
	}

	public void setAuthor(String author)
	{
		this.author = author;
	}

	public int getPoints()
	{
		return this.points;
	}

	public void setPoints(int points)
	{
		this.points = points;
	}

	public String getNote()
	{
		return this.note;
	}

	public void setNote(String note)
	{
		this.note = note;
	}
}
