package org.fulib.projects.search;

public class SearchResult
{
	private final String path;
	private final int score;

	public SearchResult(String path, int score)
	{
		this.path = path;
		this.score = score;
	}

	public String getPath()
	{
		return path;
	}

	public int getScore()
	{
		return score;
	}
}
