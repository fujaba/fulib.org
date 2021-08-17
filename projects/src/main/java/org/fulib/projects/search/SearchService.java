package org.fulib.projects.search;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;
import java.util.stream.Collectors;

public class SearchService
{
	private static final Comparator<SearchResult> COMPARATOR = Comparator //
		.comparingInt(SearchResult::getScore) // higher scores ...
		.reversed() // ... first
		.thenComparingInt(s -> s.getPath().length()) // then shorter paths
		;

	public List<SearchResult> findPaths(String path, String query, int depth)
	{
		final List<String> queryParts = Arrays
			.stream(query.split("\\s+"))
			.map(s -> s.toLowerCase(Locale.ROOT))
			.collect(Collectors.toList());

		final List<SearchResult> results = new ArrayList<>();

		search(path, depth, queryParts, results);

		results.sort(COMPARATOR);
		return results;
	}

	private void search(String path, int depth, List<String> queryParts, List<SearchResult> results)
	{
		try
		{
			Files.walkFileTree(Paths.get(path), Collections.emptySet(), depth, new FileVisitor<Path>()
			{
				@Override
				public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
				{
					return FileVisitResult.CONTINUE;
				}

				@Override
				public FileVisitResult visitFile(Path file, BasicFileAttributes attrs)
				{
					visit(file, queryParts, results);
					return FileVisitResult.CONTINUE;
				}

				@Override
				public FileVisitResult visitFileFailed(Path file, IOException exc)
				{
					return FileVisitResult.CONTINUE;
				}

				@Override
				public FileVisitResult postVisitDirectory(Path dir, IOException exc)
				{
					return FileVisitResult.CONTINUE;
				}
			});
		}
		catch (IOException e)
		{
			e.printStackTrace();
		}
	}

	private void visit(Path file, List<String> queryParts, List<SearchResult> results)
	{
		final String fullPath = file.toString();
		final String searchPath = fullPath.toLowerCase(Locale.ROOT);
		int score = 0;

		for (final String queryPart : queryParts)
		{
			if (searchPath.contains(queryPart))
			{
				score++;
			}
		}

		if (score > 0)
		{
			results.add(new SearchResult(fullPath, score));
		}
	}
}
