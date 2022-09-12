package org.fulib.webapp.tool.model;

import java.util.ArrayList;
import java.util.List;

public class Result
{
	// =============== Constants ===============

	public static final String PROPERTY_id = "id";
	public static final String PROPERTY_exitCode = "exitCode";
	public static final String PROPERTY_output = "output";
	public static final String PROPERTY_classDiagram = "classDiagram";
	public static final String PROPERTY_objectDiagrams = "objectDiagrams";
	public static final String PROPERTY_methods = "methods";

	// =============== Fields ===============

	private String id;
	private int exitCode;
	private String output;
	private String classDiagram;
	private List<Diagram> objectDiagrams = new ArrayList<>();
	private List<Method> methods = new ArrayList<>();

	// =============== Constructors ===============

	public Result(String id)
	{
		this.id = id;
	}

	// =============== Properties ===============

	public String getId()
	{
		return this.id;
	}

	public int getExitCode()
	{
		return this.exitCode;
	}

	public void setExitCode(int exitCode)
	{
		this.exitCode = exitCode;
	}

	public String getOutput()
	{
		return this.output;
	}

	public void setOutput(String output)
	{
		this.output = output;
	}

	public String getClassDiagram()
	{
		return this.classDiagram;
	}

	public void setClassDiagram(String classDiagram)
	{
		this.classDiagram = classDiagram;
	}

	public List<Diagram> getObjectDiagrams()
	{
		return this.objectDiagrams;
	}

	public List<Method> getMethods()
	{
		return this.methods;
	}
}
