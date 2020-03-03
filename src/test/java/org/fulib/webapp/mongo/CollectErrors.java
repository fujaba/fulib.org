package org.fulib.webapp.mongo;

import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Projections;
import org.bson.Document;

import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CollectErrors
{
	/**
	 * Counts all fulibScenario compiler error messages (like [foo.bar.baz]) from response outputs in the request log.
	 */
	public static void main(String[] args)
	{
		final Pattern pattern = Pattern.compile("\\[[\\w.]+]");
		final Map<String, AtomicInteger> counts = new HashMap<>();

		for (final Document document : Mongo.get().requestLog.find(Filters.eq("versions.fulibScenarios", "1.0.0"))
		                                                     .projection(Projections.include("response.output")))
		{
			final Document response = document.get("response", Document.class);
			final String output = response.getString("output");
			if (output == null)
			{
				continue;
			}

			final Matcher matcher = pattern.matcher(output);
			while (matcher.find())
			{
				final String match = matcher.group();
				counts.computeIfAbsent(match, k -> new AtomicInteger()).getAndIncrement();
			}
		}

		counts.entrySet()
		      .stream()
		      .sorted(Map.Entry.comparingByValue(Comparator.comparing(AtomicInteger::longValue)))
		      .forEach(entry -> {
			      System.out.printf("%3d * %20s%n", entry.getValue().get(), entry.getKey());
		      });
	}
}
