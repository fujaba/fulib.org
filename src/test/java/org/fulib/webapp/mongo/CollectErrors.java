package org.fulib.webapp.mongo;

import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Projections;
import org.bson.Document;
import org.bson.conversions.Bson;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

		final LocalDate start = LocalDate.of(2019, 10, 1);
		final LocalDateTime end = LocalDateTime.of(2020, 2, 16, 18, 0, 0);
		final Bson filter = Filters.and(Filters.gte("timestamp", start), Filters.lt("timestamp", end));

		int totalCount = 0;
		int totalFound = 0;

		for (final Document document : Mongo.get().requestLog.find(filter)
		                                                     .projection(Projections.include("response.output")))
		{
			totalCount++;

			final Document response = document.get("response", Document.class);
			final String output = response.getString("output");
			if (output == null)
			{
				continue;
			}

			boolean found = false;

			final Matcher matcher = pattern.matcher(output);
			while (matcher.find())
			{
				final String match = matcher.group();
				counts.computeIfAbsent(match, k -> new AtomicInteger()).getAndIncrement();

				found = true;
			}

			if (found) {
				totalFound++;
			}
		}

		counts.entrySet()
		      .stream()
		      .sorted(Map.Entry.comparingByValue(Comparator.comparing(AtomicInteger::longValue)))
		      .forEach(entry -> {
			      System.out.printf("%3d * %s%n", entry.getValue().get(), entry.getKey());
		      });

		System.out.println(totalCount + " total requests");
		System.out.println(totalFound + " requests with at least one marker");
	}
}
