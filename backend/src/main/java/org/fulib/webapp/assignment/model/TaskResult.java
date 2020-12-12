package org.fulib.webapp.assignment.model;

public class TaskResult
{
	// =============== Constants ===============

	public static final String PROPERTY_points = "points";
	public static final String PROPERTY_output = "output";

	// =============== Fields ===============

	private int points;
	private String output;

	// =============== Properties ===============

	public int getPoints()
	{
		return this.points;
	}

	public void setPoints(int points)
	{
		this.points = points;
	}

	public String getOutput()
	{
		return this.output;
	}

	public void setOutput(String output)
	{
		this.output = output;
	}
}
