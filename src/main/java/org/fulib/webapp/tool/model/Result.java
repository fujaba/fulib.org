package org.fulib.webapp.tool.model;

import java.util.ArrayList;
import java.util.List;

public class Result
{
	// =============== Constants ===============

	public static final String PROPERTY_exitCode = "exitCode";
	public static final String PROPERTY_output = "output";
	public static final String PROPERTY_classDiagram = "classDiagram";
	public static final String PROPERTY_diagrams = "diagrams";
	public static final String PROPERTY_methods = "methods";

	// =============== Fields ===============

	private int exitCode;
	private String output;
	private String classDiagram;
	private List<Diagram> diagrams = new ArrayList<>();
	private List<Method> methods = new ArrayList<>();

	// =============== Properties ===============

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

	public List<Diagram> getDiagrams()
	{
		return this.diagrams;
	}

	public List<Method> getMethods()
	{
		return this.methods;
	}
}