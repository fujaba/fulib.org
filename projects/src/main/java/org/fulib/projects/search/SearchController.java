package org.fulib.projects.search;

import org.json.JSONArray;
import spark.Request;
import spark.Response;

import java.util.List;

public class SearchController
{
	private final SearchService searchService;

	public SearchController(SearchService searchService)
	{
		this.searchService = searchService;
	}

	public Object search(Request request, Response response)
	{
		final String query = request.queryParams("q");
		if (query == null || query.isEmpty())
		{
			return "[]";
		}

		final int depth = getIntParam(request, "depth", 12);
		final int limit = getIntParam(request, "limit", 10);

		final String path = request.pathInfo().substring("/search".length());
		final List<SearchResult> results = searchService.findPaths(path, query, depth);
		final List<SearchResult> limited = results.subList(0, Math.min(results.size(), limit));
		return new JSONArray(limited).toString();
	}

	private int getIntParam(Request request, String name, int defaultValue)
	{
		final String depthStr = request.queryParams(name);
		if (depthStr != null)
		{
			try
			{
				return Integer.parseInt(depthStr);
			}
			catch (NumberFormatException ignored)
			{
			}
		}
		return defaultValue;
	}
}
