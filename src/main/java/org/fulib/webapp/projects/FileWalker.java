package org.fulib.webapp.projects;

import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.projects.model.File;

import java.util.function.BiConsumer;

public class FileWalker
{
	private final Mongo mongo;

	public FileWalker(Mongo mongo)
	{
		this.mongo = mongo;
	}

	public void walk(String startId, BiConsumer<? super File, ? super String> visitor)
	{
		final File file = this.mongo.getFile(startId);
		if (file == null)
		{
			return;
		}

		this.walk(file, "", visitor);
	}

	private void walk(File file, String prefix, BiConsumer<? super File, ? super String> visitor)
	{
		prefix += file.getName();
		visitor.accept(file, prefix);
		if (!file.isDirectory())
		{
			return;
		}

		prefix += "/";
		for (File child : this.mongo.getFilesByParent(file.getId()))
		{
			this.walk(child, prefix, visitor);
		}
	}
}
